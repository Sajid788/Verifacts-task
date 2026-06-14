import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Briefcase, Plus, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { logout } from "../store/authSlice";
import { Button } from "./ui/button";

export function Layout() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const isManager = user?.role === "manager";
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className="app-gradient">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between px-6 py-4 lg:px-20">
          <Link
            to="/"
            className="group flex items-center gap-3 font-bold text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl tracking-tight">VeriFacts</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-full border border-border/60 bg-card/80 px-4 py-2 shadow-sm sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">{user?.name}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold capitalize tracking-wide text-primary">
                {user?.role}
              </span>
            </div>

            {isManager && (
              <Button variant="default" size="sm" onClick={() => navigate("/cases/new")} className="shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                New Case
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-card/80">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-8 lg:px-20">
        <Outlet />
      </main>
    </div>
  );
}
