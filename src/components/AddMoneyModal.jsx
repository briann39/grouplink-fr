import { useState } from 'react';
import { storeService } from '../services/storeService';

const AddMoneyModal = ({ isOpen, onClose, onSuccess }) => {
  const [cbu, setCbu] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: datos, 2: verificación, 3: procesando

  const [verificationData, setVerificationData] = useState(null);
  const [userData, setUserData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar datos
    if (!cbu.trim()) {
      setError('El CBU es requerido');
      setLoading(false);
      return;
    }

    // Validar formato de CBU (22 dígitos)
    if (!/^\d{22}$/.test(cbu.trim())) {
      setError('El CBU debe tener 22 dígitos');
      setLoading(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('El monto debe ser un número positivo');
      setLoading(false);
      return;
    }

    try {
      // Verificar CBU y obtener datos del usuario
      const verifyResponse = await storeService.verifyCBU(cbu.trim());
      
      if (verifyResponse.success) {
        setUserData(verifyResponse.user);
        setVerificationData({
          cbu: cbu.trim(),
          amount: amountNum,
          description: description.trim() || `Depósito de ${amountNum} USD`,
        });
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar CBU. El CBU no existe o la cuenta no está activa.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setStep(3);
    setLoading(true);
    setError('');

    try {
      const response = await storeService.addMoneyToAccount(
        verificationData.cbu,
        verificationData.amount,
        verificationData.description
      );

      if (response.success) {
        // Éxito
        setTimeout(() => {
          onSuccess(response);
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar dinero');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCbu('');
    setAmount('');
    setDescription('');
    setError('');
    setVerificationData(null);
    setUserData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Agregar Dinero</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Paso 1: Ingresar datos */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cbu" className="block text-sm font-medium text-gray-700 mb-2">
                  CBU (Clave Bancaria Uniforme) *
                </label>
                <input
                  id="cbu"
                  type="text"
                  value={cbu}
                  onChange={(e) => setCbu(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={22}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ingrese el CBU (22 dígitos)"
                />
                <p className="text-xs text-gray-500 mt-1">El CBU debe tener 22 dígitos</p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (USD) *
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Descripción de la transacción"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Siguiente'}
                </button>
              </div>
            </form>
          )}

          {/* Paso 2: Verificación */}
          {step === 2 && verificationData && userData && (
            <div className="space-y-4">
              {/* Información del usuario destinatario */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-semibold mb-3">✅ Usuario encontrado:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-semibold">{userData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{userData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CBU:</span>
                    <span className="font-semibold font-mono">{userData.cbu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance actual:</span>
                    <span className="font-semibold">
                      {parseFloat(userData.balance).toFixed(2)} {userData.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de la transacción */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-3">Detalles de la transacción:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto a transferir al usuario:</span>
                    <span className="font-semibold text-green-600">
                      ${verificationData.amount.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                    <span className="text-gray-600">Comisión (25% para tienda, 75% para empresa):</span>
                    <span className="font-semibold text-orange-600">
                      +$1.00 USD
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                    <span className="text-gray-700 font-medium">Total a descontar de tu cuenta:</span>
                    <span className="font-semibold text-red-600">
                      -${(verificationData.amount + 1.00).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">Nuevo balance del destinatario:</span>
                    <span className="font-semibold text-green-600">
                      ${(parseFloat(userData.balance) + verificationData.amount).toFixed(2)} {userData.currency}
                    </span>
                  </div>
                  {verificationData.description && (
                    <div className="flex justify-between pt-2 border-t border-blue-300 mt-2">
                      <span className="text-gray-600">Descripción:</span>
                      <span className="font-semibold text-right max-w-xs truncate">
                        {verificationData.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Confirmar y Cargar
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Procesando */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-lg font-semibold text-gray-900">Procesando transacción...</p>
              <p className="text-sm text-gray-600 mt-2">Por favor espere</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMoneyModal;

