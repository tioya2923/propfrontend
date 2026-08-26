import { useApi } from '../../hooks/useApi';
import { adminAPI } from '../../api';
import { formatCurrency, formatCurrencyBreakdown, agruparArrecadacaoPorMes } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function AdminRelatorios() {
  const { data: arrecadacaoRaw } = useApi(() => adminAPI.relatorioArrecadacao(), []);
  const { data: devedores } = useApi(() => adminAPI.relatorioDevedores(), []);
  const arrecadacao = agruparArrecadacaoPorMes(arrecadacaoRaw);

  // Somado por moeda — AOA, EUR e USD nunca podem ser combinados num único
  // número (ver adminController.getStats/relatorioArrecadacao).
  const totalArrecadadoPorMoeda = (arrecadacaoRaw || []).reduce((acc, r) => {
    acc[r.moeda] = (acc[r.moeda] || 0) + (parseFloat(r.total) || 0);
    return acc;
  }, {});
  const totalDevedorPorMoeda = (devedores || []).reduce((acc, d) => {
    acc[d.moeda] = (acc[d.moeda] || 0) + (parseFloat(d.saldo_devedor) || 0);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total Arrecadado (últimos meses)</p>
          {formatCurrencyBreakdown(totalArrecadadoPorMoeda).length ? (
            formatCurrencyBreakdown(totalArrecadadoPorMoeda).map((v, i) => (
              <p key={i} className={i === 0 ? 'text-3xl font-bold text-wine-700' : 'text-lg font-semibold text-wine-600'}>{v}</p>
            ))
          ) : <p className="text-3xl font-bold text-wine-700">{formatCurrency(0, 'AOA')}</p>}
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total em Dívida</p>
          {formatCurrencyBreakdown(totalDevedorPorMoeda).length ? (
            formatCurrencyBreakdown(totalDevedorPorMoeda).map((v, i) => (
              <p key={i} className={i === 0 ? 'text-3xl font-bold text-red-600' : 'text-lg font-semibold text-red-500'}>{v}</p>
            ))
          ) : <p className="text-3xl font-bold text-red-600">{formatCurrency(0, 'AOA')}</p>}
          <p className="text-xs text-gray-400 mt-1">{devedores?.length || 0} seminaristas com dívida</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrecadação */}
        <div className="card">
          <h2 className="font-semibold mb-4">Arrecadação Mensal</h2>
          {!arrecadacao?.length ? <p className="text-gray-500 text-sm py-6 text-center">Sem dados</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                  <tr><th className="text-left py-2">Mês</th><th className="text-right py-2">Total</th><th className="text-right py-2">N.º Pag.</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {arrecadacao.map(g => (
                    <tr key={g.mes}>
                      <td className="py-2">{new Date(g.mes).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</td>
                      <td className="py-2 text-right font-medium text-wine-700 space-x-2">
                        {g.moedas.map(m => <span key={m.moeda}>{formatCurrency(m.total, m.moeda)}</span>)}
                      </td>
                      <td className="py-2 text-right text-gray-500">{g.num_pagamentos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Devedores */}
        <div className="card">
          <h2 className="font-semibold mb-4">Lista de Devedores</h2>
          {!devedores?.length ? <p className="text-sm text-gray-500 py-6 text-center">Sem devedores</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                  <tr><th className="text-left py-2">Seminarista</th><th className="text-right py-2">Dívida</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {devedores.map(d => (
                    <tr key={d.id}>
                      <td className="py-2">
                        <Link to="/admin/seminaristas" className="hover:text-primary-600 font-medium">{d.user?.nome}</Link>
                        <p className="text-xs text-gray-400">{d.user?.email}</p>
                      </td>
                      <td className="py-2 text-right font-semibold text-red-600">{formatCurrency(d.saldo_devedor, d.moeda)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
