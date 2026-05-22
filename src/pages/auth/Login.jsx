import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha o email e a password');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      let dest;
      if (user.cargo === 'professor') dest = '/professor';
      else if (user.permissoes === 'admin' || user.permissoes === 'staff') dest = '/admin';
      else dest = from;
      navigate(dest, { replace: true });
      toast.success(`Bem-vindo, ${user.nome.split(' ')[0]}!`);
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-dark-900">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">✝</div>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-4">Área Restrita</h1>
          <p className="text-gray-500 text-sm mt-1">Seminário Propedêutico São João Evangelista</p>
        </div>

        <div className="card shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="seu.email@sje.ao" required autoFocus />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Esqueci a password</Link>
              </div>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input pr-10" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/" className="text-primary-600 hover:underline">← Voltar ao site público</Link>
        </p>
      </div>
    </div>
  );
}
