'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  ThermometerSun,
  Clock,
  WifiOff,
  Camera,
  ArrowRight,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRiskStore } from '@/stores/risk-store';
import { useConnectivityStore } from '@/stores/connectivity-store';
import { useLocaleStore } from '@/stores/locale-store';
import { Button, Card, CardHeader, CardTitle, CardContent, FadeIn } from '@/components/ui';
import { colors } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

type DashboardState = 'no-risk' | 'elevated-risk' | 'action-pending' | 'offline-cached';

export default function DashboardPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const { isAuthenticated, user } = useAuthStore();
  const { isOnline, isSlowConnection } = useConnectivityStore();
  const { dialectCode, availableDialects } = useLocaleStore();
  const { swarmResult, fetchSwarmResult } = useRiskStore();

  const [activeState, setActiveState] = useState<DashboardState>('elevated-risk');
  const heatIndex = {
    temp: 41.2,
    humidity: 68,
    level: 'Extreme Caution',
  };
  const lastCheckTime = '12 mins ago';

  useEffect(() => {
    if (!useAuthStore.persist.hasHydrated()) {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        if (!useAuthStore.getState().isAuthenticated) {
          router.replace('/onboarding');
        } else {
          void fetchSwarmResult('intake-current');
        }
      });
      return () => unsub();
    }

    if (!isAuthenticated) {
      router.replace('/onboarding');
      return;
    }
    // Initial fetch for mock/live intake risk state
    void fetchSwarmResult('intake-current');
  }, [isAuthenticated, router, fetchSwarmResult]);

  useEffect(() => {
    if (!isOnline) {
      setActiveState('offline-cached');
    } else if (swarmResult?.overallRisk === 'none') {
      setActiveState('no-risk');
    } else if (swarmResult?.overallRisk === 'elevated' || swarmResult?.overallRisk === 'critical') {
      setActiveState('elevated-risk');
    }
  }, [isOnline, swarmResult]);

  const currentDialect = availableDialects.find((d: { code: string }) => d.code === dialectCode) || availableDialects[0];

  const getGreeting = () => {
    switch (dialectCode) {
      case 'hi-IN':
        return 'नमस्ते';
      case 'mr-IN':
        return 'नमस्कार';
      case 'ta-IN':
        return 'வணக்கம்';
      case 'te-IN':
        return 'నమస్కారం';
      case 'kn-IN':
        return 'ನಮಸ್ಕಾರ';
      case 'bn-IN':
        return 'নমস্কার';
      default:
        return 'Welcome';
    }
  };

  const handleStartScan = () => {
    startTransition(() => {
      router.push('/intake');
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-12 pt-6 px-4 max-w-md mx-auto">
      {/* ─── Top Header & Connectivity ─────────────────────────────── */}
      <FadeIn delay={0.05} className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-text-muted">AetherWeave Hub</span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {getGreeting()},{' '}
            <span style={{ color: colors.terracotta[500] }}>
              {user?.phone ? user.phone.slice(-4) : 'Guardian'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border',
              isOnline
                ? 'bg-earth-green-50 text-earth-green-600 border-earth-green-200'
                : 'bg-amber-50 text-amber-600 border-amber-200',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isOnline ? 'bg-earth-green-500 animate-pulse' : 'bg-amber-500',
              )}
            />
            {isOnline ? (isSlowConnection ? '2G Sync' : 'Live Swarm') : 'Offline Vault'}
          </div>
        </div>
      </FadeIn>

      {/* ─── Offline Cached Alert ───────────────────────────────────── */}
      {activeState === 'offline-cached' && (
        <FadeIn delay={0.1} className="mb-4">
          <div
            role="status"
            className="flex items-center gap-3 p-3.5 rounded-[var(--radius-md)] border-2 bg-amber-50 border-amber-300 text-amber-900 text-sm font-medium"
          >
            <WifiOff className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="font-bold">Displaying Cached Snapshot</p>
              <p className="text-xs text-amber-800">Telemetry will be signed locally and queued for on-chain proof.</p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ─── Primary Risk Summary Card ─────────────────────────────── */}
      <FadeIn delay={0.15} className="mb-6">
        <Card
          className={cn(
            'border-2 overflow-hidden shadow-sm relative',
            activeState === 'no-risk'
              ? 'border-earth-green-500 bg-earth-green-50/40'
              : 'border-amber-500 bg-amber-50/40',
          )}
        >
          <div
            className={cn(
              'h-2 w-full absolute top-0 left-0',
              activeState === 'no-risk' ? 'bg-earth-green-500' : 'bg-amber-500',
            )}
          />

          <CardHeader className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Anticipatory Risk Forecast
              </span>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                {lastCheckTime}
              </span>
            </div>
            <CardTitle as="h2" className="text-xl flex items-center gap-2 mt-1">
              {activeState === 'no-risk' ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-earth-green-500 shrink-0" />
                  <span className="text-earth-green-700">All Clear — Stable Matrix</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                  <span className="text-amber-800">Elevated Multi-Hazard Warning</span>
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {activeState === 'no-risk'
                ? 'Local atmospheric telemetry and micro-climate indicators show nominal risk. Preventive micro-escrows remain armed.'
                : 'Severe heat stress and soil moisture depletion detected in your sector. Immediate ground insulation will unlock $5.00 grant.'}
            </p>

            {/* Live Environmental Matrix Chips */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-surface rounded-lg p-2.5 border border-border-subtle flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <ThermometerSun className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs text-text-muted font-medium">Heat Index</div>
                  <div className="text-sm font-bold text-text-primary">{heatIndex.temp}°C · Caution</div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-2.5 border border-border-subtle flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-earth-green-100 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-earth-green-700" />
                </div>
                <div>
                  <div className="text-xs text-text-muted font-medium">Swarm Agents</div>
                  <div className="text-sm font-bold text-earth-green-700">3/3 Synthesized</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* ─── Hero Primary CTA (Large Tap Target) ────────────────────── */}
      <FadeIn delay={0.2} className="mb-6">
        <Button
          onClick={handleStartScan}
          size="lg"
          fullWidth
          className="h-16 text-lg font-bold shadow-md flex items-center justify-center gap-3 bg-earth-green-500 hover:bg-earth-green-600 active:scale-[0.98] transition-transform"
        >
          <Camera className="h-6 w-6" aria-hidden="true" />
          <span>Launch Telemetry Scan</span>
          <ArrowRight className="h-5 w-5 ml-1 opacity-90" aria-hidden="true" />
        </Button>
        <p className="text-center text-xs text-text-muted mt-2">
          Captures hardware-signed GPS, gyroscope, and crop canopy footage
        </p>
      </FadeIn>

      {/* ─── Pending Action / Verified Proof Quick Access ──────────── */}
      <FadeIn delay={0.25} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Active Pipeline</h3>
          <span className="text-xs font-bold text-earth-green-600 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Micro-Grant #704
          </span>
        </div>

        <Card
          className="border border-border-default hover:border-earth-green-500 transition-colors cursor-pointer"
          onClick={() => router.push('/cascade')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-sand-200 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="h-5 w-5 text-terracotta-500" />
              </div>
              <div>
                <h4 className="text-base font-bold text-text-primary">Inspect Risk Cascade</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Climate (Heatwave) ➔ Health (Dehydration) ➔ Livelihood (Yield Loss)
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-text-muted shrink-0 mt-2" />
          </div>
        </Card>

        <Card
          className="border border-border-default hover:border-earth-green-500 transition-colors cursor-pointer bg-sand-50/50"
          onClick={() => router.push('/action')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-text-primary">Ground Mulching Directive</h4>
                  <span className="bg-earth-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    $5.00
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Vernacular audio guide ready in {currentDialect.nativeName}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-text-muted shrink-0 mt-2" />
          </div>
        </Card>

        {/* ─── Agri-Intelligence & Disaster Resilience Suite ────────── */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Agri-Intelligence / कृषि ज्ञान केंद्र
            </h3>
            <span className="text-[11px] font-bold text-authority bg-authority/10 px-2 py-0.5 rounded">
              Govt Rail Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Card
              className="p-3 border border-border-default hover:border-authority transition-colors cursor-pointer"
              onClick={() => router.push('/weather')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">🌦️</span>
                <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">3D Radar</span>
              </div>
              <div className="font-bold text-xs text-text-primary">Live Weather & Hazards</div>
              <div className="text-[10px] text-text-muted">3D Doppler Dome & Disasters</div>
            </Card>

            <Card
              className="p-3 border border-border-default hover:border-authority transition-colors cursor-pointer"
              onClick={() => router.push('/crop-advisor')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">🌱</span>
                <span className="text-[9px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded">3D Strata</span>
              </div>
              <div className="font-bold text-xs text-text-primary">Crop & Seeds Advisor</div>
              <div className="text-[10px] text-text-muted">3D Parcel Voxel & Seed Rates</div>
            </Card>

            <Card
              className="p-3 border border-border-default hover:border-authority transition-colors cursor-pointer"
              onClick={() => router.push('/harvest-timing')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">⏱️</span>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">3D Silo</span>
              </div>
              <div className="font-bold text-xs text-text-primary">Harvest Timing</div>
              <div className="text-[10px] text-text-muted">3D Grain Silo & Loss Risk</div>
            </Card>

            <Card
              className="p-3 border border-border-default hover:border-authority transition-colors cursor-pointer"
              onClick={() => router.push('/market-prices')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">📊</span>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Agmarknet</span>
              </div>
              <div className="font-bold text-xs text-text-primary">Live Mandi Prices</div>
              <div className="text-[10px] text-text-muted">Spot Rates & e-NAM Booking</div>
            </Card>

            <Card
              className="p-3 border border-border-default hover:border-authority transition-colors cursor-pointer"
              onClick={() => router.push('/satellite')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">🛰️</span>
                <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">3D Orbit</span>
              </div>
              <div className="font-bold text-xs text-text-primary">Space Surveillance</div>
              <div className="text-[10px] text-text-muted">3D Earth & Sentinel-2/SAR</div>
            </Card>

            <Card
              className="p-3 border border-border-default hover:border-authority transition-colors cursor-pointer"
              onClick={() => router.push('/notify')}
            >
              <div className="text-xl mb-1">📢</div>
              <div className="font-bold text-xs text-text-primary">Alert Dispatch</div>
              <div className="text-[10px] text-text-muted">WhatsApp & SMS Broadcast</div>
            </Card>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
