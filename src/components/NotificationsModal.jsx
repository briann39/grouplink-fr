import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faTimes,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTrash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

const NotificationsModal = ({ isOpen, onClose, notifications, onMarkAsRead, onDeleteNotification, onMarkAllAsRead, onClearAll }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'info':
      default:
        return faInfoCircle;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-blue-500';
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
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
              <FontAwesomeIcon icon={faBell} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notificaciones</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-blue-100">
                  {unreadCount} no leída{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition"
                title="Marcar todas como leídas"
              >
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-1" />
                Marcar todas
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition"
                title="Limpiar todas"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-1" />
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            No leídas ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Leídas ({notifications.filter(n => n.read).length})
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faBell}
                className="w-16 h-16 text-gray-300 mb-4"
              />
              <p className="text-gray-500 text-lg font-medium">
                {filter === 'unread'
                  ? 'No hay notificaciones no leídas'
                  : filter === 'read'
                  ? 'No hay notificaciones leídas'
                  : 'No hay notificaciones'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Las notificaciones aparecerán aquí cuando ocurran eventos importantes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white border rounded-lg p-4 transition hover:shadow-md ${
                    notification.read
                      ? 'border-gray-200 opacity-75'
                      : 'border-blue-200 bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 mt-1 ${getIconColor(
                        notification.type
                      )}`}
                    >
                      <FontAwesomeIcon
                        icon={getIcon(notification.type)}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              notification.read
                                ? 'text-gray-700'
                                : 'text-gray-900'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Marcar como leída"
                        >
                          <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;

