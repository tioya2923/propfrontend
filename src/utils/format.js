export function formatCurrency(value, moeda = 'AOA') {
  if (value == null) return '—';
  const locales = { AOA: 'pt-AO', EUR: 'pt-PT', USD: 'en-US' };
  return new Intl.NumberFormat(locales[moeda] || 'pt-PT', {
    style: 'currency', currency: moeda,
  }).format(value);
}

// Recebe { AOA: 123, EUR: 0, USD: 45 } e devolve só as linhas com valor,
// já formatadas — usado nos totais financeiros do admin para não somar
// moedas diferentes como se fossem a mesma (ver adminController.getStats).
export function formatCurrencyBreakdown(porMoeda) {
  if (!porMoeda) return [];
  return Object.entries(porMoeda)
    .filter(([, v]) => v)
    .map(([moeda, v]) => formatCurrency(v, moeda));
}

// adminAPI.relatorioArrecadacao() devolve uma linha por mês+moeda (ver
// adminController.relatorioArrecadacao). Agrupa por mês para exibição,
// mantendo os totais de cada moeda separados dentro de cada mês.
export function agruparArrecadacaoPorMes(linhas) {
  if (!linhas?.length) return [];
  const porMes = new Map();
  for (const r of linhas) {
    const key = r.mes;
    if (!porMes.has(key)) porMes.set(key, { mes: key, moedas: [], num_pagamentos: 0 });
    const g = porMes.get(key);
    g.moedas.push({ moeda: r.moeda, total: parseFloat(r.total) || 0 });
    g.num_pagamentos += parseInt(r.num_pagamentos, 10) || 0;
  }
  return [...porMes.values()].sort((a, b) => new Date(b.mes) - new Date(a.mes));
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Origem do backend (sem o "/api" final), para montar URLs absolutos a
// partir de caminhos relativos como "/uploads/xxx.png".
export const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

// Ficheiros carregados antes de existir o Cloudinary ficaram guardados como
// caminho relativo ("/uploads/xxx.png") e precisam do backend à frente para
// dar um URL válido. Os carregados depois já vêm do Cloudinary como URL
// absoluto (https://res.cloudinary.com/...) e NÃO podem levar o backend à
// frente outra vez, ou o URL fica duplicado e partido.
export function resolveAssetUrl(url) {
  if (!url) return url;
  return /^https?:\/\//.test(url) ? url : `${BACKEND_ORIGIN}${url}`;
}

export const DIAS_SEMANA = {
  segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira',
  quinta: 'Quinta-feira', sexta: 'Sexta-feira', sabado: 'Sábado',
};

export const PERMISSOES_LABEL = {
  seminarista: 'Seminarista', staff: 'Staff', admin: 'Administrador',
};

export const CARGO_LABEL = {
  seminarista: 'Seminarista',
  professor: 'Professor',
  funcionario: 'Funcionário',
  direccao: 'Membro da Direcção',
  administrador: 'Administrador',
};

// Ordered list for the "Adicionar" modal
export const TIPOS_UTILIZADOR = [
  { cargo: 'administrador', label: 'Administrador',        permissoes: 'admin',      icon: '🛡️' },
  { cargo: 'seminarista',   label: 'Seminarista',          permissoes: 'seminarista', icon: '📖' },
  { cargo: 'professor',     label: 'Professor',            permissoes: 'staff',      icon: '🎓' },
  { cargo: 'funcionario',   label: 'Funcionário',          permissoes: 'staff',      icon: '🏢' },
  { cargo: 'direccao',      label: 'Membro da Direcção',  permissoes: 'admin',      icon: '⭐' },
];

// Anos de formação do curso propedêutico
export const ANOS_FORMACAO = [1, 2, 3];

// Legacy aliases kept for backward compatibility with any existing data
export const SECCAO_LABEL = {};
export const SECCAO_SHORT = {};
export const SECCAO_ANOS = {};

export const NOTICIA_CATEGORIA_LABEL = {
  geral: 'Geral', eventos: 'Eventos', academico: 'Académico',
  formacao: 'Formação', comunidade: 'Comunidade', vocacao: 'Vocação',
};

export const MATERIAL_TIPO_LABEL = {
  documento: 'Documento', livro: 'Livro', apresentacao: 'Apresentação', outro: 'Outro',
  apostila: 'Apostila', exercicio: 'Exercício', leitura: 'Leitura',
};

export const PAGAMENTO_METODO_LABEL = {
  cartao: 'Cartão', multibanco: 'Transferência/Depósito', transferencia: 'Transferência',
};
