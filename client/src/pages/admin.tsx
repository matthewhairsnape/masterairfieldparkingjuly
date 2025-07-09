import { useState, useEffect } from "react";
import { AdminOverview } from "../components/admin-overview";
import { AdminSidebar } from "../components/admin-sidebar";
import { AdminNav } from "../components/admin-nav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Lock, User } from "lucide-react";
import { RateManagement } from "../components/rate-management";
import { QRGenerator } from "../components/qr-generator";
import { StaffExemptions } from "../components/staff-exemptions";
import { ParkingOverview } from "../components/parking-overview";
import { SearchRegistration } from "../components/search-registration";

const TABS: Record<string, React.ReactElement> = {
  overview: <AdminOverview />,
  rates: <RateManagement />,
  qr: <QRGenerator />,
  staff: <StaffExemptions />,
  registrations: <ParkingOverview />,
  search: <SearchRegistration />,
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Check if already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check credentials
    if (username === "Graham Neal" && password === "app5FtGVdkdf6Q98N") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
    } else {
      setError("Invalid username or password");
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    setUsername("");
    setPassword("");
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Airport Parking</CardTitle>
            <CardDescription>Admin Console Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />
      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {TABS[activeTab]}
        </main>
      </div>
    </div>
  );
}
