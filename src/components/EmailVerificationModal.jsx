import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faCheckCircle,
  faTimes,
  faSpinner,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { userService } from '../services/userService';
import { storeService } from '../services/storeService';

const EmailVerificationModal = ({ isOpen, onClose, email, userType = 'user', onVerified }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Debug: verificar el userType recibido
  console.log('EmailVerificationModal renderizado - userType:', userType, 'tipo:', typeof userType, 'email:', email);

  // Función helper para determinar si es tienda
  const getIsStore = () => {
    const type = String(userType || '').toLowerCase().trim();
    const result = type === 'store' || type === 'tienda';
    console.log('getIsStore() - userType:', userType, 'type normalizado:', type, 'es tienda:', result);
    return result;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!code.trim() || code.length !== 6) {
        setError('El código debe tener 6 dígitos');
        setLoading(false);
        return;
      }

      // Asegurarse de usar el servicio correcto
      const isStore = getIsStore();
      const correctService = isStore ? storeService : userService;
      console.log('Verificando código para:', { 
        userType, 
        isStore, 
        email, 
        service: isStore ? 'storeService' : 'userService',
        endpoint: isStore ? '/stores/verify-email' : '/users/verify-email'
      });
      const response = await correctService.verifyEmail(email, code);

      if (response.success) {
        setSuccess('¡Email verificado exitosamente!');
        setTimeout(() => {
          if (onVerified) {
            onVerified(response.user || response.store);
          }
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      // Asegurarse de usar el servicio correcto
      const isStore = getIsStore();
      const correctService = isStore ? storeService : userService;
      console.log('Reenviando código para:', { 
        userType, 
        isStore, 
        email, 
        service: isStore ? 'storeService' : 'userService',
        endpoint: isStore ? '/stores/resend-verification' : '/users/resend-verification'
      });
      const response = await correctService.resendVerificationCode(email);

      if (response.success) {
        setSuccess('Código de verificación reenviado. Revisa tu correo.');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error('Error reenviando código:', err);
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
              <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Verificar Email</h2>
              <p className="text-sm text-blue-100">Ingresa el código de verificación</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              {success}
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-2">
              Hemos enviado un código de verificación de 6 dígitos a:
            </p>
            <p className="text-gray-900 font-semibold">{email}</p>
            <p className="text-gray-500 text-xs mt-2">
              El código expira en 15 minutos
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError('');
                }}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resending ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRedo} />
                    Reenviar código
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Verificar
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Si no recibes el código, verifica tu carpeta de spam o solicita un nuevo código.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;

