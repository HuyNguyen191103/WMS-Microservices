"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-api";
import {
  LOGIN_SUCCESS_KEY,
  setAccessTokenCookie,
} from "@/lib/session";

const demoAccounts = [
  {
    role: "Admin",
    mail: "admin@gmail.com",
    password: "admin123456",
  },
  {
    role: "Director",
    mail: "director@gmail.com",
    password: "director123456",
  },
  {
    role: "Manage",
    mail: "manage01+02@gmail.com",
    password: "manage123456",
  },
  {
    role: "Employee",
    mail: "employee01+02@gmail.com",
    password: "employee123456",
  },
];

export function LoginPage() {
  const router = useRouter();
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    duration: number;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    mail: "",
    password: "",
  });

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, toast.duration);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function validateForm() {
    const nextFieldErrors = {
      mail: mail.trim() ? "" : "Email is required.",
      password: password.trim() ? "" : "Password is required.",
    };

    setFieldErrors(nextFieldErrors);
    return !nextFieldErrors.mail && !nextFieldErrors.password;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = await login({ mail: mail.trim(), password });
      setAccessTokenCookie(auth.access_token, auth.expired);
      sessionStorage.setItem(LOGIN_SUCCESS_KEY, "true");
      router.push("/home");
    } catch (caughtError) {
      setToast({
        title: "Sign in failed",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Login failed. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillAccount(account: (typeof demoAccounts)[number]) {
    setMail(account.mail);
    setPassword(account.password);
    setToast(null);
    setFieldErrors({ mail: "", password: "" });
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-md border border-red-200 bg-white p-4 shadow-lg sm:right-6 sm:top-6"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-700">
              !
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
              suppressHydrationWarning
            >
              x
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex min-h-[560px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                WNS Management
              </p>
              <div className="mt-12 max-w-xl">
                <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                  Sign in to the warehouse management system
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Use your assigned account to access the default dashboard and
                  continue working with warehouse operations.
                </p>
              </div>
            </div>

            <form
              className="mt-10 max-w-md space-y-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <div>
                <label
                  htmlFor="mail"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="mail"
                  name="mail"
                  type="email"
                  value={mail}
                  onChange={(event) => {
                    setMail(event.target.value);
                    setFieldErrors((current) => ({ ...current, mail: "" }));
                  }}
                  autoComplete="email"
                  placeholder="Enter your email"
                  aria-invalid={Boolean(fieldErrors.mail)}
                  aria-describedby={
                    fieldErrors.mail ? "mail-error" : undefined
                  }
                  suppressHydrationWarning
                  className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-950 outline-none transition focus:ring-2 ${
                    fieldErrors.mail
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                  }`}
                />
                {fieldErrors.mail ? (
                  <p id="mail-error" className="mt-2 text-sm text-red-600">
                    {fieldErrors.mail}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      password: "",
                    }));
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  suppressHydrationWarning
                  className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-950 outline-none transition focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                  }`}
                />
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-2 text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                suppressHydrationWarning
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Demo accounts
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select an account to fill the form.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fillAccount(account)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  suppressHydrationWarning
                >
                  <span className="text-sm font-semibold text-slate-950">
                    {account.role}
                  </span>
                  <span className="mt-3 block text-xs font-medium uppercase text-slate-500">
                    Email
                  </span>
                  <span className="block break-all text-sm text-slate-800">
                    {account.mail}
                  </span>
                  <span className="mt-2 block text-xs font-medium uppercase text-slate-500">
                    Password
                  </span>
                  <span className="block break-all text-sm text-slate-800">
                    {account.password}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
