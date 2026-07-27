"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos para continuar.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Se a confirmação por e-mail estiver ativada no projeto Supabase,
    // não haverá sessão imediata — mostramos uma mensagem de sucesso.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md animate-fadeIn rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl shadow-gray-200/60">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-brand-500" />
          <h1 className="text-xl font-semibold text-gray-900">Confira seu e-mail</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enviamos um link de confirmação para <strong>{email}</strong>. Confirme sua conta
            para poder entrar.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-500 hover:text-brand-600">
            Voltar para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
      />

      <div className="relative w-full max-w-md animate-fadeIn">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <MessageCircle className="h-7 w-7 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900">
            Responde<span className="text-brand-500">Zap</span> AI
          </span>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/60 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Crie sua conta</h1>
            <p className="mt-2 text-sm text-gray-500">
              Leva menos de um minuto para começar a automatizar suas respostas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="name"
              type="text"
              label="Nome"
              autoComplete="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="email"
              type="email"
              label="E-mail"
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              label="Senha"
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar senha"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-brand-500 hover:text-brand-600">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
