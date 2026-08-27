import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2 text-center">Recuperar Password</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Introduza o seu email para receber as instruções.</p>

        {sent ? (
          <div className="card text-center">
            <p className="text-gray-700 mb-4">Se o email existir na nossa base de dados, receberá instruções em breve.</p>
            <Link to="/login" className="btn-primary">Voltar ao Login</Link>
          </div>
        ) : (
          <div className="card shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'A enviar...' : 'Enviar instruções'}</button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4"><Link to="/login" className="text-primary-600 hover:underline">← Voltar ao login</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}
