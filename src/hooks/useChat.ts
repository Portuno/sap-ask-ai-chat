import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  public_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useChat = (chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load chat and messages
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      // Set default welcome message for new chats
      setMessages([{
        id: 'welcome',
        content: '¡Hola! Soy tu asistente de SAP impulsado por IA. Puedo ayudarte con consultas sobre módulos SAP, transacciones, configuraciones y mejores prácticas. ¿En qué puedo asistirte hoy?',
        is_user: false,
        created_at: new Date().toISOString()
      }]);
    }
  }, [chatId]);

  const loadChat = async (id: string) => {
    try {
      // Load chat by public_id or regular id
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .or(`id.eq.${id},public_id.eq.${id}`)
        .maybeSingle();

      if (chatError) throw chatError;

      if (!chat) {
        toast({
          title: "Chat no encontrado",
          description: "El chat que buscas no existe o no está disponible.",
          variant: "destructive"
        });
        return;
      }

      setCurrentChat(chat);

      // Load messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(messages || []);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el chat.",
        variant: "destructive"
      });
    }
  };

  const createChat = async (firstMessage: string): Promise<string | null> => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          title,
          is_public: false
        })
        .select()
        .single();

      if (chatError) throw chatError;

      setCurrentChat(chat);
      return chat.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el chat.",
        variant: "destructive"
      });
      return null;
    }
  };

  const saveMessage = async (content: string, isUser: boolean, chatId: string) => {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content,
          is_user: isUser
        })
        .select()
        .single();

      if (error) throw error;

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const simulateResponse = (userMessage: string): string => {
    const responses = [
      `Para consultas sobre ${userMessage.toLowerCase()}, te recomiendo revisar las transacciones SE80 para desarrollo y SM30 para configuración de tablas. ¿Necesitas información más específica sobre algún módulo en particular?`,
      `En SAP, para resolver tu consulta sobre "${userMessage}", deberías comenzar por verificar las autorizaciones en SU53 y luego revisar la configuración en SPRO. ¿Te gustaría que profundice en algún aspecto específico?`,
      `Basándome en tu pregunta sobre "${userMessage}", en SAP esto se maneja típicamente a través del módulo correspondiente. Te sugiero revisar la documentación en SE61 o consultar las notas SAP relevantes. ¿Qué módulo específico estás utilizando?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async (messageText: string, onSuccess?: (chatId: string) => void) => {
    setIsLoading(true);

    try {
      let chatIdToUse = currentChat?.id;

      // Create new chat if none exists
      if (!chatIdToUse) {
        chatIdToUse = await createChat(messageText);
        if (!chatIdToUse) {
          setIsLoading(false);
          return;
        }
      }

      // Save user message
      const userMessage = await saveMessage(messageText, true, chatIdToUse);
      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
      }

      // Simulate bot response
      setTimeout(async () => {
        const botResponse = simulateResponse(messageText);
        const botMessage = await saveMessage(botResponse, false, chatIdToUse!);
        
        if (botMessage) {
          setMessages(prev => [...prev, botMessage]);
        }
        
        setIsLoading(false);
        onSuccess?.(chatIdToUse!);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive"
      });
    }
  };

  const shareChat = async () => {
    if (!currentChat) return null;

    try {
      const { data: updatedChat, error } = await supabase
        .from('chats')
        .update({ is_public: true })
        .eq('id', currentChat.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentChat(updatedChat);
      
      const shareUrl = `${window.location.origin}/chat/${updatedChat.public_id}`;
      
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace para compartir se ha copiado al portapapeles."
      });

      return shareUrl;
    } catch (error) {
      console.error('Error sharing chat:', error);
      toast({
        title: "Error",
        description: "No se pudo compartir el chat.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    messages,
    currentChat,
    isLoading,
    sendMessage,
    shareChat,
    loadChat
  };
};