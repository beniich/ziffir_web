import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, Users, Plus, X, 
  CheckCircle2, Download, Trash2, Check,
  ToggleLeft, ToggleRight, UserPlus, Clock, UserX
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsPageProps {
  language?: 'EN' | 'FR' | 'RU';
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: 'set-1', label: 'Billing, Plans & Payments' },
  { id: 'set-2', label: 'Team Members & Permissions' },
  { id: 'set-3', label: 'Security RBAC Matrix' },
  { id: 'set-4', label: 'Configurations' }
];

const PLANS = [
  {
    id: 'FREE',
    name: 'Starter / Free',
    price: '0',
    period: 'par mois',
    description: 'Parfait pour l évaluation et les petits projets pilotes d infrastructures.',
    features: [
      'Jusqu à 5 chambres / nœuds',
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
    description: 'Idéal pour les entreprises gérant un réseau d infrastructures régional.',
    features: [
      'Jusqu à 50 nœuds Edge / suites',
      'Analyse de trafic IA Gemini',
      'WAF & Zero-Trust complet',
      '20 000 jetons API IA'
    ],
    badgeColor: 'bg-amber-500/15 text-amber-400'
  },
  {
    id: 'GOLDEN',
    name: 'Enterprise CAFM Suite',
    price: '499',
    period: 'par mois',
    description: 'La solution ultime d orchestration globale de réseaux et d actifs.',
    features: [
      'Nœuds et suites illimités',
      'Calculs Edge & Compute Jobs dédiés',
      'Accompagnement 24/7/365',
      '100 000 jetons API IA'
    ],
    badgeColor: 'bg-purple-500/15 text-purple-400'
  }
];

export default function SettingsPage({
  language = 'FR',
  addAuditLog,
  activeItemId = 'set-1',
  onSelectTab
}: SettingsPageProps) {
  const [currentTab, setCurrentTab] = useState(activeItemId);
  const [currentPlan, setCurrentPlan] = useState('PLATINIUM');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Cartes de paiement
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [cards, setCards] = useState([
    { id: 'card-1', brand: 'Visa Enterprise', last4: '9424', expiry: '12/28', holder: 'ZAPHIR TREASURY SAS' },
    { id: 'card-2', brand: 'Mastercard Corporate', last4: '8841', expiry: '06/27', holder: 'BENIICH CORP BACKUP' }
  ]);

  // Membres
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('SecOps Engineer');
  const [members, setMembers] = useState([
    { id: '1', email: 'elena.petrova@zafir-academy.com', name: 'Elena Petrova', role: 'Super Admin', status: 'Active' },
    { id: '2', email: 'ops@cloudindustrie.com', name: 'Ops Facilities', role: 'CAFM Engineer', status: 'Active' },
    { id: '3', email: 'secops@cloudindustrie.com', name: 'SecOps Lead', role: 'SecOps Engineer', status: 'Active' },
    { id: '4', email: 'auditor@cafm-audit.org', name: 'Lead Auditor', role: 'Read-Only Auditor', status: 'Suspended' }
  ]);

  // Matrice RBAC
  const [rbacPermissions, setRbacPermissions] = useState<Record<string, Record<string, boolean>>>({
    'Super Admin': { billing: true, nodes: true, compute: true, waf: true, logs: true },
    'SecOps Engineer': { billing: false, nodes: true, compute: true, waf: true, logs: true },
    'CAFM Engineer': { billing: false, nodes: true, compute: false, waf: false, logs: false },
    'Read-Only Auditor': { billing: false, nodes: false, compute: false, waf: false, logs: true },
  });

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
            zaphir.cloudindustrie.com / Subscriptions, PayPal Billing & Granular RBAC Permissions
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

      {/* Tab 1: Billing & Plans */}
      {currentTab === 'set-1' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif-luxury">Plans d Abonnement Actifs</h2>
            <p className="text-xs text-slate-400">Synchronisé avec les webhooks PayPal et la matrice Zero-Trust.</p>
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

          {/* Section Moyens de Paiement */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold font-serif-luxury">Moyens de Paiement Enregistrés</h3>
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
                <span className="text-xs font-bold">Ajouter un moyen de paiement</span>
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
              <h3 className="text-sm font-bold">Collaborateurs & Utilisateurs de l Organisation</h3>
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
                    <tr key={m.id} className="hover:bg-white/5 font-sans">
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
            <p className="text-xs text-slate-400">Contrôle granulaire d accès synchronisé avec les guards d API backend.</p>
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
                    { key: 'billing', label: 'Gestion Facturation & Wallet', desc: 'Recharge, changement de forfait, webhooks PayPal.' },
                    { key: 'nodes', label: 'Provisionnement Nœuds & Chambres', desc: 'Gestion de la flotte d actifs et infrastructure.' },
                    { key: 'compute', label: 'Exécution Compute Jobs', desc: 'Lancement d algorithmes distribués et batchs.' },
                    { key: 'waf', label: 'Déploiement Règles WAF & Sécurité', desc: 'Filtrage IP et mitigation des cyberattaques.' },
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

      {/* Modals: Add Card */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100">Ajouter une Carte</h3>
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
                <label className="block uppercase font-mono text-slate-400 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  placeholder="collaborateur@cloudindustrie.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block uppercase font-mono text-slate-400 mb-1">Rôle</label>
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="SecOps Engineer">SecOps Engineer</option>
                  <option value="CAFM Engineer">CAFM Engineer</option>
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
                  Envoyer l Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
