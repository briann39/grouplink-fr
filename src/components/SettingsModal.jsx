import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faUser,
  faEnvelope,
  faLock,
  faCheck,
  faTimes,
  faSpinner,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { userService } from '../services/userService';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';

const SettingsModal = ({ isOpen, onClose, userType, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para perfil
  const [profileData, setProfileData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    country: '',
    city: '',
    businessType: '',
  });

  // Estados para email
  const [emailData, setEmailData] = useState({
    email: '',
    password: '',
  });

  // Estados para contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados para privacidad
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: true,
    showCountry: true,
    showCity: true,
    profileVisibility: 'public', // 'public', 'private', 'contacts'
  });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const service = userType === 'user' ? userService : storeService;
      const response = await service.getProfile();
      
      if (response.success) {
        const data = userType === 'user' ? response.user : response.store;
        if (userType === 'user') {
          setProfileData({
            fullName: data.fullName || '',
            phone: data.phone || '',
            country: data.country || '',
          });
          setEmailData({ email: data.email || '', password: '' });
          setPrivacySettings(data.privacySettings || {
            showEmail: true,
            showPhone: true,
            showCountry: true,
            profileVisibility: 'public',
          });
        } else {
          setProfileData({
            businessName: data.businessName || '',
            phone: data.phone || '',
            city: data.city || '',
            country: data.country || '',
            businessType: data.businessType || '',
          });
          setEmailData({ email: data.email || '', password: '' });
          setPrivacySettings(data.privacySettings || {
            showEmail: true,
            showPhone: true,
            showCity: true,
            showCountry: true,
            profileVisibility: 'public',
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const service = userType === 'user' ? userService : storeService;
      const updateData = userType === 'user'
        ? {
            fullName: profileData.fullName,
            phone: profileData.phone,
            country: profileData.country,
          }
        : {
            businessName: profileData.businessName,
            phone: profileData.phone,
            city: profileData.city,
            country: profileData.country,
            businessType: profileData.businessType,
          };

      const response = await service.updateProfile(updateData);
      
      if (response.success) {
        setSuccess('Perfil actualizado correctamente');
        const updatedUser = userType === 'user' ? response.user : response.store;
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
        // Actualizar localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUserData = { ...currentUser, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailData.email || !emailData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const service = userType === 'user' ? userService : storeService;
      const response = await service.updateEmail(
        emailData.email,
        emailData.password
      );

      if (response.success) {
        setSuccess('Email actualizado correctamente');
        const updatedUser = userType === 'user' ? response.user : response.store;
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
        // Actualizar localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUserData = { ...currentUser, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
        setEmailData({ email: emailData.email, password: '' });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const service = userType === 'user' ? userService : storeService;
      const response = await service.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setSuccess('Contraseña actualizada correctamente');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const service = userType === 'user' ? userService : storeService;
      const response = await service.updatePrivacySettings(privacySettings);
      
      if (response.success) {
        setSuccess('Configuraciones de privacidad actualizadas correctamente');
        const updatedUser = userType === 'user' ? response.user : response.store;
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar las configuraciones de privacidad');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Información Personal', icon: faUser },
    { id: 'email', label: 'Cambiar Email', icon: faEnvelope },
    { id: 'password', label: 'Cambiar Contraseña', icon: faLock },
    { id: 'privacy', label: 'Privacidad', icon: faShieldAlt },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <FontAwesomeIcon icon={faCog} className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Menú lateral */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setError('');
                    setSuccess('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && activeSection === 'profile' && (
              <div className="flex items-center justify-center py-8">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="w-8 h-8 text-blue-600 animate-spin"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} />
                {success}
              </div>
            )}

            {/* Sección: Información Personal */}
            {activeSection === 'profile' && !loading && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Información Personal
                </h3>

                {userType === 'user' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) =>
                          setProfileData({ ...profileData, country: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Comercial *
                      </label>
                      <input
                        type="text"
                        value={profileData.businessName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            businessName: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) =>
                            setProfileData({ ...profileData, city: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          País
                        </label>
                        <input
                          type="text"
                          value={profileData.country}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              country: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Negocio
                      </label>
                      <input
                        type="text"
                        value={profileData.businessType}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            businessType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}

            {/* Sección: Cambiar Email */}
            {activeSection === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Cambiar Email
                </h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Para cambiar tu email, necesitas
                    confirmar tu contraseña actual.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Email *
                  </label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) =>
                      setEmailData({ ...emailData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    value={emailData.password}
                    onChange={(e) =>
                      setEmailData({ ...emailData, password: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Email'}
                  </button>
                </div>
              </form>
            )}

            {/* Sección: Cambiar Contraseña */}
            {activeSection === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Cambiar Contraseña
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Requisitos de contraseña:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos un número</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            )}

            {/* Sección: Privacidad */}
            {activeSection === 'privacy' && (
              <form onSubmit={handlePrivacySubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Configuraciones de Privacidad
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Estas configuraciones controlan qué información es visible en tu perfil público.
                  </p>
                </div>

                {/* Visibilidad del Perfil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibilidad del Perfil
                  </label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        profileVisibility: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="public">Público - Cualquiera puede ver tu perfil</option>
                    <option value="contacts">Solo Contactos - Solo tus contactos pueden ver tu perfil</option>
                    <option value="private">Privado - Solo tú puedes ver tu perfil</option>
                  </select>
                </div>

                {/* Opciones de Información Visible */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Información Visible en Perfil Público:</p>
                  
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showEmail: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Mostrar Email</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={privacySettings.showPhone}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showPhone: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Mostrar Teléfono</span>
                  </label>

                  {userType === 'store' && (
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="checkbox"
                        checked={privacySettings.showCity}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            showCity: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Mostrar Ciudad</span>
                    </label>
                  )}

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={privacySettings.showCountry}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showCountry: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Mostrar País</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar Configuraciones'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

