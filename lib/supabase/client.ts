"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em componentes do lado do cliente ("use client").
 * Utilizado em formulários de login, cadastro e chamadas feitas no navegador.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
