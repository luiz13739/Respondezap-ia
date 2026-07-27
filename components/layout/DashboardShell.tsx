"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  LogOut,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/minha-empresa", label: "Minha Empresa", icon: Building2 },
  { href: "/dashboard/gerar-resposta", label: "Gerar Resposta", icon: Sparkles },
];

/**
 * Envolve as páginas do dashboard: sidebar fixa no desktop e
 * um menu do tipo drawer no mobile, controlados a partir daqui.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Topbar mobile */}
      <div className="flex w-full flex-col md:hidden">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <MessageCircle className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Responde<span className="text-brand-500">Zap</span> AI
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </div>

      {/* Conteúdo desktop */}
      <main className="hidden flex-1 p-8 md:block">{children}</main>

      {/* Drawer mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-4 shadow-xl animate-fadeIn">
            <div className="mb-8 flex items-center justify-between px-1">
              <span className="text-base font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
