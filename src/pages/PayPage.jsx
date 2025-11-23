import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { transactionService } from '../services/transactionService';
import { authService } from '../services/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDollarSign, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const PayPage = () => {
  const [searchParams] = useSearchParams();
  const cbu = searchParams.get('cbu');
  const navigate = useNavigate();
  
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: verificar CBU, 2: ingresar monto, 3: confirmar, 4: procesando

  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (cbu) {
      verifyCBU();
    } else {
      setError('CBU no proporcionado');
      setVerifying(false);
    }
  }, [cbu]);

  const verifyCBU = async () => {
    try {
      setVerifying(true);
      setError('');
      
      if (!cbu || !/^\d{22}$/.test(cbu)) {
        throw new Error('CBU inválido');
      }

      // Si está autenticado, usar el servicio protegido
      if (isAuthenticated) {
        const response = await userService.verifyCBU(cbu);
        if (response.success) {
          setRecipientInfo(response.user);
          setStep(2);
        }
      } else {
        // Si no está autenticado, mostrar información básica y pedir login
        setRecipientInfo({ cbu, needsAuth: true });
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'CBU no encontrado o inválido');
    } finally {
      setVerifying(false);
    }
  };

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      // Redirigir a login con el CBU en la URL
      navigate(`/login?redirect=/pay?cbu=${cbu}`);
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    // Verificar balance del usuario
    if (currentUser && parseFloat(currentUser.balance) < amountNum) {
      setError('Saldo insuficiente');
      return;
    }

    // Verificar CBU nuevamente para obtener información actualizada
    try {
      const verifyResponse = await userService.verifyCBU(cbu);
      if (verifyResponse.success) {
        setRecipientInfo(verifyResponse.user);
        setStep(3); // Ir a confirmación
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar CBU');
    }
  };

  const handleConfirmPayment = async () => {
    setStep(4);
    setLoading(true);
    setError('');

    try {
      const response = await transactionService.sendMoney(
        cbu,
        parseFloat(amount),
        description.trim() || `Pago a ${recipientInfo?.fullName || 'usuario'}`
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          if (currentUser) {
            navigate('/dashboard/user');
          } else {
            navigate('/login');
          }
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el pago');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Verificando CBU...</p>
        </div>
      </div>
    );
  }

  if (error && !recipientInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <FontAwesomeIcon icon={faTimesCircle} className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <FontAwesomeIcon icon={faCheckCircle} className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Has enviado ${parseFloat(amount).toFixed(2)} a {recipientInfo?.fullName || 'el usuario'}
          </p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LocalPay</h1>
          <p className="text-gray-600">Realizar Pago</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Información del destinatario */}
          {recipientInfo && !recipientInfo.needsAuth && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-3">Destinatario:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-semibold">{recipientInfo.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CBU:</span>
                  <span className="font-semibold font-mono">{recipientInfo.cbu}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Paso 2: Ingresar monto */}
          {step === 2 && (
            <>
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Inicio de sesión requerido</p>
                    <p className="text-xs text-yellow-700">
                      Necesitas iniciar sesión para realizar un pago
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Link
                      to={`/login?redirect=/pay?cbu=${cbu}`}
                      className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to={`/register?redirect=/pay?cbu=${cbu}`}
                      className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center"
                    >
                      Crear Cuenta
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAmountSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Monto a Pagar (USD) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faDollarSign} className="text-gray-400" />
                      </div>
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    {currentUser && (
                      <p className="text-xs text-gray-500 mt-1">
                        Saldo disponible: ${parseFloat(currentUser.balance || 0).toFixed(2)} USD
                      </p>
                    )}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Descripción del pago"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Continuar
                  </button>
                </form>
              )}
            </>
          )}

          {/* Paso 3: Confirmar */}
          {step === 3 && recipientInfo && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-semibold mb-3">Confirmar Pago:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destinatario:</span>
                    <span className="font-semibold">{recipientInfo.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold text-green-600">
                      ${parseFloat(amount).toFixed(2)} USD
                    </span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descripción:</span>
                      <span className="font-semibold text-right max-w-xs truncate">{description}</span>
                    </div>
                  )}
                  {currentUser && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tu nuevo balance:</span>
                      <span className="font-semibold">
                        ${(parseFloat(currentUser.balance || 0) - parseFloat(amount)).toFixed(2)} USD
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Confirmar y Pagar
                </button>
              </div>
            </div>
          )}

          {/* Paso 4: Procesando */}
          {step === 4 && (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-900">Procesando pago...</p>
              <p className="text-sm text-gray-600 mt-2">Por favor espere</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayPage;

