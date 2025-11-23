import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import PayPage from "./pages/PayPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/authService";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute userType="user">
              <Dashboard userType="user" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/store"
          element={
            <ProtectedRoute userType="store">
              <Dashboard userType="store" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {localStorage.getItem("userType") === "user" ? (
                <Navigate to="/dashboard/user" replace />
              ) : (
                <Navigate to="/dashboard/store" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
