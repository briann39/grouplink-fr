import api from "./api";

export const userService = {
  // Verificar CBU y obtener datos del usuario (para usuarios)
  verifyCBU: async (cbu) => {
    const response = await api.post("/users/verify-cbu", { cbu });
    return response.data;
  },

  // Obtener perfil completo del usuario
  getProfile: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Actualizar perfil del usuario
  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  // Actualizar email del usuario
  updateEmail: async (email, password) => {
    const response = await api.put("/users/email", { email, password });
    return response.data;
  },

  // Actualizar contraseña del usuario
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/users/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Buscar usuario por CBU, email, ID o nombre
  searchUser: async (query, type) => {
    const params = { query };
    if (type) params.type = type;
    const response = await api.get("/users/search", { params });
    return response.data;
  },

  // Obtener perfil público de usuario por ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Actualizar configuraciones de privacidad
  updatePrivacySettings: async (privacySettings) => {
    const response = await api.put("/users/privacy", { privacySettings });
    return response.data;
  },

  // Verificar email
  verifyEmail: async (email, code) => {
    const response = await api.post("/users/verify-email", { email, code });
    return response.data;
  },

  // Reenviar código de verificación
  resendVerificationCode: async (email) => {
    const response = await api.post("/users/resend-verification", { email });
    return response.data;
  },
};
