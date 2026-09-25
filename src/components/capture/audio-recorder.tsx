'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  className?: string;
}

export function AudioRecorder({
  onAudioRecorded,
  onRecordingStateChange,
  className,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setHasAudio(true);
        onAudioRecorded(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      onRecordingStateChange?.(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone access failed:', err);
      const msg = err instanceof Error ? err.message : 'Microphone permission denied';
      setPermissionError(msg);
      setIsRecording(false);
      onRecordingStateChange?.(false);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange?.(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, onRecordingStateChange]);

  const resetRecording = () => {
    setHasAudio(false);
    setDuration(0);
    audioChunksRef.current = [];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {permissionError ? (
        <div className="flex items-center gap-2 p-2 rounded-md bg-red-900/60 border border-red-500/50 text-red-200 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Mic access needed for dialect voice note</span>
        </div>
      ) : isRecording ? (
        <div className="flex items-center gap-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/40">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-sm font-bold text-white">{formatDuration(duration)}</span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 active:scale-95 transition-transform"
            aria-label="Stop audio recording"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>Done</span>
          </button>
        </div>
      ) : hasAudio ? (
        <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-earth-green-500/40">
          <span className="text-xs font-medium text-earth-green-300">Voice Note Attached ({formatDuration(duration)})</span>
          <button
            type="button"
            onClick={resetRecording}
            className="p-1 rounded-full text-sand-300 hover:text-white"
            aria-label="Re-record voice note"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-black/70 active:scale-95 transition-all"
          aria-label="Record dialect voice note"
        >
          <Mic className="h-4 w-4 text-amber-400" />
          <span>Add Vernacular Voice Note</span>
        </button>
      )}
    </div>
  );
}
