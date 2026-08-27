import { useConteudo } from '../../hooks/useConteudo';

const DEFAULTS = {
  dimensoes: [
    { titulo: 'Formação Humana', desc: 'Desenvolvimento da personalidade, maturidade afectiva, liberdade e responsabilidade.' },
    { titulo: 'Formação Espiritual', desc: 'Vida de oração, sacramentos, lectio divina, direcção espiritual e retiros.' },
    { titulo: 'Formação Intelectual', desc: 'Filosofia introdutória, Escritura, História da Igreja e Introdução à Teologia.' },
    { titulo: 'Formação Pastoral', desc: 'Estágios paroquiais, catequese, animação litúrgica e serviço aos mais pobres.' },
  ],
  curriculo: [
    { ano: '1.º Ano', disciplinas: ['Filosofia Introdutória', 'Sagrada Escritura', 'Latim I', 'Português e Comunicação', 'História da Igreja I', 'Introdução às Ciências da Religião'] },
    { ano: '2.º Ano', disciplinas: ['Introdução à Teologia', 'Psicologia e Desenvolvimento Humano', 'Latim II', 'Filosofia da Religião', 'História da Igreja II', 'Pastoral e Missionação'] },
    { ano: '3.º Ano', disciplinas: ['Doutrina Social da Igreja', 'Liturgia', 'Ética', 'Latim III', 'Metodologia do Estudo', 'Estágio Pastoral'] },
  ],
  horario_tipico: [
    { hora: '06:00', atividade: 'Laudes e Oração Pessoal', tipo: 'espiritual' },
    { hora: '07:00', atividade: 'Santa Missa', tipo: 'espiritual' },
    { hora: '07:45', atividade: 'Pequeno-almoço', tipo: 'comunitario' },
    { hora: '08:30', atividade: 'Aulas (1.º bloco)', tipo: 'academico' },
    { hora: '10:30', atividade: 'Intervalo', tipo: 'comunitario' },
    { hora: '11:00', atividade: 'Aulas (2.º bloco)', tipo: 'academico' },
    { hora: '13:00', atividade: 'Almoço e Descanso', tipo: 'comunitario' },
    { hora: '15:00', atividade: 'Estudo Individual', tipo: 'academico' },
    { hora: '17:00', atividade: 'Actividade Desportiva / Cultural', tipo: 'comunitario' },
    { hora: '18:30', atividade: 'Vésperas', tipo: 'espiritual' },
    { hora: '19:00', atividade: 'Jantar', tipo: 'comunitario' },
    { hora: '20:00', atividade: 'Tempo Livre / Estudo', tipo: 'academico' },
    { hora: '22:00', atividade: 'Completas e Silêncio', tipo: 'espiritual' },
  ],
};

const coresTipo = {
  espiritual: 'bg-purple-100 text-purple-700',
  academico: 'bg-blue-100 text-blue-700',
  comunitario: 'bg-wine-100 text-wine-700',
};

export default function Formacao() {
  const c = useConteudo('formacao', DEFAULTS);

  const dimensoes = Array.isArray(c.dimensoes) && c.dimensoes.length ? c.dimensoes : DEFAULTS.dimensoes;
  const curriculo = Array.isArray(c.curriculo) && c.curriculo.length ? c.curriculo : DEFAULTS.curriculo;
  const horario = Array.isArray(c.horario_tipico) && c.horario_tipico.length ? c.horario_tipico : DEFAULTS.horario_tipico;

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
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">Curriculum</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Formação</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Três anos de formação integral que preparam os candidatos ao sacerdócio nos seus fundamentos humanos, espirituais e intelectuais.
          </p>
        </div>
      </section>

      {/* Quatro Dimensões */}
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Quatro Dimensões da Formação</h2>
          <p className="text-center text-gray-500 text-sm mb-12">Linhas orientadoras do percurso formativo</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dimensoes.map((l, i) => (
              <div key={i} className="card text-center">
                <h3 className="font-semibold text-gray-900 mb-3">{l.titulo}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Currículo */}
      <section className="bg-white py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-primary-500 pl-6 mb-10">
            <span className="inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 bg-primary-100 text-primary-700">Propedêutico</span>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Curso Propedêutico — {curriculo.length} {curriculo.length === 1 ? 'Ano' : 'Anos'}
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl">
              O curso propedêutico oferece uma formação inicial sólida, constituindo o alicerce humano, espiritual e intelectual para os estudos filosóficos e teológicos subsequentes.
            </p>
          </div>
          <div className={`grid grid-cols-1 gap-6 ${curriculo.length <= 2 ? 'md:grid-cols-2' : curriculo.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {curriculo.map((a, i) => (
              <div key={i} className="card border-t-4 border-primary-400">
                <h3 className="font-bold text-lg mb-4 text-primary-700">{a.ano}</h3>
                <ul className="space-y-2">
                  {(a.disciplinas || []).map((d, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horário Típico */}
      <section className="py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Um Dia Típico</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Ritmo diário do Seminário</p>
          <div className="space-y-2">
            {horario.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white border border-gray-100">
                <span className="text-sm font-mono font-bold text-gray-500 w-14 shrink-0">{h.hora}</span>
                <span className="flex-1 text-sm text-gray-800">{h.atividade}</span>
                <span className={`badge text-xs ${coresTipo[h.tipo] || 'bg-gray-100 text-gray-600'}`}>{h.tipo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
