import { useApi } from '../../hooks/useApi';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatCurrencyBreakdown, agruparArrecadacaoPorMes } from '../../utils/format';
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
  const { data: arrecadacaoRaw } = useApi(() => adminAPI.relatorioArrecadacao(), []);
  const { data: devedores } = useApi(() => adminAPI.relatorioDevedores(), []);
  const arrecadacao = agruparArrecadacaoPorMes(arrecadacaoRaw);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>

      {/* ── Stats financeiras ─────────────────────────────────────────────── */}
      {/* Cada moeda é somada à parte — AOA, EUR e USD não podem ser
          combinadas num único total (ver adminController.getStats). */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Seminaristas Activos', values: [stats?.total_seminaristas ?? '—'], icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Arrecadado',     values: stats ? (formatCurrencyBreakdown(stats.total_pago_moeda).length ? formatCurrencyBreakdown(stats.total_pago_moeda) : [formatCurrency(0, 'AOA')]) : ['—'], icon: TrendingUp,   color: 'bg-wine-50 text-wine-600' },
          { label: 'Total em Dívida',      values: stats ? (formatCurrencyBreakdown(stats.total_devedor_moeda).length ? formatCurrencyBreakdown(stats.total_devedor_moeda) : [formatCurrency(0, 'AOA')]) : ['—'], icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, values, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={24} />
            </div>
            <div>
              {values.map((v, i) => (
                <p key={i} className={i === 0 ? 'text-2xl font-bold text-gray-900' : 'text-sm font-semibold text-gray-500'}>{v}</p>
              ))}
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
              {arrecadacao.slice(0, 6).map(g => (
                <div key={g.mes} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 shrink-0">
                    {new Date(g.mes).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-medium text-gray-700 text-right space-x-2">
                    {g.moedas.map(m => <span key={m.moeda}>{formatCurrency(m.total, m.moeda)}</span>)}
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
                    <Link to="/admin/seminaristas"
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
