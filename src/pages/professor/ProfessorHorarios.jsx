import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { professorAPI } from '../../api';
import toast from 'react-hot-toast';

const DIAS = { segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado' };
const DIA_ORDER = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

export default function ProfessorHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    professorAPI.getHorarios()
      .then(r => setHorarios(r.data))
      .catch(() => toast.error('Erro ao carregar horários'))
      .finally(() => setLoading(false));
  }, []);

  const byDay = DIA_ORDER.reduce((acc, d) => {
    const items = horarios.filter(h => h.dia_semana === d);
    if (items.length) acc[d] = items;
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Os Meus Horários</h1>
      </div>

      {Object.keys(byDay).length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Nenhum horário atribuído</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDay).map(([dia, items]) => (
            <div key={dia}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{DIAS[dia]}</h2>
              <div className="space-y-2">
                {items.map(h => (
                  <div key={h.id} className="card flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-semibold text-gray-900">{h.hora_inicio?.slice(0, 5)}</p>
                      <p className="text-xs text-gray-400">{h.hora_fim?.slice(0, 5)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{h.disciplina}</p>
                      <p className="text-sm text-gray-500">Ano {h.ano_formacao}{h.sala ? ` · ${h.sala}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
