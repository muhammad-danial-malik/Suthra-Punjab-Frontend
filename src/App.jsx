import { Route, Routes } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Dashboard";
import Penalties from "./pages/Penalties";
import Maps from "./pages/Maps";
import Login from "./pages/login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UpdatePenalty from "./pages/UpdatePenalty";
import Action from "./pages/Action";
import User from "./pages/User";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Stats from "./pages/Stats";
import Circle from "./pages/Circle";
import Department from "./pages/Department";
import Notifications from "./pages/Notifications";
import HeapHistory from "./pages/HeapHistory";
import PenaltyTypes from "./pages/PenaltyTypes";
import BillingReports from "./pages/BillingReports";
import BillingTypes from "./pages/BillingTypes";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/penalties"
          element={
            <ProtectedRoute>
              <Penalties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department"
          element={
            <ProtectedRoute>
              <Department />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles"
          element={
            <ProtectedRoute>
              <Circle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <Maps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heap-history"
          element={
            <ProtectedRoute>
              <HeapHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penalty-types"
          element={
            <ProtectedRoute>
              <PenaltyTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing-reports"
          element={
            <ProtectedRoute>
              <BillingReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing-types"
          element={
            <ProtectedRoute>
              <BillingTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update/:id"
          element={
            <ProtectedRoute>
              <UpdatePenalty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/action/:id"
          element={
            <ProtectedRoute>
              <Action />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
