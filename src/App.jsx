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
import PenaltyTypes from "./pages/penaltyTypes";
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
        <Route path="/users" element={<User />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/penalties" element={<Penalties />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/department" element={<Department />} />
        <Route path="/circles" element={<Circle />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/heap-history" element={<HeapHistory />} />
        <Route path="/penalty-types" element={<PenaltyTypes />} />
        <Route path="/billing-reports" element={<BillingReports />} />
        <Route path="/billing-types" element={<BillingTypes />} />
        <Route path="/update/:id" element={<UpdatePenalty />} />
        <Route path="/action/:id" element={<Action />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
