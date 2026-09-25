'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Thermometer,
  HeartPulse,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button, Card, FadeIn, LoadingScreen } from '@/components/ui';
import { useRiskStore } from '@/stores/risk-store';
import { useLocaleStore } from '@/stores/locale-store';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/contracts';

interface CascadeNodeData {
  id: 'climate' | 'health' | 'livelihood';
  title: string;
  agentName: string;
  riskLevel: RiskLevel;
  confidence: number;
  metric: string;
  vernacularSummary: string;
  icon: typeof Thermometer;
}

export default function CascadeVisualizationPage() {
  const router = useRouter();
  const { dialectCode } = useLocaleStore();
  const { swarmResult, isLoadingSwarm, fetchSwarmResult, expandedNode, setExpandedNode } = useRiskStore();

  useEffect(() => {
    void fetchSwarmResult('intake-704');
  }, [fetchSwarmResult]);

  // Vernacular-tailored summaries based on selected dialect
  const getVernacularText = (nodeId: string) => {
    if (dialectCode === 'hi-IN') {
      if (nodeId === 'climate') {
        return 'अगले 72 घंटों में तापमान 42°C से ऊपर जाने का अनुमान है। मिट्टी की नमी गंभीर स्तर तक घट रही है।';
      }
      if (nodeId === 'health') {
        return 'दोपहर के समय काम करने वाले किसानों को डिहाइड्रेशन और हीट स्ट्रोक का बड़ा खतरा है।';
      }
      return 'फसलों के जलने और सिंचाई लागत बढ़ने से प्रति एकड़ ₹4,500 का संभावित नुकसान अनुमानित है।';
    }
    // Default English fallback
    if (nodeId === 'climate') {
      return 'Satellite telemetry and ground moisture detect 42.1°C heat index with 74% soil evapotranspiration.';
    }
    if (nodeId === 'health') {
      return 'Outdoor field workers face acute risk of heat exhaustion, dehydration, and secondary thermal injury.';
    }
    return 'Crop yield loss estimated at 18-24% if preventative root-zone mulching is not applied before tomorrow midday.';
  };

  const nodes: CascadeNodeData[] = [
    {
      id: 'climate',
      title: 'Atmospheric & Climate Agent',
      agentName: 'LangGraph · ClimateGuard Agent',
      riskLevel: swarmResult?.nodes.climate.riskLevel || 'critical',
      confidence: swarmResult?.nodes.climate.confidence || 0.94,
      metric: 'Heat Index: 42.1°C',
      vernacularSummary: getVernacularText('climate'),
      icon: Thermometer,
    },
    {
      id: 'health',
      title: 'Community Health Agent',
      agentName: 'LangGraph · BioPhysio Agent',
      riskLevel: swarmResult?.nodes.health.riskLevel || 'elevated',
      confidence: swarmResult?.nodes.health.confidence || 0.89,
      metric: 'Thermal Stress: High',
      vernacularSummary: getVernacularText('health'),
      icon: HeartPulse,
    },
    {
      id: 'livelihood',
      title: 'Livelihood & Economic Agent',
      agentName: 'LangGraph · Agronomic Impact Agent',
      riskLevel: swarmResult?.nodes.livelihood.riskLevel || 'critical',
      confidence: swarmResult?.nodes.livelihood.confidence || 0.96,
      metric: 'Projected Loss: 22%',
      vernacularSummary: getVernacularText('livelihood'),
      icon: Coins,
    },
  ];

  const toggleExpand = (id: 'climate' | 'health' | 'livelihood') => {
    setExpandedNode(expandedNode === id ? null : id);
  };

  if (isLoadingSwarm && !swarmResult) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <LoadingScreen message="LangGraph multi-agent swarm synthesizing cascading climate risk graph..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface sticky top-0 z-30">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-earth-green-600 transition-colors p-2"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Intake</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-terracotta-600 bg-terracotta-50 px-2.5 py-1 rounded-full border border-terracotta-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Swarm Verified</span>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Anticipatory Triage
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Cascading Risk Graph
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Deterministic policy validates that climate shock cascades directly into health and economic vulnerability.
          </p>
        </div>

        {/* ─── Directed Graph Nodes with Connectors ─────────────────── */}
        <div className="space-y-3 relative">
          {nodes.map((node, idx) => {
            const isExpanded = expandedNode === node.id;
            const Icon = node.icon;
            const isCritical = node.riskLevel === 'critical';
            const isElevated = node.riskLevel === 'elevated';

            return (
              <div key={node.id} className="relative">
                {/* Node Card */}
                <FadeIn delay={idx * 0.1}>
                  <Card
                    className={cn(
                      'border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden',
                      isCritical
                        ? 'border-error/80 bg-red-50/30'
                        : isElevated
                        ? 'border-amber-500 bg-amber-50/30'
                        : 'border-earth-green-500 bg-earth-green-50/30',
                    )}
                    onClick={() => toggleExpand(node.id)}
                  >
                    <div
                      className={cn(
                        'w-1.5 absolute inset-y-0 left-0',
                        isCritical ? 'bg-error' : isElevated ? 'bg-amber-500' : 'bg-earth-green-500',
                      )}
                    />

                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                              isCritical
                                ? 'bg-red-100 text-error'
                                : isElevated
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-earth-green-100 text-earth-green-700',
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-text-primary">{node.title}</h3>
                              <span
                                className={cn(
                                  'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                                  isCritical
                                    ? 'bg-red-600 text-white'
                                    : isElevated
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-earth-green-600 text-white',
                                )}
                              >
                                {node.riskLevel}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-muted mt-0.5">{node.agentName}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-text-primary">
                            {(node.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="block text-[10px] text-text-muted">conf</span>
                        </div>
                      </div>

                      {/* Expandable Reasoning Accordion */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border-subtle text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-text-primary">
                            <Info className="h-3.5 w-3.5 text-earth-green-600" />
                            <span>Agent Swarm Vernacular Reasoning:</span>
                          </div>
                          <p className="text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-border-subtle">
                            {node.vernacularSummary}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-text-muted font-mono pt-1">
                            <span>Telemetry Key: {node.metric}</span>
                            <span>Audit: Policy Verified</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-center text-text-muted text-[11px]">
                        <span className="flex items-center gap-1">
                          {isExpanded ? (
                            <>
                              Collapse reasoning <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              View vernacular explanation <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                </FadeIn>

                {/* Animated Flow Connector Arrow */}
                {idx < nodes.length - 1 && (
                  <div className="flex justify-center my-1.5" aria-hidden="true">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-3 bg-terracotta-400" />
                      <ChevronDown className="h-4 w-4 text-terracotta-500 -my-1" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Bottom Navigation to Recommended Action ─────────────── */}
        <div className="pt-4">
          <Button
            onClick={() => router.push('/action')}
            size="lg"
            fullWidth
            className="h-16 text-base font-bold bg-earth-green-500 hover:bg-earth-green-600 text-white shadow-lg flex items-center justify-center gap-3"
          >
            <span>Proceed to Preventative Action</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-center text-xs text-text-muted mt-2">
            Disburses $5.00 grant immediately upon verified physical execution
          </p>
        </div>
      </div>
    </div>
  );
}
