import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatHistory } from "@/components/ChatHistory";
import { ShareButton } from "@/components/ShareButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { History, X } from "lucide-react";

const Index = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  
  const { messages, currentChat, isLoading, sendMessage, shareChat } = useChat(chatId);

  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText, (newChatId) => {
      // Navigate to the new chat URL if we created a new chat
      if (!chatId && newChatId) {
        navigate(`/chat/${newChatId}`, { replace: true });
      }
    });
  };

  const handleChatSelect = (selectedChatId: string) => {
    if (selectedChatId === 'new') {
      navigate('/', { replace: true });
    } else {
      navigate(`/chat/${selectedChatId}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-sap-blue-light flex">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowHistory(false)} />
          <div className="relative z-10 h-full">
            <ChatHistory 
              onChatSelect={handleChatSelect}
              onClose={() => setShowHistory(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                Historial
              </Button>
              
              {currentChat && (
                <ShareButton 
                  onShare={shareChat}
                  disabled={!currentChat}
                />
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-sap-blue-dark bg-clip-text text-transparent mb-4">
              Asistente de SAP impulsado por IA
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tu compañero inteligente para consultas de SAP. Obtén respuestas instantáneas sobre módulos, 
              transacciones y mejores prácticas en lenguaje natural.
            </p>
          </div>

          {/* Chat Container */}
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-[var(--shadow-soft)] overflow-hidden flex-1 flex flex-col">
            {/* Chat Area */}
            <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-card to-card/80">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.is_user}
                    timestamp={new Date(message.created_at)}
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
    </div>
  );
};

export default Index;