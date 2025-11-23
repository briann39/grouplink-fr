import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faUser,
  faTimes,
  faSpinner,
  faEnvelope,
  faIdCard,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';
import { userService } from '../services/userService';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';

const SearchUsersModal = ({ isOpen, onClose, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('auto'); // 'auto', 'cbu', 'email', 'id', 'name'
  const [searchCategory, setSearchCategory] = useState('all'); // 'all', 'users', 'stores'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const currentUser = authService.getCurrentUser();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);

    try {
      const allResults = { users: [], stores: [] };

      // Buscar usuarios si corresponde
      if (searchCategory === 'all' || searchCategory === 'users') {
        try {
          const userResponse = await userService.searchUser(
            searchQuery,
            searchType === 'auto' ? undefined : searchType
          );
          if (userResponse.success) {
            if (userResponse.users) {
              allResults.users = userResponse.users;
            } else if (userResponse.user) {
              allResults.users = [userResponse.user];
            }
          }
        } catch (err) {
          // Ignorar errores de búsqueda de usuarios si estamos buscando en ambos
          if (searchCategory === 'users') {
            throw err;
          }
        }
      }

      // Buscar tiendas si corresponde
      if (searchCategory === 'all' || searchCategory === 'stores') {
        try {
          const storeResponse = await storeService.searchStore(
            searchQuery,
            searchType === 'auto' ? undefined : searchType
          );
          if (storeResponse.success) {
            if (storeResponse.stores) {
              allResults.stores = storeResponse.stores;
            } else if (storeResponse.store) {
              allResults.stores = [storeResponse.store];
            }
          }
        } catch (err) {
          // Ignorar errores de búsqueda de tiendas si estamos buscando en ambos
          if (searchCategory === 'stores') {
            throw err;
          }
        }
      }

      // Si no hay resultados en ninguna categoría
      if (allResults.users.length === 0 && allResults.stores.length === 0) {
        setError('No se encontraron resultados');
        return;
      }

      setResults(allResults);
    } catch (err) {
      setError(err.response?.data?.message || 'No se encontraron resultados');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect({ ...user, type: 'user' });
    }
  };

  const handleStoreClick = (store) => {
    if (onUserSelect) {
      onUserSelect({ ...store, type: 'store' });
    }
  };

  const handleViewMyProfile = () => {
    if (currentUser && onUserSelect) {
      // Obtener perfil completo del usuario actual
      userService.getProfile()
        .then((response) => {
          if (response.success && response.user) {
            onUserSelect(response.user);
          }
        })
        .catch((err) => {
          setError('Error al cargar tu perfil');
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Buscar Usuarios</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Ver mi perfil */}
          {currentUser && (
            <button
              onClick={handleViewMyProfile}
              className="w-full mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-3"
            >
              <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-blue-900">Ver Mi Perfil</p>
                <p className="text-sm text-blue-700">{currentUser.fullName || currentUser.businessName}</p>
              </div>
            </button>
          )}

          {/* Formulario de búsqueda */}
          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar en
              </label>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Usuarios y Comercios</option>
                <option value="users">Solo Usuarios</option>
                <option value="stores">Solo Comercios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Búsqueda
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="auto">Detección Automática</option>
                <option value="name">Por Nombre</option>
                {searchCategory !== 'stores' && <option value="cbu">Por CBU</option>}
                <option value="email">Por Email</option>
                <option value="id">Por ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Término de Búsqueda
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchType === 'cbu' ? 'Ingresa un CBU (22 dígitos)'
                    : searchType === 'email' ? 'Ingresa un email'
                    : searchType === 'id' ? 'Ingresa un ID de usuario'
                    : 'Nombre, CBU, Email o ID'
                  }
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <FontAwesomeIcon
                  icon={
                    searchType === 'cbu' ? faCreditCard
                    : searchType === 'email' ? faEnvelope
                    : searchType === 'id' ? faIdCard
                    : faSearch
                  }
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </form>

          {/* Resultados */}
          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Resultados ({results.users.length + results.stores.length})
              </h3>

              {/* Usuarios */}
              {results.users.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Usuarios ({results.users.length})</h4>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 rounded-full p-3">
                            <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.cbu && (
                              <p className="text-xs text-gray-500 font-mono mt-1">CBU: {user.cbu}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tiendas/Comercios */}
              {results.stores.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Comercios ({results.stores.length})</h4>
                  <div className="space-y-2">
                    {results.stores.map((store) => (
                      <div
                        key={store.id}
                        onClick={() => handleStoreClick(store)}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-green-600 rounded-full p-3">
                            <FontAwesomeIcon icon={faIdCard} className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{store.businessName}</p>
                            <p className="text-sm text-gray-600">{store.email}</p>
                            {store.city && store.country && (
                              <p className="text-xs text-gray-500 mt-1">
                                📍 {store.city}, {store.country}
                              </p>
                            )}
                            {store.businessType && (
                              <p className="text-xs text-gray-500 mt-1">Tipo: {store.businessType}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!results && !loading && (
            <div className="text-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faSearch} className="w-12 h-12 mb-4 opacity-50" />
              <p>Ingresa un término de búsqueda para comenzar</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchUsersModal;

