"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EsqueciSenhaPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Informe seu e-mail para continuar.");
      return;
    }

    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setIsSubmitting(false);

    if (resetError) {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <MessageCircle className="h-7 w-7 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900">
            Responde<span className="text-brand-500">Zap</span> AI
          </span>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/60 sm:p-10">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-brand-500" />
              <h1 className="text-xl font-semibold text-gray-900">Verifique seu e-mail</h1>
              <p className="mt-2 text-sm text-gray-500">
                Enviamos um link para redefinir sua senha para <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold text-gray-900">Esqueci minha senha</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                  id="email"
                  type="email"
                  label="E-mail"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Enviar link de redefinição
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="font-medium text-brand-500 hover:text-brand-600">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
