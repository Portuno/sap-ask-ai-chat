import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat } from './useChat';

export const useChatHistory = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setChats(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  return {
    chats,
    isLoading,
    loadChatHistory,
    deleteChat
  };
};