import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Cria o cliente apenas quando uma requisição chegar.
// Isso evita erro durante o build da Vercel.
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não encontrada.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não encontrada.");
  }

  return createClient(url, serviceRoleKey);
}

// =========================
// Verificação do Webhook
// =========================
export async function GET(request: NextRequest) {
  
    console.log("VERIFY_TOKEN =", process.env.WHATSAPP_VERIFY_TOKEN);
    
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("VERIFY_TOKEN:", VERIFY_TOKEN);
console.log("TOKEN RECEBIDO:", token);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json(
    { error: "Token de verificação inválido" },
    { status: 403 }
  );
}

// =========================
// Recebe mensagens
// =========================
export async function POST(request: NextRequest) {
  console.log("🔥 POST DO WHATSAPP CHEGOU NO CÓDIGO");
  try {
    const supabase = getSupabase();

    const body = await request.json();

    console.log(
      "Webhook WhatsApp recebido:",
      JSON.stringify(body, null, 2)
    );

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
          if (message.type !== "text") continue;

          const customerPhone = message.from;
          const customerMessage = message.text?.body;
          const whatsappMessageId = message.id;
          const timestamp = message.timestamp;
          const phoneNumberId = value?.metadata?.phone_number_id;

          if (!customerPhone || !customerMessage) continue;

          console.log("Mensagem recebida:", {
            customerPhone,
            customerMessage,
            whatsappMessageId,
            phoneNumberId,
          });

          if (!phoneNumberId) {
            console.error("Phone Number ID não encontrado.");
            continue;
          }

          const { data: connection, error: connectionError } =
            await supabase
              .from("whatsapp_connections")
              .select("user_id")
              .eq("phone_number_id", phoneNumberId)
              .maybeSingle();

              console.log("CONEXÃO ENCONTRADA:", connection);
              console.log("PHONE NUMBER ID RECEBIDO:", phoneNumberId);
console.log("CONEXÃO:", JSON.stringify(connection));
console.log("ERRO:", JSON.stringify(connectionError));
console.log("ERRO DA CONEXÃO:", connectionError);

          if (connectionError) {
            console.error(
              "Erro ao encontrar conexão:",
              connectionError
            );
            continue;
          }

          if (!connection) {
            console.error(
              "Nenhuma empresa encontrada para:",
              phoneNumberId
            );
            continue;
          }

          const { data: existingMessage } = await supabase
            .from("conversations")
            .select("id")
            .eq("whatsapp_message_id", whatsappMessageId)
            .maybeSingle();

          if (existingMessage) {
            console.log("Mensagem já salva.");
            continue;
          }

          const { error: insertError } = await supabase
            .from("conversations")
            .insert({
              user_id: connection.user_id,
              customer_phone: customerPhone,
              role: "user",
              message: customerMessage,
              whatsapp_message_id: whatsappMessageId,
              created_at: timestamp
                ? new Date(Number(timestamp) * 1000).toISOString()
                : new Date().toISOString(),
            });

          if (insertError) {
            console.error(
              "Erro ao salvar mensagem:",
              insertError
            );
            continue;
          }

          console.log("Mensagem salva com sucesso!");
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Erro no Webhook:", error);

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