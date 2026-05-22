import { useState, useEffect } from 'react';
import { publicAPI } from '../../api';
import { useConteudo } from '../../hooks/useConteudo';

const DEFAULTS_COMUNIDADE = {
  vida_comunitaria: [
    { titulo: 'Oração Comum', desc: 'Começamos cada dia com a Liturgia das Horas e a Santa Missa, o centro da vida do Seminário.' },
    { titulo: 'Estudo e Formação', desc: 'Aulas de Filosofia e Teologia, seminários de investigação e leitura espiritual estruturam o dia académico.' },
    { titulo: 'Convívio Fraterno', desc: 'Refeições partilhadas, actividades desportivas e culturais constroem laços de fraternidade duradouros.' },
    { titulo: 'Serviço Pastoral', desc: 'Aos fins-de-semana, os seminaristas participam na pastoral das paróquias da Arquidiocese do Huambo.' },
  ],
  associacoes: ['Amigos do Seminário', 'Associação Alumni', 'Benefactores da Diocese'],
};

function inicial(nome) {
  return nome.split(' ').filter(p => !['Pe.', 'Irmã', 'Fr.'].includes(p))[0]?.charAt(0) ?? '?';
}

function MembroCard({ membro }) {
  return (
    <div className="card text-center hover:shadow-md transition-shadow">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-700">
        {inicial(membro.nome)}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{membro.nome}</h3>
      <p className="text-sm text-primary-600 font-medium mb-2">{membro.cargo}</p>
      {membro.area && <span className="badge bg-gray-100 text-gray-600">{membro.area}</span>}
    </div>
  );
}

export default function Comunidade() {
  const c = useConteudo('comunidade', DEFAULTS_COMUNIDADE);
  const [membros, setMembros] = useState([]);

  useEffect(() => {
    publicAPI.getEquipa()
      .then(r => setMembros(r.data))
      .catch(() => {});
  }, []);

  const vidaComunitaria = Array.isArray(c.vida_comunitaria) ? c.vida_comunitaria : DEFAULTS_COMUNIDADE.vida_comunitaria;
  const associacoes = Array.isArray(c.associacoes) ? c.associacoes : DEFAULTS_COMUNIDADE.associacoes;
  const equipaOrdenada = [...membros].sort((a, b) => a.ordem - b.ordem);

  return (
    <div>
      <section className="relative overflow-hidden bg-dark-900 text-white py-24">
        {c.hero_imagem && (
          <>
            <img src={c.hero_imagem} alt="" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/55" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">A nossa Família</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Comunidade</h1>
          <p className="text-xl text-gray-300 leading-relaxed">Uma comunidade formadora, unida na oração, no estudo e na fraternidade.</p>
        </div>
      </section>

      {/* Equipa Formadora */}
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Equipa Formadora</h2>
          <p className="text-center text-gray-500 text-sm mb-14">Seminaristas e formadores do Seminário Propedêutico São João Evangelista</p>

          {equipaOrdenada.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipaOrdenada.map(m => <MembroCard key={m.id} membro={m} />)}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">A carregar equipa...</p>
          )}
        </div>
      </section>

      {/* Vida comunitária */}
      <section className="bg-white py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">Vida Comunitária</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {vidaComunitaria.map((v, i) => (
              <div key={i} className="card">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{v.titulo}</h3>
                <p className="text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Associações */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-6">Associações de Apoio</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Várias associações de leigos e entidades parceiras apoiam a missão do Seminário, contribuindo com recursos humanos, materiais e financeiros.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {associacoes.map((a, i) => (
              <div key={i} className="card border-2 border-primary-100">
                <p className="font-semibold text-primary-700">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
