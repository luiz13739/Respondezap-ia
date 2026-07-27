import Link from "next/link";
import { Sparkles, MessageSquareText, Building2, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: responsesCount } = await supabase
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user?.id ?? "");

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const displayName =
    (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ?? "por aqui";

  return (
    <div className="mx-auto max-w-5xl animate-fadeIn">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Olá, {displayName} 👋</h1>
          <p className="mt-1 text-sm text-gray-500">
            Aqui está um resumo do seu atendimento automatizado.
          </p>
        </div>
        <Link href="/dashboard/gerar-resposta">
          <Button className="whitespace-nowrap">
            <Sparkles className="h-4 w-4" />
            Nova resposta
          </Button>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Respostas geradas</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {responsesCount ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-400">Total desde a criação da conta</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
              <MessageSquareText className="h-5 w-5 text-brand-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Empresa configurada</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {company?.name ?? "Ainda não configurada"}
              </p>
              <Link
                href="/dashboard/minha-empresa"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                {company?.name ? "Editar informações" : "Configurar agora"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
              <Building2 className="h-5 w-5 text-brand-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="text-sm font-semibold text-gray-900">Próximos passos</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Preencha os dados da sua empresa para personalizar o tom das respostas.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Cole a mensagem de um cliente em "Gerar Resposta" e receba uma sugestão em segundos.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Copie a resposta e envie diretamente no WhatsApp Business.
          </li>
        </ul>
      </Card>
    </div>
  );
}
