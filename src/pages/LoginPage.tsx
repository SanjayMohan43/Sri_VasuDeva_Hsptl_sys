import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHospital } from "@/contexts/HospitalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

const LoginPage = () => {
  const { login, register } = useAuth();
  const { isOpen } = useHospital();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  const ADMIN_EMAIL = "vasupagadala999@gmail.com";
  const ADMIN_PASSWORD = "vasu1234";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { success, error } = await login(loginEmail, loginPassword);
    setLoading(false);
    
    if (success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(error || "Invalid credentials");
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmailInput !== ADMIN_EMAIL) {
      toast.error("Invalid admin email");
      return;
    }
    
    if (adminPasswordInput !== ADMIN_PASSWORD) {
      toast.error("Invalid admin password");
      return;
    }

    setLoading(true);
    const { success, error } = await login(adminEmailInput, adminPasswordInput);
    setLoading(false);
    
    if (success) {
      toast.success("Admin access granted");
      navigate("/dashboard");
    } else {
      toast.error(error || "Admin account not found or invalid password");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { success, error } = await register(regName, regEmail, regPassword);
    setLoading(false);
    
    if (success) {
      toast.success("Account created successfully! Please sign in.");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setActiveTab("login");
      setLoginEmail(regEmail);
    } else {
      toast.error(error || "Failed to create account. Please try again.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/20"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="mb-8">
            <div className="flex items-center justify-center mb-2">
              <h1 className="text-5xl font-bold text-primary-foreground tracking-tight">Sri VasuDeva Medicals</h1>
            </div>
            <p className="text-primary-foreground/70 font-medium text-lg">Opp to Sanjay Glass Mart, Huzurabad Road, Parkal, Bhupalpally Dist.</p>
          </div>
          <p className="text-xl text-primary-foreground/80 max-w-md leading-relaxed">
            Your comprehensive medical platform for appointments, telemedicine, and pharmacy services.
          </p>
          
          <div className="mt-12 flex justify-center">
             <Badge variant={isOpen ? "secondary" : "destructive"} className="px-6 py-2 text-lg font-bold gap-2 bg-white/20 hover:bg-white/30 border-white/40 text-white backdrop-blur-md">
                {isOpen ? <Clock className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                {isOpen ? "Hospital is Open" : "Hospital is Currently Closed"}
             </Badge>
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center pt-8">
            <div className="flex items-center justify-center mb-1">
              <h1 className="text-3xl font-bold text-foreground">Sri VasuDeva Medicals</h1>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Opp to Sanjay Glass Mart, Huzurabad Road, Parkal, Bhupalpally Dist.</p>
            <Badge variant={isOpen ? "default" : "destructive"} className="gap-1">
                {isOpen ? <Clock className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {isOpen ? "Open" : "Closed until 9:00 AM"}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                  <CardDescription>
                    Enter admin credentials to access the management panel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input 
                        id="admin-email" 
                        type="email" 
                        placeholder="admin@example.com" 
                        value={adminEmailInput} 
                        onChange={(e) => setAdminEmailInput(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={adminPasswordInput} 
                        onChange={(e) => setAdminPasswordInput(e.target.value)} 
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Signing in..." : "Access Admin Panel"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Create account</CardTitle>
                  <CardDescription>Register as a new patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input id="reg-name" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
