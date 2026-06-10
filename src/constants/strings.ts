/**
 * All user-facing copy lives here, in German (Sie-Form).
 * One place to edit when wording needs to change.
 */
export const strings = {
  common: {
    loading: 'Wird geladen…',
    retry: 'Erneut versuchen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    confirm: 'Bestätigen',
  },
  brandPicker: {
    title: 'Willkommen',
    subtitle: 'Wählen Sie Ihre Marke aus',
    continue: 'Weiter',
  },
  login: {
    title: 'Anmelden',
    subtitle: 'Melden Sie sich mit Ihren Zugangsdaten an',
    username: 'Benutzername',
    password: 'Passwort',
    stayLoggedIn: 'Angemeldet bleiben',
    submit: 'Anmelden',
    demoHint: 'Demo: Beliebige Eingaben funktionieren',
  },
  tabs: {
    start: 'Start',
    karte: 'Karte',
    maerkte: 'Märkte',
    angebote: 'Angebote',
    liste: 'Liste',
  },
  start: {
    greeting: (businessName: string) => `Guten Tag, ${businessName}`,
    quickAccess: 'Schnellzugriff',
    offersTeaser: 'Aktuelle Angebote',
    tileKarte: 'Kundenkarte',
    tileMaerkte: 'Märkte',
    tileRechnungen: 'Rechnungen',
    tileScanner: 'Scanner',
  },
  karte: {
    title: 'Digitale Kundenkarte',
    customerNumber: 'Kundennummer',
    flipHint: 'Tippen für Details',
  },
  maerkte: {
    title: 'Märkte',
    nearestBranch: 'Nächstgelegener Markt',
    hours: 'Öffnungszeiten',
    call: 'Anrufen',
    route: 'Route',
  },
  angebote: {
    title: 'Angebote',
    allCategories: 'Alle',
    addToList: 'Zur Liste hinzufügen',
  },
  liste: {
    title: 'Einkaufsliste',
    empty: 'Ihre Einkaufsliste ist leer',
    share: 'Teilen',
  },
  scanner: {
    title: 'Scanner',
    hint: 'Barcode scannen',
  },
  rechnungen: {
    title: 'Rechnungen',
    filterByMarket: 'Markt',
    filterByDate: 'Datum',
  },
  profil: {
    title: 'Profil',
    accountInfo: 'Kontoinformationen',
    switchBrand: 'Marke wechseln',
    logout: 'Abmelden',
    demoReset: 'Demo zurücksetzen',
    demoResetConfirm: 'Möchten Sie alle Demo-Daten zurücksetzen?',
  },
} as const;
