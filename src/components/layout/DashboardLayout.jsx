import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, CreditCard, Clock, BookOpen, Bell, MessageSquare, User, LogOut, X, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Início', href: '/dashboard', icon: Home, exact: true },
  { label: 'Propinas', href: '/dashboard/propinas', icon: CreditCard },
  { label: 'Horários', href: '/dashboard/horarios', icon: Clock },
  { label: 'Materiais', href: '/dashboard/materiais', icon: BookOpen },
  { label: 'Comunicados', href: '/dashboard/comunicados', icon: Bell },
  { label: 'Fórum', href: '/dashboard/forum', icon: MessageSquare },
  { label: 'Perfil', href: '/dashboard/perfil', icon: User },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-dark-900 text-white z-40 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold">
            <span className="text-primary-400">✝</span>
            <span>Seminário SJE</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-bold">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.nome}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.permissoes} {user?.ano_formacao ? `· Ano ${user.ano_formacao}` : ''}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium bg-primary-700 text-primary-100">
                Propedêutico
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, exact }) => (
            <NavLink
              key={href}
              to={href}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-700 text-white' : 'text-gray-300 hover:bg-dark-700 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-700">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-dark-700 w-full transition-colors">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800">
            <Menu size={22} />
          </button>
          <span className="font-semibold text-gray-800">Painel</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
