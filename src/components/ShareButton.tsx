import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Link, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  onShare: () => Promise<string | null>;
  disabled?: boolean;
}

export const ShareButton = ({ onShare, disabled }: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (disabled) return;
    
    setIsSharing(true);
    try {
      const shareUrl = await onShare();
      if (shareUrl) {
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo compartir el chat.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={disabled || isSharing}
      className="transition-all duration-200"
    >
      {isShared ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          ¡Copiado!
        </>
      ) : (
        <>
          {isSharing ? (
            <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Share2 className="h-4 w-4 mr-2" />
          )}
          Compartir
        </>
      )}
    </Button>
  );
};