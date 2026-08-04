"use client";

import { useEffect, useState } from "react";
import { Sparkles, Copy, Check, MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateResponse } from "@/lib/ai/generateResponse";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { AttendanceTone } from "@/lib/types";

export default function GerarRespostaPage() {
  const supabase = createClient();

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preenche telefone e mensagem quando a página é aberta a partir de
  // "Conversas" (ex: /gerar-resposta?phone=5511999999999&message=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phoneFromUrl = params.get("phone");
    const messageFromUrl = params.get("message");

    if (phoneFromUrl) {
      setCustomerPhone(phoneFromUrl);
    }
    if (messageFromUrl) {
      setCustomerMessage(messageFromUrl);
    }
  }, []);

  const handleGenerate = async () => {
    setError(null);

    if (!customerPhone.trim()) {
      setError("Informe o telefone do cliente antes de gerar a resposta.");
      return;
    }

    if (!customerMessage.trim()) {
      setError("Cole a mensagem do cliente antes de gerar a resposta.");
      return;
    }

    setIsGenerating(true);
    setAiResponse("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: company } = user
        ? await supabase
            .from("companies")
            .select(`
              name,
              segment,
              description,
              products_services,
              business_hours,
              phone,
              address,
              payment_methods,
              delivery,
              delivery_time,
              faq,
              important_info,
              promotions,
              tone
            `)
            .eq("user_id", user.id)
            .maybeSingle()
        : { data: null };

      const response = await generateResponse({
        customerMessage,
        customerPhone: customerPhone.trim(),
        companyName: company?.name,
        segment: company?.segment,
        description: company?.description,
        productsServices: company?.products_services,
        businessHours: company?.business_hours,
        phone: company?.phone,
        address: company?.address,
        paymentMethods: company?.payment_methods,
        delivery: company?.delivery,
        deliveryTime: company?.delivery_time,
        faq: company?.faq,
        importantInfo: company?.important_info,
        promotions: company?.promotions,
        tone: (company?.tone as AttendanceTone) ?? "amigavel",
      });

      setAiResponse(response);

      if (user) {
        await supabase.from("responses").insert({
          user_id: user.id,
          customer_message: customerMessage,
          ai_response: response,
        });
      }
    } catch {
      setError("Não foi possível gerar a resposta agora. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!aiResponse) return;

    await navigator.clipboard.writeText(aiResponse);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!aiResponse) return;

    const message = encodeURIComponent(aiResponse);
    const targetPhone = customerPhone.trim().replace(/\D/g, "");

    const url = targetPhone
      ? `https://wa.me/${targetPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, "_blank");
  };

  return (
    <div className="mx-auto max-w-3xl animate-fadeIn">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          <Sparkles className="h-5 w-5 text-brand-600" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gerar Resposta
          </h1>

          <p className="text-sm text-gray-500">
            Cole a mensagem recebida no WhatsApp e receba uma resposta pronta
            para enviar.
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <label
            htmlFor="customerPhone"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Telefone do cliente
          </label>
          <input
            id="customerPhone"
            type="text"
            placeholder="Ex: 5511999999999"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Usado para manter o histórico de cada cliente separado. Preenchido
            automaticamente quando você vem da aba Conversas.
          </p>
        </div>

        <Textarea
          id="customerMessage"
          label="Mensagem do cliente"
          placeholder="Cole aqui a mensagem que o cliente enviou no WhatsApp..."
          rows={6}
          value={customerMessage}
          onChange={(e) => setCustomerMessage(e.target.value)}
        />

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button onClick={handleGenerate} isLoading={isGenerating}>
            <Sparkles className="h-4 w-4" />
            Gerar Resposta
          </Button>
        </div>
      </Card>

      <Card className="mt-5 min-h-[180px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MessageSquareText className="h-4 w-4 text-brand-600" />
            Resposta gerada
          </h2>

          {aiResponse && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </>
                )}
              </button>

              <button
                onClick={handleOpenWhatsApp}
                className="flex items-center gap-1.5 text-xs font-medium text-green-600 transition-colors hover:text-green-700"
              >
                📲 Abrir no WhatsApp
              </button>
            </div>
          )}
        </div>

        {isGenerating ? (
          <div className="space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        ) : aiResponse ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {aiResponse}
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            A resposta gerada pela IA vai aparecer aqui.
          </p>
        )}
      </Card>
    </div>
  );
}