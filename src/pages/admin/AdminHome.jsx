import { useApi } from '../../hooks/useApi';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

function SeccaoBadge() {
  return null; // Single seminary — no section split
}

const MEMBROS_CONFIG = [
  { key: 'total_seminaristas',   label: 'Seminaristas',        icon: '📖', cor: 'blue'   },
  { key: 'total_professores',    label: 'Professores',          icon: '🎓', cor: 'wine'   },
  { key: 'total_funcionarios',   label: 'Funcionários',         icon: '🏢', cor: 'gray'   },
  { key: 'total_direccao',       label: 'Membros da Direcção', icon: '⭐', cor: 'purple' },
  { key: 'total_administradores',label: 'Administradores',      icon: '🛡️', cor: 'red'    },
];

const COR = {
  blue:   { card: 'border-blue-200 bg-blue-50',   num: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700'   },
  wine:   { card: 'border-wine-200 bg-wine-50',   num: 'text-wine-700',   badge: 'bg-wine-100 text-wine-700'   },
  gray:   { card: 'border-gray-200 bg-gray-50',   num: 'text-gray-700',   badge: 'bg-gray-100 text-gray-700'   },
  purple: { card: 'border-purple-200 bg-purple-50',num: 'text-purple-700',badge: 'bg-purple-100 text-purple-700'},
  red:    { card: 'border-red-200 bg-red-50',     num: 'text-red-700',    badge: 'bg-red-100 text-red-700'     },
};

export default function AdminHome() {
  const { isSuperAdmin } = useAuth();
  const { data: stats } = useApi(() => adminAPI.getStats(), []);
  const { data: arrecadacao } = useApi(() => adminAPI.relatorioArrecadacao(), []);
  const { data: devedores } = useApi(() => adminAPI.relatorioDevedores(), []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>

      {/* ── Stats financeiras ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Seminaristas Activos', value: stats?.total_seminaristas ?? '—', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Arrecadado',     value: stats ? formatCurrency(stats.total_pago,    'AOA') : '—', icon: TrendingUp,   color: 'bg-wine-50 text-wine-600' },
          { label: 'Total em Dívida',      value: stats ? formatCurrency(stats.total_devedor, 'AOA') : '—', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Membros do Seminário ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Membros do Seminário</h2>
          <Link to="/admin/seminaristas" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Gerir membros →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {MEMBROS_CONFIG.map(({ key, label, icon, cor }) => {
            const total = stats?.[key] ?? '—';
            const c = COR[cor];
            return (
              <Link key={key} to="/admin/seminaristas"
                className={`card border-2 ${c.card} hover:shadow-md transition-shadow text-center p-4`}>
                <div className="text-3xl mb-2">{icon}</div>
                <p className={`text-3xl font-bold mb-1 ${c.num}`}>{total}</p>
                <p className="text-xs text-gray-600 font-medium leading-tight">{label}</p>
              </Link>
            );
          })}
        </div>

      </div>

      {/* ── Arrecadação + Devedores ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrecadação */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Arrecadação por Mês</h2>
            <Link to="/admin/relatorios" className="text-sm text-primary-600 hover:underline">Ver mais</Link>
          </div>
          {!arrecadacao?.length ? (
            <p className="text-sm text-gray-500 py-4 text-center">Sem dados</p>
          ) : (
            <div className="space-y-2">
              {arrecadacao.slice(0, 6).map(r => (
                <div key={r.mes} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">
                    {new Date(r.mes).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (r.total / (arrecadacao[0]?.total || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-24 text-right">
                    {formatCurrency(r.total, 'AOA')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devedores */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Maiores Devedores</h2>
            <Link to="/admin/relatorios" className="text-sm text-primary-600 hover:underline">Ver todos</Link>
          </div>
          {!devedores?.length ? (
            <p className="text-sm text-gray-500 py-4 text-center">Sem devedores</p>
          ) : (
            <div className="space-y-3">
              {devedores.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link to={`/admin/seminaristas/${d.user?.id}`}
                      className="text-sm text-gray-900 hover:text-primary-600 font-medium truncate">
                      {d.user?.nome}
                    </Link>
                    <SeccaoBadge seccao={d.user?.seccao} />
                  </div>
                  <span className="badge bg-red-100 text-red-700 text-xs shrink-0">
                    {formatCurrency(d.saldo_devedor, d.moeda)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
