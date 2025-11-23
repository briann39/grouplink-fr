import api from './api';

export const storeService = {
  // Verificar CBU y obtener datos del usuario
  verifyCBU: async (cbu) => {
    const response = await api.post('/stores/verify-cbu', { cbu });
    return response.data;
  },

  // Agregar dinero a una cuenta de usuario
  addMoneyToAccount: async (cbu, amount, description) => {
    const response = await api.post('/stores/add-money', {
      cbu,
      amount: parseFloat(amount),
      description,
    });
    return response.data;
  },

  // Agregar dinero a la cuenta de la tienda (depósito)
  depositToStore: async (amount, description, referenceId) => {
    const response = await api.post('/stores/deposit', {
      amount: parseFloat(amount),
      description,
      referenceId,
    });
    return response.data;
  },

  // Obtener perfil completo de la tienda
  getProfile: async () => {
    const response = await api.get('/stores/me');
    return response.data;
  },

  // Actualizar perfil de la tienda
  updateProfile: async (profileData) => {
    const response = await api.put('/stores/profile', profileData);
    return response.data;
  },

  // Actualizar email de la tienda
  updateEmail: async (email, password) => {
    const response = await api.put('/stores/email', { email, password });
    return response.data;
  },

  // Actualizar contraseña de la tienda
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/stores/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Buscar tienda por email, ID o nombre comercial
  searchStore: async (query, type) => {
    const params = { query };
    if (type) params.type = type;
    const response = await api.get('/stores/search', { params });
    return response.data;
  },

  // Obtener perfil público de tienda por ID
  getStoreById: async (storeId) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },

  // Actualizar configuraciones de privacidad
  updatePrivacySettings: async (privacySettings) => {
    const response = await api.put('/stores/privacy', { privacySettings });
    return response.data;
  },

  // Verificar email
  verifyEmail: async (email, code) => {
    const response = await api.post('/stores/verify-email', { email, code });
    return response.data;
  },

  // Reenviar código de verificación
  resendVerificationCode: async (email) => {
    const response = await api.post('/stores/resend-verification', { email });
    return response.data;
  },
};

