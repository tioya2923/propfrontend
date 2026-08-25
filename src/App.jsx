import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import ScrollToTop from './components/ui/ScrollToTop';
import InstallPrompt from './components/ui/InstallPrompt';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProfessorLayout from './components/layout/ProfessorLayout';

// Public pages
import Home from './pages/public/Home';
import Vocacao from './pages/public/Vocacao';
import Seminario from './pages/public/Seminario';
import Comunidade from './pages/public/Comunidade';
import Formacao from './pages/public/Formacao';
import Ajudar from './pages/public/Ajudar';
import Contactos from './pages/public/Contactos';
import Noticias from './pages/public/Noticias';
import NoticiaDetalhe from './pages/public/NoticiaDetalhe';
import UmDia from './pages/public/UmDia';
import LegalPage from './pages/public/LegalPage';

// Auth
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard
import DashboardHome from './pages/dashboard/DashboardHome';
import Propinas from './pages/dashboard/Propinas';
import Horarios from './pages/dashboard/Horarios';
import Materiais from './pages/dashboard/Materiais';
import Comunicados from './pages/dashboard/Comunicados';
import Forum from './pages/dashboard/Forum';
import Perfil from './pages/dashboard/Perfil';

// Admin
import AdminHome from './pages/admin/AdminHome';
import AdminSeminaristas from './pages/admin/AdminSeminaristas';
import AdminPagamentos from './pages/admin/AdminPagamentos';
import AdminComunicados from './pages/admin/AdminComunicados';
import AdminRelatorios from './pages/admin/AdminRelatorios';
import AdminMateriais from './pages/admin/AdminMateriais';
import AdminDefinicoes from './pages/admin/AdminDefinicoes';
import AdminNoticias from './pages/admin/AdminNoticias';
import AdminEventos from './pages/admin/AdminEventos';
import AdminConteudo from './pages/admin/AdminConteudo';
import AdminHorarios from './pages/admin/AdminHorarios';
import AdminForum from './pages/admin/AdminForum';

// Professor
import ProfessorHome from './pages/professor/ProfessorHome';
import ProfessorHorarios from './pages/professor/ProfessorHorarios';
import ProfessorAlunos from './pages/professor/ProfessorAlunos';
import ProfessorTrabalhos from './pages/professor/ProfessorTrabalhos';
import ProfessorMateriais from './pages/professor/ProfessorMateriais';
import ProfessorComunicados from './pages/professor/ProfessorComunicados';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '14px' } }} />
      <ScrollToTop />
      <InstallPrompt />
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/vocacao" element={<Vocacao />} />
          <Route path="/seminario" element={<Seminario />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/formacao" element={<Formacao />} />
          <Route path="/ajudar" element={<Ajudar />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalhe />} />
          <Route path="/um-dia" element={<UmDia />} />
          <Route path="/privacidade" element={<LegalPage pagina="privacidade" tituloDefault="Política de Privacidade" />} />
          <Route path="/termos" element={<LegalPage pagina="termos" tituloDefault="Termos de Uso" />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard (seminaristas + todos) */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="propinas" element={<Propinas />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="materiais" element={<Materiais />} />
          <Route path="comunicados" element={<Comunicados />} />
          <Route path="forum" element={<Forum />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>

        {/* Compat alias */}
        <Route path="/propinas" element={<Navigate to="/dashboard/propinas" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'staff']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminHome />} />
          <Route path="seminaristas" element={<AdminSeminaristas />} />
          <Route path="noticias" element={<AdminNoticias />} />
          <Route path="eventos" element={<AdminEventos />} />
          <Route path="horarios" element={<AdminHorarios />} />
          <Route path="forum" element={<AdminForum />} />
          <Route path="conteudo" element={<AdminConteudo />} />
          <Route path="pagamentos" element={<AdminPagamentos />} />
          <Route path="comunicados" element={<AdminComunicados />} />
          <Route path="relatorios" element={<AdminRelatorios />} />
          <Route path="materiais" element={<AdminMateriais />} />
          <Route path="definicoes" element={<AdminDefinicoes />} />
        </Route>

        {/* Professor */}
        <Route path="/professor" element={<ProtectedRoute roles={['staff']} cargo={['professor']}><ProfessorLayout /></ProtectedRoute>}>
          <Route index element={<ProfessorHome />} />
          <Route path="horarios" element={<ProfessorHorarios />} />
          <Route path="alunos" element={<ProfessorAlunos />} />
          <Route path="trabalhos" element={<ProfessorTrabalhos />} />
          <Route path="materiais" element={<ProfessorMateriais />} />
          <Route path="comunicados" element={<ProfessorComunicados />} />
        </Route>

        <Route path="*" element={<div className="min-h-screen flex flex-col items-center justify-center gap-4"><h1 className="text-4xl font-bold text-gray-900">404</h1><p className="text-gray-500">Página não encontrada</p><a href="/" className="btn-primary">Ir para o início</a></div>} />
      </Routes>
    </AuthProvider>
  );
}
