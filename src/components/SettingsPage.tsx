import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, Users, Plus, X, 
  CheckCircle2, Download, Trash2, Check,
  ToggleLeft, ToggleRight, UserPlus, Globe,
  ArrowRightLeft, Key, Lock, Play, RefreshCw,
  Server, Shield, Copy, ExternalLink, AlertCircle,
  Search, MapPin, Database, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsPageProps {
  language?: 'EN' | 'FR' | 'RU';
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: 'set-1', label: 'Billing, Plans & PayPal' },
  { id: 'set-2', label: 'Team Members & Invites' },
  { id: 'set-3', label: 'Security RBAC Matrix' },
  { id: 'set-4', label: 'Edge Network & Redirects' },
  { id: 'set-5', label: 'Google Suite (Auth, DB, Search, Maps)' }
];

const PLANS = [
  {
    id: 'FREE',
    name: 'Starter / Free',
    price: '0',
    period: 'par mois',
    description: 'Parfait pour l’évaluation et les petits projets pilotes d’infrastructures.',
    features: [
      'Jusqu’à 5 chambres / nœuds',
      'Trafic edge basique',
      'Support communautaire (48h)',
      '1 000 jetons API IA'
    ],
    badgeColor: 'bg-neutral-500/10 text-neutral-400'
  },
  {
    id: 'PLATINIUM',
    name: 'Professional',
    price: '149',
    period: 'par mois',
    description: 'Idéal pour les entreprises gérant un réseau d’infrastructures régional.',
    features: [
      'Jusqu’à 50 nœuds Edge / suites',
      'Analyse de trafic IA Gemini',
      'WAF & Zero-Trust complet',
      '20 000 jetons API IA'
    ],
    badgeColor: 'bg-amber-500/15 text-amber-400'
  },
  {
    id: 'GOLDEN',
    name: 'Enterprise Sovereign Suite',
    price: '499',
    period: 'par mois',
    description: 'La solution ultime d’orchestration globale de réseaux et d’actifs hôteliers.',
    features: [
      'Nœuds et suites illimités',
      'Calculs Edge & Compute Jobs dédiés',
      'Accès API illimité & Webhooks',
      'Ingénieur de compte dédié 24/7'
    ],
    badgeColor: 'bg-amber-500/25 text-amber-300 border border-amber-500/30'
  }
];

interface RedirectRule {
  id: string;
  sourceDomain: string;
  sourcePath: string;
  targetUrl: string;
  statusCode: 301 | 302 | 307 | 308;
  preserveQuery: boolean;
  active: boolean;
}

export default function SettingsPage({
  addAuditLog,
  activeItemId = 'set-1',
  onSelectTab
}: SettingsPageProps) {
  const [currentTab, setCurrentTab] = useState(activeItemId);
  const [currentPlan, setCurrentPlan] = useState('PLATINIUM');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cartes & Moyens de paiement
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [cards, setCards] = useState([
    { id: 'card-1', brand: 'Visa Enterprise', last4: '9424', expiry: '12/28', holder: 'ZAPHIR TREASURY SAS' },
    { id: 'card-2', brand: 'Mastercard Corporate', last4: '8841', expiry: '06/27', holder: 'BENIICH CORP BACKUP' }
  ]);

  // PayPal Sandbox Simulator
  const [paypalAmount, setPaypalAmount] = useState('149.00');
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  const [paypalSuccessMsg, setPaypalSuccessMsg] = useState<string | null>(null);

  // Membres
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('SecOps Engineer');
  const [members, setMembers] = useState([
    { id: '1', email: 'admin@zaphir.clouindustrie.com', name: 'Elena Petrova', role: 'Super Admin', status: 'Active' },
    { id: '2', email: 'ops@zaphir.clouindustrie.com', name: 'Ops Facilities', role: 'SecOps Engineer', status: 'Active' },
    { id: '3', email: 'concierge@zaphir.clouindustrie.com', name: 'Executive Butler', role: 'Hospitality Director', status: 'Active' },
    { id: '4', email: 'auditor@zaphir.clouindustrie.com', name: 'Lead Auditor', role: 'Read-Only Auditor', status: 'Suspended' }
  ]);

  // Matrice RBAC
  const [rbacPermissions, setRbacPermissions] = useState<Record<string, Record<string, boolean>>>({
    'Super Admin': { billing: true, nodes: true, compute: true, waf: true, logs: true, dns: true },
    'SecOps Engineer': { billing: false, nodes: true, compute: true, waf: true, logs: true, dns: true },
    'Hospitality Director': { billing: true, nodes: true, compute: false, waf: false, logs: true, dns: false },
    'Read-Only Auditor': { billing: false, nodes: false, compute: false, waf: false, logs: true, dns: false },
  });

  // Edge Network & URL Redirects (zaphir.clouindustrie.com)
  const [redirectRules, setRedirectRules] = useState<RedirectRule[]>([
    {
      id: 'rule-1',
      sourceDomain: 'zaphir.clouindustrie.com',
      sourcePath: '/portal',
      targetUrl: 'https://zaphir.clouindustrie.com/dashboard/prestige',
      statusCode: 301,
      preserveQuery: true,
      active: true
    },
    {
      id: 'rule-2',
      sourceDomain: 'clouindustrie.com',
      sourcePath: '/zaphir',
      targetUrl: 'https://zaphir.clouindustrie.com',
      statusCode: 301,
      preserveQuery: true,
      active: true
    },
    {
      id: 'rule-3',
      sourceDomain: 'api.zaphir.clouindustrie.com',
      sourcePath: '/v1/auth',
      targetUrl: 'https://zaphir.clouindustrie.com/api/sso/callback',
      statusCode: 307,
      preserveQuery: true,
      active: true
    }
  ]);

  // New Rule Form State
  const [newRuleDomain, setNewRuleDomain] = useState('zaphir.clouindustrie.com');
  const [newRulePath, setNewRulePath] = useState('');
  const [newRuleTarget, setNewRuleTarget] = useState('');
  const [newRuleCode, setNewRuleCode] = useState<301 | 302 | 307 | 308>(301);
  const [newRulePreserveQuery, setNewRulePreserveQuery] = useState(true);

  // URL Simulator State
  const [simUrlInput, setSimUrlInput] = useState('https://zaphir.clouindustrie.com/portal?ref=vip');
  const [simResult, setSimResult] = useState<{
    matched: boolean;
    ruleId?: string;
    finalUrl?: string;
    statusCode?: number;
    latencyMs?: number;
  } | null>(null);

  // Google SSO & JWT state
  const [ssoDomainWhitelist, setSsoDomainWhitelist] = useState('zaphir.clouindustrie.com, clouindustrie.com');
  const [simulatedJwt, setSimulatedJwt] = useState('');
  const [decodedJwt, setDecodedJwt] = useState<any>(null);

  // Google Suite (Auth, Database, Search, Maps) state
  const [googleAuthStatus, setGoogleAuthStatus] = useState<'connected' | 'idle' | 'authorizing'>('idle');
  const [googleSearchQuery, setGoogleSearchQuery] = useState('Zaphir Palace Riviera luxury suites amenities');
  const [googleSearchResults, setGoogleSearchResults] = useState<Array<{ title: string; link: string; snippet: string }> | null>(null);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);

  const [mapsLocationQuery, setMapsLocationQuery] = useState('Saint-Jean-Cap-Ferrat, France');
  const [activeMapsUrl, setActiveMapsUrl] = useState('https://maps.google.com/maps?q=Saint-Jean-Cap-Ferrat,%20France&z=14&output=embed');

  const [dbCollectionName, setDbCollectionName] = useState('vip_guests');
  const [dbSyncStatus, setDbSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [dbRecordsCount, setDbRecordsCount] = useState(24);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPlan = (planId: string, planName: string) => {
    setCurrentPlan(planId);
    if (addAuditLog) {
      addAuditLog('SUBSCRIPTION_PLAN_CHANGE', `Basculé vers le plan ${planName}`, 'AUTHORIZED');
    }
    triggerToast(`Abonnement mis à jour vers le forfait ${planName} !`);
    confetti({ particleCount: 35, spread: 50 });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder) return;
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    const last4 = cleanNum.slice(-4) || '4242';
    const brand = cleanNum.startsWith('5') ? 'Mastercard' : 'Visa';

    setCards(prev => [...prev, {
      id: `card-${Date.now()}`,
      brand: `${brand} Business`,
      last4,
      expiry: newCardExpiry || '12/29',
      holder: newCardHolder
    }]);

    triggerToast(`Nouvelle carte **** ${last4} enregistrée.`);
    setIsCardModalOpen(false);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvc('');
  };

  const handleDeleteCard = (cardId: string, last4: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    triggerToast(`Carte **** ${last4} supprimée.`);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    setMembers(prev => [
      ...prev,
      {
        id: String(Date.now()),
        email: newMemberEmail,
        name: newMemberEmail.split('@')[0],
        role: newMemberRole,
        status: 'Active'
      }
    ]);
    triggerToast(`Invitation envoyée à ${newMemberEmail}`);
    if (addAuditLog) {
      addAuditLog('RBAC_USER_INVITED', `Utilisateur invité avec le rôle ${newMemberRole}: ${newMemberEmail}`, 'AUTHORIZED');
    }
    setIsInviteOpen(false);
    setNewMemberEmail('');
  };

  const handleDeleteMember = (email: string) => {
    setMembers(prev => prev.filter(m => m.email !== email));
    triggerToast(`Membre ${email} révoqué.`);
  };

  const toggleMemberStatus = (email: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setMembers(prev => prev.map(m => m.email === email ? { ...m, status: nextStatus } : m));
    triggerToast(`Statut de ${email} : ${nextStatus}`);
  };

  const handleTogglePermission = (role: string, permissionKey: string) => {
    setRbacPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: !prev[role]?.[permissionKey]
      }
    }));
    triggerToast(`Permission [${permissionKey}] mise à jour pour ${role}`);
  };

  // PayPal Gateway Simulator
  const handlePaypalCheckout = (planPrice: string) => {
    setPaypalProcessing(true);
    setPaypalSuccessMsg(null);
    setTimeout(() => {
      setPaypalProcessing(false);
      setPaypalSuccessMsg(`Transaction PayPal approuvée ! Réf: PAYID-${Math.random().toString(36).substring(2, 9).toUpperCase()} pour ${planPrice} €.`);
      triggerToast(`Paiement PayPal de ${planPrice} € validé avec succès.`);
      confetti({ particleCount: 40, spread: 60 });
      if (addAuditLog) {
        addAuditLog('PAYPAL_CAPTURE_SUCCESS', `Paiement PayPal capturé : ${planPrice} EUR pour ${currentPlan}`, 'AUTHORIZED');
      }
    }, 1200);
  };

  // Add Redirect Rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePath || !newRuleTarget) return;

    const formattedPath = newRulePath.startsWith('/') ? newRulePath : `/${newRulePath}`;
    const newRule: RedirectRule = {
      id: `rule-${Date.now()}`,
      sourceDomain: newRuleDomain,
      sourcePath: formattedPath,
      targetUrl: newRuleTarget,
      statusCode: newRuleCode,
      preserveQuery: newRulePreserveQuery,
      active: true
    };

    setRedirectRules(prev => [...prev, newRule]);
    triggerToast(`Règle créée : ${newRuleDomain}${formattedPath} ➔ ${newRuleCode}`);
    setNewRulePath('');
    setNewRuleTarget('');
    if (addAuditLog) {
      addAuditLog('EDGE_REDIRECT_RULE_CREATED', `Redirection ${newRuleDomain}${formattedPath} -> ${newRuleTarget} (HTTP ${newRuleCode})`, 'AUTHORIZED');
    }
  };

  const handleDeleteRule = (id: string) => {
    setRedirectRules(prev => prev.filter(r => r.id !== id));
    triggerToast('Règle de redirection supprimée.');
  };

  const handleToggleRule = (id: string) => {
    setRedirectRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  // Live URL Simulator Execution
  const runUrlSimulation = () => {
    try {
      const parsed = new URL(simUrlInput);
      const domain = parsed.hostname;
      const path = parsed.pathname;
      const search = parsed.search;

      const matchedRule = redirectRules.find(r => 
        r.active && 
        r.sourceDomain.toLowerCase() === domain.toLowerCase() && 
        r.sourcePath === path
      );

      if (matchedRule) {
        let finalUrl = matchedRule.targetUrl;
        if (matchedRule.preserveQuery && search) {
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + search.substring(1);
        }
        setSimResult({
          matched: true,
          ruleId: matchedRule.id,
          finalUrl,
          statusCode: matchedRule.statusCode,
          latencyMs: 12
        });
      } else {
        setSimResult({
          matched: false,
          finalUrl: simUrlInput,
          statusCode: 200,
          latencyMs: 8
        });
      }
    } catch {
      triggerToast('URL invalide pour la simulation');
    }
  };

  // Google SSO JWT Generator & Decoder
  const generateSimulatedGoogleJwt = () => {
    const payload = {
      iss: "https://accounts.google.com",
      sub: "1098472948294729184",
      aud: "zaphir-cloudindustrie-client-id.apps.googleusercontent.com",
      hd: "clouindustrie.com",
      email: "security.lead@clouindustrie.com",
      email_verified: true,
      name: "Security Lead (Zaphir)",
      picture: "https://lh3.googleusercontent.com/a/mock-avatar",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    };
    const token = `eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhZmlyIn0.${btoa(JSON.stringify(payload))}.simulated_hmac_signature_zaphir_edge`;
    setSimulatedJwt(token);
    setDecodedJwt(payload);
    triggerToast("Jeton Google OAuth JWT simulé & décodé");
  };

  // Google Search Handler
  const handleGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSearchQuery.trim()) return;
    setIsSearchingGoogle(true);
    setTimeout(() => {
      setIsSearchingGoogle(false);
      setGoogleSearchResults([
        {
          title: "Zaphir Sovereign Luxury Palace & Private Residences",
          link: "https://zaphir.clouindustrie.com/suites",
          snippet: "Écrin d'hospitalité confidentiel sur la Côte d'Azur. Suites impériales avec conciergerie privée, héliport dédié et coffre-fort cryptographique souverain."
        },
        {
          title: "Zafir Academy & Sovereign Ledger Protocol - Overview",
          link: "https://zaphir.clouindustrie.com/academy",
          snippet: "Protocole de gouvernance décentralisée et certification d'actifs de prestige. Intégration Zero-Trust et audit blockchain temps-réel."
        },
        {
          title: "Guide Gastronomique & Caviste Zaphir Grand Cru",
          link: "https://zaphir.clouindustrie.com/dining",
          snippet: "Sélection exclusive de domaines bordelais et champagnes millésimés disponibles au service en chambre 24/7."
        }
      ]);
      triggerToast("Données Google Search actualisées");
    }, 700);
  };

  // Google Maps Update Handler
  const handleUpdateMapsQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsLocationQuery.trim()) return;
    const encoded = encodeURIComponent(mapsLocationQuery.trim());
    setActiveMapsUrl(`https://maps.google.com/maps?q=${encoded}&z=15&output=embed`);
    triggerToast(`Carte Google Maps centrée sur : ${mapsLocationQuery}`);
  };

  // Firestore DB Sync Simulator
  const handleSyncFirestore = () => {
    setDbSyncStatus('syncing');
    setTimeout(() => {
      setDbSyncStatus('synced');
      setDbRecordsCount(prev => prev + 1);
      triggerToast(`Base Firestore (${dbCollectionName}) synchronisée avec succès`);
      setTimeout(() => setDbSyncStatus('idle'), 3500);
    }, 900);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 relative text-slate-800 dark:text-slate-100">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border bg-white dark:bg-stone-900 border-amber-500/30 text-stone-900 dark:text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#c19a6b]/20 dark:border-white/10 pb-3 gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif-luxury text-[#7c5a30] dark:text-slate-100">
            Organisation & Infrastructure Governance
          </h1>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-mono">
            zaphir.clouindustrie.com / Subscriptions, PayPal Billing, Edge Routing & Granular RBAC Permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentTab === 'set-1' && (
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="px-3.5 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-amber-400" /> Ajouter Carte
            </button>
          )}
          {currentTab === 'set-2' && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90"
            >
              <UserPlus className="w-4 h-4" /> Inviter un Collaborateur
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setCurrentTab(tab.id);
              if (onSelectTab) onSelectTab(tab.id);
            }}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-colors whitespace-nowrap ${
              currentTab === tab.id
                ? 'bg-stone-900 border-t-2 border-amber-500 text-amber-400 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Billing, Plans & PayPal */}
      {currentTab === 'set-1' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif-luxury">Plans d'Abonnement Actifs</h2>
            <p className="text-xs text-slate-400">Passerelle unifiée CB Stripe & intégration instantanée PayPal Sandbox.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isActive = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                      : 'border-white/10 bg-stone-950/60 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                        {plan.name}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Check className="w-3.5 h-3.5" /> ACTIF
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-2xl font-bold">€ {plan.price}</span>
                        <span className="text-xs text-slate-400">/{plan.period}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{plan.description}</p>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-2">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.id, plan.name);
                    }}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    }`}
                  >
                    {isActive ? 'Forfait Actuel' : 'Basculer vers ce Forfait'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Section Passerelle PayPal Sandbox */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-stone-950/80 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold font-serif-luxury text-amber-300 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#003087] text-white text-[10px] font-mono rounded font-bold">PayPal</span>
                  Passerelle de Paiement Express (Sandbox zaphir.clouindustrie.com)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Réglez instantanément vos forfaits Zaphir ou rechargez votre portefeuille avec la passerelle PayPal sécurisée.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SANDBOX ACTIVE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="w-full sm:w-48">
                <label className="block uppercase font-mono text-[10px] text-slate-400 mb-1">Montant à régler (€)</label>
                <input
                  type="number"
                  value={paypalAmount}
                  onChange={e => setPaypalAmount(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm"
                />
              </div>
              <div className="w-full sm:w-auto pt-4 sm:pt-4">
                <button
                  disabled={paypalProcessing}
                  onClick={() => handlePaypalCheckout(paypalAmount)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#ffc439] hover:bg-[#f4b628] text-[#003087] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {paypalProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="italic font-serif font-black text-sm">P</span>
                      <span>Payer avec PayPal Express</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {paypalSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{paypalSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Section Moyens de Paiement CB */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold font-serif-luxury">Cartes Bancaires Synchronisées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(card => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-white/10 text-white space-y-4 shadow-xl relative"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">{card.brand}</span>
                    <button
                      onClick={() => handleDeleteCard(card.id, card.last4)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-lg font-mono tracking-widest text-amber-200">
                    ••••  ••••  ••••  {card.last4}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{card.holder}</span>
                    <span>{card.expiry}</span>
                  </div>
                </div>
              ))}

              <div
                onClick={() => setIsCardModalOpen(true)}
                className="p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-amber-500/40 flex flex-col justify-center items-center text-center gap-2 cursor-pointer bg-white/5 min-h-[140px]"
              >
                <CreditCard className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-bold">Ajouter un moyen de paiement CB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team Members */}
      {currentTab === 'set-2' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-stone-950/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-stone-900/50 flex justify-between items-center">
              <h3 className="text-sm font-bold">Collaborateurs Zaphir & Autorisations d'Accès</h3>
              <span className="text-xs font-mono text-slate-400">{members.length} Utilisateurs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-900/80 border-b border-white/10 text-slate-400 font-sans">
                  <tr>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-white/5">
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{m.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{m.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-amber-300">
                          {m.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleMemberStatus(m.email, m.status)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold mr-2"
                        >
                          {m.status === 'Active' ? 'Suspendre' : 'Activer'}
                        </button>
                        {m.role !== 'Super Admin' && (
                          <button
                            onClick={() => handleDeleteMember(m.email)}
                            className="p-1 text-slate-400 hover:text-red-400 align-middle"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Matrix */}
      {currentTab === 'set-3' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold flex items-center gap-2 font-serif-luxury">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Matrice Interactive des Rôles & Permissions (RBAC)
            </h2>
            <p className="text-xs text-slate-400">Contrôle granulaire d'accès synchronisé avec les guards d'API zaphir.clouindustrie.com.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-stone-950/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900/80 border-b border-white/10 text-slate-400 font-sans">
                  <tr>
                    <th className="p-4 font-bold text-slate-200">Capacités & Droits</th>
                    {Object.keys(rbacPermissions).map(role => (
                      <th key={role} className="p-4 text-center font-bold text-slate-200">{role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  {[
                    { key: 'billing', label: 'Gestion Facturation & PayPal', desc: 'Recharge, changement de forfait, webhooks PayPal.' },
                    { key: 'nodes', label: 'Provisionnement Nœuds & Suites', desc: 'Gestion de la flotte d’actifs et suites de luxe.' },
                    { key: 'compute', label: 'Exécution Compute Jobs', desc: 'Lancement d’algorithmes distribués et batchs.' },
                    { key: 'waf', label: 'Déploiement Règles WAF & Sécurité', desc: 'Filtrage IP et mitigation des cyberattaques.' },
                    { key: 'dns', label: 'Routage & Redirections Edge DNS', desc: 'Gestion du domaine zaphir.clouindustrie.com.' },
                    { key: 'logs', label: 'Accès Logs & Registre Audit', desc: 'Consultation des traces forensics et export CSV.' }
                  ].map(perm => (
                    <tr key={perm.key} className="hover:bg-white/5">
                      <td className="p-4">
                        <span className="font-bold block font-sans text-slate-200">{perm.label}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{perm.desc}</span>
                      </td>
                      {Object.keys(rbacPermissions).map(role => (
                        <td key={role} className="p-4 text-center">
                          <button
                            onClick={() => handleTogglePermission(role, perm.key)}
                            className="focus:outline-none"
                          >
                            {rbacPermissions[role]?.[perm.key] ? (
                              <ToggleRight className="w-6 h-6 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-600 inline" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Edge Network & URL Redirects */}
      {currentTab === 'set-4' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif-luxury flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              Gestionnaire d'URLs & Routage Edge (zaphir.clouindustrie.com)
            </h2>
            <p className="text-xs text-slate-400">
              Configurez des règles de redirection HTTP (301, 302, 307, 308) avec préservation des query strings pour vos domaines.
            </p>
          </div>

          {/* Simulateur d'URL en Direct */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-stone-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 font-mono">
                <Play className="w-4 h-4 text-emerald-400" /> Simulateur d'URL en direct
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Test d'aiguillage Edge en temps réel</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={simUrlInput}
                onChange={e => setSimUrlInput(e.target.value)}
                placeholder="https://zaphir.clouindustrie.com/portal?ref=promo"
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
              />
              <button
                onClick={runUrlSimulation}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-2 shrink-0"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Simuler la Requête
              </button>
            </div>

            {simResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                simResult.matched ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-stone-900 border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    {simResult.matched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Règle Appliquée (Code HTTP {simResult.statusCode})</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-slate-300">Aucune redirection : Passage direct (HTTP 200)</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">{simResult.latencyMs} ms de latence Edge</span>
                </div>
                <div className="text-[11px] break-all text-slate-300">
                  <span className="text-slate-500">Destination : </span>
                  <span className="text-amber-200 underline font-semibold">{simResult.finalUrl}</span>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire d'ajout de règle */}
          <form onSubmit={handleAddRule} className="p-5 rounded-2xl border border-white/10 bg-stone-950/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Créer une nouvelle règle de redirection
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Domaine Source</label>
                <select
                  value={newRuleDomain}
                  onChange={e => setNewRuleDomain(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="zaphir.clouindustrie.com">zaphir.clouindustrie.com</option>
                  <option value="clouindustrie.com">clouindustrie.com</option>
                  <option value="api.zaphir.clouindustrie.com">api.zaphir.clouindustrie.com</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Chemin Source (Path)</label>
                <input
                  required
                  type="text"
                  value={newRulePath}
                  onChange={e => setNewRulePath(e.target.value)}
                  placeholder="/anciennes-chambres"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">URL Cible de Redirection</label>
                <input
                  required
                  type="url"
                  value={newRuleTarget}
                  onChange={e => setNewRuleTarget(e.target.value)}
                  placeholder="https://zaphir.clouindustrie.com/suites"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 mr-2">Code HTTP</label>
                  <select
                    value={newRuleCode}
                    onChange={e => setNewRuleCode(Number(e.target.value) as any)}
                    className="bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-xs text-slate-100"
                  >
                    <option value={301}>301 (Permanent)</option>
                    <option value={302}>302 (Temporaire)</option>
                    <option value={307}>307 (Temporary Redirect)</option>
                    <option value={308}>308 (Permanent Redirect)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newRulePreserveQuery}
                    onChange={e => setNewRulePreserveQuery(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Préserver les paramètres de requête (?query=...)</span>
                </label>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-all"
              >
                Ajouter la Règle
              </button>
            </div>
          </form>

          {/* Tableau des règles de redirection */}
          <div className="rounded-2xl border border-white/10 bg-stone-950/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-stone-900/50 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-200">
                Règles de Redirection Actives ({redirectRules.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-900/80 border-b border-white/10 text-slate-400 font-sans">
                  <tr>
                    <th className="p-3">Source</th>
                    <th className="p-3">Destination Cible</th>
                    <th className="p-3">HTTP Code</th>
                    <th className="p-3">Query Strings</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {redirectRules.map(rule => (
                    <tr key={rule.id} className="hover:bg-white/5">
                      <td className="p-3">
                        <span className="text-amber-300 font-bold">{rule.sourceDomain}</span>
                        <span className="text-slate-300">{rule.sourcePath}</span>
                      </td>
                      <td className="p-3 truncate max-w-xs text-slate-300">
                        {rule.targetUrl}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-amber-400 font-bold text-[10px]">
                          {rule.statusCode}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {rule.preserveQuery ? 'Préservées' : 'Ignorées'}
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleToggleRule(rule.id)}>
                          {rule.active ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Actif</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-neutral-500/20 text-neutral-400 text-[10px]">Inactif</span>
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Google Suite (Auth, Database, Google Search, Google Maps) */}
      {currentTab === 'set-5' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif-luxury flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Écosystème Google Suite — Auth, Database, Search & Maps
            </h2>
            <p className="text-xs text-slate-400">
              Orchestrez l'authentification Google SSO, la base de données Firestore, l'indexation de recherche Google et la télémétrie Google Maps pour Zaphir.
            </p>
          </div>

          {/* 1. Database & Auth Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Auth Status & Federation */}
            <div className="p-5 rounded-2xl border border-white/10 bg-stone-950/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono text-slate-200">
                      Google Auth (SSO)
                    </h3>
                    <p className="text-[10px] text-slate-400">OAuth 2.0 / Firebase Identity Platform</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ACTIF // SSO ACTIF
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Whitelist des domaines Google autorisés
                </label>
                <input
                  type="text"
                  value={ssoDomainWhitelist}
                  onChange={e => setSsoDomainWhitelist(e.target.value)}
                  placeholder="zaphir.clouindustrie.com, clouindustrie.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Fédération Google Workspace :</span>
                <span className="text-amber-400 font-bold font-mono">zaphir.clouindustrie.com</span>
              </div>
            </div>

            {/* Cloud Database (Firestore) */}
            <div className="p-5 rounded-2xl border border-white/10 bg-stone-950/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono text-slate-200">
                      Database (Cloud Firestore)
                    </h3>
                    <p className="text-[10px] text-slate-400">Collections temps réel & persistence</p>
                  </div>
                </div>
                <button
                  onClick={handleSyncFirestore}
                  disabled={dbSyncStatus === 'syncing'}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${dbSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  {dbSyncStatus === 'syncing' ? 'Synchronisation...' : 'Synchroniser'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Collection active
                </label>
                <input
                  type="text"
                  value={dbCollectionName}
                  onChange={e => setDbCollectionName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Enregistrements synchronisés :</span>
                <span className="text-emerald-400 font-mono font-bold">{dbRecordsCount} documents</span>
              </div>
            </div>
          </div>

          {/* 2. Google Search Data Integration */}
          <div className="p-5 rounded-2xl border border-white/10 bg-stone-950/60 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-200">
                  Google Search Data (Recherche & Indexation Zaphir)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Interrogation directe des données de recherche Google pour le domaine zaphir.clouindustrie.com
                </p>
              </div>
            </div>

            <form onSubmit={handleGoogleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={googleSearchQuery}
                  onChange={e => setGoogleSearchQuery(e.target.value)}
                  placeholder="Rechercher des données Zaphir..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono pl-9"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                disabled={isSearchingGoogle}
                className="px-4 py-2 bg-sky-500 text-black font-bold rounded-xl text-xs hover:bg-sky-400 flex items-center gap-1.5 transition-all"
              >
                {isSearchingGoogle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Interroger Google
              </button>
            </form>

            {googleSearchResults && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] uppercase font-mono text-sky-400 font-bold">
                  Résultats Google Search en cache :
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {googleSearchResults.map((res, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-black/70 border border-sky-500/20 space-y-1.5 hover:border-sky-500/40 transition-all">
                      <h4 className="text-xs font-bold text-sky-300 line-clamp-1">{res.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{res.snippet}</p>
                      <a 
                        href={res.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[9px] font-mono text-amber-400/80 hover:text-amber-300 flex items-center gap-1"
                      >
                        {res.link} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Google Maps Data Integration */}
          <div className="p-5 rounded-2xl border border-white/10 bg-stone-950/60 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-200">
                    Google Maps Data (Géolocalisation & Coordonnées Zaphir)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Visualisation cartographique haute précision pour les arrivées, yachts et résidences
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateMapsQuery} className="flex gap-2">
              <input
                type="text"
                value={mapsLocationQuery}
                onChange={e => setMapsLocationQuery(e.target.value)}
                placeholder="Entrez une destination (ex: Nice Airport, Cannes, Monaco...)"
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-400 flex items-center gap-1.5 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" /> Centrer Google Maps
              </button>
            </form>

            <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 relative">
              <iframe
                title="Google Maps Data Terminal"
                src={activeMapsUrl}
                className="w-full h-full border-none"
                loading="lazy"
              />
            </div>
          </div>

          {/* 4. Décodeur & Simulateur JWT */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-stone-950/70 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-amber-300">
                  Simulateur de Décodage JWT Google OAuth
                </h3>
                <p className="text-xs text-slate-400">
                  Valide la signature et extrait les métadonnées cryptographiques du jeton bearer.
                </p>
              </div>
              <button
                onClick={generateSimulatedGoogleJwt}
                className="px-3.5 py-1.5 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5" /> Générer un Jeton Google Valide
              </button>
            </div>

            {simulatedJwt && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                    Jeton Brut (Encoded JWT)
                  </label>
                  <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-amber-300/80 break-all select-all">
                    {simulatedJwt}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                    Payload Déchiffré (Claims JSON)
                  </label>
                  <pre className="p-3 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(decodedJwt, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals: Add Card */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100">Ajouter une Carte Bancaire</h3>
              <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block uppercase font-mono text-slate-400 mb-1">Titulaire</label>
                <input
                  required
                  type="text"
                  value={newCardHolder}
                  onChange={e => setNewCardHolder(e.target.value)}
                  placeholder="M. BENIICH"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block uppercase font-mono text-slate-400 mb-1">Numéro de Carte</label>
                <input
                  required
                  type="text"
                  maxLength={19}
                  value={newCardNumber}
                  onChange={e => setNewCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 9424"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-mono text-slate-400 mb-1">Expiration (MM/AA)</label>
                  <input
                    required
                    type="text"
                    maxLength={5}
                    value={newCardExpiry}
                    onChange={e => setNewCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase font-mono text-slate-400 mb-1">CVC</label>
                  <input
                    required
                    type="password"
                    maxLength={3}
                    value={newCardCvc}
                    onChange={e => setNewCardCvc(e.target.value)}
                    placeholder="•••"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite Member */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100">Inviter un Membre</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block uppercase font-mono text-slate-400 mb-1">Email Collaborateur</label>
                <input
                  required
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  placeholder="collaborateur@zaphir.clouindustrie.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block uppercase font-mono text-slate-400 mb-1">Rôle Zaphir</label>
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="SecOps Engineer">SecOps Engineer</option>
                  <option value="Hospitality Director">Hospitality Director</option>
                  <option value="Read-Only Auditor">Read-Only Auditor</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400"
                >
                  Envoyer l'Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
