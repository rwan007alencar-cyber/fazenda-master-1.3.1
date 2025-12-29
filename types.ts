
export enum CropType {
  WHEAT = 'Trigo',
  CORN = 'Milho',
  SOY = 'Soja',
  SUNFLOWER = 'Girassol',
  TOMATO = 'Tomate',
  RICE = 'Arroz',
  SPINACH = 'Espinafre',
  PEA = 'Ervilha',
  GREEN_BEAN = 'Feijão-vagem',
  POTATO = 'Batata',
  GRAPE = 'Uva',
  OLIVE = 'Azeitona',
  COTTON = 'Algodão'
}

export enum AnimalType {
  CHICKEN = 'Galinha',
  COW = 'Vaca',
  SHEEP = 'Ovelha',
  BEEF_CATTLE = 'Gado de Corte'
}

export interface AnimalData {
  type: AnimalType;
  cost: number;
  productionTime: number; // em segundos
  resourceName: string;
  resourcePrice: number;
  icon: string;
  unlockLevel: number;
}

export interface AnimalState {
  id: string;
  type: AnimalType;
  lastProducedAt: number;
  isReady: boolean;
}

export interface CropData {
  type: CropType;
  growthTime: number;
  cost: number;
  salePrice: number;
  icon: string;
  unlockLevel: number;
}

export interface FarmPlot {
  id: number;
  crop?: CropType;
  plantedAt?: number;
  isHarvestable: boolean;
}

export interface FarmTier {
  id: string;
  name: string;
  price: number;
  plotCount: number;
  description: string;
  image: string;
}

export interface NewsItem {
  id: string;
  type: 'harvest' | 'unlock' | 'market' | 'levelUp' | 'animal';
  title: string;
  message: string;
  timestamp: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  timestamp: number;
  category: string;
}

export interface ProgressSnapshot {
  timestamp: number;
  money: number;
  grossValue: number;
  xpTotal: number;
  level: number;
}

export interface GameState {
  money: number;
  level: number;
  xp: number;
  plots: FarmPlot[];
  animals: AnimalState[];
  inventory: Record<string, number>;
  seedInventory: Record<string, number>;
  staffCount: number;
  machineryCount: number;
  autoPlantUnlocked: boolean; 
  autoHarvestUnlocked: boolean;
  autoAnimalCollectUnlocked?: boolean;
  bioAcceleratorUnlocked: boolean;
  temporaryBioAcceleratorUntil: number | null;
  ownedFarmId: string | null;
  news: NewsItem[];
  financialHistory: Transaction[];
  evolutionHistory: ProgressSnapshot[];
  marketTrend?: {
    resourceName: string;
    multiplier: number;
    endsAt: number;
  };
}
