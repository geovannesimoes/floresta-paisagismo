export const PLAN_DETAILS = {
  Lírio: {
    price: '399,00',
    checklist: ['Projeto (PDF/Imagem)', 'Sugestão de plantas ideais'],
    description: 'Ideal para pequenas renovações e consultas rápidas.',
    marketing_features: [
      'Análise detalhada das fotos',
      'Design paisagístico conceitual',
      'Sugestão de plantas ideais',
      '1 versão do projeto',
      'Entrega em PDF digital',
      'Prazo: até 7 dias úteis',
    ],
    highlight: false,
    cta: 'Escolher Lírio',
  },
  Ipê: {
    price: '699,00',
    checklist: [
      'Projeto (PDF/Imagem)',
      'Sugestão de plantas ideais',
      'Guia de manutenção básico',
    ],
    description: 'O equilíbrio perfeito para transformar seu espaço.',
    marketing_features: [
      'Tudo do Projeto Lírio',
      'Lista de compras completa',
      '1 rodada de revisão',
      'Guia de manutenção básico',
      'Entrega em alta resolução',
      'Prazo: até 7 dias úteis',
    ],
    highlight: true,
    cta: 'Escolher Ipê',
  },
  Jasmim: {
    price: '999,00',
    checklist: [
      'Projeto (PDF/Imagem)',
      'Sugestão de plantas ideais',
      'Guia de manutenção básico',
      'Guia detalhado de plantio',
    ],
    description: 'Experiência premium e suporte dedicado.',
    marketing_features: [
      'Tudo do Projeto Ipê',
      '2 rodadas de revisão',
      'Suporte via WhatsApp',
      'Guia detalhado de plantio',
      'Prioridade na entrega',
      'Prazo: até 3 dias úteis',
    ],
    highlight: false,
    cta: 'Escolher Jasmim',
  },
} as const

export type PlanName = keyof typeof PLAN_DETAILS

export const DELIVERABLE_CATEGORIES = [
  'Projeto (PDF/Imagem)',
  'Sugestão de plantas ideais',
  'Guia de manutenção básico',
  'Guia detalhado de plantio',
]

export const DELIVERABLE_SECTIONS = {
  Projeto: ['Projeto (PDF/Imagem)'],
  'Sugestão de plantas': ['Sugestão de plantas ideais'],
  'Guia de manutenção básico': ['Guia de manutenção básico'],
  'Guia detalhado de plantio': ['Guia detalhado de plantio'],
}
