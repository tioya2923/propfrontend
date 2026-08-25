import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminAPI } from '../../api';
import { formatCurrency, formatDateTime, PAGAMENTO_METODO_LABEL } from '../../utils/format';

export default function AdminPagamentos() {
  const [page, setPage] = useState(1);
  const { data, loading } = useApi(() => adminAPI.getPagamentos({ page }), [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h1>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Data', 'Seminarista', 'Valor', 'Método', 'Período', 'Referência'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.pagamentos?.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(p.data_pagamento)}</td>
                    <td className="px-4 py-3 font-medium">{p.user?.nome || '—'}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-wine-700">{formatCurrency(p.valor, p.moeda)}</span></td>
                    <td className="px-4 py-3"><span className="badge bg-blue-100 text-blue-700">{PAGAMENTO_METODO_LABEL[p.metodo] || p.metodo}</span></td>
                    <td className="px-4 py-3">{p.periodo_referencia || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.referencia_transacao?.slice(0, 12)}...</td>
                  </tr>
                ))}
                {!data?.pagamentos?.length && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhum pagamento encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data?.total > 30 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Anterior</button>
              <span className="px-4 py-2 text-sm text-gray-600">{page} / {Math.ceil(data.total / 30)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 30 >= data.total} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Seguinte</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
