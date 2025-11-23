import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faIdCard,
  faCheckCircle,
  faTimes,
  faCopy,
  faCheck,
  faCalendar,
  faPaperPlane,
  faShare,
  faQrcode,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { userService } from '../services/userService';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';

const ProfileViewModal = ({ isOpen, onClose, userId, userData, onSendMoney, onShare }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const currentUser = authService.getCurrentUser();
  const isOwnProfile = userId === currentUser?.id || (userData && userData.id === currentUser?.id);
  
  // Detectar si es tienda basándose en el perfil cargado o userData
  const isStore = profile?.type === 'store' || profile?.businessName || userData?.type === 'store' || userData?.businessName;

  useEffect(() => {
    if (isOpen) {
      if (userData) {
        setProfile(userData);
      } else if (userId) {
        // Detectar si userId es de una tienda o usuario basándose en el contexto
        // Por ahora intentamos cargar como usuario primero
        loadProfile();
      } else {
        // Si no hay userId ni userData, cargar perfil propio
        loadOwnProfile();
      }
    } else {
      // Limpiar cuando se cierra
      setProfile(null);
      setError('');
    }
  }, [isOpen, userId, userData]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      // Intentar primero como usuario, si falla intentar como tienda
      try {
        const response = await userService.getUserById(userId);
        if (response.success) {
          setProfile({ ...response.user, type: 'user' });
          return;
        }
      } catch (userErr) {
        // Si no es usuario, intentar como tienda
        try {
          const response = await storeService.getStoreById(userId);
          if (response.success) {
            setProfile({ ...response.store, type: 'store' });
            return;
          }
        } catch (storeErr) {
          throw userErr; // Lanzar el error original
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadOwnProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const userType = authService.getCurrentUser()?.businessName ? 'store' : 'user';
      if (userType === 'store') {
        const response = await storeService.getProfile();
        if (response.success) {
          setProfile({ ...response.store, type: 'store' });
        }
      } else {
        const response = await userService.getProfile();
        if (response.success) {
          setProfile({ ...response.user, type: 'user' });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${profile?.id || userId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${isStore ? profile?.businessName : profile?.fullName} - LocalPay`,
        text: `Mira el perfil de ${isStore ? profile?.businessName : profile?.fullName} en LocalPay`,
        url: profileUrl,
      }).catch(() => {
        // Si falla, copiar al portapapeles
        copyShareLink(profileUrl);
      });
    } else {
      copyShareLink(profileUrl);
    }
  };

  const copyShareLink = (url) => {
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSendMoney = () => {
    if (onSendMoney && profile && !isStore && profile.cbu) {
      onSendMoney(profile.cbu, profile.fullName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
              <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isStore ? 'Perfil de Comercio' : 'Perfil de Usuario'}
              </h2>
              {isOwnProfile && (
                <p className="text-sm text-blue-100">Tu perfil</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando perfil...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {profile && !loading && (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className={`bg-gradient-to-br rounded-xl p-6 border ${
                isStore 
                  ? 'from-green-50 to-emerald-50 border-green-100' 
                  : 'from-blue-50 to-indigo-50 border-blue-100'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`rounded-full p-4 ${
                    isStore ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {isStore ? profile.businessName : profile.fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        profile.accountStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.accountStatus === 'ACTIVE' ? 'Activo' : profile.accountStatus}
                      </span>
                      {profile.verificationLevel && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {profile.verificationLevel}
                        </span>
                      )}
                      {isStore && profile.isVerified && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del Perfil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">Email</label>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-medium break-all">{profile.email}</p>
                    <button
                      onClick={() => copyToClipboard(profile.email)}
                      className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition"
                      title="Copiar email"
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-green-600' : ''} />
                    </button>
                  </div>
                </div>

                {/* CBU (solo para usuarios) */}
                {!isStore && profile.cbu && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faIdCard} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">CBU</label>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-mono text-sm break-all">{profile.cbu}</p>
                      <button
                        onClick={() => copyToClipboard(profile.cbu)}
                        className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Copiar CBU"
                      >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-green-600' : ''} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Ciudad (solo para tiendas) */}
                {isStore && profile.city && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">Ciudad</label>
                    </div>
                    <p className="text-gray-900 font-medium">{profile.city}</p>
                  </div>
                )}

                {/* Tipo de Negocio (solo para tiendas) */}
                {isStore && profile.businessType && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faIdCard} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">Tipo de Negocio</label>
                    </div>
                    <p className="text-gray-900 font-medium">{profile.businessType}</p>
                  </div>
                )}

                {/* Teléfono */}
                {profile.phone && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    </div>
                    <p className="text-gray-900 font-medium">{profile.phone}</p>
                  </div>
                )}

                {/* País */}
                {profile.country && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">País</label>
                    </div>
                    <p className="text-gray-900 font-medium">{profile.country}</p>
                  </div>
                )}

                {/* Ciudad y País juntos (solo para tiendas si no están separados) */}
                {isStore && profile.city && profile.country && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">Ubicación</label>
                    </div>
                    <p className="text-gray-900 font-medium">{profile.city}, {profile.country}</p>
                  </div>
                )}

                {/* ID */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faIdCard} className="w-5 h-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      {isStore ? 'ID de Comercio' : 'ID de Usuario'}
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-mono text-xs break-all">{profile.id}</p>
                    <button
                      onClick={() => copyToClipboard(profile.id)}
                      className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition"
                      title="Copiar ID"
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-green-600' : ''} />
                    </button>
                  </div>
                </div>

                {/* Fecha de Registro */}
                {profile.createdAt && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                    </div>
                    <p className="text-gray-900 font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                )}
              </div>

              {/* Información Adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Esta es la información pública del perfil. Algunos datos pueden estar ocultos por privacidad.
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {/* Enviar Dinero (solo para usuarios, no propio perfil) */}
                {!isOwnProfile && !isStore && profile?.cbu && currentUser && (
                  <button
                    onClick={handleSendMoney}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Enviar Dinero</span>
                  </button>
                )}

                {/* Compartir Perfil */}
                {profile && (
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FontAwesomeIcon icon={shareCopied ? faCheck : faShare} />
                    <span>{shareCopied ? '¡Copiado!' : 'Compartir'}</span>
                  </button>
                )}

                {/* Ver Mi QR (solo para perfil propio) */}
                {isOwnProfile && currentUser && (
                  <button
                    onClick={() => {
                      // Esto se manejará desde el Dashboard
                      if (onShare) {
                        onShare('qr');
                      }
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <FontAwesomeIcon icon={faQrcode} />
                    <span>Ver Mi QR</span>
                  </button>
                )}

                {/* Agregar a Contactos (futuro) */}
                {!isOwnProfile && (
                  <button
                    onClick={() => {
                      // TODO: Implementar agregar a contactos
                      alert('Función de contactos próximamente');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Agregar Contacto</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;

