import { Routes, Route, Navigate } from "react-router-dom";

/* Pages */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Useraudit from "./pages/Useraudit";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Documents from "./pages/Documents";
import ChangePassword from "./pages/ChangePassword";
import Others from "./pages/Others";
import AdminPayment from "./pages/AdminPayment";
import Userfulldetlise from "./components/Userfulldetlise";

/* Layout */
import MainLayout from "./layouts/MainLayout";

/* 🔐 Protected Route */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  return token ? children : <Navigate to="/" replace />;
};

/* 🔓 Public Route */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ================= AUTO REDIRECT ================= */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      {/* ================= PROTECTED ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Useraudit />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Customers />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Documents />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ChangePassword />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/others"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Others />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= PAYMENT METHOD (ADMIN) ================= */}
      <Route
        path="/admin/payment"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AdminPayment />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= USER FULL DETAILS ================= */}
      <Route
        path="/user-full-details"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Userfulldetlise />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
