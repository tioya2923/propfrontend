import { useState, useEffect } from 'react';
import { publicAPI } from '../../api';
import { useConteudo } from '../../hooks/useConteudo';
import toast from 'react-hot-toast';
import StripeCheckoutModal from '../../components/ui/StripeCheckoutModal';

const DEFAULTS = {
  hero_subtitulo: 'A sua generosidade transforma vidas e forma sacerdotes ao serviço de Angola.',
  apadrinhamento_descricao: 'Ao apadrinhar um seminarista, contribui mensalmente para cobrir os custos da sua formação.',
  apadrinhamento_beneficios: ['Recebe cartas e actualizações do seminarista que apoia', 'Participação na missa de ordenação', 'Oração especial do seminarista por si', 'Contribuição a partir de 50.000 Kz/mês'],
  email_apadrinhamento: 'info@sje.ao',
  email_oracao: 'oracao@sje.ao',
  oracao_texto: 'Envie o seu pedido de oração e os nossos seminaristas orarão por si durante a Missa e a oração comunitária.',
};

const METODOS = [
  { id: 'mcx',   label: 'MCX Express', moeda: 'AOA', hint: 'Angola' },
  { id: 'mbway', label: 'MBWay',       moeda: 'EUR', hint: 'Portugal' },
  { id: 'visa',  label: 'Cartão Visa', moeda: 'EUR', hint: 'Internacional' },
];

const VALORES_AOA = [5000, 10000, 25000, 50000];
const VALORES_EUR = [5, 10, 25, 50];

// Mostra as formas de pagamento reais configuradas pela administração (as
// mesmas usadas nas Propinas — a conta bancária do Seminário é a mesma para
// donativos e propinas), com o código interno para referência na descrição.
function FormasPagamentoReais({ metodos, referencia }) {
  return (
    <>
      {referencia && (
        <div className="bg-gray-100 rounded-xl py-3 px-6 mb-4">
          <p className="text-xs text-gray-500 mb-1">Código de referência (indique na descrição do pagamento):</p>
          <p className="text-xl font-mono font-bold text-primary-700 tracking-widest">{referencia}</p>
        </div>
      )}
      {metodos.length > 0 ? (
        <div className="space-y-3 text-left">
          {metodos.map((m, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
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
          A administração ainda não configurou nenhuma forma de pagamento. Contacte-nos directamente para saber como proceder.
        </p>
      )}
    </>
  );
}

function DonatePage() {
  const { metodos_pagamento: metodos = [] } = useConteudo('propinas', { metodos_pagamento: [] });
  const [metodo, setMetodo] = useState('mcx');
  const [valor, setValor] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeOk, setStripeOk] = useState(false);
  const [sucesso, setSucesso] = useState(null);
  const [checkout, setCheckout] = useState(null); // { clientSecret } — donativo por cartão em curso

  useEffect(() => {
    publicAPI.getDonativosStatus()
      .then(r => setStripeOk(!!r.data.disponivel))
      .catch(() => setStripeOk(false));
  }, []);

  const m = METODOS.find(x => x.id === metodo);
  const valores = m.moeda === 'AOA' ? VALORES_AOA : VALORES_EUR;
  const simbolo = m.moeda === 'AOA' ? 'Kz' : '€';

  function fmt(v) {
    return m.moeda === 'AOA'
      ? v.toLocaleString('pt-AO') + ' Kz'
      : v.toLocaleString('pt-PT') + ' €';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome || !valor) return toast.error('Preencha o nome e o valor');
    if ((metodo === 'mbway' || metodo === 'mcx') && !telefone)
      return toast.error('Introduza o número de telefone');
    setLoading(true);
    try {
      if (metodo === 'mcx') {
        const r = await publicAPI.mcxDonativo({ nome, email, valor: parseFloat(valor), telefone });
        setSucesso({ referencia: r.data.referencia });
      } else if (metodo === 'mbway') {
        const r = await publicAPI.mbwayDonativo({ nome, email, valor: parseFloat(valor), telefone });
        setSucesso(r.data.manual ? { manual: true } : { mbway: true });
      } else {
        const r = await publicAPI.criarDonativo({ nome, email, valor: parseFloat(valor), moeda: 'EUR' });
        setCheckout({ clientSecret: r.data.client_secret });
      }
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao processar');
    } finally { setLoading(false); }
  }

  async function handlePagamentoConfirmado() {
    setCheckout(null);
    setSucesso({ cartao: true, valorPago: fmt(parseFloat(valor) || 0) });
    toast.success('Donativo confirmado. Muito obrigado pela sua generosidade!');
  }

  /* ── Ecrã de sucesso ── */
  if (sucesso?.referencia) return (
    <div id="donativo" className="card max-w-md mx-auto text-center py-8">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Pedido registado!</h3>
      <p className="text-gray-600 mb-4">A nossa equipa foi notificada. Conclua o pagamento por uma das formas abaixo:</p>
      <FormasPagamentoReais metodos={metodos} referencia={sucesso.referencia} />
      <button onClick={() => setSucesso(null)} className="btn-secondary text-sm mt-6">Fazer outro donativo</button>
    </div>
  );

  if (sucesso?.cartao) return (
    <div id="donativo" className="card max-w-md mx-auto text-center py-8">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Obrigado pela sua generosidade!</h3>
      <p className="text-gray-600 mb-6">O seu donativo de <strong>{sucesso.valorPago}</strong> foi processado com sucesso.</p>
      <button onClick={() => setSucesso(null)} className="btn-secondary text-sm">Fazer outro donativo</button>
    </div>
  );

  if (sucesso?.manual) return (
    <div id="donativo" className="card max-w-md mx-auto text-center py-8">
      <h3 className="text-xl font-semibold mb-3 text-gray-900">Pedido recebido!</h3>
      <p className="text-gray-600 mb-4">
        O pagamento automático por MBWay não está disponível de momento. A nossa equipa foi notificada — pode
        concluir o donativo por uma das formas abaixo, indicando o seu nome:
      </p>
      <FormasPagamentoReais metodos={metodos} />
      <button onClick={() => setSucesso(null)} className="btn-secondary text-sm mt-6">Voltar</button>
    </div>
  );

  return (
    <>
    <div id="donativo" className="card max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-5 text-gray-900">Fazer uma Doação</h3>

      {/* Método de pagamento */}
      <div className="flex gap-2 mb-5">
        {METODOS.map(mt => (
          <button key={mt.id} type="button" onClick={() => { setMetodo(mt.id); setValor(''); }}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-xl border text-xs font-semibold transition-colors ${metodo === mt.id ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {mt.label}
            <span className={`text-[10px] font-normal mt-0.5 ${metodo === mt.id ? 'text-primary-200' : 'text-gray-400'}`}>{mt.hint}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Valores rápidos — altura fixa para evitar quebra de linha */}
        <div className="flex gap-2">
          {valores.map(v => (
            <button key={v} type="button" onClick={() => setValor(String(v))}
              className={`flex-1 h-10 rounded-lg text-xs font-medium border transition-colors ${String(v) === valor ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:border-primary-400'}`}>
              {fmt(v)}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Outro valor ({simbolo})</label>
          <input type="number" min="1" step="1" value={valor} onChange={e => setValor(e.target.value)}
            placeholder={m.moeda === 'AOA' ? 'Ex: 15000' : 'Ex: 20'} className="input" />
        </div>

        <div>
          <label className="label">Nome *</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="input" required />
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
        </div>

        {/* Zona condicional com altura fixa — evita que o card mude de tamanho */}
        <div className="h-[72px]">
          {(metodo === 'mcx' || metodo === 'mbway') && (
            <div>
              <label className="label">
                {metodo === 'mcx' ? 'Nº de telefone (Unitel/Movicel) *' : 'Nº de telefone MBWay *'}
              </label>
              <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
                placeholder={metodo === 'mcx' ? '9XX XXX XXX' : '+351 9XX XXX XXX'}
                className="input" required />
            </div>
          )}
          {metodo === 'visa' && !stripeOk && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Pagamento por cartão temporariamente indisponível. Use outro método.
            </p>
          )}
        </div>

        <button type="submit"
          disabled={loading || (metodo === 'visa' && !stripeOk)}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'A processar…' : `Doar ${valor ? fmt(parseFloat(valor) || 0) : ''}`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          {metodo === 'mcx'   && 'Pagamento via MCX Express (Angola)'}
          {metodo === 'mbway' && 'Pagamento via MBWay (Portugal)'}
          {metodo === 'visa'  && 'Pagamento seguro via Stripe'}
        </p>
      </form>
    </div>

    {checkout && (
      <StripeCheckoutModal
        clientSecret={checkout.clientSecret}
        valor={parseFloat(valor) || 0}
        moeda="EUR"
        title="Doar com Cartão"
        submitLabel={`Doar ${fmt(parseFloat(valor) || 0)}`}
        onClose={() => setCheckout(null)}
        onSuccess={handlePagamentoConfirmado}
      />
    )}
    </>
  );
}

export default function Ajudar() {
  const c = useConteudo('ajudar', DEFAULTS);
  const beneficios = Array.isArray(c.apadrinhamento_beneficios) ? c.apadrinhamento_beneficios : DEFAULTS.apadrinhamento_beneficios;

  return (
    <div>
      <section className="bg-dark-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">Generosidade</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Como Ajudar</h1>
          <p className="text-xl text-gray-300 leading-relaxed">{c.hero_subtitulo}</p>
        </div>
      </section>

      <section className="py-28 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { titulo: 'Donativos', desc: 'Apoie a missão formativa com uma contribuição livre, única ou mensal.', href: '#donativo' },
              { titulo: 'Apadrinhamento', desc: 'Apadrinhe um seminarista e acompanhe a sua jornada vocacional de perto.', href: '#apadrinhamento' },
              { titulo: 'Pedido de Oração', desc: 'Os nossos seminaristas rezam por si e pelas suas intenções. Envie o seu pedido.', href: '#oracao' },
            ].map(o => (
              <a key={o.titulo} href={o.href} className="card text-center block hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                <h3 className="font-semibold text-xl mb-3 text-gray-900">{o.titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{o.desc}</p>
              </a>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <DonatePage />
            <div id="apadrinhamento" className="card">
              <h3 className="text-xl font-semibold mb-4">Apadrinhamento de Seminaristas</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{c.apadrinhamento_descricao}</p>
              <ul className="space-y-2 mb-6">
                {beneficios.map(i => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-primary-600 font-bold shrink-0">✓</span>{i}
                  </li>
                ))}
              </ul>
              <a href={`mailto:${c.email_apadrinhamento}?subject=Apadrinhamento`} className="btn-secondary block text-center">
                Tornar-me Padrinho
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="oracao" className="bg-primary-700 text-white py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Pedido de Oração</h2>
          <p className="text-primary-100 mb-8">{c.oracao_texto}</p>
          <a href={`mailto:${c.email_oracao}?subject=Pedido de Oração`} className="bg-white text-primary-700 hover:bg-white font-semibold py-3 px-8 rounded-lg inline-block transition-colors">
            Enviar Pedido de Oração
          </a>
        </div>
      </section>
    </div>
  );
}
