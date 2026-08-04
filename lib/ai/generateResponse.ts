import type { AttendanceTone } from "@/lib/types";

interface GenerateResponseParams {
  customerMessage: string;
  customerPhone: string;
  companyName?: string;
  segment?: string;
  description?: string;
  productsServices?: string;
  businessHours?: string;
  phone?: string;
  address?: string;
  paymentMethods?: string;
  delivery?: string;
  deliveryTime?: string;
  faq?: string;
  importantInfo?: string;
  promotions?: string;
  tone?: AttendanceTone;
}

export async function generateResponse({
  customerMessage,
  customerPhone,
  companyName,
  segment,
  description,
  productsServices,
  businessHours,
  phone,
  address,
  paymentMethods,
  delivery,
  deliveryTime,
  faq,
  importantInfo,
  promotions,
  tone,
}: GenerateResponseParams): Promise<string> {
  const response = await fetch("/api/generate-response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerMessage,
      customerPhone,
      companyName,
      segment,
      description,
      productsServices,
      businessHours,
      phone,
      address,
      paymentMethods,
      delivery,
      deliveryTime,
      faq,
      importantInfo,
      promotions,
      tone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao gerar resposta");
  }

  return data.response;
}