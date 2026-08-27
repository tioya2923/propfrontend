import { useState, useEffect } from 'react';
import { propinaAPI, publicAPI } from '../../api';
import { useApi } from '../../hooks/useApi';
import { useConteudo } from '../../hooks/useConteudo';
import { formatCurrency, formatDate, PAGAMENTO_METODO_LABEL } from '../../utils/format';
import { Download, AlertCircle, CheckCircle2, CreditCard, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import StripeCheckoutModal, { stripePromise } from '../../components/ui/StripeCheckoutModal';

export default function Propinas() {
  const { data: divida, loading, error, reload } = useApi(() => propinaAPI.getMinhaDivida(), []);
  const { metodos_pagamento: metodos = [] } = useConteudo('propinas', { metodos_pagamento: [] });
  const [paying, setPaying] = useState(false);
  const [prorrogacao, setProrrogacao] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [checkout, setCheckout] = useState(null); // { clientSecret, paymentId }
  const [referencia, setReferencia] = useState(null); // referência Multibanco gerada
  const [cartaoConfigurado, setCartaoConfigurado] = useState(false);

  useEffect(() => {
    publicAPI.getDonativosStatus()
      .then(r => setCartaoConfigurado(!!r.data.disponivel))
      .catch(() => setCartaoConfigurado(false));
  }, []);

  const ehAOA = divida?.moeda === 'AOA';
  const cartaoDisponivel = cartaoConfigurado && !!stripePromise;

  async function handlePagar() {
    if (!divida || parseFloat(divida.saldo_devedor) <= 0) return toast('Não tem saldo devedor');
    setPaying(true);
    setReferencia(null);
    try {
      const periodo_referencia = new Date().toISOString().slice(0, 7);
      if (ehAOA) {
        const res = await propinaAPI.pagar({ valor: divida.saldo_devedor, metodo: 'multibanco', periodo_referencia });
        setReferencia(res.data.referencia);
      } else {
        const res = await propinaAPI.pagar({ valor: divida.saldo_devedor, metodo: 'cartao', periodo_referencia });
        setCheckout({ clientSecret: res.data.client_secret, paymentId: res.data.payment_id });
      }
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao iniciar pagamento');
    } finally {
      setPaying(false);
    }
  }

  async function handlePagamentoConfirmado(paymentIntent) {
    try {
      await propinaAPI.confirmar({ payment_id: checkout.paymentId, payment_intent_id: paymentIntent.id });
      toast.success('Pagamento confirmado com sucesso!');
    } catch {
      // O backend confirma sempre junto do Stripe antes de aceitar — se esta chamada
      // falhar por instabilidade de rede, o webhook do Stripe reconcilia o estado depois.
      toast.success('Pagamento efectuado. A confirmar com a administração…');
    }
    setCheckout(null);
    reload();
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
              ['Data Limite', formatDate(divida.data_vencimento)],
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
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {ehAOA ? (
                <button onClick={handlePagar} disabled={paying} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <Landmark size={16} /> {paying ? 'A gerar referência...' : `Gerar Referência de ${formatCurrency(divida.saldo_devedor, divida.moeda)}`}
                </button>
              ) : cartaoDisponivel ? (
                <button onClick={handlePagar} disabled={paying} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <CreditCard size={16} /> {paying ? 'A preparar pagamento...' : `Pagar ${formatCurrency(divida.saldo_devedor, divida.moeda)}`}
                </button>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Pagamento por cartão indisponível de momento. Contacte a administração.
                </p>
              )}
              <button onClick={() => setProrrogacao(true)} className="btn-secondary">Pedir Prorrogação</button>
            </div>
          )}

          {/* Código de referência gerado + formas de pagamento configuradas pela administração */}
          {referencia && (
            <div className="mt-4 bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="text-sm text-primary-800 mb-1">Pedido de pagamento registado. Código de referência:</p>
              <p className="text-2xl font-mono font-bold text-primary-700 tracking-widest">{referencia}</p>
              <p className="text-xs text-gray-500 mt-2 mb-4">
                Efectue o pagamento por uma das formas abaixo e indique este código na descrição/referência da
                operação, para a administração confirmar mais depressa. O saldo é actualizado assim que a
                administração confirmar o pagamento.
              </p>

              {metodos.length > 0 ? (
                <div className="space-y-3">
                  {metodos.map((m, i) => (
                    <div key={i} className="bg-white border border-primary-100 rounded-lg p-3">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{m.nome}</p>
                      <dl className="text-xs text-gray-600 space-y-0.5">
                        {m.titular && <div><dt className="inline font-medium">Titular: </dt><dd className="inline">{m.titular}</dd></div>}
                        {m.banco && <div><dt className="inline font-medium">Banco: </dt><dd className="inline">{m.banco}</dd></div>}
                        {m.iban && <div><dt className="inline font-medium">IBAN: </dt><dd className="inline font-mono">{m.iban}</dd></div>}
                        {m.numero_conta && <div><dt className="inline font-medium">Nº de conta: </dt><dd className="inline">{m.numero_conta}</dd></div>}
                        {m.telefone && <div><dt className="inline font-medium">Telefone: </dt><dd className="inline">{m.telefone}</dd></div>}
                      </dl>
                      {m.instrucoes && <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{m.instrucoes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  A administração ainda não configurou nenhuma forma de pagamento. Contacte-a directamente para saber como proceder.
                </p>
              )}

              <button onClick={() => setReferencia(null)} className="text-xs text-gray-500 hover:underline mt-3">Fechar</button>
            </div>
          )}
        </div>
      )}

      {/* Checkout Stripe Elements */}
      {checkout && (
        <StripeCheckoutModal
          clientSecret={checkout.clientSecret}
          valor={divida.saldo_devedor}
          moeda={divida.moeda}
          onClose={() => setCheckout(null)}
          onSuccess={handlePagamentoConfirmado}
        />
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
                    <td className="py-3 pr-4">{PAGAMENTO_METODO_LABEL[p.metodo] || p.metodo}</td>
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
