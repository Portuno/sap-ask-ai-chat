import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4 justify-start">
      <Avatar className="h-8 w-8 bg-primary">
        <AvatarFallback>
          <Bot className="h-4 w-4 text-primary-foreground" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="p-3 bg-card text-card-foreground shadow-[var(--shadow-chat)]">
        <div className="flex gap-1 items-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-sap-gray rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-sap-gray rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 bg-sap-gray rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
          <span className="text-xs text-muted-foreground ml-2">Escribiendo...</span>
        </div>
      </Card>
    </div>
  );
};