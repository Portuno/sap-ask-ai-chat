import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatHistory } from '@/hooks/useChatHistory';
import { History, Share2, Trash2, MessageSquare, ChevronLeft, Search, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatHistoryProps {
  onChatSelect: (chatId: string) => void;
  onClose: () => void;
}

export const ChatHistory = ({ onChatSelect, onClose }: ChatHistoryProps) => {
  const { chats, isLoading, isDeletingAll, deleteChat, deleteAllChats } = useChatHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter(c => c.title?.toLowerCase().includes(q));
  }, [chats, query]);

  const handleDeleteChat = async (chatId: string) => {
    setDeletingId(chatId);
    await deleteChat(chatId);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
    onClose();
  };

  return (
    <div className="w-80 h-full bg-card border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Historial</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conversaciones"
              className="pl-8 h-9"
            />
          </div>
          {chats.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteAllOpen(true)}
              disabled={isDeletingAll}
              className="h-9"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {query ? 'No hay resultados' : 'No hay conversaciones aún'}
            </p>
            {!query && (
              <p className="text-xs text-muted-foreground mt-1">
                Inicia una nueva conversación para verla aquí
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <Card 
                key={chat.id} 
                className="p-3 cursor-pointer hover:bg-accent/50 transition-colors group"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate mb-1">
                      {chat.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.updated_at), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                      {chat.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartido
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 ml-2"
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(chat.id); }}
                    disabled={deletingId === chat.id}
                    aria-label="Eliminar chat"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            onChatSelect('new');
            onClose();
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Nueva conversación
        </Button>
      </div>

      {/* Confirm Delete Single */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar conversación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán la conversación y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteId && handleDeleteChat(confirmDeleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete All */}
      <AlertDialog open={confirmDeleteAllOpen} onOpenChange={setConfirmDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar todo el historial</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todas las conversaciones y sus mensajes. Esta acción es permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { await deleteAllChats(); setConfirmDeleteAllOpen(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingAll}
            >
              Eliminar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};