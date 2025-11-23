import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faQrcode, faDownload } from '@fortawesome/free-solid-svg-icons';

const MyQRCodeModal = ({ isOpen, onClose, user, userType }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generar URL para pagar con el CBU
  const baseUrl = window.location.origin;
  let qrValue = '';
  let displayText = '';
  let displayLabel = '';

  if (userType === 'user' && user?.cbu) {
    qrValue = `${baseUrl}/pay?cbu=${user.cbu}`;
    displayText = user.cbu;
    displayLabel = 'Tu CBU';
  } else if (userType === 'store' && user?.cbu) {
    // Para stores también usamos el CBU si está disponible
    qrValue = `${baseUrl}/pay?cbu=${user.cbu}`;
    displayText = user.cbu;
    displayLabel = 'CBU de la Tienda';
  } else if (userType === 'store' && user?.id) {
    // Si no hay CBU, usar el ID de la tienda
    qrValue = `${baseUrl}/pay?store=${user.id}`;
    displayText = user.id;
    displayLabel = 'ID de la Tienda';
  }

  const downloadQR = () => {
    try {
      const svg = document.querySelector('#qr-code-svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const link = document.createElement('a');
      link.download = `qr-code-${userType}-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar QR:', error);
      // Fallback: copiar el texto del QR
      copyToClipboard(qrValue);
      alert('No se pudo descargar la imagen. El código QR se ha copiado al portapapeles.');
    }
  };

  if (!qrValue) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi Código QR</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faQrcode} className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontró información para generar el código QR</p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mi Código QR</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Información del usuario/tienda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                {userType === 'user' ? 'Tu información' : 'Información de la Tienda'}
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {userType === 'user' ? 'Nombre:' : 'Tienda:'}
                  </span>
                  <span className="font-semibold">
                    {userType === 'user' ? user?.fullName : user?.businessName}
                  </span>
                </div>
                {displayText && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{displayLabel}:</span>
                    <span className="font-semibold font-mono text-xs">{displayText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center">
              <div className="mb-4">
                <FontAwesomeIcon icon={faQrcode} className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 text-center">
                  Escanea para pagar
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Comparte este código QR para recibir pagos
              </p>
            </div>

            {/* Código/ID para copiar */}
            {displayText && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-3 text-center">{displayLabel}</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-lg sm:text-xl font-mono font-bold text-gray-900 break-all">
                    {displayText}
                  </p>
                  <button
                    onClick={() => copyToClipboard(displayText)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition shrink-0"
                    title="Copiar"
                  >
                    <FontAwesomeIcon
                      icon={copied ? faCheck : faCopy}
                      className={copied ? 'text-green-600 w-5 h-5' : 'w-5 h-5'}
                    />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 text-center mt-2">✓ Copiado al portapapeles</p>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={downloadQR}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Descargar QR</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800 font-semibold mb-2">📋 Instrucciones:</p>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>Comparte tu código QR con quien te va a pagar</li>
                <li>El pagador puede escanear el código o usar tu {displayLabel.toLowerCase()}</li>
                <li>El dinero llegará automáticamente a tu cuenta</li>
                <li>Puedes verificar el pago en tu historial de transacciones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyQRCodeModal;

