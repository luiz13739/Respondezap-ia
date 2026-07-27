import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verificação do Webhook pela Meta
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json(
    { error: "Token de verificação inválido" },
    { status: 403 }
  );
}

// Recebe mensagens enviadas pelo WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "Webhook WhatsApp recebido:",
      JSON.stringify(body, null, 2)
    );

    // Verifica se o evento veio da WhatsApp Cloud API
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { error: "Evento inválido" },
        { status: 400 }
      );
    }

    const entries = body.entry ?? [];

    for (const entry of entries) {
      const changes = entry.changes ?? [];

      for (const change of changes) {
        const value = change.value;

        const messages = value?.messages ?? [];

        for (const message of messages) {
          // Por enquanto, processamos apenas mensagens de texto
          if (message.type !== "text") {
            continue;
          }

          const customerPhone = message.from;
          const customerMessage = message.text?.body;
          const whatsappMessageId = message.id;
          const timestamp = message.timestamp;
          const phoneNumberId = value?.metadata?.phone_number_id;

          if (!customerPhone || !customerMessage) {
            continue;
          }

          console.log("Mensagem recebida:", {
            customerPhone,
            customerMessage,
            whatsappMessageId,
            phoneNumberId,
          });

          if (!phoneNumberId) {
            console.error(
              "Phone Number ID não encontrado."
            );
            continue;
          }

          /*
           * Procura qual usuário do RespondeZap
           * é dono desse número do WhatsApp.
           */
          const { data: connection, error: connectionError } =
            await supabase
              .from("whatsapp_connections")
              .select("user_id")
              .eq("phone_number_id", phoneNumberId)
              .maybeSingle();

          if (connectionError) {
            console.error(
              "Erro ao encontrar conexão WhatsApp:",
              connectionError
            );
            continue;
          }

          if (!connection) {
            console.error(
              "Nenhuma empresa encontrada para o Phone Number ID:",
              phoneNumberId
            );
            continue;
          }

          /*
           * Evita salvar a mesma mensagem duas vezes.
           */
          const { data: existingMessage } = await supabase
            .from("conversations")
            .select("id")
            .eq(
              "whatsapp_message_id",
              whatsappMessageId
            )
            .maybeSingle();

          if (existingMessage) {
            console.log(
              "Mensagem já foi salva:",
              whatsappMessageId
            );
            continue;
          }

          /*
           * Salva a mensagem do cliente na tabela conversations.
           */
          const { error: insertError } = await supabase
            .from("conversations")
            .insert({
              user_id: connection.user_id,
              customer_phone: customerPhone,
              role: "user",
              message: customerMessage,
              whatsapp_message_id: whatsappMessageId,
              created_at: timestamp
                ? new Date(
                    Number(timestamp) * 1000
                  ).toISOString()
                : new Date().toISOString(),
            });

          if (insertError) {
            console.error(
              "Erro ao salvar mensagem:",
              insertError
            );
            continue;
          }

          console.log(
            "Mensagem salva com sucesso no Supabase!"
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro no Webhook do WhatsApp:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro interno no Webhook",
      },
      {
        status: 500,
      }
    );
  }
}