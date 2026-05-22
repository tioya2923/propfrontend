import api from './client';

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (password_atual, password_nova) => api.put('/auth/change-password', { password_atual, password_nova }),
};

// Seminarista
export const semináristaAPI = {
  getPerfil: () => api.get('/seminarista/perfil'),
  updatePerfil: (data) => api.put('/seminarista/perfil', data),
  getHorarios: () => api.get('/seminarista/horarios'),
  getMateriais: () => api.get('/seminarista/materiais'),
  getComunicados: () => api.get('/seminarista/comunicados'),
  getForumPosts: (params) => api.get('/seminarista/forum', { params }),
  createForumPost: (data) => api.post('/seminarista/forum', data),
};

// Propinas
export const propinaAPI = {
  getMinhaDivida: () => api.get('/propinas/minha-divida'),
  pagar: (data) => api.post('/propinas/pagar', data),
  confirmar: (data) => api.post('/propinas/confirmar', data),
  getRecibos: () => api.get('/propinas/recibos'),
  downloadRecibo: (id) => api.get(`/propinas/recibos/${id}/download`, { responseType: 'blob' }),
  pedirProrrogacao: (data) => api.post('/propinas/pedir-prorrogacao', data),
};

// Público
export const publicAPI = {
  getNoticias: (params) => api.get('/noticias', { params }),
  getNoticia: (id) => api.get(`/noticias/${id}`),
  getEventos: () => api.get('/eventos'),
  submitContacto: (data) => api.post('/contacto/formulario', data),
  getDonativosStatus: () => api.get('/donativos/status'),
  criarDonativo: (data) => api.post('/donativos/criar', data),
  mcxDonativo: (data) => api.post('/donativos/mcx', data),
  mbwayDonativo: (data) => api.post('/donativos/mbway', data),
  getConteudo: (pagina) => api.get(`/conteudo/${pagina}`),
  getEquipa: (params) => api.get('/equipa', { params }),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listSeminaristas: (params) => api.get('/admin/seminaristas', { params }),
  getSeminarista: (id) => api.get(`/admin/seminarista/${id}`),
  createSeminarista: (data) => api.post('/admin/seminarista', data),
  updateSeminarista: (id, data) => api.put(`/admin/seminarista/${id}`, data),
  deleteSeminarista: (id) => api.delete(`/admin/seminarista/${id}`),
  aplicarBolsa: (id, data) => api.post(`/admin/seminarista/${id}/bolsa`, data),
  configurarPropina: (data) => api.post('/admin/propina/config', data),
  enviarComunicado: (data) => api.post('/admin/comunicado', data),
  getPagamentos: (params) => api.get('/admin/pagamentos', { params }),
  relatorioArrecadacao: () => api.get('/admin/relatorios/arrecadacao'),
  relatorioDevedores: () => api.get('/admin/relatorios/devedores'),
  uploadMaterial: (formData) => api.post('/admin/material', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Conteúdo de páginas
  getConteudo: (pagina) => api.get(`/conteudo/${pagina}`),
  saveConteudo: (pagina, campos) => api.put('/admin/conteudo', { pagina, campos }),

  // Equipa Formadora
  getEquipa: (params) => api.get('/admin/equipa', { params }),
  createMembro: (data) => api.post('/admin/equipa', data),
  updateMembro: (id, data) => api.put(`/admin/equipa/${id}`, data),
  deleteMembro: (id) => api.delete(`/admin/equipa/${id}`),

  // Upload de imagens
  uploadImagem: (file) => {
    const fd = new FormData();
    fd.append('imagem', file);
    return api.post('/admin/upload/imagem', fd);
  },

  // Notícias (admin CRUD)
  listNoticias: (params) => api.get('/admin/noticias', { params }),
  getNoticia: (id) => api.get(`/admin/noticias/${id}`),
  createNoticia: (data) => api.post('/admin/noticias', data),
  updateNoticia: (id, data) => api.put(`/admin/noticias/${id}`, data),
  deleteNoticia: (id) => api.delete(`/admin/noticias/${id}`),

  // Eventos (admin CRUD)
  listEventos: (params) => api.get('/admin/eventos', { params }),
  createEvento: (data) => api.post('/admin/eventos', data),
  updateEvento: (id, data) => api.put(`/admin/eventos/${id}`, data),
  deleteEvento: (id) => api.delete(`/admin/eventos/${id}`),
};

// Professor
export const professorAPI = {
  getHorarios: () => api.get('/professor/horarios'),
  getAlunos: () => api.get('/professor/alunos'),

  getNotas: () => api.get('/professor/notas'),
  upsertNota: (data) => api.post('/professor/notas', data),
  deleteNota: (id) => api.delete(`/professor/notas/${id}`),

  getTrabalhos: () => api.get('/professor/trabalhos'),
  createTrabalho: (data) => api.post('/professor/trabalhos', data),
  updateTrabalho: (id, data) => api.put(`/professor/trabalhos/${id}`, data),
  deleteTrabalho: (id) => api.delete(`/professor/trabalhos/${id}`),
  getEntregas: (id) => api.get(`/professor/trabalhos/${id}/entregas`),
  avaliarEntrega: (id, data) => api.post(`/professor/trabalhos/${id}/avaliar`, data),

  getMateriais: () => api.get('/professor/materiais'),
  uploadMaterial: (formData) => api.post('/professor/materiais', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMaterial: (id) => api.delete(`/professor/materiais/${id}`),

  getComunicados: () => api.get('/professor/comunicados'),
  enviarComunicado: (data) => api.post('/professor/comunicados', data),
};
