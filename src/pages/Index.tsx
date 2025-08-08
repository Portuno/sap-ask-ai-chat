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
import { History } from "lucide-react";

const Index = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  
  const { messages, currentChat, isLoading, sendMessage, sendAudioMessage, shareChat } = useChat(chatId);

  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText, (newChatId) => {
      if (!chatId && newChatId) {
        navigate(`/chat/${newChatId}`, { replace: true });
      }
    });
  };

  const handleSendAudio = async (audio: Blob, durationSec: number) => {
    await sendAudioMessage(audio, durationSec, (newChatId) => {
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background to-sap-blue-light flex">
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
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Top Nav */}
        <div className="w-full border-b border-border/50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="container mx-auto px-4 py-3 max-w-5xl flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-sap-blue-dark bg-clip-text text-transparent">
              Asistente de SAP
            </h1>
            <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 max-w-5xl flex-1 min-h-0 flex flex-col">
          {/* Chat Container */}
          <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-[var(--shadow-soft)] overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 md:p-6 bg-gradient-to-b from-card to-card/80">
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
            <div className="p-3 md:p-4 bg-card border-t border-border/50">
              <ChatInput onSendMessage={handleSendMessage} onSendAudio={handleSendAudio} isLoading={isLoading} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;