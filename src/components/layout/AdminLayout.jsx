import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Megaphone, BarChart2, Settings, LogOut, Menu, X, Upload, Newspaper, CalendarDays, FileEdit } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Membros e Seminaristas', href: '/admin/seminaristas', icon: Users },
  { label: 'Notícias', href: '/admin/noticias', icon: Newspaper },
  { label: 'Eventos', href: '/admin/eventos', icon: CalendarDays },
  { label: 'Conteúdo', href: '/admin/conteudo', icon: FileEdit },
  { label: 'Pagamentos', href: '/admin/pagamentos', icon: CreditCard },
  { label: 'Comunicados', href: '/admin/comunicados', icon: Megaphone },
  { label: 'Materiais', href: '/admin/materiais', icon: Upload },
  { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart2 },
  { label: 'Definições', href: '/admin/definicoes', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold">
            <span className="text-primary-400">✝</span>
            <span>Admin SJE</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <p className="text-sm font-medium">{user?.nome}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.permissoes}</p>
          <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium bg-primary-700 text-primary-100">
            São João Evangelista
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, exact }) => (
            <NavLink key={href} to={href} end={exact} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
              }>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 w-full transition-colors mb-1">
            <LayoutDashboard size={18} /> Meu Painel
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700 w-full transition-colors">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800"><Menu size={22} /></button>
          <span className="font-semibold text-gray-800">Administração</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
