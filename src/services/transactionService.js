import api from './api';

export const transactionService = {
  // Enviar dinero a otro usuario por CBU
  sendMoney: async (cbu, amount, description) => {
    const response = await api.post('/transactions/send', {
      cbu,
      amount: parseFloat(amount),
      description,
    });
    return response.data;
  },

  // Obtener historial de transacciones (para usuarios)
  getTransactions: async (limit = 50, offset = 0) => {
    const response = await api.get('/transactions/history', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Obtener historial de transacciones (para tiendas)
  getStoreTransactions: async (limit = 50, offset = 0) => {
    const response = await api.get('/stores/transactions', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Obtener una transacción específica
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
};

