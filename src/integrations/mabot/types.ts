export type Token = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type TextContent = {
  type: "text";
  value: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2" | null;
};

export type AudioContent = {
  type: "audio";
  value: string;
  filename: string;
  mimetype: string;
  parse_to_text?: boolean;
  parsed_text?: string | null;
};

export type ImageContent = {
  type: "image";
  value: string;
  filename: string;
  mimetype: string;
};

export type VideoContent = {
  type: "video";
  value: string;
  filename: string;
  mimetype: string;
};

export type DocumentContent = {
  type: "document";
  value: string;
  filename: string;
  mimetype: string;
};

export type InputContent = TextContent | AudioContent | ImageContent | VideoContent | DocumentContent;
export type OutputContent = TextContent | AudioContent | ImageContent | VideoContent | DocumentContent;

export type MessageInput = {
  role: "developer" | "system" | "user" | "assistant" | "tool" | "function";
  contents: InputContent[];
  reply_to_message?: MessageInput | null;
};

export type MessageOutput = {
  role: "developer" | "system" | "user" | "assistant" | "tool" | "function";
  contents: OutputContent[];
  reply_to_message?: MessageOutput | null;
};

export type UpdateIn = {
  platform: "web" | "whatsapp" | "telegram";
  chat_id?: string | null;
  platform_chat_id?: string | null;
  messages: MessageInput[];
  bot_username?: string | null;
  prefix_with_bot_name?: boolean;
};

export type UpdateOut = {
  chat_id: string;
  platform_chat_id?: string | null;
  messages: MessageOutput[];
}; 