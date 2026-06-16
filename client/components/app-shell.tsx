"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  Boxes,
  Home,
  LogOut,
  Package,
  Send,
  Truck,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import type { UserInfo } from "@/lib/auth-api";
import { getMe } from "@/lib/auth-api";
import { canReadActivityLogs } from "@/lib/permissions";
import {
  ACCESS_TOKEN_COOKIE,
  clearSession,
  getCookie,
  LOGIN_SUCCESS_KEY,
  readCurrentUser,
  saveCurrentUser,
} from "@/lib/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/warehouses", label: "Warehouse", icon: Warehouse },
  { href: "/products", label: "Product", icon: Package },
  { href: "/inbound", label: "Inbound", icon: Truck },
  { href: "/outbound", label: "Outbound", icon: Send },
  { href: "/activity-logs", label: "ActivityLog", icon: Activity, adminOnly: true },
];

type AppShellProps = {
  children: ReactNode;
};

type AppShellContextValue = {
  user: UserInfo | null;
  isLoadingUser: boolean;
};

const AppShellContext = createContext<AppShellContextValue>({
  user: null,
  isLoadingUser: true,
});

export function useAppShell() {
  return useContext(AppShellContext);
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(LOGIN_SUCCESS_KEY) === "true") {
      sessionStorage.removeItem(LOGIN_SUCCESS_KEY);
      toast.success("Signed in successfully", {
        description: "Welcome to the WMS dashboard.",
        duration: 3000,
      });
    }

    async function loadUser() {
      await Promise.resolve();

      const cachedUser = readCurrentUser();
      if (cachedUser) {
        setUser(cachedUser);
      }

      const token = getCookie(ACCESS_TOKEN_COOKIE);
      if (!token) {
        clearSession();
        router.replace("/");
        return;
      }

      try {
        const response = await getMe(token);
        setUser(response.user);
        saveCurrentUser(response.user);
      } catch {
        clearSession();
        router.replace("/");
      } finally {
        setIsLoadingUser(false);
      }
    }

    void loadUser();
  }, [router]);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (!item.adminOnly) {
          return true;
        }

        return canReadActivityLogs(user);
      }),
    [user],
  );

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  const contextValue = useMemo(
    () => ({ user, isLoadingUser }),
    [user, isLoadingUser],
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-100 text-slate-950">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-16 items-center border-b border-slate-200 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-950">WNS</p>
              <p className="text-xs text-slate-500">Management</p>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                    isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Hello, {user?.username || "User"}
              </p>
              <p className="text-xs text-slate-500">
                {isLoadingUser ? "Loading profile..." : "Warehouse operations"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600",
                      pathname === item.href && "bg-slate-950 text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
