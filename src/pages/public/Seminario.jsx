import { useEffect, useState } from 'react';
import { useConteudo } from '../../hooks/useConteudo';
import { publicAPI } from '../../api';

const DEFAULTS = {
  reitor_nome: 'Pe. João Manuel da Silva',
  reitor_cargo: 'Reitor do Seminário Propedêutico São João Evangelista',
  reitor_citacao: '"O Seminário Propedêutico é a porta de entrada para o serviço sacerdotal. Aqui formamos homens que, com coração aberto, respondem ao chamamento de Deus."',
  reitor_descricao: 'O Seminário Propedêutico São João Evangelista acolhe jovens que sentem o chamamento ao sacerdócio, oferecendo-lhes nos primeiros anos do seu percurso os fundamentos humanos, espirituais e intelectuais necessários para prosseguir a formação.',
  disciplinas: [
    'Filosofia Introdutória',
    'Sagrada Escritura',
    'Introdução à Teologia',
    'Latim',
    'Português e Comunicação',
    'História da Igreja',
    'Introdução às Ciências da Religião',
    'Psicologia e Desenvolvimento Humano',
  ],
  stats: [
    { valor: '14', desc: 'Seminaristas' },
    { valor: '3', desc: 'Anos de formação' },
    { valor: '3', desc: 'Membros da Direcção' },
  ],
  historia: [
    { ano: '1954', titulo: 'Fundação', desc: 'O Seminário Propedêutico São João Evangelista é fundado pela Arquidiocese do Huambo.' },
    { ano: '1975', titulo: 'Fidelidade', desc: 'Durante a independência, a comunidade manteve-se firme na sua missão de formação.' },
    { ano: '2002', titulo: 'Reconstrução', desc: 'Com o fim da guerra, o Seminário inicia uma fase de expansão e renovação das suas instalações.' },
    { ano: '2010', titulo: 'Crescimento', desc: 'Abertura de novas instalações e reorganização do seminário com estatutos próprios.' },
    { ano: '2020', titulo: 'Digitalização', desc: 'Lançamento de ferramentas digitais de gestão académica e administrativa.' },
    { ano: 'Hoje', titulo: 'Missão Viva', desc: 'O Seminário continua a formar jovens para o sacerdócio ao serviço de Angola e da Igreja.' },
  ],
};

function inicialNome(nome) {
  return (nome || '').split(' ').filter(p => !['Pe.', 'Irmã', 'Fr.', 'D.'].includes(p))[0]?.charAt(0) ?? '?';
}

export default function Seminario() {
  const c = useConteudo('seminario', DEFAULTS);
  const [equipa, setEquipa] = useState([]);

  useEffect(() => {
    publicAPI.getEquipa().then(r => {
      const lista = Array.isArray(r.data) ? r.data : [];
      setEquipa(lista.sort((a, b) => a.ordem - b.ordem));
    }).catch(() => {});
  }, []);

  function get(chave) {
    const val = c[chave];
    return val !== undefined && val !== null && val !== '' ? val : DEFAULTS[chave];
  }

  const nome = get('reitor_nome');
  const cargo = get('reitor_cargo');
  const citacao = get('reitor_citacao');
  const descricao = get('reitor_descricao');
  const foto = c.reitor_foto;
  const disciplinas = Array.isArray(c.disciplinas) && c.disciplinas.length ? c.disciplinas : DEFAULTS.disciplinas;
  const stats = Array.isArray(c.stats) && c.stats.length ? c.stats : DEFAULTS.stats;
  const historia = Array.isArray(c.historia) && c.historia.length ? c.historia : DEFAULTS.historia;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark-900 text-white py-24">
        {c.hero_imagem && (
          <>
            <img src={c.hero_imagem} alt="" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/55" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">Arquidiocese do Huambo</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Seminário Propedêutico São João Evangelista</h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Uma casa de formação onde jovens respondem ao chamamento de Deus e se preparam para servir a Igreja e o povo de Angola.
          </p>
        </div>
      </section>

      {/* Nota institucional */}
      <section className="py-12 bg-white border-b border-primary-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-800 text-base leading-relaxed">
            O <strong>Seminário Propedêutico São João Evangelista</strong> é uma instituição da <strong>Arquidiocese do Huambo</strong> dedicada à formação inicial de candidatos ao sacerdócio. Durante os três anos propedêuticos, os seminaristas desenvolvem as bases humanas, espirituais e intelectuais necessárias para o seu percurso vocacional.
          </p>
        </div>
      </section>

      {/* Mensagem do Reitor */}
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-primary-500 pl-6 mb-12">
            <span className="inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 bg-primary-100 text-primary-700">Direcção</span>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Mensagem do Reitor</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 items-start mb-16">
            <div className="md:col-span-1 text-center">
              {foto ? (
                <img
                  src={foto}
                  alt={nome}
                  loading="lazy"
                  decoding="async"
                  className="w-28 h-28 rounded-full object-contain bg-gray-100 mx-auto mb-4 border-4 border-primary-100"
                />
              ) : (
                <div className="w-28 h-28 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-700">
                  {inicialNome(nome)}
                </div>
              )}
              <p className="font-semibold text-gray-900">{nome}</p>
              <p className="text-sm text-gray-500">{cargo}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 italic leading-relaxed border-l-4 border-primary-400 pl-4 mb-4 text-base">{citacao}</p>
              <p className="text-gray-600 leading-relaxed">{descricao}</p>
            </div>
          </div>

          {/* Stats + Direcção + Disciplinas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Em números</h4>
              <div className="space-y-4">
                {stats.map((st, i) => (
                  <div key={i} className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary-600">{st.valor}</span>
                    <span className="text-sm text-gray-500">{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Direcção</h4>
              {equipa.length > 0 ? (
                <div className="space-y-3">
                  {equipa.map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {inicialNome(m.nome)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.nome}</p>
                        <p className="text-xs text-gray-500">{m.cargo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">A carregar equipa...</p>
              )}
            </div>
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Disciplinas (3 anos)</h4>
              <ul className="space-y-1.5">
                {disciplinas.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />{d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* História */}
      <section className="bg-dark-900 text-white py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">História do Seminário</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {historia.map((h, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-primary-400 mb-2">{h.ano}</div>
                <h3 className="font-semibold text-white mb-2">{h.titulo}</h3>
                <p className="text-sm text-gray-400">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
