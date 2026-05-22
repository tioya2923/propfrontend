import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Início', href: '/' },
  {
    label: 'O Seminário',
    href: '/seminario',
    dropdown: [
      { label: 'Mensagem do Reitor', href: '/seminario#reitor' },
      { label: 'História', href: '/seminario#historia' },
    ],
  },
  {
    label: 'Comunidade',
    href: '/comunidade',
    dropdown: [
      { label: 'A Nossa Comunidade', href: '/comunidade' },
      { label: 'Seminaristas', href: '/comunidade#formandos' },
    ],
  },
  {
    label: 'Formação',
    href: '/formacao',
    dropdown: [
      { label: 'Linhas orientadoras', href: '/formacao' },
      { label: 'Currículo Propedêutico', href: '/formacao#curriculo' },
    ],
  },
  {
    label: 'Como ajudar',
    href: '/ajudar',
    dropdown: [
      { label: 'Donativos', href: '/ajudar' },
      { label: 'Apadrinhamento', href: '/ajudar#apadrinhamento' },
      { label: 'Rezar pelo Seminário', href: '/ajudar#oracao' },
    ],
  },
  { label: 'Contactos', href: '/contactos' },
];

function DropdownNavItem({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!item.dropdown) {
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `px-4 py-5 text-sm font-medium transition-colors border-b-2 ${
            isActive
              ? 'text-white border-white'
              : 'text-white/90 border-transparent hover:text-white hover:border-white/50'
          }`
        }
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-white/90 hover:text-white border-b-2 border-transparent hover:border-white/50 transition-colors"
      >
        {item.label}
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 bg-white shadow-lg min-w-[210px] z-50 border-t-2 border-primary-700">
          {item.dropdown.map((sub) => (
            <Link
              key={sub.href}
              to={sub.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 border-b border-gray-100 last:border-0"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
    setProfileOpen(false);
  }

  return (
    <nav className="bg-primary-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center h-14">
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center flex-1">
            {navItems.map((item) => (
              <DropdownNavItem key={item.href} item={item} />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.nome?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">{user.nome?.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 text-gray-800 py-1 z-50">
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <LayoutDashboard size={16} /> Painel
                    </Link>
                    <Link to="/dashboard/perfil" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <User size={16} /> Perfil
                    </Link>
                    {(isAdmin || isStaff) && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <LayoutDashboard size={16} /> Administração
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-red-600 w-full"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-primary-700 hover:bg-primary-50 text-sm font-semibold py-1.5 px-4 rounded transition-colors"
              >
                Entrar
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded hover:bg-primary-800 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-primary-800 border-t border-primary-900">
          {navItems.map((item) => (
            <div key={item.href}>
              <div className="flex items-center justify-between border-b border-primary-900">
                <NavLink
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex-1 block px-4 py-3 text-sm font-medium ${isActive ? 'text-white' : 'text-white/85'}`
                  }
                >
                  {item.label}
                </NavLink>
                {item.dropdown && (
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === item.href ? null : item.href)}
                    className="px-4 py-3 text-white/70"
                  >
                    <ChevronDown size={14} className={`transition-transform ${mobileExpanded === item.href ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {item.dropdown && mobileExpanded === item.href &&
                item.dropdown.map((sub) => (
                  <Link
                    key={sub.href}
                    to={sub.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-8 py-2.5 text-sm text-white/70 border-b border-primary-900 hover:bg-primary-900"
                  >
                    {sub.label}
                  </Link>
                ))}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
