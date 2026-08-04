import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const {
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
    } = await request.json();

    if (!customerMessage || !customerMessage.trim()) {
      return NextResponse.json(
        { error: "A mensagem do cliente é obrigatória" },
        { status: 400 }
      );
    }

    if (!customerPhone || !customerPhone.trim()) {
      return NextResponse.json(
        {
          error:
            "O telefone do cliente (customerPhone) é obrigatório para manter o histórico separado por conversa",
        },
        { status: 400 }
      );
    }

    // Busca SOMENTE o histórico deste cliente específico, desta empresa (user.id).
    // Isso garante que o histórico de um cliente nunca se misture com o de outro.
    const { data: history, error: historyError } = await supabase
      .from("conversations")
      .select("role, message")
      .eq("user_id", user.id)
      .eq("customer_phone", customerPhone)
      .order("created_at", { ascending: false })
      .limit(10);

    if (historyError) {
      console.log("Erro ao buscar histórico:", historyError);
    }

    // Histórico em ordem cronológica (a query veio do mais recente pro mais antigo)
    const conversationHistory = (history ?? [])
      .reverse()
      .map(
        (msg) =>
          `${msg.role === "user" ? "Cliente" : "Atendente"}: ${msg.message}`
      )
      .join("\n");

    // Salva a mensagem do cliente JÁ vinculada ao telefone correto,
    // antes de gerar a resposta (assim ela não entra duplicada no histórico acima).
    const { error: saveUserError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        customer_phone: customerPhone,
        role: "user",
        message: customerMessage,
      });

    if (saveUserError) {
      console.log("Erro ao salvar mensagem do cliente:", saveUserError);
    }

    const today = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const prompt = `
Você é um atendente profissional de WhatsApp de uma empresa.

Hoje é: ${today}

Sua função é responder clientes como um funcionário real da empresa.

Dados da empresa:

Nome:
${companyName}

Segmento:
${segment}

Descrição:
${description}

Produtos e serviços:
${productsServices}

Horário de funcionamento:
${businessHours}

Telefone:
${phone}

Endereço:
${address}

Formas de pagamento:
${paymentMethods}

Entrega:
${delivery}

Tempo de entrega:
${deliveryTime}

Perguntas frequentes:
${faq}

Informações importantes:
${importantInfo}

Promoções:
${promotions}

Tom de atendimento:
${tone}


REGRAS IMPORTANTES:

- Responda como uma pessoa real atendendo pelo WhatsApp.
- Seja educado, natural e objetivo.
- Responda primeiro exatamente o que o cliente perguntou.
- Não use frases genéricas como "estou aqui para ajudar".
- Não invente informações, preços, horários, serviços ou promoções.
- Use somente os dados fornecidos pela empresa.
- Não force vendas.
- Não ofereça produtos que o cliente não perguntou.
- Não faça perguntas desnecessárias.
- Mantenha respostas curtas e naturais.

REGRAS DE CONVERSÃO:

- Quando o cliente demonstrar interesse em comprar, agendar ou contratar um serviço, conduza o próximo passo.
- Faça perguntas úteis para continuar o atendimento.
- Ajude o cliente até ele conseguir realizar o objetivo.

Exemplos:

Cliente:
"Vocês fazem exame de vista?"

Resposta:
"Olá! 😊 Sim, realizamos exames de vista. Gostaria de agendar um horário ou tirar alguma dúvida?"

Cliente:
"Quero um exame"

Resposta:
"Olá! 😊 Claro, podemos ajudar com o agendamento do seu exame de vista. Qual dia e horário seria melhor para você?"

Cliente:
"Qual o valor?"

Resposta:
"Claro! Vou verificar essa informação para você." 
(Não invente valores caso não estejam cadastrados)


- Nunca diga que você é uma inteligência artificial.
- Use emojis apenas quando combinar com o tom da empresa.
- Adapte a linguagem ao segmento.


Histórico da conversa:

${conversationHistory}

Mensagem atual do cliente:

${customerMessage}


Responda somente a mensagem que será enviada ao cliente.
`;

console.log("========== HISTÓRICO ==========");
console.log(conversationHistory);

console.log("========== MENSAGEM ATUAL ==========");
console.log(customerMessage);

console.log("========== CUSTOMER PHONE ==========");
console.log(customerPhone);
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
        }),
      }
    );

    const data = await response.json();

    // Só tenta salvar/retornar a resposta da IA se a chamada realmente deu certo.
    if (!response.ok || !data?.choices?.[0]?.message?.content) {
      console.log(data);
      return NextResponse.json({ error: "Erro na IA" }, { status: 500 });
    }

    const aiMessage = data.choices[0].message.content as string;

    // Salva a resposta da IA com o MESMO customer_phone da mensagem do cliente
    const { error: saveAssistantError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        customer_phone: customerPhone,
        role: "assistant",
        message: aiMessage,
      });

    if (saveAssistantError) {
      console.log("Erro ao salvar resposta da IA:", saveAssistantError);
    }

    return NextResponse.json({
      response: aiMessage,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Erro ao gerar resposta" },
      { status: 500 }
    );
  }
}