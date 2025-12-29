
import { CropType, CropData, FarmTier, GameState, AnimalType, AnimalData } from './types';

export const XP_PER_LEVEL = 1000;

export const CROPS: Record<CropType, CropData> = {
  [CropType.SPINACH]: {
    type: CropType.SPINACH,
    growthTime: 15,
    cost: 20,
    salePrice: 55,
    icon: 'https://img.icons8.com/color/512/spinach.png',
    unlockLevel: 1
  },
  [CropType.WHEAT]: {
    type: CropType.WHEAT,
    growthTime: 30,
    cost: 50,
    salePrice: 130,
    icon: 'https://img.icons8.com/color/512/wheat.png',
    unlockLevel: 2
  },
  [CropType.PEA]: {
    type: CropType.PEA,
    growthTime: 45,
    cost: 70,
    salePrice: 190,
    icon: 'https://img.icons8.com/color/512/soy.png',
    unlockLevel: 3
  },
  [CropType.CORN]: {
    type: CropType.CORN,
    growthTime: 60,
    cost: 110,
    salePrice: 300,
    icon: 'https://img.icons8.com/color/512/corn.png',
    unlockLevel: 5
  },
  [CropType.GREEN_BEAN]: {
    type: CropType.GREEN_BEAN,
    growthTime: 80,
    cost: 140,
    salePrice: 420,
    icon: '🫘',
    unlockLevel: 7
  },
  [CropType.RICE]: {
    type: CropType.RICE,
    growthTime: 100,
    cost: 180,
    salePrice: 550,
    icon: '🍚',
    unlockLevel: 10
  },
  [CropType.SOY]: {
    type: CropType.SOY,
    growthTime: 120,
    cost: 220,
    salePrice: 700,
    icon: '🌿',
    unlockLevel: 12
  },
  [CropType.TOMATO]: {
    type: CropType.TOMATO,
    growthTime: 180,
    cost: 350,
    salePrice: 1100,
    icon: '🍅',
    unlockLevel: 15
  },
  [CropType.POTATO]: {
    type: CropType.POTATO,
    growthTime: 240,
    cost: 500,
    salePrice: 1650,
    icon: '🥔',
    unlockLevel: 18
  },
  [CropType.SUNFLOWER]: {
    type: CropType.SUNFLOWER,
    growthTime: 300,
    cost: 650,
    salePrice: 2200,
    icon: '🌻',
    unlockLevel: 22
  },
  [CropType.COTTON]: {
    type: CropType.COTTON,
    growthTime: 400,
    cost: 900,
    salePrice: 3200,
    icon: '☁️',
    unlockLevel: 26
  },
  [CropType.GRAPE]: {
    type: CropType.GRAPE,
    growthTime: 500,
    cost: 1200,
    salePrice: 4500,
    icon: '🍇',
    unlockLevel: 30
  },
  [CropType.OLIVE]: {
    type: CropType.OLIVE,
    growthTime: 600,
    cost: 1800,
    salePrice: 7200,
    icon: 'https://img.icons8.com/color/512/olive.png',
    unlockLevel: 35
  }
};

export const ANIMALS: Record<AnimalType, AnimalData> = {
  [AnimalType.CHICKEN]: {
    type: AnimalType.CHICKEN,
    cost: 1500,
    productionTime: 20,
    resourceName: 'Ovo',
    resourcePrice: 85,
    icon: '🐔',
    unlockLevel: 4
  },
  [AnimalType.COW]: {
    type: AnimalType.COW,
    cost: 8500,
    productionTime: 60,
    resourceName: 'Leite',
    resourcePrice: 450,
    icon: '🐄',
    unlockLevel: 8
  },
  [AnimalType.SHEEP]: {
    type: AnimalType.SHEEP,
    cost: 15000,
    productionTime: 120,
    resourceName: 'Lã',
    resourcePrice: 1200,
    icon: '🐑',
    unlockLevel: 14
  },
  [AnimalType.BEEF_CATTLE]: {
    type: AnimalType.BEEF_CATTLE,
    cost: 35000,
    productionTime: 240,
    resourceName: 'Carne',
    resourcePrice: 5200,
    icon: '🐂',
    unlockLevel: 20
  }
};

export const FARM_TIERS: FarmTier[] = [
  {
    id: 'sitio',
    name: 'Sítio Recanto',
    price: 150000,
    plotCount: 8,
    description: 'Pequena propriedade ideal para hortaliças e início de carreira rural.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'fazenda_media',
    name: 'Fazenda Alvorada',
    price: 450000,
    plotCount: 16,
    description: 'Área produtiva com infraestrutura completa para escala média e pecuária.',
    image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'agro_complex',
    name: 'Complexo do Alvorada',
    price: 1200000,
    plotCount: 32,
    description: 'Expansão industrial da rede Alvorada. Capacidade de produção massiva.',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'complexo_ceo',
    name: 'Complexo do CEO',
    price: 5000000,
    plotCount: 64,
    description: 'O ápice absoluto do agronegócio. 64 lotes de terra para dominar o mercado mundial.',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1000&auto=format&fit=crop'
  }
];

export const INITIAL_STATE: GameState = {
  money: 150000,
  level: 1,
  xp: 0,
  plots: [],
  animals: [],
  inventory: {},
  seedInventory: {
    [CropType.SPINACH]: 10
  },
  staffCount: 1,
  machineryCount: 0,
  autoPlantUnlocked: false,
  autoHarvestUnlocked: false,
  bioAcceleratorUnlocked: false,
  temporaryBioAcceleratorUntil: null,
  ownedFarmId: null,
  news: [],
  financialHistory: [],
  evolutionHistory: []
};
