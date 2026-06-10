"use client";

import { useEffect, useState } from "react";
import { getMe, UserInfo } from "@/lib/auth-api";

function getCookie(name: string) {
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : "";
}

export function DefaultPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [status, setStatus] = useState("Loading user profile...");
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    duration: number;
  } | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      if (sessionStorage.getItem("login_success") === "true") {
        sessionStorage.removeItem("login_success");
        setToast({
          title: "Signed in successfully",
          message: "Welcome to the default dashboard.",
          duration: 3000,
        });
      }

      const accessToken = getCookie("access_token");

      if (!accessToken) {
        setStatus("No access token found. Please sign in again.");
        return;
      }

      try {
        const me = await getMe(accessToken);
        setUser(me.user);
        localStorage.setItem("current_user", JSON.stringify(me.user));
        setStatus("User profile loaded.");
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Unable to load user profile.",
        );
      }
    }

    void loadUserProfile();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, toast.duration);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-md border border-emerald-200 bg-white p-4 shadow-lg sm:right-6 sm:top-6"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
              OK
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">
                {toast.title}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto h-7 w-7 shrink-0 rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        </div>
      ) : null}

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            WNS Management
          </p>
          <div className="mt-12 max-w-2xl">
            <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Default dashboard
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              You are signed in. This default page is ready for product,
              warehouse, inbound, outbound, and inventory screens.
            </p>
          </div>

          <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Profile status
            </p>
            <p className="mt-2 text-sm text-slate-600">{status}</p>
            {user ? (
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                <div>
                  <span className="block text-xs font-medium uppercase text-slate-500">
                    Name
                  </span>
                  <span>{user.username || "Unknown"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase text-slate-500">
                    Email
                  </span>
                  <span className="break-all">{user.mail || "Unknown"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase text-slate-500">
                    Roles
                  </span>
                  <span>
                    {user.roles.map((role) => role.role_name).join(", ") ||
                      "None"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
          {["Products", "Warehouses", "Inventory"].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-950">{item}</p>
              <p className="mt-2 text-sm text-slate-500">Coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
