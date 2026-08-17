import { useRef, useState, useEffect, useMemo } from 'react'

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  RO: [
    'Alba Iulia', 'Arad', 'Bacău', 'Baia Mare', 'Bistrița', 'Botoșani', 'Brăila', 'Brașov',
    'București', 'Buzău', 'Călărași', 'Cluj-Napoca', 'Constanța', 'Craiova', 'Deva',
    'Drobeta-Turnu Severin', 'Deva', 'Focșani', 'Galați', 'Giurgiu', 'Iași', 'Lugoj',
    'Mangalia', 'Mediaș', 'Miercurea Ciuc', 'Năvodari', 'Odorheiu Secuiesc', 'Onești',
    'Oradea', 'Petroșani', 'Piatra Neamț', 'Pitești', 'Ploiești', 'Râmnicu Vâlcea',
    'Reșița', 'Roman', 'Satu Mare', 'Sfântu Gheorghe', 'Sibiu', 'Sighișoara', 'Sinaia',
    'Slobozia', 'Suceava', 'Târgoviște', 'Târgu Jiu', 'Târgu Mureș', 'Tecuci', 'Timișoara',
    'Tulcea', 'Turda', 'Urziceni', 'Vaslui', 'Vulcan', 'Zalău', 'Câmpina', 'Câmpulung',
    'Câmpulung Moldovenesc', 'Cernavodă', 'Codlea', 'Curtea de Argeș', 'Dorohoi',
    'Fălticeni', 'Fetești', 'Gura Humorului', 'Hunedoara', 'Huși', 'Medgidia', 'Motru',
    'Oltenița', 'Orăștie', 'Pașcani', 'Rădăuți', 'Roșiorii de Vede', 'Sebeș',
    'Turnu Măgurele', 'Vatra Dornei', 'Aiud', 'Blaj', 'Brad', 'Calafat', 'Caracal',
    'Câmpia Turzii', 'Gherla', 'Reghin', 'Săcele', 'Toplița', 'Moreni', 'Moinești',
    'Adjud', 'Comănești', 'Hârlău', 'Siret', 'Darabani', 'Târgu Frumos', 'Lehliu Gară',
  ].sort(),
  DE: [
    'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
    'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg',
    'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Mannheim', 'Karlsruhe',
    'Augsburg', 'Wiesbaden', 'Mönchengladbach', 'Gelsenkirchen', 'Braunschweig',
    'Kiel', 'Aachen', 'Chemnitz', 'Halle', 'Magdeburg', 'Freiburg', 'Lübeck', 'Erfurt',
  ].sort(),
  FR: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg',
    'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon',
    'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Le Mans', 'Aix-en-Provence',
    'Clermont-Ferrand', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan',
  ].sort(),
  IT: [
    'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
    'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Brescia',
    'Reggio Calabria', 'Modena', 'Prato', 'Taranto', 'Cagliari', 'Livorno', 'Parma',
  ].sort(),
  ES: [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia',
    'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo',
    'Gijón', 'Granada', 'Elche', 'Oviedo', 'Badalona', 'Terrassa', 'Sabadell',
  ].sort(),
  PL: [
    'Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz',
    'Lublin', 'Białystok', 'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec',
    'Toruń', 'Kielce', 'Rzeszów', 'Gliwice', 'Zabrze', 'Olsztyn', 'Bytom',
  ].sort(),
  HU: [
    'Budapest', 'Debrecen', 'Miskolc', 'Szeged', 'Pécs', 'Győr', 'Nyíregyháza',
    'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Érd', 'Tatabánya', 'Kaposvár',
    'Sopron', 'Eger', 'Veszprém', 'Zalaegerszeg', 'Dunakeszi', 'Ózd', 'Nagykanizsa',
  ].sort(),
  BG: [
    'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven',
    'Dobrich', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad',
    'Vratsa', 'Gabrovo', 'Vidin', 'Lovech', 'Silistra', 'Targovishte', 'Montana',
  ].sort(),
  GB: [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Bristol', 'Sheffield',
    'Leeds', 'Edinburgh', 'Leicester', 'Coventry', 'Bradford', 'Cardiff', 'Belfast',
    'Nottingham', 'Kingston upon Hull', 'Newcastle', 'Stoke-on-Trent', 'Southampton',
    'Derby', 'Portsmouth', 'Brighton', 'Plymouth', 'Oxford', 'Cambridge',
  ].sort(),
  AT: ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'St. Pölten', 'Dornbirn'].sort(),
  CH: ['Zürich', 'Genf', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Luzern', 'St. Gallen', 'Biel', 'Thun'].sort(),
  NL: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'].sort(),
  BE: ['Bruxelles', 'Antwerpen', 'Gent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Mechelen'].sort(),
  SE: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'].sort(),
  NO: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Tromsø', 'Sandnes', 'Bodø'].sort(),
  DK: ['København', 'Aarhus', 'Odense', 'Aalborg', 'Frederiksberg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle'].sort(),
  PT: ['Lisboa', 'Porto', 'Amadora', 'Braga', 'Setúbal', 'Coimbra', 'Funchal', 'Almada', 'Aveiro', 'Guimarães'].sort(),
  GR: ['Αθήνα', 'Θεσσαλονίκη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα', 'Βόλος', 'Ιωάννινα', 'Χανιά', 'Χαλκίδα', 'Αλεξανδρούπολη'].sort(),
  CZ: ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice'].sort(),
  SK: ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Nitra', 'Banská Bystrica', 'Trnava', 'Martin', 'Trenčín', 'Poprad'].sort(),
  HR: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Slavonski Brod', 'Pula', 'Karlovac', 'Sisak', 'Varaždin'].sort(),
  RS: ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin', 'Pančevo', 'Čačak', 'Leskovac', 'Smederevo'].sort(),
  MD: ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița', 'Cahul', 'Ungheni', 'Soroca', 'Orhei', 'Dubăsari'].sort(),
  UA: ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Mariupol', 'Luhansk', 'Vinnytsia'].sort(),
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Nashville', 'Miami', 'Atlanta', 'Boston', 'Las Vegas', 'Portland'].sort(),
  CA: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Halifax', 'Victoria', 'Windsor', 'Oshawa'].sort(),
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Darwin'].sort(),
  TR: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Trabzon', 'Samsun'].sort(),
  AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].sort(),
  CN: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Chongqing', 'Chengdu', 'Nanjing', 'Wuhan', 'Xi\'an', 'Hangzhou', 'Dongguan', 'Shenyang', 'Qingdao', 'Harbin'].sort(),
  JP: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu'].sort(),
  IN: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore'].sort(),
  IL: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beer Sheva', 'Bnei Brak', 'Holon'].sort(),
  FI: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori'].sort(),
  IE: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan'].sort(),
}

interface CitySelectProps {
  countryCode: string
  value: string
  onChange: (city: string) => void
  placeholder?: string
}

export function CitySelect({ countryCode, value, onChange, placeholder = 'Oraș' }: CitySelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const cities = useMemo(() => CITIES_BY_COUNTRY[countryCode] ?? [], [countryCode])
  const hasCities = cities.length > 0

  const filtered = useMemo(
    () => query ? cities.filter((c) => c.toLowerCase().includes(query.toLowerCase())) : cities,
    [cities, query],
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(city: string) {
    onChange(city)
    setOpen(false)
    setQuery('')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  if (!hasCities) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery('') }}
        className={[
          'w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors outline-none',
          open
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
          'bg-white dark:bg-gray-800',
        ].join(' ')}
      >
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span role="button" onClick={clear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={['h-4 w-4 text-gray-400 transition-transform', open ? 'rotate-180' : ''].join(' ')}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              type="text"
              placeholder="Caută oraș..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-gray-400 text-center">Niciun oraș găsit</li>
            ) : (
              filtered.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => select(city)}
                    className={[
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      city === value
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    {city}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
