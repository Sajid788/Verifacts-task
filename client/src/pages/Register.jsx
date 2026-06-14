import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Briefcase, User, Mail, Lock, Shield, ArrowRight } from "lucide-react";
import { register } from "../store/authApi";
import { setLoading, setError } from "../store/authSlice";
import { validateRegister } from "../lib/validation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectItem } from "../components/ui/select";

export default function Register() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      const next = validateRegister({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: next[field] }));
    }
  }

  function validateField(field) {
    const next = validateRegister(form);
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors below");
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.role);
      toast.success("Account created! Please sign in.");
      navigate("/login", { state: { message: "Registration successful. Please login." } });
    } catch (err) {
      const message = err?.message || "Registration failed";
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
            Join your verification team
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Create your account and start managing cases as a manager or agent.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Secure · Fast · Reliable</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="glass-card w-full max-w-md border-0">
          <CardHeader className="space-y-2 text-center sm:text-left">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 lg:hidden">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Create account</CardTitle>
            <p className="text-sm text-muted-foreground">Get started with VeriFacts today</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    onBlur={() => validateField("name")}
                    error={errors.name}
                    className="pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => validateField("email")}
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
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onBlur={() => validateField("password")}
                    error={errors.password}
                    className="pl-10"
                    placeholder="Min 6 chars, letters & numbers"
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="relative">
                  {/* <Shield className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
                  <Select
                    value={form.role}
                    onValueChange={(v) => update("role", v)}
                    error={errors.role}
                    className=""
                  >
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </Select>
                </div>
                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating account..." : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
