import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { authService } from '../services/authService';
import EmailVerificationModal from './EmailVerificationModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        // Si hay una redirección, ir allí, sino al dashboard
        if (redirect) {
          navigate(redirect);
        } else if (response.type === 'user') {
          navigate('/dashboard/user');
        } else {
          navigate('/dashboard/store');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      
      // Si el error es de email no verificado, ofrecer verificar
      if (errorMessage.includes('verify your email') || errorMessage.includes('verificar')) {
        // Intentar detectar el tipo de usuario
        // Por ahora, asumimos que puede ser cualquiera
        setUserType('user'); // Por defecto, pero se puede cambiar
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.08), rgba(251, 191, 36, 0.1))'
    }}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)'
        }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15), transparent 70%)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1), transparent 70%)'
        }}></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent mb-3" style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              LocalPay
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Bienvenido de nuevo</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Inicia sesión para continuar</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {(error.includes('verify your email') || error.includes('verificar')) && (
                    <button
                      type="button"
                      onClick={() => setShowVerificationModal(true)}
                      className="mt-2 text-sm font-semibold underline transition-colors"
                      style={{
                        color: '#6366f1'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#a855f7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6366f1';
                      }}
                    >
                      Verificar email ahora
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #fbbf24)',
                boxShadow: loading ? '0 15px 25px rgba(99, 102, 241, 0.4)' : '0 15px 25px rgba(99, 102, 241, 0.4)',
                focusRingColor: '#6366f1'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 20px 35px rgba(99, 102, 241, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 15px 25px rgba(99, 102, 241, 0.4)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Enlace de registro */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link 
                to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} 
                className="font-semibold transition-colors duration-200 hover:underline"
                style={{
                  color: '#6366f1'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#a855f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6366f1';
                }}
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer decorativo */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            © 2024 LocalPay. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Modal de verificación de email */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
        userType={userType || 'user'}
        onVerified={async () => {
          setShowVerificationModal(false);
          setError('');
          // Intentar login nuevamente después de verificar
          setLoading(true);
          try {
            const response = await authService.login(email, password);
            if (response.success) {
              if (redirect) {
                navigate(redirect);
              } else if (response.type === 'user') {
                navigate('/dashboard/user');
              } else {
                navigate('/dashboard/store');
              }
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};

export default Login;

