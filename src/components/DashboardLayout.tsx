import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, Pill, ShoppingCart,
  Stethoscope, FileText, Video, ClipboardList, LogOut, Menu, X,
  Package, Settings, Bell, TruckIcon, Store, AlertCircle, Clock,
  CheckCheck, CalendarCheck, Truck, Beaker, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useHospital } from "@/contexts/HospitalContext";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["admin", "doctor", "patient"] },
  { label: "Appointments", href: "/appointments", icon: <Calendar className="h-5 w-5" />, roles: ["admin", "doctor", "patient"] },
  { label: "Queue Status", href: "/queue", icon: <ClipboardList className="h-5 w-5" />, roles: ["admin", "doctor", "patient"] },
  { label: "Telemedicine", href: "/telemedicine", icon: <Video className="h-5 w-5" />, roles: ["doctor", "patient"] },
  { label: "Consultation Reports", href: "/reports", icon: <FileText className="h-5 w-5" />, roles: ["doctor"] },
  { label: "Manage Doctors", href: "/manage-doctors", icon: <Stethoscope className="h-5 w-5" />, roles: ["admin"] },
  { label: "Manage Patients", href: "/manage-patients", icon: <Users className="h-5 w-5" />, roles: ["admin"] },
  { label: "Pharmacy", href: "/pharmacy", icon: <Pill className="h-5 w-5" />, roles: ["admin", "patient"] },
  { label: "Medicine Delivery", href: "/delivery", icon: <TruckIcon className="h-5 w-5" />, roles: ["admin", "patient"] },
  { label: "Medicine Requests", href: "/medicine-requests", icon: <Package className="h-5 w-5" />, roles: ["admin", "patient"] },
  { label: "Store Settings", href: "/store-settings", icon: <Store className="h-5 w-5" />, roles: ["admin"] },
  { label: "My Bills & Receipts", href: "/bills", icon: <Receipt className="h-5 w-5" />, roles: ["admin", "patient"] },
  { label: "My Schedule", href: "/schedule", icon: <Calendar className="h-5 w-5" />, roles: ["doctor"] },
];

const notifIcon = (type: string) => {
  if (type === "appointment") return <CalendarCheck className="h-4 w-4 text-blue-500" />;
  if (type === "medicine") return <Beaker className="h-4 w-4 text-emerald-500" />;
  if (type === "delivery") return <Truck className="h-4 w-4 text-amber-500" />;
  return <Bell className="h-4 w-4 text-muted-foreground" />;
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const { isOpen, isClosingSoon } = useHospital();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification panel if clicked outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  if (!user) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-sidebar-foreground">Sri VasuDeva Medicals</span>
        </div>
        <p className="text-[10px] leading-tight text-sidebar-foreground/60 px-1">
          Opp to Sanjay Glass Mart, Huzurabad Road, Parkal, Bhupalpally Dist.
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-sidebar animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 bg-card">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => { setNotifOpen(v => !v); }}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 max-h-[420px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm text-foreground">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Real-time updates will appear here</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 flex gap-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0",
                            !n.read && "bg-primary/5"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium text-foreground leading-tight", !n.read && "font-semibold")}>
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                          </div>
                          {!n.read && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Status Banners */}
        {!isOpen && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center gap-2 text-destructive font-medium text-sm animate-pulse-subtle">
            <AlertCircle className="h-4 w-4" />
            <span>Sri VasuDeva Medicals is currently closed. We will open at 9:00 AM.</span>
          </div>
        )}
        
        {isOpen && isClosingSoon && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 text-amber-600 font-medium text-sm">
            <Clock className="h-4 w-4" />
            <span>Hospital will be closed soon (Closing time: 8:00 PM).</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
