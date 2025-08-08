import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe tu pregunta sobre SAP aquí..."
        disabled={isLoading}
        className="flex-1 h-12 bg-background border-2 border-muted focus:border-primary transition-colors"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading}
        className="h-12 px-6 bg-primary hover:bg-sap-blue-dark transition-colors shadow-[var(--shadow-soft)]"
      >
        <Send className="h-4 w-4" />
        <span className="ml-2">Preguntar</span>
      </Button>
    </form>
  );
};