export function formatCurrency(value, moeda = 'AOA') {
  if (value == null) return '—';
  const locales = { AOA: 'pt-AO', EUR: 'pt-PT', USD: 'en-US' };
  return new Intl.NumberFormat(locales[moeda] || 'pt-PT', {
    style: 'currency', currency: moeda,
  }).format(value);
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
export const ANOS_FORMACAO = [1, 2];

// Legacy aliases kept for backward compatibility with any existing data
export const SECCAO_LABEL = {};
export const SECCAO_SHORT = {};
export const SECCAO_ANOS = {};
