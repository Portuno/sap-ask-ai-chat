import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy tu asistente de SAP impulsado por IA. Puedo ayudarte con consultas sobre módulos SAP, transacciones, configuraciones y mejores prácticas. ¿En qué puedo asistirte hoy?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const simulateResponse = (userMessage: string): string => {
    const responses = [
      `Para consultas sobre ${userMessage.toLowerCase()}, te recomiendo revisar las transacciones SE80 para desarrollo y SM30 para configuración de tablas. ¿Necesitas información más específica sobre algún módulo en particular?`,
      `En SAP, para resolver tu consulta sobre "${userMessage}", deberías comenzar por verificar las autorizaciones en SU53 y luego revisar la configuración en SPRO. ¿Te gustaría que profundice en algún aspecto específico?`,
      `Basándome en tu pregunta sobre "${userMessage}", en SAP esto se maneja típicamente a través del módulo correspondiente. Te sugiero revisar la documentación en SE61 o consultar las notas SAP relevantes. ¿Qué módulo específico estás utilizando?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateResponse(messageText),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-sap-blue-light">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-sap-blue-dark bg-clip-text text-transparent mb-4">
            Asistente de SAP impulsado por IA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu compañero inteligente para consultas de SAP. Obtén respuestas instantáneas sobre módulos, 
            transacciones y mejores prácticas en lenguaje natural.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-[var(--shadow-soft)] overflow-hidden">
          {/* Chat Area */}
          <ScrollArea className="h-96 p-6 bg-gradient-to-b from-card to-card/80">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 bg-card border-t border-border/50">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Desarrollado con tecnología de IA avanzada para consultas SAP
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;