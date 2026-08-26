import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime, PAGAMENTO_METODO_LABEL } from '../../utils/format';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPagamentos() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('pendentes'); // 'pendentes' | 'confirmados'
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const { data: confirmados, loading: loadingConfirmados } = useApi(() => adminAPI.getPagamentos({ page }), [page, tab]);
  const { data: pendentes, loading: loadingPendentes, reload: reloadPendentes } = useApi(() => adminAPI.listPagamentosPendentes(), []);

  async function handleConfirmar(id) {
    setBusyId(id);
    try {
      await adminAPI.confirmarPagamentoAdmin(id);
      toast.success('Pagamento confirmado — saldo devedor actualizado');
      reloadPendentes();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao confirmar pagamento');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejeitar(id) {
    if (!confirm('Rejeitar e eliminar este pedido de pagamento? Esta acção não pode ser desfeita.')) return;
    setBusyId(id);
    try {
      await adminAPI.rejeitarPagamentoAdmin(id);
      toast.success('Pagamento rejeitado');
      reloadPendentes();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao rejeitar pagamento');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        {!!pendentes?.length && (
          <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1">
            <Clock size={13} /> {pendentes.length} por confirmar
          </span>
        )}
      </div>

      <div className="flex gap-1 mb-6">
        {[['pendentes', 'Por Confirmar'], ['confirmados', 'Confirmados']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${tab === k ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {label}{k === 'pendentes' && pendentes?.length ? ` (${pendentes.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'pendentes' ? (
        loadingPendentes ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <p className="text-xs text-gray-500 bg-amber-50 border-b border-amber-100 px-4 py-2">
              Pagamentos por Multibanco ou transferência ficam aqui até confirmar no extracto bancário que o dinheiro foi mesmo recebido — os pagamentos por cartão confirmam-se automaticamente e não aparecem nesta lista.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Pedido em', 'Seminarista', 'Valor', 'Método', 'Período', 'Referência', ...(isAdmin ? ['Acções'] : [])].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendentes?.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDateTime(p.createdAt)}</td>
                      <td className="px-4 py-3 font-medium">{p.user?.nome || '—'}</td>
                      <td className="px-4 py-3"><span className="font-semibold text-wine-700">{formatCurrency(p.valor, p.moeda)}</span></td>
                      <td className="px-4 py-3"><span className="badge bg-blue-100 text-blue-700">{PAGAMENTO_METODO_LABEL[p.metodo] || p.metodo}</span></td>
                      <td className="px-4 py-3">{p.periodo_referencia || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.referencia_transacao || '—'}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleConfirmar(p.id)} disabled={busyId === p.id}
                              className="flex items-center gap-1 text-xs font-medium text-wine-700 hover:text-wine-800 disabled:opacity-50">
                              <CheckCircle2 size={14} /> Confirmar
                            </button>
                            <button onClick={() => handleRejeitar(p.id)} disabled={busyId === p.id}
                              className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
                              <XCircle size={14} /> Rejeitar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {!pendentes?.length && (
                    <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-gray-500">Nenhum pagamento por confirmar</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        loadingConfirmados ? (
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
                  {confirmados?.pagamentos?.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDateTime(p.data_pagamento)}</td>
                      <td className="px-4 py-3 font-medium">{p.user?.nome || '—'}</td>
                      <td className="px-4 py-3"><span className="font-semibold text-wine-700">{formatCurrency(p.valor, p.moeda)}</span></td>
                      <td className="px-4 py-3"><span className="badge bg-blue-100 text-blue-700">{PAGAMENTO_METODO_LABEL[p.metodo] || p.metodo}</span></td>
                      <td className="px-4 py-3">{p.periodo_referencia || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.referencia_transacao?.slice(0, 12)}...</td>
                    </tr>
                  ))}
                  {!confirmados?.pagamentos?.length && (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhum pagamento encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {confirmados?.total > 30 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Anterior</button>
                <span className="px-4 py-2 text-sm text-gray-600">{page} / {Math.ceil(confirmados.total / 30)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 30 >= confirmados.total} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Seguinte</button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
