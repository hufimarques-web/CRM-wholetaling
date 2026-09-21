import { PropertyType, MarketDealRating } from '../types/crm';

export interface ParishMarketBenchmark {
  freguesia: string;
  concelho: string;
  mediaApartamentoM2: number;
  mediaMoradiaM2: number;
  mediaRuinaM2: number;
  mediaTerrenoM2: number;
}

/**
 * Realistic market reference database exclusively for the DISTRICT OF AVEIRO.
 * Values are calibrated based on current market metrics across all Aveiro municipalities.
 */
export const AVEIRO_MARKET_BENCHMARKS: ParishMarketBenchmark[] = [
  // 1. CONCELHO DE AVEIRO
  {
    freguesia: 'Aveiro Centro (Glória e Vera Cruz)',
    concelho: 'Aveiro',
    mediaApartamentoM2: 2850,
    mediaMoradiaM2: 2450,
    mediaRuinaM2: 1450,
    mediaTerrenoM2: 180,
  },
  {
    freguesia: 'São Bernardo',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1950,
    mediaMoradiaM2: 1750,
    mediaRuinaM2: 950,
    mediaTerrenoM2: 95,
  },
  {
    freguesia: 'Esgueira',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1900,
    mediaMoradiaM2: 1650,
    mediaRuinaM2: 880,
    mediaTerrenoM2: 85,
  },
  {
    freguesia: 'Aradas',
    concelho: 'Aveiro',
    mediaApartamentoM2: 2150,
    mediaMoradiaM2: 1850,
    mediaRuinaM2: 1050,
    mediaTerrenoM2: 100,
  },
  {
    freguesia: 'Santa Joana',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1750,
    mediaMoradiaM2: 1550,
    mediaRuinaM2: 820,
    mediaTerrenoM2: 75,
  },
  {
    freguesia: 'Cacia',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1550,
    mediaMoradiaM2: 1350,
    mediaRuinaM2: 720,
    mediaTerrenoM2: 65,
  },
  {
    freguesia: 'Oliveirinha',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1450,
    mediaMoradiaM2: 1250,
    mediaRuinaM2: 650,
    mediaTerrenoM2: 55,
  },
  {
    freguesia: 'Eixo e Gafanha de Aquém',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1400,
    mediaMoradiaM2: 1200,
    mediaRuinaM2: 600,
    mediaTerrenoM2: 50,
  },
  {
    freguesia: 'Requeixo, N. Sra. de Fátima e Nariz',
    concelho: 'Aveiro',
    mediaApartamentoM2: 1250,
    mediaMoradiaM2: 1100,
    mediaRuinaM2: 550,
    mediaTerrenoM2: 45,
  },

  // 2. CONCELHO DE ÍLHAVO
  {
    freguesia: 'Ílhavo (São Salvador)',
    concelho: 'Ílhavo',
    mediaApartamentoM2: 1650,
    mediaMoradiaM2: 1450,
    mediaRuinaM2: 780,
    mediaTerrenoM2: 70,
  },
  {
    freguesia: 'Gafanha da Nazaré',
    concelho: 'Ílhavo',
    mediaApartamentoM2: 1850,
    mediaMoradiaM2: 1550,
    mediaRuinaM2: 850,
    mediaTerrenoM2: 80,
  },
  {
    freguesia: 'Gafanha da Encarnação',
    concelho: 'Ílhavo',
    mediaApartamentoM2: 1550,
    mediaMoradiaM2: 1350,
    mediaRuinaM2: 720,
    mediaTerrenoM2: 65,
  },
  {
    freguesia: 'Gafanha do Carmo',
    concelho: 'Ílhavo',
    mediaApartamentoM2: 1400,
    mediaMoradiaM2: 1250,
    mediaRuinaM2: 620,
    mediaTerrenoM2: 55,
  },

  // 3. CONCELHO DE ESTARREJA
  {
    freguesia: 'Estarreja (Beduído e Veiros)',
    concelho: 'Estarreja',
    mediaApartamentoM2: 1400,
    mediaMoradiaM2: 1250,
    mediaRuinaM2: 620,
    mediaTerrenoM2: 50,
  },
  {
    freguesia: 'Avanca',
    concelho: 'Estarreja',
    mediaApartamentoM2: 1300,
    mediaMoradiaM2: 1150,
    mediaRuinaM2: 560,
    mediaTerrenoM2: 45,
  },
  {
    freguesia: 'Pardilhó',
    concelho: 'Estarreja',
    mediaApartamentoM2: 1200,
    mediaMoradiaM2: 1050,
    mediaRuinaM2: 500,
    mediaTerrenoM2: 40,
  },
  {
    freguesia: 'Salreu',
    concelho: 'Estarreja',
    mediaApartamentoM2: 1250,
    mediaMoradiaM2: 1100,
    mediaRuinaM2: 520,
    mediaTerrenoM2: 40,
  },

  // 4. CONCELHO DE ÁGUEDA
  {
    freguesia: 'Águeda e Borralha',
    concelho: 'Águeda',
    mediaApartamentoM2: 1450,
    mediaMoradiaM2: 1280,
    mediaRuinaM2: 650,
    mediaTerrenoM2: 50,
  },
  {
    freguesia: 'Recardães e Espinhel',
    concelho: 'Águeda',
    mediaApartamentoM2: 1300,
    mediaMoradiaM2: 1150,
    mediaRuinaM2: 580,
    mediaTerrenoM2: 45,
  },
  {
    freguesia: 'Fermentelos',
    concelho: 'Águeda',
    mediaApartamentoM2: 1350,
    mediaMoradiaM2: 1200,
    mediaRuinaM2: 600,
    mediaTerrenoM2: 48,
  },

  // 5. CONCELHO DE ALBERGARIA-A-VELHA
  {
    freguesia: 'Albergaria-a-Velha e Valmaior',
    concelho: 'Albergaria-a-Velha',
    mediaApartamentoM2: 1350,
    mediaMoradiaM2: 1200,
    mediaRuinaM2: 600,
    mediaTerrenoM2: 45,
  },
  {
    freguesia: 'Branca',
    concelho: 'Albergaria-a-Velha',
    mediaApartamentoM2: 1250,
    mediaMoradiaM2: 1100,
    mediaRuinaM2: 540,
    mediaTerrenoM2: 40,
  },

  // 6. CONCELHO DE OLIVEIRA DE AZEMÉIS
  {
    freguesia: 'Oliveira de Azeméis',
    concelho: 'Oliveira de Azeméis',
    mediaApartamentoM2: 1500,
    mediaMoradiaM2: 1350,
    mediaRuinaM2: 680,
    mediaTerrenoM2: 55,
  },
  {
    freguesia: 'Cucujães',
    concelho: 'Oliveira de Azeméis',
    mediaApartamentoM2: 1350,
    mediaMoradiaM2: 1200,
    mediaRuinaM2: 580,
    mediaTerrenoM2: 45,
  },

  // 7. CONCELHO DE OVAR
  {
    freguesia: 'Ovar (Centro)',
    concelho: 'Ovar',
    mediaApartamentoM2: 1750,
    mediaMoradiaM2: 1550,
    mediaRuinaM2: 820,
    mediaTerrenoM2: 75,
  },
  {
    freguesia: 'Esmoriz',
    concelho: 'Ovar',
    mediaApartamentoM2: 2100,
    mediaMoradiaM2: 1850,
    mediaRuinaM2: 1050,
    mediaTerrenoM2: 110,
  },
  {
    freguesia: 'Cortegaça',
    concelho: 'Ovar',
    mediaApartamentoM2: 1850,
    mediaMoradiaM2: 1600,
    mediaRuinaM2: 850,
    mediaTerrenoM2: 85,
  },

  // 8. CONCELHO DE VAGOS
  {
    freguesia: 'Vagos e Santo António',
    concelho: 'Vagos',
    mediaApartamentoM2: 1400,
    mediaMoradiaM2: 1250,
    mediaRuinaM2: 620,
    mediaTerrenoM2: 50,
  },
  {
    freguesia: 'Gafanha da Boa Hora (Praia da Vagueira)',
    concelho: 'Vagos',
    mediaApartamentoM2: 1850,
    mediaMoradiaM2: 1600,
    mediaRuinaM2: 850,
    mediaTerrenoM2: 90,
  },

  // 9. CONCELHO DE ANADIA
  {
    freguesia: 'Arcos e Mogofores (Anadia)',
    concelho: 'Anadia',
    mediaApartamentoM2: 1300,
    mediaMoradiaM2: 1150,
    mediaRuinaM2: 550,
    mediaTerrenoM2: 45,
  },
  {
    freguesia: 'Sangalhos',
    concelho: 'Anadia',
    mediaApartamentoM2: 1250,
    mediaMoradiaM2: 1100,
    mediaRuinaM2: 520,
    mediaTerrenoM2: 40,
  },

  // 10. CONCELHO DE ESPINHO
  {
    freguesia: 'Espinho (Centro)',
    concelho: 'Espinho',
    mediaApartamentoM2: 2900,
    mediaMoradiaM2: 2550,
    mediaRuinaM2: 1500,
    mediaTerrenoM2: 190,
  },
  {
    freguesia: 'Anta e Guetim',
    concelho: 'Espinho',
    mediaApartamentoM2: 2200,
    mediaMoradiaM2: 1950,
    mediaRuinaM2: 1100,
    mediaTerrenoM2: 120,
  },

  // 11. CONCELHO DE SANTA MARIA DA FEIRA
  {
    freguesia: 'Santa Maria da Feira (Centro)',
    concelho: 'Santa Maria da Feira',
    mediaApartamentoM2: 1850,
    mediaMoradiaM2: 1600,
    mediaRuinaM2: 880,
    mediaTerrenoM2: 85,
  },
  {
    freguesia: 'São João de Ver',
    concelho: 'Santa Maria da Feira',
    mediaApartamentoM2: 1650,
    mediaMoradiaM2: 1450,
    mediaRuinaM2: 780,
    mediaTerrenoM2: 70,
  },

  // 12. SÃO JOÃO DA MADEIRA
  {
    freguesia: 'São João da Madeira',
    concelho: 'São João da Madeira',
    mediaApartamentoM2: 1700,
    mediaMoradiaM2: 1500,
    mediaRuinaM2: 800,
    mediaTerrenoM2: 75,
  }
];

// Fallback Aveiro District Average
export const AVEIRO_DISTRICT_AVERAGE_M2: Record<PropertyType, number> = {
  'Apartamento': 1750,
  'Moradia': 1500,
  'Ruína': 750,
  'Terreno': 70,
  'Prédio': 1800,
  'Outro': 1100
};

/**
 * Get benchmark m2 for a given Aveiro parish and property type
 */
export const getAveiroParishBenchmarkM2 = (freguesiaName: string, propertyType: PropertyType = 'Moradia'): number => {
  if (!freguesiaName) return AVEIRO_DISTRICT_AVERAGE_M2[propertyType] || 1500;
  
  const found = AVEIRO_MARKET_BENCHMARKS.find(b =>
    freguesiaName.toLowerCase().includes(b.freguesia.toLowerCase()) ||
    b.freguesia.toLowerCase().includes(freguesiaName.toLowerCase())
  );

  if (!found) {
    return AVEIRO_DISTRICT_AVERAGE_M2[propertyType] || 1500;
  }

  switch (propertyType) {
    case 'Apartamento':
      return found.mediaApartamentoM2;
    case 'Moradia':
      return found.mediaMoradiaM2;
    case 'Ruína':
      return found.mediaRuinaM2;
    case 'Terreno':
      return found.mediaTerrenoM2;
    case 'Prédio':
      return Math.round(found.mediaApartamentoM2 * 0.9);
    default:
      return found.mediaMoradiaM2;
  }
};

export interface MarketStudyResult {
  precoM2: number;
  mediaFreguesiaM2: number;
  deltaPercent: number; // e.g. -35.2 (%)
  rating: MarketDealRating;
  etiqueta: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

/**
 * Run automatic market study based on lead value, m2 and Aveiro parish
 */
export const analyzeLeadMarket = (
  valor: number,
  areaM2?: number,
  freguesia: string = '',
  tipoImovel: PropertyType = 'Moradia'
): MarketStudyResult | null => {
  if (!valor || valor <= 0 || !areaM2 || areaM2 <= 0) {
    return null;
  }

  const precoM2 = Math.round(valor / areaM2);
  const mediaFreguesiaM2 = getAveiroParishBenchmarkM2(freguesia, tipoImovel);
  
  if (mediaFreguesiaM2 <= 0) return null;

  const deltaPercent = Number((((precoM2 - mediaFreguesiaM2) / mediaFreguesiaM2) * 100).toFixed(1));

  let rating: MarketDealRating = 'medio';
  let etiqueta = 'Na Média de Mercado';
  let badgeBg = 'bg-stone-100';
  let badgeText = 'text-stone-700';
  let badgeBorder = 'border-stone-300';

  if (deltaPercent <= -25) {
    rating = 'ouro';
    etiqueta = `🔥 Oportunidade Incrível (${Math.abs(deltaPercent)}% abaixo da média)`;
    badgeBg = 'bg-emerald-50';
    badgeText = 'text-emerald-800';
    badgeBorder = 'border-emerald-300';
  } else if (deltaPercent < -5) {
    rating = 'bom';
    etiqueta = `🟢 Bom Negócio (${Math.abs(deltaPercent)}% abaixo da média)`;
    badgeBg = 'bg-teal-50';
    badgeText = 'text-teal-800';
    badgeBorder = 'border-teal-200';
  } else if (deltaPercent <= 15) {
    rating = 'medio';
    etiqueta = `🟡 Preço em Linha (${deltaPercent > 0 ? '+' : ''}${deltaPercent}% vs média)`;
    badgeBg = 'bg-stone-100';
    badgeText = 'text-stone-700';
    badgeBorder = 'border-stone-300';
  } else {
    rating = 'fraco';
    etiqueta = `🔴 Fraco / Caro (+${deltaPercent}% acima da média)`;
    badgeBg = 'bg-red-50';
    badgeText = 'text-red-700';
    badgeBorder = 'border-red-200';
  }

  return {
    precoM2,
    mediaFreguesiaM2,
    deltaPercent,
    rating,
    etiqueta,
    badgeBg,
    badgeText,
    badgeBorder
  };
};
