import { useApi } from '../../hooks/useApi';
import { semináristaAPI } from '../../api';

export default function Notas() {
  const { data: notas, loading } = useApi(() => semináristaAPI.getNotas(), []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  const porPeriodo = (notas || []).reduce((acc, n) => {
    (acc[n.periodo] = acc[n.periodo] || []).push(n);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">As Minhas Notas</h1>
      {!notas?.length ? (
        <div className="card text-center py-10 text-gray-500">Ainda não tem notas lançadas.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(porPeriodo).map(([periodo, lista]) => (
            <div key={periodo} className="card">
              <h2 className="font-semibold text-gray-900 mb-4 text-lg">{periodo}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase">
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 font-medium pr-4">Disciplina</th>
                      <th className="text-left pb-2 font-medium pr-4">Professor</th>
                      <th className="text-right pb-2 font-medium pr-4">Nota</th>
                      <th className="text-left pb-2 font-medium">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lista.map(n => (
                      <tr key={n.id}>
                        <td className="py-3 pr-4 font-medium text-gray-900">{n.materia}</td>
                        <td className="py-3 pr-4 text-gray-500">{n.professor?.nome || '—'}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={`badge font-bold ${parseFloat(n.valor) >= 10 ? 'bg-wine-100 text-wine-700' : 'bg-red-100 text-red-700'}`}>
                            {n.valor} / 20
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{n.observacao || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
