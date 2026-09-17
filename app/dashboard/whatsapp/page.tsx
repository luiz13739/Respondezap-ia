"use client";

import { MessageCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function WhatsAppPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fadeIn">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
          <MessageCircle className="h-5 w-5 text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Conectar WhatsApp
          </h1>

          <p className="text-sm text-gray-500">
            Conecte o WhatsApp da sua empresa ao RespondeZap.
          </p>
        </div>
      </div>

      <Card>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Conecte o WhatsApp da sua empresa
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-500">
            Depois de conectar, as mensagens recebidas pelos seus clientes
            poderão aparecer automaticamente na aba Conversas.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Receba mensagens dos seus clientes
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Organize as conversas no RespondeZap
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Gere respostas com inteligência artificial
            </div>
          </div>

          <div className="mt-7 flex justify-center">
            <Button>
              <MessageCircle className="h-4 w-4" />
              Conectar WhatsApp
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}