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
  Brain,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";

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
  const [isTextUploaded, setIsTextUploaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingText, setIsUploadingText] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const hasBaseText = isTextUploaded && baseText.trim().length > 0;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({type, message});
    setTimeout(() => setNotification({type: null, message: ''}), 3000);
  };

  const handleSubmitBaseText = async () => {
    if (baseText.trim()) {
      setIsUploadingText(true);
      try {
        const response = await fetch('/api/upload-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: baseText }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload text');
        }

        const result = await response.json();
        setIsTextUploaded(true);
      } catch (error) {
        console.error('Error uploading text:', error);
        setIsTextUploaded(false);
        // Você pode adicionar uma notificação de erro aqui
        alert('Erro ao enviar o texto. Tente novamente.');
      } finally {
        setIsUploadingText(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
    
    // Limpar o input para permitir carregar o mesmo arquivo novamente
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0]; // Pegar apenas o primeiro arquivo
    
    // Processar o arquivo diretamente
    await processFile(file);
  };

  const processFile = async (file: File) => {
    // Verificar tipo de arquivo
    const allowedTypes = [
      'text/plain',
      'text/markdown', 
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      showNotification('error', 'Formato de arquivo não suportado. Use: TXT, MD, PDF, DOC ou DOCX');
      return;
    }

    setIsLoadingFile(true);
    try {
      let content = '';

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        // Arquivos de texto simples
        content = await file.text();
      } else {
        // Para outros formatos, vamos simular a extração de texto
        // Em produção, você usaria bibliotecas como pdf-parse, mammoth, etc.
        showNotification('error', 'Funcionalidade para este tipo de arquivo em desenvolvimento. Use arquivos .txt ou .md por enquanto.');
        return;
      }

      if (content.trim()) {
        setBaseText(content);
        setLoadedFileName(file.name);
        showNotification('success', `Arquivo "${file.name}" carregado! Revise o conteúdo e clique em "Analisar Documento".`);
      } else {
        showNotification('error', 'O arquivo está vazio ou não foi possível extrair o conteúdo.');
      }
    } catch (error) {
      console.error('Error reading file:', error);
      showNotification('error', 'Erro ao ler o arquivo. Tente novamente.');
    } finally {
      setIsLoadingFile(false);
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

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const result = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.answer,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      showNotification('error', 'Erro ao processar pergunta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header/Menu Principal */}
      <header className="border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">NotebookLM Clone</h1>
            {hasBaseText && (
              <Badge variant="outline" className="ml-4">
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat ativo
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">v1.0</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Notificação */}
      {notification.type && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar com texto base */}
        <div className="w-80 border-r bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documento Base</h2>
          </div>
          
          {!hasBaseText ? (
            <div className="space-y-4"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
                isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'
              }`}>
                <FileText className={`w-12 h-12 mx-auto mb-4 ${
                  isDragOver ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'
                }`} />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {isDragOver ? 'Solte o arquivo aqui' : 'Adicione seu documento'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {isDragOver ? 'Solte para carregar o arquivo' : 'Carregue ou cole o texto que deseja analisar e fazer perguntas'}
                </p>
              </div>
              
              {loadedFileName && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-700 truncate">
                      {loadedFileName}
                    </p>
                    <p className="text-xs text-blue-600">
                      {baseText.length} caracteres
                    </p>
                  </div>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] w-[95vw] sm:w-full">
                      <DialogHeader>
                        <DialogTitle className="truncate">Visualizar Conteúdo - {loadedFileName}</DialogTitle>
                        <DialogDescription>
                          Revise o conteúdo do arquivo antes de analisar
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] w-full">
                        <Textarea
                          value={baseText}
                          onChange={(e) => setBaseText(e.target.value)}
                          placeholder="Edite o conteúdo se necessário..."
                          className="min-h-[50vh] resize-none border-0 focus:ring-0"
                        />
                      </ScrollArea>
                      
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLoadedFileName(null);
                      setBaseText("");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {!loadedFileName && (
                <Textarea
                  placeholder="Cole seu texto aqui..."
                  value={baseText}
                  onChange={(e) => setBaseText(e.target.value)}
                  className="h-32 resize-none"
                />
              )}
              
              {loadedFileName && (
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Preview do conteúdo:</p>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-600 max-h-24 overflow-hidden">
                    <p className="text-sm text-gray-700 dark:text-gray-300" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {baseText.substring(0, 150)}...
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver conteúdo completo
                  </Button>
                </div>
              )}
              
              <div className="space-y-2">
                <Button 
                  onClick={handleSubmitBaseText}
                  className="w-full"
                  disabled={!baseText.trim() || isUploadingText}
                >
                  {isUploadingText ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analisar
                    </>
                  )}
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <label>
                    {isLoadingFile ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-500 border-t-transparent rounded-full"></div>
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Carregar Arquivo
                      </>
                    )}
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,.doc,.docx,text/plain,text/markdown"
                      onChange={handleFileUpload}
                      disabled={isLoadingFile}
                      className="hidden"
                    />
                  </label>
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
                onClick={async () => {
                  setBaseText("");
                  setIsTextUploaded(false);
                  setMessages([]);
                  setLoadedFileName(null);
                  // Limpar o texto base no servidor também
                  try {
                    await fetch('/api/upload-text', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ text: "" }),
                    });
                  } catch (error) {
                    console.error('Error clearing base text:', error);
                  }
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
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
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
        <div className="flex-1 flex flex-col">
          {/* Área de mensagens com scroll */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4 max-w-4xl mx-auto">
                {!hasBaseText ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                        Bem-vindo ao NotebookLM Clone
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Para começar, adicione um documento na barra lateral e comece a fazer perguntas sobre o conteúdo.
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Pronto para conversar!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
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
                                : "bg-white dark:bg-gray-800 border"
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
                                    : "text-gray-500 dark:text-gray-400"
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
                        <Card className="bg-white dark:bg-gray-800 border max-w-[80%]">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Analisando...</span>
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
            <div className="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4 shrink-0">
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
    </div>
  );
}