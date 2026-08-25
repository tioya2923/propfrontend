import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { propinaAPI, semináristaAPI } from '../../api';
import { Link } from 'react-router-dom';
import { CreditCard, Clock, BookOpen, Bell, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

export default function DashboardHome() {
  const { user } = useAuth();
  const { data: divida } = useApi(() => propinaAPI.getMinhaDivida(), []);
  const { data: comunicados } = useApi(() => semináristaAPI.getComunicados(), []);

  const temDivida = divida && parseFloat(divida.saldo_devedor) > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.nome?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Seminário Propedêutico São João Evangelista
          {user?.ano_formacao ? ` · ${user.ano_formacao}º Ano` : ''}
        </p>
      </div>

      {/* Alerta propina */}
      {temDivida && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Propina em atraso</p>
            <p className="text-sm text-amber-700">Tem um saldo devedor de <strong>{formatCurrency(divida.saldo_devedor, divida.moeda)}</strong>.</p>
            <Link to="/dashboard/propinas" className="text-sm text-amber-700 underline font-medium mt-1 inline-block">Regularizar agora →</Link>
          </div>
        </div>
      )}

      {/* Cards de acesso rápido */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Propinas', href: '/dashboard/propinas', icon: CreditCard, color: 'bg-blue-50 text-blue-600', sub: divida ? formatCurrency(divida.saldo_devedor, divida.moeda) : '—' },
          { label: 'Horários', href: '/dashboard/horarios', icon: Clock, color: 'bg-purple-50 text-purple-600', sub: `Ano ${user?.ano_formacao || '—'}` },
          { label: 'Materiais', href: '/dashboard/materiais', icon: BookOpen, color: 'bg-wine-50 text-wine-600', sub: 'Documentos' },
          { label: 'Comunicados', href: '/dashboard/comunicados', icon: Bell, color: 'bg-yellow-50 text-yellow-600', sub: `${comunicados?.length || 0} mensagens` },
          { label: 'Fórum', href: '/dashboard/forum', icon: MessageSquare, color: 'bg-pink-50 text-pink-600', sub: 'Comunidade' },
        ].map(({ label, href, icon: Icon, color, sub }) => (
          <Link key={href} to={href} className="card hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Propina resumo */}
      {divida && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Situação de Propina</h2>
            <Link to="/dashboard/propinas" className="text-sm text-primary-600 hover:underline">Ver detalhes</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Propina Mensal', formatCurrency(divida.montante_efectivo, divida.moeda)],
              ['Saldo Devedor', formatCurrency(divida.saldo_devedor, divida.moeda)],
              ['Vencimento', formatDate(divida.data_vencimento)],
              ['Bolsa', divida.bolsa ? `${divida.desconto_percentagem}% desconto` : 'Não'],
            ].map(([l, v]) => (
              <div key={l} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{l}</p>
                <p className="font-semibold text-sm text-gray-900">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimos comunicados */}
      {comunicados?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Comunicados Recentes</h2>
            <Link to="/dashboard/comunicados" className="text-sm text-primary-600 hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {comunicados.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Bell size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.titulo}</p>
                  <p className="text-xs text-gray-500">{formatDate(c.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
