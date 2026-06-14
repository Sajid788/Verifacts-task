import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Briefcase, Mail, Lock, ArrowRight } from "lucide-react";
import { login } from "../store/authApi";
import { setUser, setLoading, setError, setToken } from "../store/authSlice";
import { validateLogin } from "../lib/validation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Login() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const successMessage = location.state?.message;

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
  }, [successMessage]);

  function validateField(field, value) {
    const next = validateLogin({
      email: field === "email" ? value : email,
      password: field === "password" ? value : password,
    });
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateLogin({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors below");
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await login(email.trim(), password);
      dispatch(setToken(data.token));
      dispatch(setUser(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/");
    } catch (err) {
      const message = err.message || "Login failed";
      toast.error(message);
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <div className="auth-gradient flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">VeriFacts</span>
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Verify cases with confidence
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Streamlined case management for ops teams. Track, assign, and resolve verification cases in one place.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Trusted by verification teams worldwide</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="glass-card w-full max-w-md border-0">
          <CardHeader className="space-y-2 text-center sm:text-left">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 lg:hidden">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in to your VeriFacts account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) validateField("email", e.target.value);
                    }}
                    onBlur={(e) => validateField("email", e.target.value)}
                    error={errors.email}
                    className="pl-10"
                    placeholder="you@company.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
                    error={errors.password}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
