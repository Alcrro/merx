export const LAST_UPDATED = '10 septembrie 2026'

export const SECTIONS = [
  { id: 'definitii', label: 'Definiții' },
  { id: 'cont', label: 'Contul tău' },
  { id: 'abonamente', label: 'Abonamente și plată' },
  { id: 'utilizare', label: 'Utilizare acceptabilă' },
  { id: 'ai', label: 'Funcționalități AI' },
  { id: 'proprietate', label: 'Proprietate intelectuală' },
  { id: 'raspundere', label: 'Limitarea răspunderii' },
  { id: 'reziliere', label: 'Reziliere' },
  { id: 'modificari', label: 'Modificări' },
  { id: 'lege', label: 'Lege aplicabilă' },
  { id: 'contact', label: 'Contact' },
] as const

export const DEFINITIONS: { term: string; definition: string }[] = [
  { term: 'Platformă', definition: 'Aplicațiile web și API-urile puse la dispoziție de Merx la merx.com și subdomeniile sale.' },
  { term: 'Merchant', definition: 'Persoana fizică autorizată sau juridică ce creează un cont și operează un magazin pe Platformă.' },
  { term: 'Magazin', definition: 'Storefrontul public al Merchantului, accesibil la {slug}.merx.com.' },
  { term: 'Conținut', definition: 'Orice date, texte, imagini sau fișiere încărcate de Merchant pe Platformă.' },
  { term: 'Serviciu AI', definition: 'Funcționalitățile bazate pe modele de limbaj mari integrate în Platformă.' },
]

export const RESTRICTED_USES: string[] = [
  'Vinde produse ilegale, contrafăcute sau interzise de legislația aplicabilă.',
  'Colecta sau procesa date ale clienților tăi în afara scopurilor declarate.',
  'Trimite comunicări comerciale nesolicitate (spam).',
  'Testa vulnerabilități de securitate ale infrastructurii Merx.',
  'Revinde sau sub-licenția accesul la Platformă fără acord scris.',
]
