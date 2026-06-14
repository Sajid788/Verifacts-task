import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { Toaster } from "sonner";
import store from "./store/store";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CaseList from "./pages/CaseList";
import CaseDetail from "./pages/CaseDetail";
import CreateCase from "./pages/CreateCase";

function AuthLoading() {
  return (
    <div className="app-gradient flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children, managerOnly = false }) {
  const { user, initialized } = useSelector((s) => s.auth);

  if (!initialized) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (managerOnly && user.role !== "manager") return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, initialized } = useSelector((s) => s.auth);

  if (!initialized) return <AuthLoading />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<CaseList />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route
          path="cases/new"
          element={
            <PrivateRoute managerOnly>
              <CreateCase />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton duration={3000} />
      </BrowserRouter>
    </Provider>
  );
}
