import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faQrcode, faWallet } from '@fortawesome/free-solid-svg-icons';

const ReceivePaymentModal = ({ isOpen, onClose, userCbu, userName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCBU = () => {
    if (userCbu) {
      navigator.clipboard.writeText(userCbu);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generar URL para pagar con el CBU
  const baseUrl = window.location.origin;
  const qrValue = userCbu ? `${baseUrl}/pay?cbu=${userCbu}` : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recibir Pago</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!userCbu ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faWallet} className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontró tu CBU</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información del usuario */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-2">Tu información</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-semibold">{userName || 'Usuario'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CBU:</span>
                    <span className="font-semibold font-mono">{userCbu}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center">
                <div className="mb-4">
                  <FontAwesomeIcon icon={faQrcode} className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 text-center">Escanea para pagar</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <QRCodeSVG
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Escanea este código QR para pagar directamente
                </p>
              </div>

              {/* CBU numérico */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-3 text-center">Tu CBU</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-mono font-bold text-gray-900">{userCbu}</p>
                  <button
                    onClick={copyCBU}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                    title="Copiar CBU"
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-600 w-5 h-5" : "w-5 h-5"} />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 text-center mt-2">✓ CBU copiado</p>
                )}
              </div>

              {/* Instrucciones */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800 font-semibold mb-2">📋 Instrucciones:</p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Comparte tu CBU o código QR con quien te va a pagar</li>
                  <li>El pagador debe usar tu CBU para enviarte dinero</li>
                  <li>El dinero llegará automáticamente a tu cuenta</li>
                  <li>Puedes verificar el pago en tu historial de transacciones</li>
                </ul>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivePaymentModal;

