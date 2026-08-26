"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import {
  MessageCircle,
  User,
  Bot,
  Clock,
  Loader2,
  AlertCircle,
  Inbox,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface ConversationRow {
  id: number;
  created_at: string;
  user_id: string | null;
  customer_phone: string | null;
  role: string | null;
  message: string | null;
}

interface GroupedConversation {
  customerPhone: string;
  messages: ConversationRow[];
  lastMessage: ConversationRow;
  messageCount: number;
}

export default function ConversasPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversations, setConversations] = useState<GroupedConversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Guarda qual mensagem foi copiada
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Não foi possível identificar o usuário logado.");

        if (showRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }

        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(
          "id, created_at, user_id, customer_phone, role, message"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      console.log("🔥 USUÁRIO LOGADO:", user.id);
      console.log("🔥 CONVERSAS BUSCADAS:", data);
      console.log("🔥 ERRO AO BUSCAR CONVERSAS:", error);

      if (error) {
        setErrorMessage("Erro ao carregar as conversas.");

        if (showRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }

        return;
      }

      const rows = (data ?? []) as ConversationRow[];

      const groupsMap = new Map<string, ConversationRow[]>();

      for (const row of rows) {
        const key =
          row.customer_phone?.trim() || "Cliente sem identificação";

        const existing = groupsMap.get(key);

        if (existing) {
          existing.push(row);
        } else {
          groupsMap.set(key, [row]);
        }
      }

      const grouped: GroupedConversation[] = Array.from(
        groupsMap.entries()
      ).map(([customerPhone, messages]) => {
        const sorted = [...messages].sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );

        return {
          customerPhone,
          messages: sorted,
          lastMessage: sorted[sorted.length - 1],
          messageCount: sorted.length,
        };
      });

      grouped.sort(
        (a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime()
      );

      setConversations(grouped);

      // Se a conversa selecionada ainda existir, mantém ela.
      // Caso contrário, seleciona a primeira.
      setSelectedPhone((prev) => {
        if (prev && grouped.some((c) => c.customerPhone === prev)) {
          return prev;
        }

        return grouped.length > 0
          ? grouped[0].customerPhone
          : null;
      });
    } catch (error) {
      console.error("Erro inesperado:", error);
      setErrorMessage("Erro inesperado ao carregar as conversas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function truncate(text: string | null, max: number) {
    if (!text) return "";

    return text.length > max
      ? `${text.slice(0, max)}...`
      : text;
  }

  // ============================================================
  // PEGA A ÚLTIMA MENSAGEM DO CLIENTE
  // ============================================================

  function getLastCustomerMessage(
    conversation: GroupedConversation
  ) {
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const msg = conversation.messages[i];

      if (msg.role === "user") {
        return msg.message ?? "";
      }
    }

    return "";
  }

  // ============================================================
  // COPIAR MENSAGEM DO CLIENTE
  // ============================================================

  async function handleCopyMessage(
    conversation: GroupedConversation
  ) {
    const message = getLastCustomerMessage(conversation);

    if (!message) {
      return;
    }

    try {
      await navigator.clipboard.writeText(message);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar mensagem:", error);

      // Fallback para navegadores que bloquearem clipboard
      try {
        const textarea = document.createElement("textarea");

        textarea.value = message;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        console.error("Não foi possível copiar a mensagem.");
      }
    }
  }

  // ============================================================
  // GERAR RESPOSTA
  // ============================================================

  function handleGenerateResponse(
    conversation: GroupedConversation
  ) {
    const phone = conversation.customerPhone;
    const message = getLastCustomerMessage(conversation);

    if (!message) {
      return;
    }

    const params = new URLSearchParams({
      phone,
      message,
    });

    router.push(`/gerar-resposta?${params.toString()}`);
  }

  // ============================================================
  // ABRIR WHATSAPP
  // ============================================================

  function handleOpenWhatsApp(
    conversation: GroupedConversation
  ) {
    const phone = conversation.customerPhone;

    // Remove tudo que não for número
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone) {
      return;
    }

    // Abre a conversa no WhatsApp Web/App.
    // O usuário poderá colar a resposta gerada.
    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.customerPhone === selectedPhone
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />

          <p className="text-sm text-gray-500">
            Carregando conversas...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERRO
  // ============================================================

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>{errorMessage}</span>
        </div>

        <button
          onClick={() => loadConversations(true)}
          className="mt-4 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />

          Tentar novamente
        </button>
      </div>
    );
  }

  // ============================================================
  // NENHUMA CONVERSA
  // ============================================================

  if (conversations.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-16 text-center">
          <Inbox className="h-10 w-10 text-gray-300" />

          <p className="text-gray-500 text-sm">
            Nenhuma conversa encontrada ainda.
          </p>

          <button
            onClick={() => loadConversations(true)}
            disabled={refreshing}
            className="mt-2 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Atualizar
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PÁGINA
  // ============================================================

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* HEADER */}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Conversas
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Acompanhe o histórico de atendimento dos seus clientes.
          </p>
        </div>

        <button
          onClick={() => loadConversations(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          Atualizar
        </button>
      </div>

      {/* CONTEÚDO */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ================================================== */}
        {/* LISTA DE CONVERSAS */}
        {/* ================================================== */}

        <div className="md:col-span-1">
          <Card className="p-0 overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
              {conversations.map((conversation) => {
                const isSelected =
                  conversation.customerPhone === selectedPhone;

                return (
                  <button
                    key={conversation.customerPhone}
                    onClick={() =>
                      setSelectedPhone(
                        conversation.customerPhone
                      )
                    }
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-gray-900 text-white"
                        : "hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageCircle
                          className={`h-4 w-4 shrink-0 ${
                            isSelected
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />

                        <span className="font-medium text-sm truncate">
                          {conversation.customerPhone}
                        </span>
                      </div>

                      <span
                        className={`text-xs shrink-0 ${
                          isSelected
                            ? "text-gray-300"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(
                          conversation.lastMessage.created_at
                        )}
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-1 truncate ${
                        isSelected
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      {truncate(
                        conversation.lastMessage.message,
                        50
                      )}
                    </p>

                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        isSelected
                          ? "text-gray-300"
                          : "text-gray-400"
                      }`}
                    >
                      <Clock className="h-3 w-3" />

                      <span>
                        {formatDateTime(
                          conversation.lastMessage.created_at
                        )}
                      </span>

                      <span className="mx-1">
                        •
                      </span>

                      <span>
                        {conversation.messageCount} mensagens
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ================================================== */}
        {/* CONVERSA SELECIONADA */}
        {/* ================================================== */}

        <div className="md:col-span-2">
          {selectedConversation ? (
            <Card className="p-0 flex flex-col h-[70vh]">
              {/* CABEÇALHO DA CONVERSA */}

              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => setSelectedPhone(null)}
                  className="md:hidden p-1 rounded hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-500" />
                </button>

                <MessageCircle className="h-4 w-4 text-gray-400" />

                <h2 className="font-medium text-gray-900 text-sm">
                  {selectedConversation.customerPhone}
                </h2>

                <span className="text-xs text-gray-400 ml-auto">
                  {selectedConversation.messageCount} mensagens
                </span>
              </div>

              {/* MENSAGENS */}

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {selectedConversation.messages.map((msg) => {
                  const isAssistant =
                    msg.role === "assistant";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isAssistant
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                          isAssistant
                            ? "bg-gray-900 text-white rounded-br-sm"
                            : "bg-white text-gray-900 rounded-bl-sm border border-gray-100"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1 mb-1 text-[11px] font-medium ${
                            isAssistant
                              ? "text-gray-300"
                              : "text-gray-400"
                          }`}
                        >
                          {isAssistant ? (
                            <Bot className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}

                          <span>
                            {isAssistant
                              ? "IA"
                              : "Cliente"}
                          </span>
                        </div>

                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>

                        <p className="text-[10px] mt-1 text-right text-gray-400">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ================================================== */}
              {/* AÇÕES */}
              {/* ================================================== */}

              <div className="border-t border-gray-100 bg-white px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {/* COPIAR */}

                  <button
                    onClick={() =>
                      handleCopyMessage(
                        selectedConversation
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />

                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />

                        Copiar mensagem
                      </>
                    )}
                  </button>

                  {/* GERAR RESPOSTA */}

                  <button
                    onClick={() =>
                      handleGenerateResponse(
                        selectedConversation
                      )
                    }
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                  >
                    <Sparkles className="h-4 w-4" />

                    Gerar Resposta
                  </button>

                  {/* ABRIR WHATSAPP */}

                  <button
                    onClick={() =>
                      handleOpenWhatsApp(
                        selectedConversation
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4" />

                    Abrir WhatsApp
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Copie a mensagem do cliente ou gere uma resposta
                  com a IA.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-0 flex items-center justify-center h-[70vh]">
              <p className="text-sm text-gray-400">
                Selecione uma conversa para ver o histórico.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}