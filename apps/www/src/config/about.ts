export interface AboutCard {
  title: string
  body: string
}

export const ABOUT_CARDS: readonly AboutCard[] = [
  {
    title: 'Setup în minute',
    body: 'Contul tău, magazinul tău online și primul produs — live în mai puțin de 5 minute.',
  },
  {
    title: 'Zero mentenanță',
    body: 'Update-uri, securitate, backup — totul e gestionat de noi. Tu nu instalezi nimic.',
  },
  {
    title: 'Scalează cu tine',
    body: 'De la 10 la 10.000 de comenzi pe lună — infrastructura crește fără să schimbi nimic.',
  },
]
