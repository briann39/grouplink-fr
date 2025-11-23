import api from './api';

export const withdrawalService = {
  // Generar código de retiro
  generateWithdrawalCode: async (amount) => {
    const response = await api.post('/withdrawals/generate', {
      amount: parseFloat(amount),
    });
    return response.data;
  },

  // Obtener información de código de retiro (sin procesarlo)
  getWithdrawalCodeInfo: async (code) => {
    const response = await api.post('/withdrawals/info', { code });
    return response.data;
  },

  // Procesar retiro por código
  processWithdrawal: async (code) => {
    const response = await api.post('/withdrawals/process', { code });
    return response.data;
  },
};

