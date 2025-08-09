import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const formatMabotText = (raw: string): string => {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n");

  // Normalize horizontal rules and ensure spacing
  text = text.replace(/\s*---\s*/g, "\n\n---\n\n");

  // Ensure headings start on a new paragraph
  text = text.replace(/###\s/g, "\n\n### ");
  text = text.replace(/##\s/g, "\n\n## ");

  // Force numbered lists to begin on a new line when embedded inline
  text = text.replace(/\s(\d+)\.\s/g, "\n$1. ");

  // Convert inline bullets after punctuation into real list items
  text = text.replace(/([:\.;])\s-\s/g, "$1\n- ");

  // Collapse excessive newlines to max 2
  text = text.replace(/\n{3,}/g, "\n\n");

  // Trim trailing spaces per line
  text = text
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n");

  return text.trim();
};

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  const formatted = isUser ? message : formatMabotText(message);

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary">
          <AvatarFallback>
            <Bot className="h-4 w-4 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <Card className={`p-3 ${
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-card text-card-foreground shadow-[var(--shadow-chat)]"
        }`}>
          <div className={`${isUser ? "prose prose-sm prose-invert" : "prose prose-sm"} max-w-none prose-p:my-1 prose-pre:my-2 prose-code:px-1 prose-code:py-0.5 whitespace-pre-wrap`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              skipHtml
              linkTarget="_blank"
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} rel="noopener noreferrer" className="underline" />
                ),
                code: ({ inline, className, children, ...props }) => {
                  const isInline = inline ?? false;
                  if (isInline) {
                    return (
                      <code className={"rounded bg-muted/40 " + (className || "")} {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="rounded-md bg-muted/30 p-3 overflow-x-auto">
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-2 pl-3 italic opacity-90" {...props} />
                ),
              }}
            >
              {formatted}
            </ReactMarkdown>
          </div>
        </Card>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 bg-sap-gray">
          <AvatarFallback>
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};