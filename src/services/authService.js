import api from './api';

export const authService = {
  // Login unificado (detecta automáticamente si es usuario o tienda)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      if (response.data.type === 'user') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'user');
      } else {
        localStorage.setItem('user', JSON.stringify(response.data.store));
        localStorage.setItem('userType', 'store');
      }
    }
    return response.data;
  },

  // Registro de usuario
  registerUser: async (userData) => {
    const response = await api.post('/users/create', userData);
    return response.data;
  },

  // Registro de tienda
  registerStore: async (storeData) => {
    const response = await api.post('/stores/create', storeData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

