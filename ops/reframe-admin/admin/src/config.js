export const GITHUB_ORG = 'flipthecoins';

export const NL_BADGE_LABELS = {
  'Top Pick': 'Beste keuze', 'Best Bonus': 'Beste bonus', "Editor's Choice": 'Keuze van de redactie',
  'Most Popular': 'Populairst', 'New Casino': 'Nieuw casino', 'Exclusive': 'Exclusief',
  'Recommended': 'Aanbevolen', 'VIP': 'VIP', '🔥 Hot': '🔥 Populair',
};

export const LANGS = {
  it: {
    name: 'Italiano',
    bonus_label: 'Bonus benvenuto',
    methods_label: 'Metodo di deposito',
    deposit_label: 'Deposito minimo',
    verified_label: 'Casinò verificato',
    disclaimer: '18+ | Si applicano i T&C',
    cta_play: 'Gioca ora',
    cta_review: 'Recensione',
  },
  de: {
    name: 'Deutsch',
    bonus_label: 'Willkommensbonus',
    methods_label: 'Zahlungsmethoden',
    deposit_label: 'Mindesteinzahlung',
    verified_label: 'Verifiziertes Casino',
    disclaimer: '18+ | Es gelten die AGB',
    cta_play: 'Jetzt spielen',
    cta_review: 'Bewertung',
  },
  en: {
    name: 'English',
    bonus_label: 'Welcome bonus',
    methods_label: 'Payment methods',
    deposit_label: 'Min. deposit',
    verified_label: 'Verified casino',
    disclaimer: '18+ | T&C apply',
    cta_play: 'Play now',
    cta_review: 'Review',
  },
  es: {
    name: 'Español',
    bonus_label: 'Bono de bienvenida',
    methods_label: 'Métodos de pago',
    deposit_label: 'Depósito mínimo',
    verified_label: 'Casino verificado',
    disclaimer: '18+ | Se aplican los T&C',
    cta_play: 'Jugar ahora',
    cta_review: 'Reseña',
  },
  nl: {
    name: 'Nederlands',
    bonus_label: 'Welkomstbonus',
    methods_label: 'Betaalmethoden',
    deposit_label: 'Min. storting',
    verified_label: 'Geverifieerd casino',
    disclaimer: '18+ | Speel verantwoord',
    cta_play: 'Speel Nu',
    cta_review: 'Lees review',
  },
};

export const COUNTRIES = {
  italy_aams: {
    name: 'Italy — AAMS',
    flag: '🇮🇹',
    repo: '',
    bot_path: '',
    link_base: 'https://link.flower-home.it',
    kv_key: 'bot:casinos:italy_aams',
    card_layout: 'compact',
  },
  italy: {
    // Keep the existing ID and site integrations for the NON AAMS list.
    name: 'Italy — NON AAMS',
    flag: '🇮🇹',
    repo: 'flower-home.it',
    bot_path: 'proyectos/flower-home.it/bot/index.html',
    link_base: 'https://link.flower-home.it',
    kv_key: 'bot:casinos:italy',
    card_layout: 'compact',
    card_theme: 'editorial',
  },
  netherlands: {
    // Keep the existing ID and site integrations for the Zonder CRUKS list.
    name: 'Netherlands — Zonder CRUKS',
    flag: '🇳🇱',
    repo: 'driftwooddistillery.nl',
    bot_path: 'proyectos/driftwooddistillery.nl/bot/nl/index.html',
    link_base: 'https://www.driftwooddistillery.nl/go',
    kv_key: 'bot:casinos:netherlands',
    card_layout: 'compact',
  },
  netherlands_cruks: {
    name: 'Netherlands — CRUKS',
    flag: '🇳🇱',
    repo: '',
    bot_path: '',
    link_base: 'https://www.driftwooddistillery.nl/go',
    kv_key: 'bot:casinos:netherlands_cruks',
    card_layout: 'compact',
  },
};
