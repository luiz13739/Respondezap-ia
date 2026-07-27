"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type AttendanceTone = "formal" | "informal" | "amigavel" | "profissional";

interface CompanyData {
  name: string;
  segment: string;
  description: string;
  products_services: string;
  business_hours: string;
  address: string;
  phone: string;
  payment_methods: string;
  delivery: string;
  delivery_time: string;
  faq: string;
  important_info: string;
  promotions: string;
  tone: AttendanceTone;
}

const initialData: CompanyData = {
  name: "",
  segment: "",
  description: "",
  products_services: "",
  business_hours: "",
  address: "",
  phone: "",
  payment_methods: "",
  delivery: "",
  delivery_time: "",
  faq: "",
  important_info: "",
  promotions: "",
  tone: "amigavel",
};

const toneOptions: { value: AttendanceTone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
  { value: "amigavel", label: "Amigável" },
  { value: "profissional", label: "Profissional" },
];

export default function MinhaEmpresaPage() {
  const supabase = createClient();

  const [formData, setFormData] = useState<CompanyData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, []);

  async function loadCompanyData() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Não foi possível identificar o usuário logado.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("companies")
        .select(
          "name, segment, description, products_services, business_hours, address, phone, payment_methods, delivery, delivery_time, faq, important_info, promotions, tone"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage("Erro ao carregar os dados da empresa.");
        setLoading(false);
        return;
      }

      if (data) {
        setFormData({
          name: data.name ?? "",
          segment: data.segment ?? "",
          description: data.description ?? "",
          products_services: data.products_services ?? "",
          business_hours: data.business_hours ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          payment_methods: data.payment_methods ?? "",
          delivery: data.delivery ?? "",
          delivery_time: data.delivery_time ?? "",
          faq: data.faq ?? "",
          important_info: data.important_info ?? "",
          promotions: data.promotions ?? "",
          tone: (data.tone as AttendanceTone) ?? "amigavel",
        });
      }
    } catch {
      setErrorMessage("Erro inesperado ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    field: keyof CompanyData,
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Não foi possível identificar o usuário logado.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("companies").upsert(
        {
          user_id: user.id,
          name: formData.name,
          segment: formData.segment,
          description: formData.description,
          products_services: formData.products_services,
          business_hours: formData.business_hours,
          address: formData.address,
          phone: formData.phone,
          payment_methods: formData.payment_methods,
          delivery: formData.delivery,
          delivery_time: formData.delivery_time,
          faq: formData.faq,
          important_info: formData.important_info,
          promotions: formData.promotions,
          tone: formData.tone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setErrorMessage("Erro ao salvar os dados da empresa.");
        setSaving(false);
        return;
      }

      setSuccessMessage("Dados salvos com sucesso!");
    } catch {
      setErrorMessage("Erro inesperado ao salvar os dados.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <p className="text-sm text-gray-500">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Minha Empresa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure as informações que serão usadas pelo assistente para atender seus clientes.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da empresa"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Pizzaria do João"
            />
            <Input
              label="Segmento"
              value={formData.segment}
              onChange={(e) => handleChange("segment", e.target.value)}
              placeholder="Ex: Alimentação, Moda, Serviços"
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Descrição"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Conte um pouco sobre sua empresa"
              rows={4}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Produtos e Serviços</h2>
          <Textarea
            label="Produtos / Serviços oferecidos"
            value={formData.products_services}
            onChange={(e) => handleChange("products_services", e.target.value)}
            placeholder="Liste os principais produtos ou serviços"
            rows={4}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Atendimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Horário de funcionamento"
              value={formData.business_hours}
              onChange={(e) => handleChange("business_hours", e.target.value)}
              placeholder="Ex: Seg a Sex, 9h às 18h"
            />
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Ex: (11) 99999-9999"
            />
          </div>
          <div className="mt-4">
            <Input
              label="Endereço"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pagamento e Entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Formas de pagamento"
              value={formData.payment_methods}
              onChange={(e) => handleChange("payment_methods", e.target.value)}
              placeholder="Ex: Pix, Cartão, Dinheiro"
            />
            <Input
              label="Entrega"
              value={formData.delivery}
              onChange={(e) => handleChange("delivery", e.target.value)}
              placeholder="Ex: Entregamos em toda a cidade"
            />
          </div>
          <div className="mt-4">
            <Input
              label="Tempo de entrega"
              value={formData.delivery_time}
              onChange={(e) => handleChange("delivery_time", e.target.value)}
              placeholder="Ex: 30 a 60 minutos"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h2>
          <div className="space-y-4">
            <Textarea
              label="Perguntas frequentes (FAQ)"
              value={formData.faq}
              onChange={(e) => handleChange("faq", e.target.value)}
              placeholder="Perguntas e respostas comuns"
              rows={4}
            />
            <Textarea
              label="Informações importantes"
              value={formData.important_info}
              onChange={(e) => handleChange("important_info", e.target.value)}
              placeholder="Regras, políticas ou avisos importantes"
              rows={3}
            />
            <Textarea
              label="Promoções"
              value={formData.promotions}
              onChange={(e) => handleChange("promotions", e.target.value)}
              placeholder="Promoções ativas no momento"
              rows={3}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tom de Atendimento</h2>
          <Select
            label="Tom da conversa"
            value={formData.tone}
            onChange={(e) => handleChange("tone", e.target.value)}
          >
            {toneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </Card>
    </div>
  );
}