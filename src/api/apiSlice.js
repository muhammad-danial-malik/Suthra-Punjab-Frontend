import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "../redux/userSlice";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8000/api/v1";

// Base query with token handling
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    console.warn("Access token expired. Attempting refresh...");

    const refreshResult = await baseQuery(
      { url: "/users/refresh-token", method: "POST" },
      api,
      extraOptions,
    );

    const newToken = refreshResult?.data?.data?.accessToken;

    if (newToken) {
      console.log("Token refreshed successfully.");
      localStorage.setItem("accessToken", newToken);
      api.dispatch(setCredentials(newToken));

      // Retry the failed request
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.error("Refresh token failed — logging out.");
      api.dispatch(clearCredentials());
      localStorage.removeItem("accessToken");

      // Redirect to login page
      window.location.href = "/";
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Penalties",
    "BillingType",
    "Billing",
    "Department",
    "PenaltyType",
    "Circle",
  ],
  endpoints: (builder) => ({
    //  Fetch users
    GetUsers: builder.query({
      query: () => "/users",
    }),

    //  Delete user
    DeleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
    }),
    //  Update user
    UpdateUser: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
    }),
    //  Set user active status
    SetUserActive: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/active`,
        method: "PATCH",
        body: { isActive },
      }),
    }),

    //  Penalties
    Getpenalties: builder.query({
      query: () => "/penalties",
      providesTags: ["Penalties"],
    }),

    //  Departments
    GetAllDepartments: builder.query({
      query: ({ isActive } = {}) => {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append("isActive", isActive);
        return `/departments?${params.toString()}`;
      },
      providesTags: ["Department"],
    }),

    GetDepartmentById: builder.query({
      query: (id) => `/departments/${id}`,
      providesTags: (result, error, id) => [{ type: "Department", id }],
    }),

    CreateDepartment: builder.mutation({
      query: (departmentData) => ({
        url: "/departments",
        method: "POST",
        body: departmentData,
      }),
      invalidatesTags: ["Department"],
    }),

    UpdateDepartment: builder.mutation({
      query: ({ id, ...departmentData }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: departmentData,
      }),
      invalidatesTags: ["Department"],
    }),

    DeleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),

    //  Circles - Full CRUD
    GetAllCircles: builder.query({
      query: () => "/circles",
      providesTags: ["Circle"],
    }),
    GetCircleById: builder.query({
      query: (id) => `/circles/${id}`,
      providesTags: ["Circle"],
    }),
    CreateCircle: builder.mutation({
      query: (circleData) => ({
        url: "/circles",
        method: "POST",
        body: circleData,
      }),
      invalidatesTags: ["Circle"],
    }),
    UpdateCircle: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/circles/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Circle"],
    }),
    DeleteCircle: builder.mutation({
      query: (id) => ({
        url: `/circles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Circle"],
    }),

    //  Circles (Legacy - keeping for backward compatibility)
    Getcircles: builder.query({
      query: () => "/circles",
    }),

    //  Departments
    GetDepartments: builder.query({
      query: () => "/departments",
      providesTags: ["Department"],
    }),

    //  Register user
    RegisterUser: builder.mutation({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        body: {
          ...userData,
          assignedCircle:
            userData.role === "circle_owner"
              ? userData.assignedCircle
              : undefined,
          assignedCircles:
            userData.role === "inspection"
              ? userData.assignedCircles
              : undefined,
        },
      }),
    }),

    //  Login
    LoginForm: builder.mutation({
      query: (formData) => ({
        url: "/users/login",
        method: "POST",
        body: formData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.data?.accessToken;
          if (token) {
            dispatch(setCredentials(token));
          }
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),
    getPenaltiesStats: builder.query({
      query: () => "/penalties/stats",
    }),

    createPenalty: builder.mutation({
      query: (formData) => ({
        url: "/penalties",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Penalties"],
    }),

    ReviewPenalty: builder.mutation({
      query: ({ id, reviewData }) => ({
        url: `/penalties/${id}/review`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: reviewData,
      }),
      invalidatesTags: ["Penalties"],
    }),
    deletePenalty: builder.mutation({
      query: (id) => ({
        url: `/penalties/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["penalties"],
    }),
    updatePenalty: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/penalties/${id}/update`,
        method: "PUT",
        body: payload,
      }),
    }),

    //  Billing Types
    GetBillingTypes: builder.query({
      query: ({ page = 1, limit = 10, ...filters } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        return `/billing-types?${params.toString()}`;
      },
      providesTags: ["BillingType"],
    }),

    GetBillingTypeById: builder.query({
      query: (id) => `/billing-types/${id}`,
      providesTags: (result, error, id) => [{ type: "BillingType", id }],
    }),

    CreateBillingType: builder.mutation({
      query: (billingTypeData) => ({
        url: "/billing-types",
        method: "POST",
        body: billingTypeData,
      }),
      invalidatesTags: ["BillingType"],
    }),

    UpdateBillingType: builder.mutation({
      query: ({ id, billingTypeData }) => ({
        url: `/billing-types/${id}`,
        method: "PUT",
        body: billingTypeData,
      }),
      invalidatesTags: ["BillingType"],
    }),

    DeleteBillingType: builder.mutation({
      query: (id) => ({
        url: `/billing-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BillingType"],
    }),

    //  Billing (Bills)
    GetAllBills: builder.query({
      query: ({ page = 1, limit = 10, ...filters } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        return `/billing?${params.toString()}`;
      },
      providesTags: ["Billing"],
    }),

    GetBillById: builder.query({
      query: (id) => `/billing/${id}`,
      providesTags: (result, error, id) => [{ type: "Billing", id }],
    }),

    CreateBill: builder.mutation({
      query: (formData) => ({
        url: "/billing",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Billing"],
    }),

    UpdateBill: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/billing/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Billing"],
    }),

    UpdateBillAdmin: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/billing/admin/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Billing"],
    }),

    DeleteBill: builder.mutation({
      query: (id) => ({
        url: `/billing/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Billing"],
    }),

    // Penalty Types
    GetAllPenaltyTypes: builder.query({
      query: ({ isActive } = {}) => {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append("isActive", isActive);
        return `/penalty-types?${params.toString()}`;
      },
      providesTags: ["PenaltyType"],
    }),

    GetPenaltyTypeById: builder.query({
      query: (id) => `/penalty-types/${id}`,
      providesTags: (result, error, id) => [{ type: "PenaltyType", id }],
    }),

    CreatePenaltyType: builder.mutation({
      query: (penaltyTypeData) => ({
        url: "/penalty-types",
        method: "POST",
        body: penaltyTypeData,
      }),
      invalidatesTags: ["PenaltyType"],
    }),

    UpdatePenaltyType: builder.mutation({
      query: ({ id, ...penaltyTypeData }) => ({
        url: `/penalty-types/${id}`,
        method: "PUT",
        body: penaltyTypeData,
      }),
      invalidatesTags: ["PenaltyType"],
    }),

    DeletePenaltyType: builder.mutation({
      query: (id) => ({
        url: `/penalty-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PenaltyType"],
    }),

    //  Get current user profile
    GetCurrentUser: builder.query({
      query: () => "/users/me",
    }),

    //  User Scoreboard (Admin)
    GetUserScoreboard: builder.query({
      query: ({
        role = "all",
        startDate,
        endDate,
        circleId,
        page = 1,
        limit = 10,
      } = {}) => {
        const params = new URLSearchParams();
        if (role) params.append("role", role);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (circleId) params.append("circleId", circleId);
        params.append("page", page);
        params.append("limit", limit);
        return `/users/scoreboard/all?${params.toString()}`;
      },
    }),

    //  Logout
    Logout: builder.mutation({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(clearCredentials());
        } catch (err) {
          console.error("Logout failed:", err);
        }
      },
    }),
  }),
});

export const {
  useLoginFormMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetUserScoreboardQuery,
  useDeletePenaltyMutation,
  useUpdatePenaltyMutation,
  useReviewPenaltyMutation,
  useCreatePenaltyMutation,
  useGetUsersQuery,
  useRegisterUserMutation,
  useGetpenaltiesQuery,
  useGetMyCreatedPenaltiesQuery,
  useGetcirclesQuery,
  useGetAllCirclesQuery,
  useGetCircleByIdQuery,
  useCreateCircleMutation,
  useUpdateCircleMutation,
  useDeleteCircleMutation,
  useGetDepartmentsQuery,
  useGetAllDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useSetUserActiveMutation,
  useGetAllPenaltyTypesQuery,
  useGetPenaltyTypeByIdQuery,
  useCreatePenaltyTypeMutation,
  useUpdatePenaltyTypeMutation,
  useDeletePenaltyTypeMutation,
  useGetPenaltiesStatsQuery,
  useGetBillingTypesQuery,
  useGetBillingTypeByIdQuery,
  useCreateBillingTypeMutation,
  useUpdateBillingTypeMutation,
  useDeleteBillingTypeMutation,
  useGetAllBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useUpdateBillAdminMutation,
  useDeleteBillMutation,
} = apiSlice;
