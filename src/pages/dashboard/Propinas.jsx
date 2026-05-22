import { useState } from 'react';
import { propinaAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/format';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Propinas() {
  const { data: divida, loading, error } = useApi(() => propinaAPI.getMinhaDivida(), []);
  const [paying, setPaying] = useState(false);
  const [prorrogacao, setProrrogacao] = useState(false);
  const [motivo, setMotivo] = useState('');

  async function handlePagar() {
    if (!divida || parseFloat(divida.saldo_devedor) <= 0) return toast('Não tem saldo devedor');
    setPaying(true);
    try {
      const res = await propinaAPI.pagar({ valor: divida.saldo_devedor, metodo: 'cartao', periodo_referencia: new Date().toISOString().slice(0, 7) });
      if (res.data.client_secret) {
        toast.success('Pagamento iniciado. Integre o Stripe Elements com o client_secret.');
      } else {
        toast.success(`Referência: ${res.data.referencia}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao iniciar pagamento');
    } finally {
      setPaying(false);
    }
  }

  async function handleDownload(id) {
    try {
      const res = await propinaAPI.downloadRecibo(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `recibo-${id.slice(0, 8)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao descarregar recibo');
    }
  }

  async function submitProrrogacao(e) {
    e.preventDefault();
    try {
      await propinaAPI.pedirProrrogacao({ motivo });
      toast.success('Pedido enviado à administração');
      setProrrogacao(false);
      setMotivo('');
    } catch {
      toast.error('Erro ao enviar pedido');
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="card text-center py-10 text-gray-500"><AlertCircle size={32} className="mx-auto mb-3 text-amber-500" /><p>{error}</p></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Propinas</h1>

      {/* Status */}
      {divida && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            {parseFloat(divida.saldo_devedor) > 0
              ? <><AlertCircle size={22} className="text-amber-500" /><span className="font-semibold text-amber-700">Existe saldo devedor</span></>
              : <><CheckCircle2 size={22} className="text-wine-500" /><span className="font-semibold text-wine-700">Situação regularizada</span></>
            }
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              ['Propina Mensal', formatCurrency(divida.montante_mensal, divida.moeda)],
              ['Após Desconto', formatCurrency(divida.montante_efectivo, divida.moeda)],
              ['Saldo Devedor', formatCurrency(divida.saldo_devedor, divida.moeda)],
              ['Vencimento', formatDate(divida.data_vencimento)],
              ['Bolsa', divida.bolsa ? 'Sim' : 'Não'],
              ['Desconto', `${divida.desconto_percentagem}%`],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{l}</p>
                <p className="font-semibold text-gray-900 text-sm">{v}</p>
              </div>
            ))}
          </div>

          {parseFloat(divida.saldo_devedor) > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handlePagar} disabled={paying} className="btn-primary">
                {paying ? 'A processar...' : `Pagar ${formatCurrency(divida.saldo_devedor, divida.moeda)}`}
              </button>
              <button onClick={() => setProrrogacao(true)} className="btn-secondary">Pedir Prorrogação</button>
            </div>
          )}
        </div>
      )}

      {/* Prorrogação modal */}
      {prorrogacao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-semibold text-lg mb-4">Pedir Prorrogação</h2>
            <form onSubmit={submitProrrogacao} className="space-y-4">
              <div><label className="label">Motivo *</label>
                <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={4} className="input" required placeholder="Descreva o motivo do pedido..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Enviar Pedido</button>
                <button type="button" onClick={() => setProrrogacao(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h2>
        {!divida?.pagamentos?.length ? (
          <p className="text-gray-500 text-sm text-center py-6">Nenhum pagamento registado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase">
                <tr className="border-b border-gray-100">
                  {['Data', 'Valor', 'Método', 'Período', 'Recibo'].map(h => <th key={h} className="text-left pb-2 font-medium pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {divida.pagamentos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">{formatDate(p.data_pagamento)}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(p.valor, p.moeda)}</td>
                    <td className="py-3 pr-4 capitalize">{p.metodo}</td>
                    <td className="py-3 pr-4">{p.periodo_referencia || '—'}</td>
                    <td className="py-3">
                      <button onClick={() => handleDownload(p.id)} className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
