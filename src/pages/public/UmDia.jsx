import { useConteudo } from '../../hooks/useConteudo';

const DEFAULTS_SEMINARIO = {
  infraestruturas: [
    { nome: 'Biblioteca', desc: '5.000+ volumes' },
    { nome: 'Capela', desc: 'Celebrações comuns' },
    { nome: 'Refeitório', desc: 'Refeições diárias' },
    { nome: 'Desporto', desc: 'Campo e ginásio' },
    { nome: 'Enfermaria', desc: 'Cuidados básicos' },
    { nome: 'Laboratório', desc: 'Informática e internet' },
    { nome: 'Jardins', desc: 'Espaços de oração' },
    { nome: 'Salas de Aula', desc: 'Separadas por Secção' },
  ],
};

const DEFAULTS = {
  texto_introducao: 'O Seminário Propedêutico São João Evangelista tem um ritmo de vida que integra harmoniosamente a oração, o estudo académico e a convivência fraterna — três dimensões inseparáveis da formação sacerdotal.',
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
  regulamento: [],
  atividades: [],
  galeria: [],
};

const coresTipo = {
  espiritual:  { badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  academico:   { badge: 'bg-blue-100   text-blue-700',   dot: 'bg-blue-400'   },
  comunitario: { badge: 'bg-wine-100  text-wine-700',  dot: 'bg-wine-400'  },
};

export default function UmDia() {
  const c  = useConteudo('um_dia', DEFAULTS);
  const cs = useConteudo('seminario', DEFAULTS_SEMINARIO);

  const horario       = Array.isArray(c.horario_tipico) && c.horario_tipico.length ? c.horario_tipico : DEFAULTS.horario_tipico;
  const regulamento   = Array.isArray(c.regulamento)    ? c.regulamento    : [];
  const atividades    = Array.isArray(c.atividades)     ? c.atividades     : [];
  const galeria       = Array.isArray(c.galeria)        ? c.galeria        : [];
  const infraestruturas = Array.isArray(cs.infraestruturas) && cs.infraestruturas.length
    ? cs.infraestruturas
    : DEFAULTS_SEMINARIO.infraestruturas;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-dark-900 text-white py-24">
        {c.hero_imagem && (
          <>
            <img src={c.hero_imagem} alt="" loading="eager" decoding="async"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/55" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-300 text-sm uppercase tracking-widest mb-4">Seminário Propedêutico São João Evangelista</p>
          <h1 className="text-5xl font-serif font-bold mb-6">Um Dia no Seminário</h1>
          {c.texto_introducao && (
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">{c.texto_introducao}</p>
          )}
        </div>
      </section>

      {/* ── Horário Típico ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-2">Um Dia Típico</h2>
          <p className="text-center text-gray-500 text-sm mb-12">Ritmo diário do Seminário</p>

          <div className="divide-y divide-gray-100">
            {horario.map((item, i) => {
              const cores = coresTipo[item.tipo] || coresTipo.comunitario;
              return (
                <div key={i} className="flex items-center gap-6 py-4">
                  <span className="w-14 text-right font-mono text-sm font-semibold text-gray-400 shrink-0">
                    {item.hora}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cores.dot}`} />
                  <span className="flex-1 text-gray-800">{item.atividade}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cores.badge}`}>
                    {item.tipo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Actividades ── */}
      {atividades.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">Actividades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {atividades.map((a, i) => (
                <div key={i} className="card text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">{a.nome}</h3>
                  {a.desc && <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Galeria ── */}
      {galeria.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">Galeria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galeria.map((foto, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={foto.url}
                    alt={foto.legenda || ''}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Regulamento ── */}
      {regulamento.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">Regulamento</h2>
            <div className="space-y-6">
              {regulamento.map((r, i) => (
                <div key={i} className="card">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      {r.titulo && <h3 className="font-semibold text-gray-900 mb-1">{r.titulo}</h3>}
                      {r.descricao && <p className="text-sm text-gray-600 leading-relaxed">{r.descricao}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Infraestruturas Partilhadas ── */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-4">Infraestruturas Partilhadas</h2>
          <p className="text-center text-gray-500 text-sm mb-12">Espaços e instalações do Seminário</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {infraestruturas.map((inf, i) => (
              <div key={i} className="card text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-1">{inf.nome}</h3>
                <p className="text-xs text-gray-500">{inf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
