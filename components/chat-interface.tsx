"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  FileText, 
  Upload, 
  MessageCircle, 
  BookOpen,
  Sparkles,
  Brain
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [baseText, setBaseText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasBaseText = baseText.trim().length > 0;

  const handleSubmitBaseText = () => {
    if (baseText.trim()) {
      // Aqui você pode processar o texto base
      console.log("Texto base submetido:", baseText);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !hasBaseText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Simular resposta da IA (substitua pela sua implementação real)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Com base no texto fornecido, posso responder que: ${currentMessage}. Esta é uma resposta simulada baseada na sua pergunta sobre o conteúdo.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Sidebar com texto base */}
      <div className="w-80 border-r bg-white p-6 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Documento Base</h2>
          </div>
          
          {!hasBaseText ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Adicione seu documento
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Carregue ou cole o texto que deseja analisar e fazer perguntas
                </p>
              </div>
              
              <Textarea
                placeholder="Cole seu texto aqui..."
                value={baseText}
                onChange={(e) => setBaseText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              
              <div className="space-y-2">
                <Button 
                  onClick={handleSubmitBaseText}
                  className="w-full"
                  disabled={!baseText.trim()}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Analisar Documento
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Arquivo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-2">
                Documento carregado
              </Badge>
              
              <ScrollArea className="h-48 p-3 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {baseText}
                </p>
              </ScrollArea>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setBaseText("");
                  setMessages([]);
                }}
                className="w-full"
              >
                Alterar Documento
              </Button>
            </div>
          )}
        </div>

        {hasBaseText && (
          <div className="mt-auto">
            <Separator className="mb-4" />
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 text-sm">
                Sugestões de perguntas:
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto p-2"
                  onClick={() => setCurrentMessage("Resuma os pontos principais deste documento")}
                >
                  📝 Resumir pontos principais
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto p-2"
                  onClick={() => setCurrentMessage("Quais são as ideias mais importantes?")}
                >
                  💡 Destacar ideias importantes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto p-2"
                  onClick={() => setCurrentMessage("Explique este conteúdo de forma simples")}
                >
                  🔍 Explicar de forma simples
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-semibold">NotebookLM Clone</h1>
            {hasBaseText && (
              <Badge variant="outline" className="ml-auto">
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat ativo
              </Badge>
            )}
          </div>
        </div>

        {/* Área de mensagens com scroll */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4 max-w-4xl mx-auto">
          {!hasBaseText ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Bem-vindo ao NotebookLM Clone
                </h2>
                <p className="text-gray-600 mb-6">
                  Para começar, adicione um documento na barra lateral e comece a fazer perguntas sobre o conteúdo.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Análise de texto</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    <span>IA conversacional</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Insights inteligentes</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Pronto para conversar!
                  </h3>
                  <p className="text-gray-500">
                    Faça uma pergunta sobre o documento carregado
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        message.isUser
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.isUser
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Card className="bg-white border max-w-[80%]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Analisando...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          </div>
        </ScrollArea>
        </div>

        {/* Input de mensagem fixo */}
        {hasBaseText && (
          <div className="border-t bg-white p-4 shrink-0">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                placeholder="Faça uma pergunta sobre o documento..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}