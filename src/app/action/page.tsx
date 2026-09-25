'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, FadeIn } from '@/components/ui';
import { useLocaleStore } from '@/stores/locale-store';

export default function RecommendedActionPage() {
  const router = useRouter();
  const { dialectCode, availableDialects } = useLocaleStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 28; // 28s vernacular audio instruction
  const [audioError, setAudioError] = useState(false);

  const currentDialect =
    availableDialects.find((d: { code: string }) => d.code === dialectCode) || availableDialects[0];

  // Vernacular instructions mapped to selected dialect
  const getActionContent = () => {
    if (dialectCode === 'hi-IN') {
      return {
        title: 'जड़ों में गीली घास और मल्चिंग की परत बिछाएं',
        actionType: 'सत्यापन योग्य रोकथाम उपाय #402',
        instructions:
          '1. खेत की क्यारियों में सूखी घास या पत्तियों की 3 इंच मोटी परत फैलाएं।\n2. यह मिट्टी की नमी को 60% तक सुरक्षित रखेगा और जड़ों को 42°C की तेज गर्मी से बचाएगा।\n3. काम पूरा होने के बाद कैमरे से 1 स्पष्ट तस्वीर लें।',
        audioTranscript:
          'नमस्ते किसान भाई। आगामी गंभीर गर्मी की लहर से अपनी फसल बचाने के लिए तुरंत क्यारियों में 3 इंच मल्चिंग बिछाएं। काम पूरा होने पर तस्वीर खींचें। नीति सत्यापन के तुरंत बाद ₹400 ($5.00) आपके खाते में भेज दिए जाएंगे।',
      };
    }
    return {
      title: 'Biomass Root-Zone Ground Mulching',
      actionType: 'Verifiable Preventative Protocol #402',
      instructions:
        '1. Spread a 3-inch layer of dry straw or crop residue across active root beds.\n2. This prevents up to 60% soil moisture transpiration and protects roots from 42°C heat spikes.\n3. Capture 1 hardware-signed photo once mulching is laid.',
      audioTranscript:
        'Greetings guardian. To protect your crop canopy from the incoming 42°C thermal shock, apply a 3-inch biomass ground mulch over the bed. Once complete, photograph the field. $5.00 will disburse into your UPI/escrow wallet immediately upon cryptographic verification.',
    };
  };

  const content = getActionContent();

  const togglePlay = () => {
    if (audioError) return;

    if (!isPlaying) {
      setIsPlaying(true);
      // Simulate or play actual speech synthesis / audio playback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content.audioTranscript);
        utterance.lang = dialectCode === 'hi-IN' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        utterance.onerror = () => {
          setAudioError(true);
          setIsPlaying(false);
        };
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handleProceedToVerification = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    router.push('/verification/capture');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface sticky top-0 z-30">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-earth-green-600 transition-colors p-2"
          aria-label="Back to Cascade"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Cascade</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Action Directive
        </span>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        {/* Action Title & Micro-Grant Eligibility */}
        <FadeIn delay={0.05} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-earth-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              $5.00 Grant Eligible
            </span>
            <span className="text-xs font-bold text-terracotta-600 bg-sand-200 px-2 py-0.5 rounded">
              Escrow Armed
            </span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-snug">
            {content.title}
          </h1>
          <p className="text-xs text-text-muted font-mono">{content.actionType}</p>
        </FadeIn>

        {/* ─── Vernacular ElevenLabs Voice Guidance Card ────────────── */}
        <FadeIn delay={0.1}>
          <Card className="border-2 border-earth-green-500 bg-earth-green-50/50 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-earth-green-800 flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4" />
                  Vernacular Audio Guide ({currentDialect.nativeName})
                </span>
                <span className="text-[11px] font-mono text-earth-green-700">ElevenLabs Synced</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="h-16 w-16 rounded-full bg-earth-green-500 hover:bg-earth-green-600 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
                  aria-label={isPlaying ? 'Pause Vernacular Audio' : 'Play Vernacular Audio Instructions'}
                >
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                </button>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-text-primary">
                    <span>{isPlaying ? 'Playing Audio...' : 'Tap Play to Listen'}</span>
                    <span>
                      {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 0:
                      {duration}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-earth-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-earth-green-600 transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Audio Failed Fallback Notice */}
              {audioError && (
                <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                  <div>
                    <span className="font-bold">Audio Output Notice:</span> Vernacular audio stream degraded. Full text instructions available below.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* ─── Clear Step-by-Step Instructions Card ─────────────────── */}
        <FadeIn delay={0.15}>
          <Card className="border border-border-default bg-surface shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle as="h2" className="text-base flex items-center gap-2 text-text-primary">
                <FileText className="h-4 w-4 text-terracotta-500" />
                Action Protocol & Physical Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line space-y-2">
                {content.instructions}
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2 text-xs text-text-muted font-medium">
                <ShieldCheck className="h-4 w-4 text-earth-green-600" />
                <span>Verification requires hardware GPS lock and soil photo</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* ─── Primary CTA ─────────────────────────────────────────── */}
        <div className="pt-2">
          <Button
            onClick={handleProceedToVerification}
            size="lg"
            fullWidth
            className="h-16 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <CheckCircle className="h-6 w-6" />
            <span>I Have Completed This Action</span>
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
          <p className="text-center text-xs text-text-muted mt-2">
            Launches hardware camera viewfinder for proof capture
          </p>
        </div>
      </div>
    </div>
  );
}
