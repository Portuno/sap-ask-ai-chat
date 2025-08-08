import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Square } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio: (audio: Blob, durationSec: number) => void;
  isLoading?: boolean;
}

const MAX_SECONDS = 120;

export const ChatInput = ({ onSendMessage, onSendAudio, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isRecording) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  useEffect(() => {
    if (!isRecording) return;
    if (seconds >= MAX_SECONDS) {
      stopRecording();
      return;
    }
  }, [seconds, isRecording]);

  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (isLoading || isRecording) return;
    try {
      if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        alert('La grabación de audio no es compatible en este navegador.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        clearTimer();
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const duration = seconds;
        setIsRecording(false);
        setSeconds(0);
        chunksRef.current = [];
        if (blob.size > 0) onSendAudio(blob, duration);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setSeconds(0);
      startTimer();
    } catch (err) {
      console.error('Error starting recording', err);
      alert('No se pudo iniciar la grabación. Verifica los permisos del micrófono.');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    try {
      mediaRecorderRef.current?.stop();
    } catch (err) {
      console.error('Error stopping recording', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2">
        <Button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          aria-label={isRecording ? 'Detener grabación' : 'Grabar nota de voz'}
          className={isRecording ? 'h-12 w-12 bg-destructive hover:bg-destructive/90' : 'h-12 w-12'}
          variant={isRecording ? 'default' : 'outline'}
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isRecording ? "Grabando..." : "Escribe tu pregunta sobre SAP aquí..."}
          disabled={isLoading || isRecording}
          className="flex-1 h-12 bg-background border-2 border-muted focus:border-primary transition-colors"
          aria-label="Mensaje de chat"
        />
      </div>

      {isRecording ? (
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')} / 02:00
          </div>
          <Button
            type="button"
            onClick={stopRecording}
            className="h-12 px-4 bg-destructive hover:bg-destructive/90"
          >
            <Square className="h-4 w-4 mr-2" /> Detener
          </Button>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="h-12 px-6 bg-primary hover:bg-sap-blue-dark transition-colors shadow-[var(--shadow-soft)]"
        >
          <Send className="h-4 w-4" />
          <span className="ml-2">Preguntar</span>
        </Button>
      )}
    </form>
  );
};