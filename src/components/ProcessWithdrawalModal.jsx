import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { withdrawalService } from '../services/withdrawalService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faKeyboard, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const ProcessWithdrawalModal = ({ isOpen, onClose, onSuccess, storeBalance }) => {
  const [mode, setMode] = useState('code'); // 'code' o 'scan'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeInfo, setCodeInfo] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const qrCodeRegionId = 'qr-reader';

  useEffect(() => {
    if (!isOpen) {
      // Limpiar cuando se cierra el modal
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      setScanning(false);
      setCode('');
      setCodeInfo(null);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCodeInput = async (e) => {
    e.preventDefault();
    setError('');
    setCodeInfo(null);
    setLoading(true);

    if (!code.trim()) {
      setError('Por favor ingresa un código');
      setLoading(false);
      return;
    }

    try {
      const response = await withdrawalService.getWithdrawalCodeInfo(code.trim());
      if (response.success) {
        setCodeInfo(response.withdrawalCode);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido o expirado');
      setCodeInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!code.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await withdrawalService.processWithdrawal(code.trim());
      if (response.success) {
        setTimeout(() => {
          onSuccess(response);
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el retiro');
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Código escaneado exitosamente
          setCode(decodedText);
          html5QrCode.stop();
          setScanning(false);
          scannerRef.current = null;
          // Obtener información del código
          withdrawalService.getWithdrawalCodeInfo(decodedText)
            .then((response) => {
              if (response.success) {
                setCodeInfo(response.withdrawalCode);
              }
            })
            .catch((err) => {
              setError(err.response?.data?.message || 'Código inválido o expirado');
            });
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (err) {
      setError('Error al iniciar la cámara. Verifica los permisos.');
      setScanning(false);
      scannerRef.current = null;
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Ignorar errores al detener
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    setCode('');
    setCodeInfo(null);
    setError('');
    setMode('code');
    onClose();
  };

  const handleModeChange = (newMode) => {
    if (scanning) {
      stopScanning();
    }
    setMode(newMode);
    setCode('');
    setCodeInfo(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Procesar Retiro</h2>
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

          {/* Tabs para modo */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => handleModeChange('code')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition ${
                mode === 'code'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={faKeyboard} className="mr-2" />
              Ingresar Código
            </button>
            <button
              onClick={() => handleModeChange('scan')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition ${
                mode === 'scan'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={faQrcode} className="mr-2" />
              Escanear QR
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Modo: Ingresar código */}
          {mode === 'code' && (
            <div className="space-y-4">
              <form onSubmit={handleCodeInput} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Retiro *
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ''));
                      setCodeInfo(null);
                      setError('');
                    }}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl font-mono"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
              </form>
            </div>
          )}

          {/* Modo: Escanear QR */}
          {mode === 'scan' && (
            <div className="space-y-4">
              {!scanning ? (
                <div className="text-center">
                  <button
                    onClick={startScanning}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faQrcode} />
                    Iniciar Escáner
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div id={qrCodeRegionId} className="w-full rounded-lg overflow-hidden"></div>
                  <button
                    onClick={stopScanning}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Detener Escáner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Información del código */}
          {codeInfo && (
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-3">Información del Retiro:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código:</span>
                    <span className="font-semibold font-mono">{codeInfo.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold text-gray-900">
                      ${parseFloat(codeInfo.amount).toFixed(2)} {codeInfo.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuario:</span>
                    <span className="font-semibold">{codeInfo.user.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-semibold ${
                      codeInfo.status === 'PENDING' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {codeInfo.status === 'PENDING' ? 'Válido' : codeInfo.status}
                    </span>
                  </div>
                </div>
              </div>

              {codeInfo.status === 'PENDING' && (
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      <span>Procesar Retiro</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessWithdrawalModal;

