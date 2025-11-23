import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faPaperPlane,
  faCreditCard,
  faStore,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';

const TransactionsHistoryModal = ({ isOpen, onClose, userType, onTransactionClick, inline = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen]);

  const loadTransactions = async (reset = false) => {
    try {
      setLoading(true);
      setError('');
      const currentOffset = reset ? 0 : offset;
      // Usar la ruta correcta según el tipo de usuario
      const response = userType === 'store' 
        ? await transactionService.getStoreTransactions(limit, currentOffset)
        : await transactionService.getTransactions(limit, currentOffset);
      
      if (response.success) {
        if (reset) {
          setTransactions(response.transactions);
        } else {
          setTransactions([...transactions, ...response.transactions]);
        }
        setOffset(currentOffset + response.transactions.length);
        setHasMore(response.pagination?.hasMore || false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setOffset(0);
    loadTransactions(true);
  };

  const getTransactionIcon = (type, direction) => {
    if (type === 'WITHDRAW') {
      return faArrowUp;
    }
    if (type === 'DEPOSIT') {
      return faStore; // Icono de tienda para recargas
    }
    if (type === 'SEND') {
      return faPaperPlane; // Icono de avión para transferencias
    }
    if (type === 'PURCHASE') {
      return faCreditCard;
    }
    return faStore;
  };

  const getTransactionColor = (direction, status) => {
    if (status !== 'SUCCESS') {
      return 'text-gray-500';
    }
    return direction === 'outgoing' ? 'text-red-600' : 'text-green-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'FAILED':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      case 'PENDING':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  const content = (
    <div className={`${inline ? 'bg-transparent' : 'bg-white'} ${inline ? '' : 'rounded-lg shadow-xl'} max-w-4xl w-full ${inline ? '' : 'max-h-[90vh]'} overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Historial de Transacciones</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Actualizar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading && transactions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faHistory} className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay transacciones</p>
              <p className="text-gray-400 text-sm mt-2">Tus transacciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => onTransactionClick && onTransactionClick(transaction.id)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className={`rounded-lg p-3 ${
                        transaction.type === 'SEND'
                          ? transaction.direction === 'outgoing' ? 'bg-blue-100' : 'bg-blue-50'
                          : transaction.type === 'DEPOSIT'
                          ? 'bg-purple-100'
                          : transaction.direction === 'outgoing' ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                        <FontAwesomeIcon
                          icon={getTransactionIcon(transaction.type, transaction.direction)}
                          className={`w-5 h-5 ${
                            transaction.type === 'SEND'
                              ? transaction.direction === 'outgoing' ? 'text-blue-600' : 'text-blue-500'
                              : transaction.type === 'DEPOSIT'
                              ? 'text-purple-600'
                              : transaction.direction === 'outgoing' ? 'text-red-600' : 'text-green-600'
                          }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {/* Badge de tipo de transacción */}
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            transaction.type === 'SEND' 
                              ? 'bg-blue-100 text-blue-700' 
                              : transaction.type === 'DEPOSIT'
                              ? 'bg-purple-100 text-purple-700'
                              : transaction.type === 'WITHDRAW'
                              ? 'bg-orange-100 text-orange-700'
                              : transaction.type === 'PURCHASE'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {transaction.type === 'SEND' 
                              ? '💸 Transferencia' 
                              : transaction.type === 'DEPOSIT'
                              ? '🏪 Recarga de Comercio'
                              : transaction.type === 'WITHDRAW'
                              ? '💰 Retiro'
                              : transaction.type === 'PURCHASE'
                              ? '🛒 Compra'
                              : transaction.type}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {transaction.type === 'SEND' && transaction.direction === 'outgoing'
                              ? `Enviado a ${transaction.otherParty?.fullName || 'Usuario'}`
                              : transaction.type === 'SEND' && transaction.direction === 'incoming'
                              ? `Recibido de ${transaction.otherParty?.fullName || 'Usuario'}`
                              : transaction.type === 'WITHDRAW'
                              ? transaction.otherParty?.businessName
                                ? `Retiro en ${transaction.otherParty.businessName}`
                                : 'Retiro de dinero'
                              : transaction.type === 'DEPOSIT'
                              ? transaction.otherParty?.businessName
                                ? `Recarga desde ${transaction.otherParty.businessName}`
                                : 'Recarga desde comercio'
                              : transaction.type === 'PURCHASE'
                              ? `Compra en ${transaction.otherParty?.businessName || 'Tienda'}`
                              : transaction.type}
                          </p>
                          {getStatusIcon(transaction.status)}
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mb-1">{transaction.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap mt-1">
                          <span>{formatDate(transaction.createdAt)}</span>
                          {/* Mostrar CBU para transferencias (SEND) */}
                          {transaction.type === 'SEND' && transaction.otherParty?.cbu && (
                            <span className="font-mono bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                              {transaction.direction === 'outgoing' ? '→ CBU' : '← CBU'}: {transaction.otherParty.cbu}
                            </span>
                          )}
                          {/* Mostrar comercio para recargas (DEPOSIT) */}
                          {transaction.type === 'DEPOSIT' && transaction.otherParty?.businessName && (
                            <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                              🏪 {transaction.otherParty.businessName}
                            </span>
                          )}
                          {/* Mostrar comercio para retiros (WITHDRAW) */}
                          {transaction.type === 'WITHDRAW' && transaction.otherParty?.businessName && (
                            <span className="font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                              📍 {transaction.otherParty.businessName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getTransactionColor(transaction.direction, transaction.status)}`}>
                          {transaction.direction === 'outgoing' ? '-' : '+'}
                          ${parseFloat(transaction.amount).toFixed(2)} {transaction.currency}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {transaction.status === 'SUCCESS' ? 'Completada' : 
                           transaction.status === 'PENDING' ? 'Pendiente' : 'Fallida'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadTransactions()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cargar más
              </button>
            </div>
          )}

          {loading && transactions.length > 0 && (
            <div className="mt-6 text-center">
              <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          )}
        </div>
      </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {content}
    </div>
  );
};

export default TransactionsHistoryModal;

