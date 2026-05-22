import { useEffect, useState } from 'react';
import { Clock, Users, FileText, Upload, Megaphone, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { professorAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProfessorHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ horarios: 0, alunos: 0, trabalhos: 0, materiais: 0, comunicados: 0 });

  useEffect(() => {
    Promise.all([
      professorAPI.getHorarios(),
      professorAPI.getAlunos(),
      professorAPI.getTrabalhos(),
      professorAPI.getMateriais(),
      professorAPI.getComunicados(),
    ]).then(([h, a, t, m, c]) => {
      setStats({
        horarios: h.data.length,
        alunos: a.data.length,
        trabalhos: t.data.length,
        materiais: m.data.length,
        comunicados: c.data.length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Horários',     value: stats.horarios,    icon: Clock,      href: '/professor/horarios',    color: 'bg-blue-500' },
    { label: 'Alunos',       value: stats.alunos,      icon: Users,      href: '/professor/alunos',      color: 'bg-wine-500' },
    { label: 'Trabalhos',    value: stats.trabalhos,   icon: FileText,   href: '/professor/trabalhos',   color: 'bg-purple-500' },
    { label: 'Materiais',    value: stats.materiais,   icon: Upload,     href: '/professor/materiais',   color: 'bg-amber-500' },
    { label: 'Comunicados',  value: stats.comunicados, icon: Megaphone,  href: '/professor/comunicados', color: 'bg-rose-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bom dia, {user?.nome?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Portal do Professor — Seminário Propedêutico São João Evangelista</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href} to={href} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
