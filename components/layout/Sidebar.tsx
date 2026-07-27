"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Sparkles, LogOut, MessageCircle, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/conversas", label: "Conversas", icon: MessageSquare },
  { href: "/dashboard/minha-empresa", label: "Minha Empresa", icon: Building2 },
  { href: "/dashboard/gerar-resposta", label: "Gerar Resposta", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-6 md:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-md shadow-brand-500/25">
          <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.25} />
        </div>
        <span className="text-base font-semibold tracking-tight text-gray-900">
          Responde<span className="text-brand-500">Zap</span> AI
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4.5 w-4.5" />
        Sair
      </button>
    </aside>
  );
}