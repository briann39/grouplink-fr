import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faPaperPlane,
  faCreditCard,
  faStore,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faDownload,
  faShare,
  faCopy,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { transactionService } from '../services/transactionService';

const TransactionDetailModal = ({ isOpen, onClose, transactionId, userType }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      loadTransaction();
    }
  }, [isOpen, transactionId]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await transactionService.getTransaction(transactionId);
      if (response.success) {
        setTransaction(response.transaction);
      } else {
        setError('No se pudo cargar la transacción');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type, direction) => {
    if (type === 'WITHDRAW') return faArrowUp;
    if (type === 'DEPOSIT') return faStore; // Icono de tienda para recargas
    if (type === 'SEND') return faPaperPlane; // Icono de avión para transferencias
    if (type === 'PURCHASE') return faCreditCard;
    return faStore;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { icon: faCheckCircle, color: 'text-green-500', bg: 'bg-green-50', text: 'Completada' };
      case 'FAILED':
        return { icon: faTimesCircle, color: 'text-red-500', bg: 'bg-red-50', text: 'Fallida' };
      case 'PENDING':
        return { icon: faClock, color: 'text-yellow-500', bg: 'bg-yellow-50', text: 'Pendiente' };
      default:
        return { icon: faClock, color: 'text-gray-500', bg: 'bg-gray-50', text: 'Desconocido' };
    }
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      SEND: 'Transferencia entre Usuarios',
      WITHDRAW: 'Retiro',
      DEPOSIT: 'Recarga desde Comercio',
      PURCHASE: 'Compra',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadPDF = () => {
    if (!transaction) return;

    // Crear contenido HTML para el PDF
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Comprobante de Transacción - LocalPay</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              padding: 40px;
              color: #03111b;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #6366f1;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              background: linear-gradient(135deg, #6366f1, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .info-section {
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
            }
            .info-value {
              color: #03111b;
              font-weight: 500;
            }
            .amount {
              font-size: 32px;
              font-weight: 700;
              text-align: center;
              padding: 30px;
              margin: 30px 0;
              border-radius: 12px;
              background: ${transaction.direction === 'outgoing' ? '#fef2f2' : '#f0fdf4'};
              color: ${transaction.direction === 'outgoing' ? '#dc2626' : '#16a34a'};
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LocalPay</h1>
            <p>Comprobante de Transacción</p>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Tipo de Transacción:</span>
              <span class="info-value">${getTransactionTypeLabel(transaction.type)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <span class="info-value">${getStatusInfo(transaction.status).text}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha y Hora:</span>
              <span class="info-value">${formatDate(transaction.createdAt)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID de Transacción:</span>
              <span class="info-value">${transaction.id}</span>
            </div>
            ${transaction.description ? `
            <div class="info-row">
              <span class="info-label">Descripción:</span>
              <span class="info-value">${transaction.description}</span>
            </div>
            ` : ''}
            ${transaction.otherParty ? `
            <div class="info-row">
              <span class="info-label">${transaction.direction === 'outgoing' ? 'Destinatario' : 'Remitente'}:</span>
              <span class="info-value">${transaction.otherParty.fullName || transaction.otherParty.businessName || 'N/A'}</span>
            </div>
            ${transaction.otherParty.cbu ? `
            <div class="info-row">
              <span class="info-label">CBU:</span>
              <span class="info-value">${transaction.otherParty.cbu}</span>
            </div>
            ` : ''}
            ` : ''}
            ${transaction.commissionAmount ? `
            <div class="info-row">
              <span class="info-label">Comisión:</span>
              <span class="info-value">$${parseFloat(transaction.commissionAmount).toFixed(2)} ${transaction.currency || 'USD'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto Neto:</span>
              <span class="info-value">$${parseFloat(transaction.netAmount || transaction.amount).toFixed(2)} ${transaction.currency || 'USD'}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="amount">
            ${transaction.direction === 'outgoing' ? '-' : '+'}$${parseFloat(transaction.amount).toFixed(2)} ${transaction.currency || 'USD'}
          </div>
          
          <div class="footer">
            <p>Este es un comprobante generado automáticamente por LocalPay</p>
            <p>Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </body>
      </html>
    `;

    // Crear ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Esperar a que se cargue y luego imprimir/guardar como PDF
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const shareTransaction = async () => {
    if (!transaction) return;

    const shareText = `Transacción LocalPay\n\n` +
      `Tipo: ${getTransactionTypeLabel(transaction.type)}\n` +
      `Monto: ${transaction.direction === 'outgoing' ? '-' : '+'}$${parseFloat(transaction.amount).toFixed(2)} ${transaction.currency || 'USD'}\n` +
      `Estado: ${getStatusInfo(transaction.status).text}\n` +
      `Fecha: ${formatDate(transaction.createdAt)}\n` +
      `ID: ${transaction.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprobante LocalPay',
          text: shareText,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando transacción...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <FontAwesomeIcon icon={faTimesCircle} className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la transacción'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(transaction.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de Transacción</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPDF}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Descargar PDF"
            >
              <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
            </button>
            <button
              onClick={shareTransaction}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Compartir"
            >
              <FontAwesomeIcon icon={faShare} className="w-5 h-5" />
            </button>
            {copied && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                Copiado
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Display */}
          <div className={`text-center py-8 rounded-2xl ${
            transaction.type === 'SEND'
              ? transaction.direction === 'outgoing' ? 'bg-blue-50' : 'bg-blue-100'
              : transaction.type === 'DEPOSIT'
              ? 'bg-purple-50'
              : transaction.direction === 'outgoing' ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <FontAwesomeIcon
                icon={getTransactionIcon(transaction.type, transaction.direction)}
                className={`w-8 h-8 ${
                  transaction.type === 'SEND'
                    ? transaction.direction === 'outgoing' ? 'text-blue-600' : 'text-blue-500'
                    : transaction.type === 'DEPOSIT'
                    ? 'text-purple-600'
                    : transaction.direction === 'outgoing' ? 'text-red-600' : 'text-green-600'
                }`}
              />
              <span className={`text-4xl font-bold ${
                transaction.type === 'SEND'
                  ? transaction.direction === 'outgoing' ? 'text-blue-600' : 'text-blue-500'
                  : transaction.type === 'DEPOSIT'
                  ? 'text-purple-600'
                  : transaction.direction === 'outgoing' ? 'text-red-600' : 'text-green-600'
              }`}>
                {transaction.direction === 'outgoing' ? '-' : '+'}
                ${parseFloat(transaction.amount).toFixed(2)} {transaction.currency || 'USD'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                transaction.type === 'SEND'
                  ? 'bg-blue-100 text-blue-700'
                  : transaction.type === 'DEPOSIT'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {transaction.type === 'SEND' ? '💸 Transferencia' : transaction.type === 'DEPOSIT' ? '🏪 Recarga de Comercio' : ''}
              </span>
              <p className="text-gray-600 font-medium">{getTransactionTypeLabel(transaction.type)}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${statusInfo.bg}`}>
            <FontAwesomeIcon icon={statusInfo.icon} className={`w-5 h-5 ${statusInfo.color}`} />
            <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
              Información de la Transacción
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">ID de Transacción</span>
                <span className="text-sm font-mono text-gray-900">{transaction.id}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Fecha y Hora</span>
                <span className="text-sm text-gray-900">{formatDate(transaction.createdAt)}</span>
              </div>

              {transaction.description && (
                <div className="flex justify-between items-start py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Descripción</span>
                  <span className="text-sm text-gray-900 text-right max-w-xs">{transaction.description}</span>
                </div>
              )}

              {transaction.otherParty && (
                <>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {transaction.direction === 'outgoing' ? 'Destinatario' : 'Remitente'}
                    </span>
                    <span className="text-sm text-gray-900">
                      {transaction.otherParty.fullName || transaction.otherParty.businessName || 'N/A'}
                    </span>
                  </div>

                  {transaction.otherParty.cbu && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">CBU</span>
                      <span className="text-sm font-mono text-gray-900">{transaction.otherParty.cbu}</span>
                    </div>
                  )}

                  {transaction.otherParty.businessName && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Comercio</span>
                      <span className="text-sm text-gray-900">{transaction.otherParty.businessName}</span>
                    </div>
                  )}
                </>
              )}

              {transaction.commissionAmount && (
                <>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Comisión</span>
                    <span className="text-sm text-gray-900">
                      ${parseFloat(transaction.commissionAmount).toFixed(2)} {transaction.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Monto Neto</span>
                    <span className="text-sm text-gray-900">
                      ${parseFloat(transaction.netAmount || transaction.amount).toFixed(2)} {transaction.currency || 'USD'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-center text-gray-500">
            Este comprobante fue generado automáticamente por LocalPay
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;

