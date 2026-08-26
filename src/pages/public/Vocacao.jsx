import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useConteudo } from '../../hooks/useConteudo';

const DEFAULT_TESTEMUNHOS = [
  { nome: 'Pe. Carlos Neto', ano: 'Ordenado em 2018', texto: '"Entrei no seminário com muitas dúvidas, mas a comunidade e a oração ajudaram-me a perceber que era mesmo este o meu caminho."' },
  { nome: 'Pe. Manuel Silva', ano: 'Ordenado em 2020', texto: '"Os sete anos de formação moldaram-me como homem e como sacerdote. Aprendi a escutar Deus no silêncio e nos outros."' },
  { nome: 'Pe. João Paulo Dias', ano: 'Ordenado em 2022', texto: '"O Seminário de São João Evangelista é uma escola de humanidade. Formação não é apenas estudo — é transformação interior."' },
];

const DEFAULT_FAQS = [
  { q: 'Como sei se tenho vocação sacerdotal?', a: 'A vocação manifesta-se através de um desejo persistente de servir a Deus e à Igreja, amor pela Eucaristia e pelos sacramentos, e o desejo de acompanhar espiritualmente as pessoas. Fala com o teu pároco ou um sacerdote de confiança.' },
  { q: 'Que requisitos são necessários para entrar no Seminário?', a: 'É necessário ser do sexo masculino, católico praticante, ter concluído o ensino secundário, ter boa saúde física e psicológica, e apresentar carta de recomendação do pároco.' },
  { q: 'Quantos anos dura a formação?', a: 'A formação propedêutica dura 3 anos, após os quais o seminarista prossegue para a Filosofia e depois a Teologia, num percurso total de formação para o sacerdócio.' },
  { q: 'Posso visitar o Seminário antes de me candidatar?', a: 'Sim! Organizamos fins-de-semana vocacionais e dias abertos. Entre em contacto connosco para agendar uma visita.' },
  { q: 'Como se faz a candidatura?', a: 'A candidatura é feita através do formulário disponível na diocese ou directamente no Seminário, entre Junho e Agosto de cada ano.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-white transition-colors">
        <span className="font-semibold text-gray-900 pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="text-primary-600 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{a}</div>}
    </div>
  );
}

export default function Vocacao() {
  const c = useConteudo('vocacao', {
    hero_subtitulo: 'Se sentes um chamamento interior para servir a Deus como sacerdote, esta página é para ti.',
    testemunhos: DEFAULT_TESTEMUNHOS,
    faqs: DEFAULT_FAQS,
  });

  const testemunhos = Array.isArray(c.testemunhos) && c.testemunhos.length ? c.testemunhos : DEFAULT_TESTEMUNHOS;
  const faqs = Array.isArray(c.faqs) && c.faqs.length ? c.faqs : DEFAULT_FAQS;

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
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">Vocação</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Deus Chama-me?</h1>
          <p className="text-xl text-gray-300 leading-relaxed">{c.hero_subtitulo}</p>
        </div>
      </section>

      <section className="py-28 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">Testemunhos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testemunhos.map((t, i) => (
              <div key={i} className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-700">
                  {t.nome?.charAt(0)}
                </div>
                <p className="text-gray-600 italic leading-relaxed mb-4">{t.texto}</p>
                <p className="font-semibold text-gray-900">{t.nome}</p>
                <p className="text-sm text-gray-400">{t.ano}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
