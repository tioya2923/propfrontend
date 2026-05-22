import { useApi } from '../../hooks/useApi';
import { semináristaAPI } from '../../api';
import { DIAS_SEMANA } from '../../utils/format';

export default function Horarios() {
  const { data: horarios, loading } = useApi(() => semináristaAPI.getHorarios(), []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  const porDia = horarios?.reduce((acc, h) => {
    if (!acc[h.dia_semana]) acc[h.dia_semana] = [];
    acc[h.dia_semana].push(h);
    return acc;
  }, {}) || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Horários de Aulas</h1>
      {!horarios?.length ? (
        <div className="card text-center py-10 text-gray-500">Nenhum horário disponível para o seu ano de formação.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(DIAS_SEMANA).map(([chave, label]) => {
            const aulas = porDia[chave];
            if (!aulas?.length) return null;
            return (
              <div key={chave} className="card">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">{label}</h2>
                <div className="space-y-2">
                  {aulas.map(a => (
                    <div key={a.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-mono text-gray-500 w-28 shrink-0">{a.hora_inicio} – {a.hora_fim}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{a.disciplina}</p>
                        {a.professor && <p className="text-xs text-gray-500">{a.professor}</p>}
                      </div>
                      {a.sala && <span className="badge bg-blue-100 text-blue-700 text-xs">{a.sala}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
