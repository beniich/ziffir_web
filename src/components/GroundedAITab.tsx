import React, { useState } from 'react';
import { 
  Globe, Search, MapPin, Sparkles, Send, ShieldCheck, 
  ExternalLink, Clock, Zap, Cpu, RefreshCw, CheckCircle2,
  Lock, Compass, Navigation
} from 'lucide-react';
import { groundingService, GroundingResult } from '../server/domains/ai/grounding.service';

interface GroundedAITabProps {
  language?: 'EN' | 'FR' | 'RU';
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
  availableTokens?: number;
}

const PRESET_QUERIES = [
  {
    label: '✈️ NOTAMs & Héliport Cap-Ferrat',
    query: 'Vérification des NOTAMs et conditions météo pour l\'héliport de Saint-Jean-Cap-Ferrat (H1).',
    source: 'search' as const,
    tier: 'fast' as const
  },
  {
    label: '🚗 Chauffeur VIP Nice ➔ Monte-Carlo',
    query: 'Disponibilité immédiate d\'un chauffeur bilingue et état du trafic entre l\'aéroport de Nice et le Casino de Monte-Carlo.',
    source: 'all' as const,
    tier: 'fast' as const
  },
  {
    label: '🛡️ Audit CVE Clusters Edge Kubernetes',
    query: 'Analyse des dernières vulnérabilités critiques sur les clusters Kubernetes Edge Zaphir.',
    source: 'search' as const,
    tier: 'deep' as const
  },
  {
    label: '⚓ Mouillage Super-Yachts & Marina',
    query: 'Disponibilité des places de mouillage profond pour yacht de 60m à Monaco et Saint-Jean-Cap-Ferrat.',
    source: 'maps' as const,
    tier: 'fast' as const
  }
];

export const GroundedAITab: React.FC<GroundedAITabProps> = ({ 
  addAuditLog,
  availableTokens = 18450
}) => {
  const [prompt, setPrompt] = useState('');
  const [sourceType, setSourceType] = useState<'all' | 'search' | 'maps'>('all');
  const [modelTier, setModelTier] = useState<'fast' | 'deep'>('fast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundingResult | null>(null);
  const [tokenBalance, setTokenBalance] = useState(availableTokens);

  const handleExecuteQuery = async (queryText?: string) => {
    const textToRun = queryText || prompt;
    if (!textToRun.trim() || loading) return;

    setLoading(true);
    try {
      const res = await groundingService.queryWithGrounding(textToRun, {
        sourceType,
        modelTier
      });

      setResult(res);
      setTokenBalance(prev => Math.max(0, prev - res.tokensConsumed));

      if (addAuditLog) {
        addAuditLog(
          'GROUNDED_AI_QUERY',
          `Grounded Query via ${res.modelUsed} (${sourceType.toUpperCase()}): "${textToRun.substring(0, 45)}..." - ${res.tokensConsumed} tokens consommés`,
          'AUTHORIZED'
        );
      }
    } catch (err) {
      console.error('Erreur lors du grounding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* En-tête Quiet Luxury */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c19a6b]/20 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold">
              ZAPHIR SOVEREIGN GROUNDED INTELLIGENCE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif-luxury text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#c19a6b]" />
            Intelligence Souveraine Grounded (Google Search & Maps)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Système d'ancrage en temps réel propulsé par Gemini. Élimination totale des hallucinations par citation de sources Google Search et géolocalisation haute précision Google Maps.
          </p>
        </div>

        {/* Quota & Token Meter */}
        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-2xl bg-[#fdfaf5] dark:bg-stone-900/90 border border-[#c19a6b]/30 text-right shadow-sm">
            <span className="text-[9px] font-mono uppercase text-slate-400 block">Quota Jetons IA Souverains</span>
            <div className="flex items-center gap-2 justify-end">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-amber-400">
                {tokenBalance.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-slate-400">TOKENS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de commandes et sélection de sources */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-stone-950/70 border border-[#c19a6b]/25 shadow-xl backdrop-blur-md space-y-5">
        {/* Sélecteurs de modes */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">
              Source d'Ancrage :
            </span>
            <button
              onClick={() => setSourceType('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                sourceType === 'all'
                  ? 'bg-[#c19a6b] text-slate-950 font-bold shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Hybride (Search + Maps)
            </button>
            <button
              onClick={() => setSourceType('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                sourceType === 'search'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Google Search
            </button>
            <button
              onClick={() => setSourceType('maps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                sourceType === 'maps'
                  ? 'bg-red-500 text-white font-bold shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Google Maps
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">
              Moteur :
            </span>
            <button
              onClick={() => setModelTier('fast')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all ${
                modelTier === 'fast'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Zap className="w-3 h-3" />
              Flash 1.5 (Latence Rapide - 15t)
            </button>
            <button
              onClick={() => setModelTier('deep')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all ${
                modelTier === 'deep'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Cpu className="w-3 h-3" />
              Pro 1.5 (Deep Reasoning - 25t)
            </button>
          </div>
        </div>

        {/* Zone de saisie du Prompt */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleExecuteQuery();
              }
            }}
            placeholder="Ex : Indiquez la disponibilité immédiate des hélicoptères et chauffeurs pour un atterrissage d'urgence à LFMN..."
            rows={3}
            className="w-full p-4 pr-16 bg-[#f7f5ef] dark:bg-black/60 border border-[#c19a6b]/30 rounded-2xl text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b] resize-none"
          />
          <button
            onClick={() => handleExecuteQuery()}
            disabled={loading || !prompt.trim()}
            className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-[#c19a6b] text-slate-950 font-bold hover:bg-[#d6ad7a] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Suggestions rapides adaptées aux scénarios prioritaires Zaphir */}
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
            Scénarios Opérationnels Prioritaires Zaphir :
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(preset.query);
                  setSourceType(preset.source);
                  setModelTier(preset.tier);
                  handleExecuteQuery(preset.query);
                }}
                className="text-[11px] p-2 px-3 rounded-xl bg-white/60 dark:bg-stone-900/60 border border-stone-200 dark:border-white/10 hover:border-[#c19a6b]/50 text-slate-700 dark:text-slate-300 hover:text-[#c19a6b] transition-all flex items-center gap-1.5"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultat Grounded avec Glassmorphism & Sources vérifiées */}
      {result && (
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-stone-950/80 border border-[#c19a6b]/35 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED GROUNDED FACTS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {result.modelUsed} • {result.latencyMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(result.groundedAt).toLocaleTimeString()}
            </div>
          </div>

          {/* Corps du texte de réponse */}
          <div className="prose dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans">
            {result.text}
          </div>

          {/* Cartographie directe si Google Maps est actif */}
          {sourceType !== 'search' && (
            <div className="p-4 rounded-2xl bg-black/40 border border-[#c19a6b]/25 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <Navigation className="w-3.5 h-3.5" /> Projection Cartographique Google Maps Live
                </span>
                <span className="text-[9px] text-slate-500">Télémétrie GPS active</span>
              </div>
              <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10">
                <iframe
                  title="Grounded Maps Radar"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(prompt || 'Saint-Jean-Cap-Ferrat, France')}&z=14&output=embed`}
                  className="w-full h-full border-none"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Liste des Sources et Citations */}
          {result.sources && result.sources.length > 0 && (
            <div className="border-t border-black/5 dark:border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c19a6b]" />
                  Sources Citées & Ancrages Factuels (Grounding Audit Trail)
                </h4>
                <span className="text-[9px] font-mono text-[#c19a6b]">
                  {result.sources.length} SOURCES VÉRIFIÉES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#fdfbf7] dark:bg-stone-900/60 border border-stone-200 dark:border-white/10 hover:border-[#c19a6b]/50 transition-all block group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#c19a6b] transition-colors truncate">
                        {src.title || 'Source Officielle'}
                      </span>
                      {src.sourceType === 'maps' ? (
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      ) : (
                        <ExternalLink className="w-3 h-3 text-sky-400 shrink-0" />
                      )}
                    </div>
                    {src.snippet && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {src.snippet}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
