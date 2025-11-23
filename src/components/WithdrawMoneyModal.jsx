import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { withdrawalService } from '../services/withdrawalService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';

const WithdrawMoneyModal = ({ isOpen, onClose, onSuccess, userBalance }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [withdrawalCode, setWithdrawalCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!withdrawalCode) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(withdrawalCode.expiresAt);
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('Expirado');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [withdrawalCode]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('El monto debe ser un número positivo');
      setLoading(false);
      return;
    }

    // Verificar que el usuario tenga suficiente balance (monto + comisión de 1 USD)
    const currentBalance = parseFloat(userBalance || 0);
    const totalRequired = amountNum + 1.00; // Monto + comisión fija
    if (currentBalance < totalRequired) {
      setError(`Saldo insuficiente. Se requiere ${totalRequired.toFixed(2)} USD (${amountNum.toFixed(2)} + 1.00 de comisión)`);
      setLoading(false);
      return;
    }

    try {
      const response = await withdrawalService.generateWithdrawalCode(amountNum);
      if (response.success) {
        setWithdrawalCode(response.withdrawalCode);
        setAmount('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar código de retiro');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (withdrawalCode?.code) {
      navigator.clipboard.writeText(withdrawalCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setWithdrawalCode(null);
    setAmount('');
    setError('');
    setCopied(false);
    setTimeLeft(null);
    onClose();
  };

  const handleNewCode = () => {
    setWithdrawalCode(null);
    setAmount('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Retirar Dinero</h2>
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

          {!withdrawalCode ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Retirar (USD) *
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={userBalance || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saldo disponible: ${parseFloat(userBalance || 0).toFixed(2)} USD
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El código generado expirará en 15 minutos. Muéstralo o escanéalo en el comercio para retirar el dinero.
                </p>
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
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generando...' : 'Generar Código'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-800 font-semibold mb-2">✅ Código de Retiro Generado</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faClock} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Expira en: {timeLeft || 'Calculando...'}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={withdrawalCode.code}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Código numérico */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-2 text-center">Código de Retiro</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-mono font-bold text-gray-900">{withdrawalCode.code}</p>
                  <button
                    onClick={copyCode}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                    title="Copiar código"
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-600" : ""} />
                  </button>
                </div>
              </div>

              {/* Información */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto a retirar:</span>
                    <span className="font-semibold text-gray-900">
                      ${parseFloat(withdrawalCode.amount).toFixed(2)} {withdrawalCode.currency}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                    <span className="text-gray-600">Comisión (25% para tienda, 75% para empresa):</span>
                    <span className="font-semibold text-orange-600">
                      +$1.00 {withdrawalCode.currency}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                    <span className="text-gray-700 font-medium">Total a descontar de tu cuenta:</span>
                    <span className="font-semibold text-red-600">
                      -${(parseFloat(withdrawalCode.amount) + 1.00).toFixed(2)} {withdrawalCode.currency}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-green-600">Activo</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800">
                  <strong>Instrucciones:</strong> Muestra el código QR o el número al comerciante para retirar el dinero. El código expirará en 15 minutos.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleNewCode}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Generar Nuevo Código
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawMoneyModal;

