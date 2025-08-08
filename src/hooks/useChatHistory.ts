import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat } from './useChat';

export const useChatHistory = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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
      // Delete messages first to avoid FK issues
      const { error: msgErr } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);
      if (msgErr) throw msgErr;

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

  const deleteAllChats = async () => {
    if (chats.length === 0) return;
    setIsDeletingAll(true);
    try {
      const chatIds = chats.map(c => c.id);
      // Delete all messages for these chats
      const { error: msgErr } = await supabase
        .from('messages')
        .delete()
        .in('chat_id', chatIds);
      if (msgErr) throw msgErr;
      // Delete chats
      const { error: chatErr } = await supabase
        .from('chats')
        .delete()
        .in('id', chatIds);
      if (chatErr) throw chatErr;

      setChats([]);
    } catch (error) {
      console.error('Error deleting all chats:', error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  return {
    chats,
    isLoading,
    isDeletingAll,
    loadChatHistory,
    deleteChat,
    deleteAllChats,
  };
};