import { useState, useEffect, useMemo } from 'react'
import { DropdownBase } from '../primitives/DropdownBase'
import { IconButton, XIcon } from '../primitives/IconButton'

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

  const cities = useMemo(() => CITIES_BY_COUNTRY[countryCode] ?? [], [countryCode])
  const hasCities = cities.length > 0
  const filtered = useMemo(
    () => query ? cities.filter((c) => c.toLowerCase().includes(query.toLowerCase())) : cities,
    [cities, query],
  )

  useEffect(() => { if (!hasCities) setOpen(false) }, [hasCities])

  function handleOpenChange(next: boolean) { setOpen(next); if (!next) setQuery('') }
  function select(city: string) { onChange(city); setOpen(false); setQuery('') }
  function clear(e: React.MouseEvent) { e.stopPropagation(); onChange(''); setQuery('') }

  if (!hasCities) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
      />
    )
  }

  return (
    <DropdownBase
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <>
          <span className={['truncate', value ? 'text-fg-primary' : 'text-fg-muted'].join(' ')}>
            {value || placeholder}
          </span>
          {value && (
            <IconButton label="Șterge" onClick={clear} className="ml-auto shrink-0">
              <XIcon />
            </IconButton>
          )}
        </>
      }
    >
      <div className="dropdown-search">
        <input
          autoFocus
          type="text"
          placeholder="Caută oraș..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none"
        />
      </div>
      <ul className="max-h-56 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-sm text-fg-muted text-center">Niciun oraș găsit</li>
        ) : (
          filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                onClick={() => select(city)}
                className={[
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  city === value
                    ? 'bg-brand-subtle text-brand-text font-medium'
                    : 'text-fg-secondary hover:bg-surface-hover',
                ].join(' ')}
              >
                {city}
              </button>
            </li>
          ))
        )}
      </ul>
    </DropdownBase>
  )
}
