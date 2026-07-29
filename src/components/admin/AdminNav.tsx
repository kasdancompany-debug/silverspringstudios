"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Inbox,
  Film,
  BarChart3,
  Mail,
  LogOut,
  Menu,
  X,
  Handshake,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/layout/Wordmark";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/outreach", label: "Outreach", icon: Megaphone },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/films", label: "Films", icon: Film },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/templates", label: "Templates", icon: Mail },
] as const;

export function AdminNav({ children, userEmail }: { children: ReactNode; userEmail: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Demo mode / missing Supabase env — still leave the desk.
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-screen bg-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-6 py-7">
          <Wordmark href="/admin" />
          <p className="mt-3 text-[0.65rem] tracking-[0.28em] text-warm-metal uppercase">
            Acquisitions Desk
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Admin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-xs tracking-[0.1em] uppercase no-underline transition-colors",
                  active
                    ? "bg-ivory/10 text-ivory border-l-2 border-warm-metal"
                    : "text-slate hover:bg-ivory/5 hover:text-ivory border-l-2 border-transparent",
                )}
              >
                <Icon size={15} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-4 py-5">
          {userEmail ? (
            <p className="mb-3 truncate px-3 text-xs text-slate" title={userEmail}>
              {userEmail}
            </p>
          ) : (
            <p className="mb-3 px-3 text-xs text-warm-metal">Demo mode</p>
          )}
          {userEmail ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-xs tracking-[0.1em] text-slate uppercase transition-colors hover:text-ivory disabled:opacity-50"
            >
              <LogOut size={15} strokeWidth={1.75} />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : null}
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-4 lg:hidden">
          <Wordmark href="/admin" />
          <button
            type="button"
            className="text-ivory"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span className="sr-only">Toggle admin menu</span>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {mobileOpen ? (
          <nav className="border-b border-line bg-surface px-5 py-4 lg:hidden" aria-label="Admin mobile">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-xs tracking-[0.1em] uppercase no-underline",
                      active ? "text-ivory" : "text-slate",
                    )}
                  >
                    <Icon size={15} strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
              {userEmail ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="mt-2 flex items-center gap-3 border-t border-line px-3 py-3 text-xs tracking-[0.1em] text-slate uppercase disabled:opacity-50"
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <p className="mt-2 border-t border-line px-3 py-3 text-xs text-warm-metal">Demo mode</p>
              )}
            </div>
          </nav>
        ) : null}

        <main className="flex-1 px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}
