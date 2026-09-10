import type { MarketItem, Category } from '../../types/marketplace'

export const CATEGORIES: Category[] = [
  { id: 'all',         label: 'All Items',    icon: '📦', count: 2084 },
  { id: 'weapons',     label: 'Weapons',      icon: '⚔️',  count: 842  },
  { id: 'armor',       label: 'Armor',        icon: '🛡️',  count: 614  },
  { id: 'accessories', label: 'Accessories',  icon: '💍',  count: 389  },
  { id: 'potions',     label: 'Potions',      icon: '🧪',  count: 127  },
  { id: 'materials',   label: 'Materials',    icon: '📦',  count: 1204 },
  { id: 'enchants',    label: 'Enchants',     icon: '✨',  count: 96   },
  { id: 'cosmetics',   label: 'Cosmetics',    icon: '🎁',  count: 253  },
]

const v = (id: string, name: string, avatar: string, rating: number, trades: number, verified = true) =>
  ({ id, name, avatar, rating, tradeCount: trades, verified })

export const MOCK_ITEMS: MarketItem[] = [
  { id: '1',  name: 'Void Blade +12',   icon: '🗡️', rarity: 'legendary', category: 'weapons', price: 48000, quantity: 1, isNew: true, vendor: v('v1','DarkForge','⚔️',4.9,1240), stats: [{ key:'ATK Power',value:'+2,840',type:'good'},{key:'Crit Rate',value:'+18%',type:'good'},{key:'Speed',value:'Normal'},{key:'Durability',value:'94/100',type:'warn'},{key:'Enchant',value:'Void Rift III'}] },
  { id: '2',  name: 'Eternity Bow',     icon: '🏹', rarity: 'legendary', category: 'weapons', price: 62500, quantity: 1, vendor: v('v2','ArcaneArrow','🏹',4.7,890), stats: [] },
  { id: '3',  name: 'Storm Staff +8',   icon: '⚡', rarity: 'epic',      category: 'weapons', price: 22400, quantity: 1, isNew: true, vendor: v('v3','StormCraft','⚡',4.5,432,false), stats: [] },
  { id: '4',  name: 'Abyssal Spear',    icon: '🔱', rarity: 'epic',      category: 'weapons', price: 19800, quantity: 2, vendor: v('v4','AbyssForge','🔱',4.6,321), stats: [] },
  { id: '5',  name: 'Twin Daggers',     icon: '🗡️', rarity: 'epic',      category: 'weapons', price: 17200, quantity: 1, vendor: v('v5','ShadowBlade','🗡️',4.4,215,false), stats: [] },
  { id: '6',  name: 'Iron Katana +5',   icon: '⚔️', rarity: 'rare',      category: 'weapons', price: 8600,  quantity: 3, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '7',  name: 'Boreal Chakram',   icon: '🪃', rarity: 'rare',      category: 'weapons', price: 7400,  quantity: 1, isNew: true, vendor: v('v7','FrostForge','🪃',4.3,156,false), stats: [] },
  { id: '8',  name: 'War Hammer +4',    icon: '🔨', rarity: 'rare',      category: 'weapons', price: 6900,  quantity: 2, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '9',  name: 'Shadow Blade',     icon: '🗡️', rarity: 'rare',      category: 'weapons', price: 5800,  quantity: 1, vendor: v('v5','ShadowBlade','🗡️',4.4,215,false), stats: [] },
  { id: '10', name: 'Crossbow Elite',   icon: '🏹', rarity: 'rare',      category: 'weapons', price: 5200,  quantity: 4, vendor: v('v2','ArcaneArrow','🏹',4.7,890), stats: [] },
  { id: '11', name: 'Broad Sword +3',   icon: '⚔️', rarity: 'uncommon',  category: 'weapons', price: 2400,  quantity: 6, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '12', name: 'Battle Axe',       icon: '🪓', rarity: 'uncommon',  category: 'weapons', price: 1800,  quantity: 3, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '13', name: 'Long Dagger',      icon: '🗡️', rarity: 'uncommon',  category: 'weapons', price: 1600,  quantity: 8, vendor: v('v5','ShadowBlade','🗡️',4.4,215,false), stats: [] },
  { id: '14', name: 'Steel Trident',    icon: '🔱', rarity: 'uncommon',  category: 'weapons', price: 1400,  quantity: 2, isNew: true, vendor: v('v4','AbyssForge','🔱',4.6,321), stats: [] },
  { id: '15', name: "Hunter's Bow",     icon: '🏹', rarity: 'uncommon',  category: 'weapons', price: 1200,  quantity: 5, vendor: v('v2','ArcaneArrow','🏹',4.7,890), stats: [] },
  { id: '16', name: 'Iron Sword',       icon: '🗡️', rarity: 'common',    category: 'weapons', price: 480,   quantity: 12, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '17', name: 'Hatchet',          icon: '🪓', rarity: 'common',    category: 'weapons', price: 320,   quantity: 20, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '18', name: 'Short Sword',      icon: '⚔️', rarity: 'common',    category: 'weapons', price: 280,   quantity: 15, vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '19', name: 'Mace',             icon: '🔨', rarity: 'common',    category: 'weapons', price: 240,   quantity: 9,  vendor: v('v6','IronSmith','⚔️',4.2,180), stats: [] },
  { id: '20', name: 'Short Bow',        icon: '🏹', rarity: 'common',    category: 'weapons', price: 200,   quantity: 18, vendor: v('v2','ArcaneArrow','🏹',4.7,890), stats: [] },
]
