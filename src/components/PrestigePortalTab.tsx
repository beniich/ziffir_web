import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Key,
  Waves,
  Globe,
  Calendar,
  Clock,
  User,
  Plus,
  AlertCircle,
  Filter,
  Info,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpaReservation {
  id: string;
  guestName: string;
  service: string;
  price: number;
  timeSlot: string;
  resource: string;
  preferences: string[];
  notes: string;
  checkedIn: boolean;
}

interface Therapist {
  id: string;
  name: string;
  specialty: string;
  status: 'Active' | 'On Break' | 'Off-Duty';
}

const SPA_SERVICES = [
  { name: "VIP Gold-Leaf Facial", price: 380, duration: "90 min", desc: "Gold-leaf dynamic cell hydration treatment." },
  { name: "Deep Tissue Massage", price: 290, duration: "90 min", desc: "Sandalwood infused deep tissue pressure therapy." },
  { name: "Wellness Consultation", price: 180, duration: "60 min", desc: "Biological diet & dietary stress alignment." },
  { name: "Aromatherapy Mud Bath", price: 240, duration: "90 min", desc: "Volcanic marine clay enriched with eucalyptus." },
  { name: "Hot Stone Therapy", price: 320, duration: "90 min", desc: "Basalt volcanic stones infused with organic lavender." }
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM"
];

const RESOURCES = [
  "Treatment Room 1",
  "Treatment Room 2",
  "Therapist Elena (Facials)",
  "Therapist Liam (Deep Tissue)"
];

interface PrestigePortalTabProps {
  language: 'EN' | 'FR' | 'RU';
}

export const PrestigePortalTab: React.FC<PrestigePortalTabProps> = ({
  language
}) => {
  // Sub-navigation inside the Prestige Portal
  const [subTab, setSubTab] = useState<'hero' | 'about' | 'pricing' | 'security' | 'scheduler'>('hero');

  // Spa scheduler specific states
  const [schedulerView, setSchedulerView] = useState<'dashboard' | 'grid' | 'services'>('grid');
  const [reservations, setReservations] = useState<SpaReservation[]>([
    {
      id: 'RES-001',
      guestName: 'Mrs. Dubois',
      service: 'VIP Gold-Leaf Facial',
      price: 380,
      timeSlot: '09:00 AM',
      resource: 'Treatment Room 1',
      preferences: ['Aromatherapy', 'Honey Treatment'],
      notes: 'Honey treatment requested. Extra warm towels.',
      checkedIn: true
    },
    {
      id: 'RES-002',
      guestName: 'Mr. Bertrand',
      service: 'Deep Tissue Massage',
      price: 290,
      timeSlot: '12:00 PM',
      resource: 'Therapist Liam (Deep Tissue)',
      preferences: ['High Pressure', 'Low Light'],
      notes: 'Prefers dynamic pressure on shoulders.',
      checkedIn: false
    },
    {
      id: 'RES-003',
      guestName: 'Sophia Loren',
      service: 'Wellness Consultation',
      price: 180,
      timeSlot: '03:00 PM',
      resource: 'Treatment Room 2',
      preferences: ['Soft Music'],
      notes: 'First residency check. Dynamic diet alignment session.',
      checkedIn: false
    },
    {
      id: 'RES-004',
      guestName: 'Lord Kensington',
      service: 'Hot Stone Therapy',
      price: 320,
      timeSlot: '04:30 PM',
      resource: 'Therapist Elena (Facials)',
      preferences: ['Aromatherapy', 'Warm Stones'],
      notes: 'Ensure lavender ambient scenting is pre-triggered.',
      checkedIn: false
    }
  ]);

  const [therapists, setTherapists] = useState<Therapist[]>([
    { id: 'T1', name: 'Elena', specialty: 'Facials & Skin', status: 'Active' },
    { id: 'T2', name: 'Liam', specialty: 'Massage & Muscle', status: 'Active' },
    { id: 'T3', name: 'Francois', specialty: 'Hydrotherapy', status: 'On Break' },
    { id: 'T4', name: 'Yuki', specialty: 'Acupressure', status: 'Off-Duty' }
  ]);

  // Filters
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<string>('All');
  const [searchGuestQuery, setSearchGuestQuery] = useState<string>('');

  // Selected reservation details modal/panel
  const [selectedResId, setSelectedResId] = useState<string | null>('RES-001');

  // Booking form states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [formGuestName, setFormGuestName] = useState('');
  const [formService, setFormService] = useState(SPA_SERVICES[0].name);
  const [formTimeSlot, setFormTimeSlot] = useState(TIME_SLOTS[0]);
  const [formResource, setFormResource] = useState(RESOURCES[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formPreferences, setFormPreferences] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Pricing calculator state
  const [selectedSuite, setSelectedSuite] = useState<'presidential' | 'royal' | 'penthouse'>('royal');
  const [nightsCount, setNightsCount] = useState(3);
  const [includeCaviar, setIncludeCaviar] = useState(true);
  const [includeHeliport, setIncludeHeliport] = useState(false);
  const [assignedButler, setAssignedButler] = useState(true);

  // Translations
  const trans = {
    EN: {
      navHero: "Prestige Accueil",
      navAbout: "Genesis & Heritage",
      navPricing: "Luxury Tariffs",
      navSecurity: "Sovereign Shield",
      navScheduler: "Wellness Scheduler",
      heroBadge: "Epitome of Quiet Luxury",
      heroTitle: "Sovereign Sanctuary & Academic High Council",
      heroSubtitle: "Experience a pristine landscape crafted with custom cryptographic architecture, bespoke gastronomical services, and majestic mountain vistas.",
      reserveSuite: "Explore Imperial Suites",
      aboutTitle: "The Craftsmanship Behind Sovereign Luxury",
      aboutDesc1: "Founded on the high sands of the French Riviera, Zafir Academy is the world's most exclusive trust for high-end hospitality ethics, quantum architecture design, and elite spatial gastronomy.",
      aboutDesc2: "We combine historic French elegance with advanced tech-cybernetic defense protocols, giving each member a fully sovereign sanctuary untouched by global instability.",
      pricingTitle: "Exclusive Suite Accoutrements & Estimates",
      pricingSubtitle: "Model your perfect sitting. Our bespoke pricing estimator accounts for dynamic butler clearance, caviar reserves, and heliport logons.",
      suitePres: "Presidential Amber Suite",
      suiteRoyal: "Royal Embassy Chambers",
      suitePent: "Executive Light Penthouse",
      calcTitle: "Dynamic Rate Simulation",
      calcNights: "Duration of Residence (Nights)",
      addonCaviar: "24/7 Imperial Beluga Caviar Setup",
      addonHeliport: "Private Helipad Transponder Liaison",
      addonButler: "Level 5 Personal Butler Clearances",
      calcTotalVal: "Calculated Estate Allocation",
      calcBook: "Lock Sovereign Residence",
      securityTitle: "Automated Cryptographic Security Shield",
      securitySubtitle: "How the Zafir Archon Firewall stabilizes your suite, secures private ledgers, and authenticates administrative credentials.",
      secNode: "Sovereign SHA-256 Ledger Parity",
      secNodeDesc: "Every room order, keycard authorization, and cash audit is compiled into an immutable SHA-256 ledger block, validated by distributed admin nodes.",
      secCard: "Acoustic Bio-Signature Firewalls",
      secCardDesc: "Traditional physical keycards are replaced with quantum certificate tokens linked directly to guest biometric hashes.",
      secRbac: "Clearance Level Verification",
      secRbacDesc: "Rigid Role-Based Access controls restrict high-risk operations (climate override, safe access) exclusively to L5 managers."
    },
    FR: {
      navHero: "Accueil Prestige",
      navAbout: "Genèse & Édifice",
      navPricing: "Tarifs d’Exception",
      navSecurity: "Bouclier Souverain",
      navScheduler: "Planificateur Spa",
      heroBadge: "L'Apothéose de l'Élégance Discrète",
      heroTitle: "Sanctuaire Souverain & Institut des Hautes Études",
      heroSubtitle: "Découvrez un havre immaculé, façonné par une architecture cryptographique souveraine, une haute oenologie et une douceur de vivre impériale.",
      reserveSuite: "Explorer les Suites",
      aboutTitle: "L'art de l'hospitalité secrète et royale",
      aboutDesc1: "Né sur les falaises escarpées dominant une mer d'azur, l'Institut Zafir est le plus exclusif des établissements d'enseignement de l'éthique hôtelière de luxe, de la gastronomie d'élite et de la sécurité souveraine.",
      aboutDesc2: "Nous marions l'élégance historique avec des protocoles technologiques cybernétiques avancés pour garantir à chaque membre un sanctuaire sans égal.",
      pricingTitle: "Inclusions de Suites & Services Sur-Mesure",
      pricingSubtitle: "Estimez le coût de votre séjour de prestige. Notre simulateur intègre les accès hélicoptère, la réserve exclusive de caviar Beluga et les majordomes L5.",
      suitePres: "Suite Présidentielle Ambre",
      suiteRoyal: "Chambres de l'Ambassade Royale",
      suitePent: "Penthouse de Lumière Esthétique",
      calcTitle: "Simulation de Tarif en Temps Réel",
      calcNights: "Durée du Séjour (Nuits)",
      addonCaviar: "Service Caviar Beluga Impérial 24/7",
      addonHeliport: "Liaison Héliport Privé & Transpondeur",
      addonButler: "Majordome Dédié avec Habilitation L5",
      calcTotalVal: "Allocation Budgétaire Estimée",
      calcBook: "Bloquer la Résidence",
      securityTitle: "Sécurité Cryptographique & Technologie de Pointe",
      securitySubtitle: "Comment le pare-feu archon du système Zafir stabilise vos espaces de vie, assure vos de l'intégrité et valide vos clés d'accès.",
      secNode: "Parité de Registre SHA-256 Souveraine",
      secNodeDesc: "Toutes les commandes, accès aux suites et audits de coffres sont inscrits dans un registre cryptographique immuable validé par signature.",
      secCard: "Pare-Feu Acoustique & Biométrique",
      secCardDesc: "Les clés magnétiques standards sont remplacées par des jetons de certificat quantique liés aux signatures biométriques des invités.",
      secRbac: "Contrôles d'Accès d'Équipe Rigides",
      secRbacDesc: "Le système de rôles garantit que les actions sensibles (déverrouillage de coffre, tarifs) sont restreintes aux gestionnaires habilités."
    },
    RU: {
      navHero: "Главная Портал",
      navAbout: "История и Истоки",
      navPricing: "Премиум Тарифы",
      navSecurity: "Щит Биометрии",
      navScheduler: "Велнес-расписание",
      heroBadge: "Воплощение изысканной роскоши",
      heroTitle: "Суверенное Святилище и Академия Высокого Сервиса",
      heroSubtitle: "Исследуйте безупречные пространства, защищенные криптографической структурой, дополненные изысканным кейтерингом и великолепными видами.",
      reserveSuite: "Перейти к Апартаментам",
      aboutTitle: "Философия Золотого Стандарта Zafir",
      aboutDesc1: "Основанная на живописном побережье Французской Ривьеры, Академия Zafir является мировым оплотом суверенного гостеприимства, квантового дизайна и элитной гастрономии.",
      aboutDesc2: "Мы объединяем классическую европейскую роскошь с передовыми протоколами кибербезопасности, предлагая каждому члену клуба безопасность.",
      pricingTitle: "Расчет стоимости проживания",
      pricingSubtitle: "Настройте параметры своего пребывания. Интерактивный калькулятор учитывает расходы на черную икру, вертолетный трансфер и услуги мажордома.",
      suitePres: "Президентский Янтарный Люкс",
      suiteRoyal: "Королевские Посольские Покои",
      suitePent: "Апрельский Световой Пентхаус",
      calcTitle: "Симулятор расчета стоимости",
      calcNights: "Количество ночей в резиденции",
      addonCaviar: "Круглосуточная подача Черной Икры",
      addonHeliport: "Приоритетная вертолетная площадка",
      addonButler: "Личный мажордом высшего уровня доступа (L5)",
      calcTotalVal: "Расчетная сумма проживания",
      calcBook: "Забронировать покои",
      securityTitle: "Автоматизированный Криптографический Щит",
      securitySubtitle: "Как защитный сетевой экран Zafir гарантирует спокойствие, защищает ваши данные и проверяет допуски персонала.",
      secNode: "Суверенный хэш-реестр SHA-256",
      secNodeDesc: "Каждая операция в отеле, автовыпуск ключ-карт и изменения сейфа кодируются в цепочки блоков SHA-256.",
      secCard: "Акустический биометрический барьер",
      secCardDesc: "Стандартные ключи заменены квантовыми токенами, привязанными к биометрическим отпечаткам гостей.",
      secRbac: "Жесткое разграничение полномочий",
      secRbacDesc: "Строгий ролевой доступ не допускает персонал низшего звена к управлению климатом, сейфами или тарифами."
    }
  }[language];

  // Pricing constants (USD / EUR per night)
  const SUITE_RATES = {
    presidential: { name: trans.suitePres, rate: 3800 },
    royal: { name: trans.suiteRoyal, rate: 2500 },
    penthouse: { name: trans.suitePent, rate: 1800 }
  };

  const handleCalculateRate = () => {
    let base = SUITE_RATES[selectedSuite].rate * nightsCount;
    if (includeCaviar) base += 500 * nightsCount;
    if (includeHeliport) base += 1500;
    if (assignedButler) base += 750 * nightsCount;
    return base;
  };

  const handleLockIn = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#c19a6b', '#ffd700', '#fcfaf2']
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* LUXURY INNER TAB CONTROLS */}
      <div className="flex justify-center border-b border-black/5 pb-4">
        <div className="bg-slate-100/80 backdrop-blur-sm p-1 rounded-2xl flex flex-wrap justify-center gap-1 border border-slate-200 max-w-full">
          {(['hero', 'about', 'pricing', 'security', 'scheduler'] as const).map((tab) => {
            const isActive = subTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#c19a6b] text-white shadow-md scale-102' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {tab === 'hero' && <Globe className="w-3.5 h-3.5" />}
                {tab === 'about' && <Compass className="w-3.5 h-3.5" />}
                {tab === 'pricing' && <Calculator className="w-3.5 h-3.5" />}
                {tab === 'security' && <ShieldCheck className="w-3.5 h-3.5" />}
                {tab === 'scheduler' && <Calendar className="w-3.5 h-3.5" />}
                {tab === 'hero' && trans.navHero}
                {tab === 'about' && trans.navAbout}
                {tab === 'pricing' && trans.navPricing}
                {tab === 'security' && trans.navSecurity}
                {tab === 'scheduler' && trans.navScheduler}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-PAGES RENDERING */}
      {subTab === 'hero' && (
        <div className="space-y-12">
          
          {/* MAJESTIC HERO WELCOME BLOCK */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-black/5 min-h-[440px] flex items-center p-8 md:p-12">
            
            {/* Elegant luxury backdrop */}
            <div 
              className="absolute inset-0 bg-cover bg-center brightness-[0.45] saturate-[0.8] contrast-[1.1]" 
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80')" 
              }} 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#040914] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6 text-white text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold border border-white/20">
                <Sparkles className="w-3 h-3 text-[#c19a6b]" />
                {trans.heroBadge}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif-luxury font-bold tracking-tight leading-tight">
                {trans.heroTitle}
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                {trans.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setSubTab('pricing')}
                  className="bg-[#c19a6b] hover:bg-[#7c5a30] text-white px-5 py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition shadow-lg flex items-center justify-center gap-2"
                >
                  {trans.reserveSuite}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSubTab('scheduler');
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.8 },
                      colors: ['#e9c349', '#ffffff']
                    });
                  }}
                  className="bg-gradient-to-r from-[#e9c349] to-[#af8d11] hover:brightness-110 text-slate-950 px-5 py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Waves className="w-4 h-4 animate-pulse text-slate-950" />
                  {language === 'FR' ? "Planificateur Spa & Bien-être" : language === 'RU' ? "Велнес-расписание" : "Wellness Scheduler"}
                </button>
                <button 
                  onClick={() => setSubTab('about')}
                  className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition"
                >
                  {trans.navAbout}
                </button>
              </div>
            </div>
          </div>

          {/* TWO DECORATIVE RESORT GRID CALLOUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="p-3 bg-[#c19a6b]/20 text-[#7c5a30] rounded-xl inline-block mb-4">
                  <Waves className="w-5 h-5" />
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-slate-800">Imperial Spa & Waterway</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Purified crystalline thermal springs cascading with premium mineral treatments over dynamic glowing lights.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7c5a30] tracking-wider mt-4 block">LEVEL 4 CLEARANCE ACCESS</span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="p-3 bg-[#c19a6b]/20 text-[#7c5a30] rounded-xl inline-block mb-4">
                  <Globe className="w-5 h-5" />
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-slate-800">Sovereign Heliport Liaison</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Fast executive transit with orbital flight transponders bypass links directly supporting air terminal coordinates.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider mt-4 block">VIP PREVENTATIVE TRANSPORT</span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="p-3 bg-[#c19a6b]/20 text-[#7c5a30] rounded-xl inline-block mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-slate-800">Quantum Vault Storage</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Triple-layer cryptographic document protection using high density physical containment blocks in an offline bunker.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-red-500 tracking-wider mt-4 block">LEVEL 5 ABSOLUTE INTEGRITY</span>
            </div>

          </div>

        </div>
      )}

      {subTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="text-[10px] uppercase font-mono font-bold text-[#c19a6b] tracking-widest">ABOUT THE ARCHITECTURE</span>
            <h2 className="text-2xl md:text-4xl font-serif-luxury font-bold text-slate-800 leading-tight">
              {trans.aboutTitle}
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
              <p>{trans.aboutDesc1}</p>
              <p>{trans.aboutDesc2}</p>
            </div>

            {/* Core credentials checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/5 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Verified Michelin Elite Cuisine</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Sovereign Financial Trust</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Military-Grade Cybernetic Defense</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Discrete Bio-Signature Nodes</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" 
                alt="Zafir architecture" 
                className="w-full object-cover h-80 brightness-[0.8] grayscale-[0.1]"
              />
            </div>
            
            {/* Ambient badge overlay */}
            <div className="absolute -bottom-4 -left-4 bg-slate-900 border border-slate-800 text-[#c19a6b] p-4 rounded-2xl shadow-xl max-w-xs text-left font-mono">
              <p className="text-[9px] uppercase font-bold tracking-wider">Historical Trust Citation</p>
              <p className="text-[11px] text-white mt-1">"Established 1924, re-cleared as high-frequency sovereign territory in 2024 with zero data disclosure pacts."</p>
            </div>
          </div>

        </div>
      )}

      {subTab === 'pricing' && (
        <div className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#c19a6b] tracking-widest uppercase">TARIFICATION & MODELING</span>
            <h2 className="text-3xl font-serif-luxury font-bold text-slate-800">{trans.pricingTitle}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{trans.pricingSubtitle}</p>
          </div>

          {/* Pricing Selector & Calculator Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Pricing Options Cards (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Pres Card */}
              <div 
                onClick={() => setSelectedSuite('presidential')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                  selectedSuite === 'presidential'
                    ? 'bg-[#c19a6b]/20 border-[#c19a6b]/60 shadow-md ring-1 ring-[#c19a6b]'
                    : 'bg-white/60 border-slate-200 hover:border-[#c19a6b]/40'
                }`}
              >
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#c19a6b]">Imperial Top</span>
                  <h3 className="font-serif-luxury font-bold text-slate-800 text-sm mt-1">{SUITE_RATES.presidential.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Private helicopter link access, supreme caviar reserves.</p>
                </div>
                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xl font-mono font-bold text-slate-800">${SUITE_RATES.presidential.rate}</p>
                  <p className="text-[9px] text-slate-500 font-mono">/ night standard tier</p>
                </div>
              </div>

              {/* Royal Card */}
              <div 
                onClick={() => setSelectedSuite('royal')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                  selectedSuite === 'royal'
                    ? 'bg-[#c19a6b]/20 border-[#c19a6b]/60 shadow-md ring-1 ring-[#c19a6b]'
                    : 'bg-white/60 border-slate-200 hover:border-[#c19a6b]/40'
                }`}
              >
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-indigo-600">VIP Choice</span>
                  <h3 className="font-serif-luxury font-bold text-slate-800 text-sm mt-1">{SUITE_RATES.royal.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Personal L5 butler, custom climate calibrations.</p>
                </div>
                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xl font-mono font-bold text-slate-800">${SUITE_RATES.royal.rate}</p>
                  <p className="text-[9px] text-slate-500 font-mono">/ night standard tier</p>
                </div>
              </div>

              {/* Penthouse Card */}
              <div 
                onClick={() => setSelectedSuite('penthouse')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                  selectedSuite === 'penthouse'
                    ? 'bg-[#c19a6b]/20 border-[#c19a6b]/60 shadow-md ring-1 ring-[#c19a6b]'
                    : 'bg-white/60 border-slate-200 hover:border-[#c19a6b]/40'
                }`}
              >
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-teal-600">Discreet</span>
                  <h3 className="font-serif-luxury font-bold text-slate-800 text-sm mt-1">{SUITE_RATES.penthouse.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Stunning glowing vistas, high scale security.</p>
                </div>
                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xl font-mono font-bold text-slate-800">${SUITE_RATES.penthouse.rate}</p>
                  <p className="text-[9px] text-slate-500 font-mono">/ night standard tier</p>
                </div>
              </div>

            </div>

            {/* Interactive Calculator Section (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 text-left space-y-6">
              
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#c19a6b] animate-bounce" />
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[#c19a6b]">{trans.calcTitle}</h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{trans.calcNights}</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" 
                      max="14" 
                      value={nightsCount}
                      onChange={(e) => setNightsCount(Number(e.target.value))}
                      className="w-full text-[#c19a6b]"
                    />
                    <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded border border-slate-700 w-10 text-center">{nightsCount}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  
                  {/* Caviar Package add-on */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition">
                    <span className="text-slate-300">{trans.addonCaviar} (+ $500/night)</span>
                    <input 
                      type="checkbox" 
                      checked={includeCaviar}
                      onChange={(e) => setIncludeCaviar(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c19a6b]"
                    />
                  </label>

                  {/* Heliport Liaison transponder */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition">
                    <span className="text-slate-300">{trans.addonHeliport} (+ $1500 one-way)</span>
                    <input 
                      type="checkbox" 
                      checked={includeHeliport}
                      onChange={(e) => setIncludeHeliport(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c19a6b]"
                    />
                  </label>

                  {/* Level 5 Personal Butler Clearances */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition">
                    <span className="text-slate-300">{trans.addonButler} (+ $750/night)</span>
                    <input 
                      type="checkbox" 
                      checked={assignedButler}
                      onChange={(e) => setAssignedButler(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c19a6b]"
                    />
                  </label>

                </div>

              </div>

              {/* Total output representation with big gold values */}
              <div className="border-t border-slate-800/80 pt-4">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">{trans.calcTotalVal}</span>
                <p className="text-3xl md:text-4xl font-mono font-bold text-[#c19a6b] mt-1">${handleCalculateRate().toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Calculated based on active sovereign tariff formulas</p>
              </div>

              <button 
                onClick={handleLockIn}
                className="w-full bg-[#c19a6b] hover:bg-[#a98150] text-slate-950 font-mono font-bold text-[11px] uppercase tracking-widest p-3 rounded-xl transition duration-150 shadow-md text-center"
              >
                {trans.calcBook}
              </button>

            </div>

          </div>

        </div>
      )}

      {subTab === 'security' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-red-500 tracking-widest uppercase">SOVEREIGN ARCHON INTEGRITY</span>
            <h2 className="text-3xl font-serif-luxury font-bold text-slate-800">{trans.securityTitle}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{trans.securitySubtitle}</p>
          </div>

          {/* Three Grid Security Layers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left space-y-4">
              <span className="p-3 bg-red-950 text-red-500 border border-red-900/40 rounded-xl inline-block">
                <Layers className="w-5 h-5 animate-pulse" />
              </span>
              <h3 className="text-base font-serif-luxury font-bold text-red-100">{trans.secNode}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {trans.secNodeDesc}
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left space-y-4">
              <span className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-900/40 rounded-xl inline-block">
                <Key className="w-5 h-5" />
              </span>
              <h3 className="text-base font-serif-luxury font-bold text-indigo-100">{trans.secCard}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {trans.secCardDesc}
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left space-y-4">
              <span className="p-3 bg-amber-950 text-[#c19a6b] border border-amber-900/40 rounded-xl inline-block">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h3 className="text-base font-serif-luxury font-bold text-amber-100">{trans.secRbac}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {trans.secRbacDesc}
              </p>
            </div>

          </div>

          {/* Forensic Visual audit console */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-[#c19a6b] tracking-wider">Dynamic Parity Verification</span>
              <h4 className="text-base font-serif-luxury font-bold text-slate-800">Verify Ledger Signatures</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Our cryptographic ledger ensures non-repudiation. Every event is mapped to SHA-256 blocks that you can review in real-time on our Forensic Consoles.
              </p>
            </div>
            
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono p-4 rounded-xl shadow">
              STATUS // EN_COMPLIANT
            </span>
          </div>

        </div>
      )}

      {subTab === 'scheduler' && (
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Header section with custom title */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#e9c349]/20 p-8 md:p-10 bg-gradient-to-b from-[#1c1b1b] to-[#131313] relative overflow-hidden">
            {/* Subtle glow filter */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#e9c349]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e9c349]/10 backdrop-blur-md rounded-full text-[10px] font-mono tracking-widest uppercase text-[#e9c349] font-bold border border-[#e9c349]/20">
                  <Sparkles className="w-3 h-3 animate-spin text-[#e9c349]" />
                  {language === 'FR' ? "Planification Intelligente" : language === 'RU' ? "Умное планирование" : "Intelligent Scheduling"}
                </span>
                <h2 className="text-3xl md:text-4xl font-headline-md font-bold tracking-tight text-white glow-text">
                  Zaphir Spa & Wellness Scheduler
                </h2>
                <p className="text-sm text-[#b9cacb] max-w-2xl font-light">
                  {language === 'FR' 
                    ? "Gérez en toute fluidité les soins spa prestigieux, l'attribution des thérapeutes qualifiés et les fiches personnalisées de vos invités dans un environnement hautement sécurisé."
                    : language === 'RU'
                    ? "Управляйте высококлассными спа-услугами, доступностью терапевтов и профилями гостей."
                    : "Seamlessly manage high-end spa services, therapist availability, and guest profiles."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-gradient-to-r from-[#e9c349] to-[#af8d11] text-slate-950 font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition hover:scale-105 duration-200 shadow-lg shadow-[#e9c349]/20"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  {language === 'FR' ? "Nouveau Soin" : language === 'RU' ? "Новая услуга" : "Book Treatment"}
                </button>
              </div>
            </div>

            {/* Scheduler Sub-Navigation Tabs */}
            <div className="flex gap-4 border-b border-white/5 mt-8 pt-4">
              <button
                onClick={() => setSchedulerView('grid')}
                className={`pb-3 text-xs font-mono font-bold tracking-wider uppercase transition-colors relative ${
                  schedulerView === 'grid' ? 'text-[#e9c349]' : 'text-[#849495] hover:text-white'
                }`}
              >
                {language === 'FR' ? "📅 Grille Horaire" : language === 'RU' ? "📅 Сетка часов" : "📅 Scheduler Grid"}
                {schedulerView === 'grid' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e9c349]" />}
              </button>
              <button
                onClick={() => setSchedulerView('dashboard')}
                className={`pb-3 text-xs font-mono font-bold tracking-wider uppercase transition-colors relative ${
                  schedulerView === 'dashboard' ? 'text-[#e9c349]' : 'text-[#849495] hover:text-white'
                }`}
              >
                {language === 'FR' ? "📊 Thérapeutes & Stats" : language === 'RU' ? "📊 Терапевты и статистика" : "📊 Therapists & Stats"}
                {schedulerView === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e9c349]" />}
              </button>
              <button
                onClick={() => setSchedulerView('services')}
                className={`pb-3 text-xs font-mono font-bold tracking-wider uppercase transition-colors relative ${
                  schedulerView === 'services' ? 'text-[#e9c349]' : 'text-[#849495] hover:text-white'
                }`}
              >
                {language === 'FR' ? "💆 Soins & Rituels" : language === 'RU' ? "💆 Процедуры и Ритуалы" : "💆 Spa Rituals"}
                {schedulerView === 'services' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e9c349]" />}
              </button>
            </div>
          </div>

          {/* RENDERING INNER SCHEDULER VIEWs */}
          {schedulerView === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* THE TIMELINE GRID (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1c1b1b] border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#e9c349]" />
                    <span className="text-xs font-mono font-semibold text-[#e5e2e1]">
                      {language === 'FR' ? "Filtrer l'Espace :" : language === 'RU' ? "Фильтр ресурсов :" : "Filter Space :"}
                    </span>
                    <select
                      value={selectedResourceFilter}
                      onChange={(e) => setSelectedResourceFilter(e.target.value)}
                      className="bg-[#131313] border border-white/10 text-[#e5e2e1] text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                    >
                      <option value="All">{language === 'FR' ? "Tous les Espaces" : "All Spaces"}</option>
                      {RESOURCES.map(res => (
                        <option key={res} value={res}>{res}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder={language === 'FR' ? "Rechercher invité..." : "Search guest name..."}
                      value={searchGuestQuery}
                      onChange={(e) => setSearchGuestQuery(e.target.value)}
                      className="w-full bg-[#131313] border border-white/10 text-xs text-white placeholder-[#849495] px-3.5 py-1.5 rounded-lg focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                    />
                  </div>
                </div>

                {/* THE MAIN INTERACTIVE GRID BOARD */}
                <div className="bg-[#131313] border border-white/10 rounded-2xl overflow-x-auto relative">
                  
                  {/* Grid overlay visual representation */}
                  <div className="min-w-[700px]">
                    
                    {/* Header Columns */}
                    <div className="grid grid-cols-5 border-b border-white/5 bg-[#1c1b1b]/60">
                      <div className="p-4 text-xs font-mono font-bold text-[#849495] border-r border-white/5">
                        {language === 'FR' ? "Créneau" : "Time Slot"}
                      </div>
                      {RESOURCES.map((res) => {
                        const isFiltered = selectedResourceFilter !== 'All' && selectedResourceFilter !== res;
                        return (
                          <div 
                            key={res} 
                            className={`p-4 text-center border-r border-white/5 last:border-r-0 transition-opacity ${
                              isFiltered ? 'opacity-30' : 'opacity-100'
                            }`}
                          >
                            <p className="text-xs font-mono font-bold text-[#e5e2e1] truncate">{res.replace(/Therapist|Treatment Room/g, '')}</p>
                            <span className="text-[9px] font-mono text-[#849495]">
                              {res.includes('Room') ? (language === 'FR' ? "Cabine VIP" : "Premium Suite") : (language === 'FR' ? "Thérapeute" : "Practitioner")}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Grid Rows */}
                    <div className="divide-y divide-white/5">
                      {TIME_SLOTS.map((time) => (
                        <div key={time} className="grid grid-cols-5 group">
                          
                          {/* Time label column */}
                          <div className="p-4 flex items-center gap-2 border-r border-white/5 bg-[#1c1b1b]/10">
                            <Clock className="w-3.5 h-3.5 text-[#e9c349]" />
                            <span className="text-xs font-mono font-bold text-[#e5e2e1]">{time}</span>
                          </div>

                          {/* Columns per Resource */}
                          {RESOURCES.map((res) => {
                            const isFiltered = selectedResourceFilter !== 'All' && selectedResourceFilter !== res;
                            
                            // Find active reservation matching this slot
                            const matchedRes = reservations.find(r => r.timeSlot === time && r.resource === res);
                            
                            // Check search query matches guest name
                            const searchMatches = !searchGuestQuery || (matchedRes && matchedRes.guestName.toLowerCase().includes(searchGuestQuery.toLowerCase()));
                            
                            return (
                              <div 
                                key={res} 
                                className={`p-2 border-r border-white/5 last:border-r-0 min-h-[85px] relative flex flex-col justify-center transition-all ${
                                  isFiltered ? 'opacity-25 bg-[#1c1b1b]/10' : 'opacity-100 hover:bg-white/[0.02]'
                                }`}
                              >
                                {matchedRes ? (
                                  searchMatches ? (
                                    <div
                                      onClick={() => setSelectedResId(matchedRes.id)}
                                      className={`p-2.5 rounded-xl text-left cursor-pointer transition-all border shadow-md flex flex-col justify-between h-full ${
                                        selectedResId === matchedRes.id
                                          ? 'bg-[#e9c349]/20 border-[#e9c349] shadow-[#e9c349]/5'
                                          : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1">
                                          <p className="text-[11px] font-mono font-bold text-white truncate max-w-[100px]">{matchedRes.guestName}</p>
                                          <span className={`w-1.5 h-1.5 rounded-full ${matchedRes.checkedIn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                        </div>
                                        <p className="text-[10px] text-[#e9c349] font-mono truncate mt-0.5">{matchedRes.service}</p>
                                      </div>
                                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                                        <span className="text-[9px] font-mono text-[#849495]">${matchedRes.price}</span>
                                        <span className="text-[8px] font-mono uppercase bg-white/10 px-1 rounded text-white scale-90">
                                          {matchedRes.checkedIn ? (language === 'FR' ? "Présent" : "Active") : (language === 'FR' ? "Réservé" : "Hold")}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-stone-600 font-mono italic text-center">Unmatched</div>
                                  )
                                ) : (
                                  /* Empty cell with click to trigger booking modal pre-populated */
                                  <button
                                    disabled={isFiltered}
                                    onClick={() => {
                                      setFormTimeSlot(time);
                                      setFormResource(res);
                                      setIsBookingModalOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute inset-0 w-full h-full flex items-center justify-center bg-white/[0.01] text-[#e9c349] transition-opacity"
                                  >
                                    <div className="flex items-center gap-1.5 bg-[#e9c349]/10 border border-[#e9c349]/20 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                                      <Plus className="w-3 h-3" />
                                      {language === 'FR' ? "Réserver" : "Book"}
                                    </div>
                                  </button>
                                )}
                              </div>
                            );
                          })}

                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#849495] bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <Info className="w-4 h-4 text-[#e9c349]" />
                  <span>
                    {language === 'FR'
                      ? "💡 Astuce : Survolez les cellules vides et cliquez sur le bouton Réserver pour pré-remplir le soin à l'heure sélectionnée."
                      : "💡 Pro tip: Hover on any empty cell and click Book to pre-populate slot parameters for immediate scheduling."}
                  </span>
                </div>

              </div>

              {/* GUEST WELLNESS PROFILE & RESERVATION DETAILS (4 cols) */}
              <div className="lg:col-span-4 bg-[#1c1b1b] border border-white/5 rounded-3xl p-6 space-y-6 relative sticky top-6">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-[#e9c349] uppercase flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {language === 'FR' ? "Fiche Invité & Détails" : "Guest Wellness Profile"}
                  </h3>
                  <span className="text-[10px] font-mono text-[#849495]">SECURE // RBAC-L4</span>
                </div>

                {selectedResId && reservations.find(r => r.id === selectedResId) ? (
                  (() => {
                    const activeRes = reservations.find(r => r.id === selectedResId)!;
                    return (
                      <div className="space-y-6">
                        
                        {/* Guest Header */}
                        <div className="bg-[#131313] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#e9c349]/10 border border-[#e9c349]/30 flex items-center justify-center text-[#e9c349] shrink-0 font-serif-luxury text-xl font-bold">
                            {activeRes.guestName[0]}
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-bold text-white">{activeRes.guestName}</h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-[#849495] mt-0.5">
                              {activeRes.id}
                            </span>
                          </div>
                        </div>

                        {/* Treatment parameters details */}
                        <div className="space-y-3 font-mono text-xs text-left">
                          <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-[#849495]">{language === 'FR' ? "Soin Spa" : "Service Rituel"}</span>
                            <span className="font-bold text-white text-right">{activeRes.service}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-[#849495]">{language === 'FR' ? "Espace Assigné" : "Assigned Area"}</span>
                            <span className="font-bold text-[#e9c349] text-right">{activeRes.resource.replace(/Therapist |Treatment /g, '')}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-[#849495]">{language === 'FR' ? "Heure de Soin" : "Treatment Time"}</span>
                            <span className="font-bold text-white text-right">{activeRes.timeSlot}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-[#849495]">{language === 'FR' ? "Tarif du soin" : "Treatment Price"}</span>
                            <span className="font-bold text-[#e9c349] text-right">${activeRes.price}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-[#849495]">{language === 'FR' ? "Statut Présence" : "Check-in Status"}</span>
                            <span className={`font-bold ${activeRes.checkedIn ? 'text-emerald-400' : 'text-amber-400'} text-right`}>
                              {activeRes.checkedIn ? (language === 'FR' ? "🟢 Présent en cabine" : "🟢 Checked In") : (language === 'FR' ? "🟡 Réservation Validée" : "🟡 Pending Check-in")}
                            </span>
                          </div>
                        </div>

                        {/* Guest Wellness Preferences checkboxes */}
                        <div className="space-y-3">
                          <p className="text-[11px] font-mono font-bold text-[#849495] uppercase tracking-wider text-left">
                            {language === 'FR' ? "🎯 Préférences Personnalisées" : "🎯 Wellness Preferences"}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            {['Aromatherapy', 'High Pressure', 'Low Light', 'Soft Music', 'Honey Treatment', 'Warm Stones'].map(pref => {
                              const hasPref = activeRes.preferences.includes(pref);
                              return (
                                <button
                                  key={pref}
                                  onClick={() => {
                                    const updatedRes = reservations.map(r => {
                                      if (r.id === activeRes.id) {
                                        const newPrefs = hasPref 
                                          ? r.preferences.filter(p => p !== pref)
                                          : [...r.preferences, pref];
                                        return { ...r, preferences: newPrefs };
                                      }
                                      return r;
                                    });
                                    setReservations(updatedRes);
                                  }}
                                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition ${
                                    hasPref 
                                      ? 'bg-[#e9c349]/10 border-[#e9c349]/40 text-[#e9c349]' 
                                      : 'bg-white/[0.02] border-white/5 text-[#849495] hover:bg-white/5'
                                  }`}
                                >
                                  <span className="text-xs">{hasPref ? '✓' : '+'}</span>
                                  <span className="truncate">{pref}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Guest notes and clinical exceptions */}
                        <div className="space-y-2 text-left">
                          <label className="text-[11px] font-mono font-bold text-[#849495] uppercase tracking-wider block">
                            {language === 'FR' ? "📝 Notes Cliniques & Souhaits" : "📝 Clinical Notes & Requests"}
                          </label>
                          <textarea
                            value={activeRes.notes}
                            onChange={(e) => {
                              const updatedRes = reservations.map(r => {
                                if (r.id === activeRes.id) {
                                  return { ...r, notes: e.target.value };
                                }
                                return r;
                              });
                              setReservations(updatedRes);
                            }}
                            rows={3}
                            placeholder={language === 'FR' ? "Notes particulières sur l'invité..." : "Add specific notes for the therapist..."}
                            className="w-full bg-[#131313] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                          />
                        </div>

                        {/* Actions buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          {!activeRes.checkedIn ? (
                            <button
                              onClick={() => {
                                const updatedRes = reservations.map(r => {
                                  if (r.id === activeRes.id) {
                                    return { ...r, checkedIn: true };
                                  }
                                  return r;
                                });
                                setReservations(updatedRes);
                                confetti({
                                  particleCount: 80,
                                  spread: 50,
                                  origin: { x: 0.8, y: 0.6 },
                                  colors: ['#e9c349', '#ffffff']
                                });
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition"
                            >
                              {language === 'FR' ? "Enregistrer" : "Check In"}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const updatedRes = reservations.map(r => {
                                  if (r.id === activeRes.id) {
                                    return { ...r, checkedIn: false };
                                  }
                                  return r;
                                });
                                setReservations(updatedRes);
                              }}
                              className="bg-white/10 hover:bg-white/15 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition"
                            >
                              {language === 'FR' ? "Annuler Arrivée" : "Undo Arrival"}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(language === 'FR' ? "Annuler ce rendez-vous spa ?" : "Cancel this spa treatment booking?")) {
                                setReservations(reservations.filter(r => r.id !== activeRes.id));
                                setSelectedResId(null);
                              }
                            }}
                            className="bg-red-950/40 hover:bg-red-950 text-red-200 border border-red-900/30 font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition"
                          >
                            {language === 'FR' ? "Annuler Soin" : "Cancel Book"}
                          </button>
                        </div>

                      </div>
                    );
                  })()
                ) : (
                  <div className="py-12 text-center text-[#849495] font-mono text-xs space-y-2">
                    <AlertCircle className="w-8 h-8 text-[#e9c349] mx-auto opacity-60" />
                    <p>{language === 'FR' ? "Aucun soin sélectionné" : "No treatment selected"}</p>
                    <p className="text-[10px] text-stone-500">{language === 'FR' ? "Sélectionnez un créneau pour voir la fiche" : "Select a booking card to view guest details."}</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {schedulerView === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Quick spa metrics statistics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-[#1c1b1b] border border-white/5 p-5 rounded-2xl text-left">
                  <p className="text-[10px] font-mono font-bold text-[#849495] uppercase tracking-wider">Occupancy Rate Today</p>
                  <p className="text-3xl font-mono font-bold text-[#e9c349] mt-2">68.5%</p>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-[#e9c349] h-full rounded-full" style={{ width: '68.5%' }} />
                  </div>
                </div>

                <div className="bg-[#1c1b1b] border border-white/5 p-5 rounded-2xl text-left">
                  <p className="text-[10px] font-mono font-bold text-[#849495] uppercase tracking-wider">Total Spa Revenue Today</p>
                  <p className="text-3xl font-mono font-bold text-white mt-2">
                    ${reservations.reduce((sum, r) => sum + r.price, 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] font-mono text-[#4edea3] mt-2 block">L5 Premium billing sync live</span>
                </div>

                <div className="bg-[#1c1b1b] border border-white/5 p-5 rounded-2xl text-left">
                  <p className="text-[10px] font-mono font-bold text-[#849495] uppercase tracking-wider">Active Bookings</p>
                  <p className="text-3xl font-mono font-bold text-white mt-2">{reservations.length}</p>
                  <span className="text-[10px] font-mono text-[#849495] mt-2 block">{reservations.filter(r => r.checkedIn).length} guests checked in</span>
                </div>

                <div className="bg-[#1c1b1b] border border-white/5 p-5 rounded-2xl text-left">
                  <p className="text-[10px] font-mono font-bold text-[#849495] uppercase tracking-wider">Sovereign Airflow Integrity</p>
                  <p className="text-3xl font-mono font-bold text-[#4edea3] mt-2">Optimal</p>
                  <span className="text-[10px] font-mono text-[#849495] mt-2 block">Water filtration system: 98%</span>
                </div>

              </div>

              {/* Therapist Availability management */}
              <div className="bg-[#1c1b1b] border border-white/5 rounded-3xl p-6">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-serif-luxury font-bold text-white">
                      {language === 'FR' ? "Disponibilité des Thérapeutes" : "Therapist Availability Management"}
                    </h3>
                    <p className="text-xs text-[#849495] font-mono mt-1">
                      {language === 'FR' ? "Cliquez sur le badge pour modifier l'état de présence de l'opérateur en temps réel." : "Click on the availability badge to cycle status and update scheduler resource allocation."}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#e9c349]">ACTIVE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {therapists.map(t => {
                    const statusColors = {
                      Active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
                      'On Break': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                      'Off-Duty': 'bg-red-400/10 text-red-400 border-red-400/20'
                    };

                    const statusBadges = {
                      Active: '🟢 Active',
                      'On Break': '🟡 On Break',
                      'Off-Duty': '🔴 Off-Duty'
                    };

                    return (
                      <div key={t.id} className="bg-[#131313] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#e9c349]">
                            {t.name[0]}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white font-mono">{t.name}</h4>
                            <p className="text-xs text-[#849495] font-mono">{t.specialty}</p>
                          </div>
                        </div>

                        {/* Interactive toggle for Therapist Availability */}
                        <button
                          onClick={() => {
                            const statuses: Array<'Active' | 'On Break' | 'Off-Duty'> = ['Active', 'On Break', 'Off-Duty'];
                            const nextIndex = (statuses.indexOf(t.status) + 1) % statuses.length;
                            const updated = therapists.map(th => th.id === t.id ? { ...th, status: statuses[nextIndex] } : th);
                            setTherapists(updated);
                          }}
                          className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-all hover:scale-105 active:scale-95 ${statusColors[t.status]}`}
                        >
                          {statusBadges[t.status]}
                        </button>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

          {schedulerView === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPA_SERVICES.map(service => {
                const countOfReservations = reservations.filter(r => r.service === service.name).length;
                return (
                  <div key={service.name} className="bg-[#1c1b1b] border border-white/5 rounded-2xl p-5 flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="p-2 bg-[#e9c349]/10 text-[#e9c349] rounded-xl inline-block">
                          <Heart className="w-5 h-5" />
                        </span>
                        <span className="text-xs font-mono font-bold text-[#e9c349]">${service.price}</span>
                      </div>
                      <h4 className="text-base font-serif-luxury font-bold text-white">{service.name}</h4>
                      <p className="text-xs text-[#849495] font-mono">Duration: {service.duration}</p>
                      <p className="text-xs text-[#b9cacb] font-light leading-relaxed">{service.desc}</p>
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] font-mono text-[#849495]">
                      <span>Active Reservations Today:</span>
                      <span className="font-bold text-white">{countOfReservations}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* NEW RESERVATION FORM MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1c1b1b] border border-[#e9c349]/20 rounded-3xl max-w-lg w-full overflow-hidden p-6 text-left space-y-4 relative animate-scale-up shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-serif-luxury font-bold text-[#e9c349] tracking-wide uppercase flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#e9c349]" />
                {language === 'FR' ? "Réserver un Soin d'Exception" : "Schedule Luxury Spa Ritual"}
              </h3>
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="text-[#849495] hover:text-white font-mono text-sm p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400" />
                {formError}
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              
              <div className="space-y-1">
                <label className="text-[#849495] block">{language === 'FR' ? "Nom de l'Invité (Nom complet)" : "Guest Full Name"}</label>
                <input
                  type="text"
                  placeholder={language === 'FR' ? "Ex. Madame Dubois" : "Ex. Mrs. Dubois"}
                  value={formGuestName}
                  onChange={(e) => setFormGuestName(e.target.value)}
                  className="w-full bg-[#131313] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#849495] block">{language === 'FR' ? "Rituel Spa" : "Spa Treatment"}</label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                  >
                    {SPA_SERVICES.map(s => (
                      <option key={s.name} value={s.name}>{s.name} (${s.price})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#849495] block">{language === 'FR' ? "Espace de Soin" : "Assigned Resource"}</label>
                  <select
                    value={formResource}
                    onChange={(e) => setFormResource(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                  >
                    {RESOURCES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#849495] block">{language === 'FR' ? "Créneau Horaire" : "Treatment Hour"}</label>
                  <select
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#849495] block">Price Estimate</label>
                  <div className="bg-[#131313] border border-white/10 text-[#e9c349] p-2.5 rounded-xl font-bold flex items-center justify-between">
                    <span>${SPA_SERVICES.find(s => s.name === formService)?.price || 0}</span>
                    <span className="text-[10px] text-stone-500 font-normal">Sovereign tariff auto-pull</span>
                  </div>
                </div>
              </div>

              {/* Guest Preferences checklists */}
              <div className="space-y-2">
                <label className="text-[#849495] block">{language === 'FR' ? "Préférences Hôtelières" : "Hotel & Wellness Preferences"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Aromatherapy', 'High Pressure', 'Low Light', 'Soft Music', 'Honey Treatment', 'Warm Stones'].map(pref => {
                    const isChecked = formPreferences.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setFormPreferences(formPreferences.filter(p => p !== pref));
                          } else {
                            setFormPreferences([...formPreferences, pref]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-[10px] transition truncate text-center ${
                          isChecked 
                            ? 'bg-[#e9c349]/10 border-[#e9c349]/40 text-[#e9c349]' 
                            : 'bg-[#131313] border-white/10 text-[#849495] hover:bg-white/5'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#849495] block">{language === 'FR' ? "Notes Cliniques ou Souhaits Spécifiques" : "Clinical Notes & Exceptions"}</label>
                <textarea
                  rows={2}
                  placeholder={language === 'FR' ? "Ex. Allérgies, niveau de température, huiles essentielles souhaitées..." : "Ex. Allergies, pressure notes, room temperature..."}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#131313] border border-white/10 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-[#e9c349] focus:outline-none"
                />
              </div>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => {
                  if (!formGuestName.trim()) {
                    setFormError(language === 'FR' ? "Veuillez entrer le nom complet de l'invité." : "Please input guest name first.");
                    return;
                  }

                  // Check if slot already booked for this resource and time
                  const isConflict = reservations.some(r => r.timeSlot === formTimeSlot && r.resource === formResource);
                  if (isConflict) {
                    setFormError(language === 'FR' ? "Ce créneau horaire est déjà réservé pour cet espace." : "This slot is already booked for this resource.");
                    return;
                  }

                  const matchedServ = SPA_SERVICES.find(s => s.name === formService)!;
                  const newRes: SpaReservation = {
                    id: `RES-${Math.floor(100 + Math.random() * 900)}`,
                    guestName: formGuestName,
                    service: formService,
                    price: matchedServ.price,
                    timeSlot: formTimeSlot,
                    resource: formResource,
                    preferences: formPreferences,
                    notes: formNotes || 'None',
                    checkedIn: false
                  };

                  setReservations([...reservations, newRes]);
                  setSelectedResId(newRes.id);
                  setFormGuestName('');
                  setFormNotes('');
                  setFormPreferences([]);
                  setFormError('');
                  setIsBookingModalOpen(false);

                  confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#e9c349', '#ffffff', '#af8d11']
                  });
                }}
                className="flex-1 bg-gradient-to-r from-[#e9c349] to-[#af8d11] text-slate-950 font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition hover:scale-[1.02]"
              >
                {language === 'FR' ? "Créer la Réservation" : "Confirm & Schedule"}
              </button>
              <button
                onClick={() => {
                  setFormGuestName('');
                  setFormNotes('');
                  setFormPreferences([]);
                  setFormError('');
                  setIsBookingModalOpen(false);
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition"
              >
                {language === 'FR' ? "Annuler" : "Cancel"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
