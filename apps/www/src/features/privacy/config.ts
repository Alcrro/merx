export const LAST_UPDATED = '10 septembrie 2026'

export const SECTIONS = [
  { id: 'cine', label: 'Cine suntem' },
  { id: 'date', label: 'Ce date colectăm' },
  { id: 'utilizare', label: 'Cum utilizăm datele' },
  { id: 'temei', label: 'Temei juridic' },
  { id: 'partajare', label: 'Cu cine partajăm' },
  { id: 'transfer', label: 'Transfer internațional' },
  { id: 'retentie', label: 'Retenție' },
  { id: 'drepturi', label: 'Drepturile tale' },
  { id: 'cookies', label: 'Cookie-uri' },
  { id: 'modificari', label: 'Modificări' },
  { id: 'contact', label: 'Contact' },
] as const

export const DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: 'Date de cont',
    description: 'Nume, adresă de email, parolă (hash), planul de abonament, data înregistrării. Necesare pentru crearea și gestionarea contului tău.',
  },
  {
    title: 'Date de facturare',
    description: 'Adresă de facturare, CUI (dacă ești persoană juridică). Datele cardului sunt procesate direct de Stripe — Merx nu stochează date de card.',
  },
  {
    title: 'Date operaționale ale magazinului',
    description: 'Produse, comenzi, stoc, clienții magazinului tău. Aceste date îți aparțin — noi le procesăm doar pentru a furniza Serviciul.',
  },
  {
    title: 'Date de utilizare',
    description: 'Acțiuni în dashboard (clickuri, navigație), query-uri AI, loguri de sesiune. Utilizate pentru îmbunătățirea platformei și depanare.',
  },
  {
    title: 'Date tehnice',
    description: 'Adresă IP, browser, device, timestamp-uri de acces. Colectate automat la utilizarea Platformei.',
  },
]

export const USES: string[] = [
  'Furnizarea și îmbunătățirea Serviciului (procesarea comenzilor, funcționalități AI, analytics).',
  'Gestionarea contului și autentificarea.',
  'Procesarea plăților și emiterea facturilor.',
  'Trimiterea de notificări tranzacționale (confirmare comandă, alertă stoc).',
  'Comunicări de marketing — doar cu consimțământul tău explicit.',
  'Prevenirea fraudei și asigurarea securității platformei.',
  'Respectarea obligațiilor legale.',
]

export const LEGAL_BASES: { basis: string; scope: string }[] = [
  { basis: 'Executarea contractului (Art. 6(1)(b))', scope: 'Date de cont, date operaționale, facturare — necesare pentru a-ți furniza Serviciul.' },
  { basis: 'Interes legitim (Art. 6(1)(f))', scope: 'Date de utilizare și tehnice — pentru securitate, depanare și îmbunătățirea platformei.' },
  { basis: 'Obligație legală (Art. 6(1)(c))', scope: 'Păstrarea facturilor conform legislației fiscale române.' },
  { basis: 'Consimțământ (Art. 6(1)(a))', scope: 'Comunicări de marketing — poți retrage consimțământul oricând.' },
]

export const SUB_PROCESSORS: string[] = [
  'Stripe — procesare plăți (SUA, clauze contractuale standard UE).',
  'Supabase — baza de date (UE).',
  'Upstash — cache și cozi de mesaje (UE).',
  'Fly.io — hosting API (UE).',
  'Vercel — hosting frontend (UE).',
  'OpenAI — procesare query-uri AI (SUA, clauze contractuale standard UE). Query-urile nu sunt folosite pentru antrenarea modelelor.',
]

export const RETENTION: { type: string; period: string }[] = [
  { type: 'Date de cont', period: '30 de zile după închiderea contului, apoi ștergere.' },
  { type: 'Date operaționale', period: 'Pe durata abonamentului + 30 zile fereastră de export.' },
  { type: 'Facturi', period: '10 ani conform legislației fiscale române.' },
  { type: 'Loguri tehnice', period: 'Maximum 90 de zile.' },
  { type: 'Date marketing', period: 'Până la retragerea consimțământului.' },
]

export const GDPR_RIGHTS: string[] = [
  'Acces — să primești o copie a datelor pe care le deținem despre tine.',
  'Rectificare — să corectezi datele inexacte.',
  'Ștergere („dreptul de a fi uitat") — în anumite condiții.',
  'Restricționare — să limitezi prelucrarea datelor tale.',
  'Portabilitate — să primești datele în format structurat, citibil automat.',
  'Opoziție — față de prelucrarea bazată pe interes legitim sau în scop de marketing.',
  'Retragerea consimțământului — oricând, fără efect retroactiv.',
]
