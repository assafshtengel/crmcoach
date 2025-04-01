
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, RotateCcw, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  initialAudioUrl?: string;
}

export function AudioRecorder({ onAudioReady, initialAudioUrl }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (audioUrl && !initialAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, initialAudioUrl]);
  
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingTime(0);
    setIsLoading(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioUrl && !initialAudioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);
        onAudioReady(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('לא ניתן לגשת למיקרופון');
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const resetRecording = () => {
    if (audioUrl && !initialAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
    onAudioReady(null);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="space-y-4 border border-muted rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-[#6E59A5]" />
          <h3 className="text-base font-semibold text-[#6E59A5]">הקלטת סיכום קולי</h3>
        </div>
        
        {recordingTime > 0 && isRecording && (
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium animate-pulse">
            מקליט... {formatTime(recordingTime)}
          </div>
        )}
      </div>
      
      {audioUrl ? (
        <div className="space-y-4">
          <audio 
            src={audioUrl} 
            controls 
            className="w-full rounded-md" 
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetRecording}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              הקלט מחדש
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          {isRecording ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={stopRecording}
              className="w-full font-medium"
            >
              <Square className="h-4 w-4 mr-2" />
              עצור הקלטה
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={startRecording}
              disabled={isLoading}
              className="w-full font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mic className="h-4 w-4 mr-2" />
              )}
              הקלט סיכום קולי
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
