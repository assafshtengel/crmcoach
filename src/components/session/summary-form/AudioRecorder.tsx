import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, RotateCcw, Volume2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  initialAudioUrl?: string;
}
export function AudioRecorder({
  onAudioReady,
  initialAudioUrl
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sharingOption, setSharingOption] = useState("coach_only");
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });
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
        setRecordingTime(prev => prev + 1);
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
  return <div className="space-y-4 border border-muted rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-[#6E59A5]" />
          <h3 className="text-base font-semibold text-[#6E59A5]">��קלטת סיכום קולי</h3>
        </div>
        
        {recordingTime > 0 && isRecording && <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium animate-pulse">
            מקליט... {formatTime(recordingTime)}
          </div>}
      </div>
      
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-4 w-4 text-[#6E59A5]" />
          <label className="text-sm font-medium">שיתוף הסיכום הקולי עם:</label>
        </div>
        
        <RadioGroup defaultValue="coach_only" value={sharingOption} onValueChange={setSharingOption} className="grid grid-cols-2 gap-2">
          <div className="relative">
            <RadioGroupItem value="coach_only" id="coach_only" className="sr-only" />
            <Label htmlFor="coach_only" className={`
                block w-full p-3 rounded-lg text-center cursor-pointer
                transition-all duration-300 ease-in-out
                ${sharingOption === 'coach_only' ? 'bg-primary text-white shadow-md transform scale-105' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}
              `}>
              רק המאמן
            </Label>
          </div>
          
          <div className="relative">
            <RadioGroupItem value="coach_and_player" id="coach_and_player" className="sr-only" />
            <Label htmlFor="coach_and_player" className={`
                block w-full p-3 rounded-lg text-center cursor-pointer
                transition-all duration-300 ease-in-out
                ${sharingOption === 'coach_and_player' ? 'bg-primary text-white shadow-md transform scale-105' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}
              `}>
              המאמן והשחקן
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {audioUrl ? <div className="space-y-4">
          <audio src={audioUrl} controls className="w-full rounded-md" />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetRecording} className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              הקלט מחדש
            </Button>
          </div>
        </div> : <div className="flex justify-center gap-4">
          {isRecording ? <Button variant="destructive" size="lg" onClick={stopRecording} className="w-full font-medium">
              <Square className="h-4 w-4 mr-2" />
              עצור הקלטה
            </Button> : <Button variant="outline" size="lg" onClick={startRecording} disabled={isLoading} className="w-full font-medium text-lime-950 bg-lime-100">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mic className="h-4 w-4 mr-2" />}
              הקלט סיכום קולי
            </Button>}
        </div>}
    </div>;
}