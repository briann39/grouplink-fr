import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faCopy,
  faCheck,
  faPaperPlane,
  faArrowDown,
  faHistory,
  faCreditCard,
  faArrowUp,
  faQrcode,
  faUsers,
  faUser,
  faClock,
  faCog,
  faSignOutAlt,
  faCog as faSettings,
  faBell,
  faHome,
  faExchangeAlt,
  faEllipsisH,
  faAddressBook,
  faUserCircle,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../services/authService";
import AddMoneyModal from "../components/AddMoneyModal";
import SendMoneyModal from "../components/SendMoneyModal";
import WithdrawMoneyModal from "../components/WithdrawMoneyModal";
import ProcessWithdrawalModal from "../components/ProcessWithdrawalModal";
import TransactionsHistoryModal from "../components/TransactionsHistoryModal";
import TransactionDetailModal from "../components/TransactionDetailModal";
import ReceivePaymentModal from "../components/ReceivePaymentModal";
import MyQRCodeModal from "../components/MyQRCodeModal";
import SettingsModal from "../components/SettingsModal";
import SearchUsersModal from "../components/SearchUsersModal";
import ProfileViewModal from "../components/ProfileViewModal";
import NotificationsModal from "../components/NotificationsModal";

const Dashboard = ({ userType }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // "home", "transfer", "transactions", "more"
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [sendMoneyCbu, setSendMoneyCbu] = useState("");
  const [sendMoneyRecipient, setSendMoneyRecipient] = useState("");
  const [showWithdrawMoneyModal, setShowWithdrawMoneyModal] = useState(false);
  const [showProcessWithdrawalModal, setShowProcessWithdrawalModal] =
    useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showReceivePaymentModal, setShowReceivePaymentModal] = useState(false);
  const [showMyQRCodeModal, setShowMyQRCodeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchUsersModal, setShowSearchUsersModal] = useState(false);
  const [showProfileViewModal, setShowProfileViewModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [copiedCBU, setCopiedCBU] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const navigate = useNavigate();

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        console.error("Error loading notifications:", e);
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Función para agregar una notificación
  const addNotification = (title, message, type = "info") => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Mostrar notificación del sistema si está disponible
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/vite.svg",
      });
    }
  };

  // Solicitar permiso para notificaciones del sistema
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      // Si es usuario, cargar perfil completo para verificar isManager
      if (userType === "user") {
        try {
          const { userService } = await import("../services/userService");
          const profileResponse = await userService.getProfile();
          if (profileResponse.user) {
            setUser(profileResponse.user);
            // Actualizar localStorage con datos completos
            localStorage.setItem("user", JSON.stringify(profileResponse.user));
          } else {
            setUser(currentUser);
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
          setUser(currentUser);
        }
      } else if (userType === "store") {
        // Si es tienda, cargar perfil completo para obtener totalCommissionsEarned
        try {
          const { storeService } = await import("../services/storeService");
          const profileResponse = await storeService.getProfile();
          if (profileResponse.store) {
            setUser(profileResponse.store);
            // Actualizar localStorage con datos completos
            localStorage.setItem("user", JSON.stringify(profileResponse.store));
          } else {
            setUser(currentUser);
          }
        } catch (err) {
          console.error("Error loading store profile:", err);
          setUser(currentUser);
        }
      } else {
        setUser(currentUser);
      }
    };

    loadUser();
  }, [navigate, userType]);

  // Cargar transacciones recientes
  useEffect(() => {
    const loadRecentTransactions = async () => {
      if (!user) return;

      try {
        setLoadingTransactions(true);
        const { transactionService } = await import(
          "../services/transactionService"
        );
        const response =
          userType === "store"
            ? await transactionService.getStoreTransactions(5, 0)
            : await transactionService.getTransactions(5, 0);

        if (response.success && response.transactions) {
          setRecentTransactions(response.transactions);
        }
      } catch (err) {
        console.error("Error loading recent transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (user && activeTab === "home") {
      loadRecentTransactions();
    }
  }, [user, userType, activeTab]);

  // Cargar contactos desde transacciones y localStorage
  useEffect(() => {
    const loadContacts = async () => {
      if (!user) return;

      try {
        setLoadingContacts(true);
        // Cargar contactos guardados del localStorage
        const savedContacts = localStorage.getItem("contacts");
        let savedContactsList = [];
        if (savedContacts) {
          try {
            savedContactsList = JSON.parse(savedContacts);
          } catch (e) {
            console.error("Error loading saved contacts:", e);
          }
        }

        // Cargar contactos desde transacciones recientes
        const { transactionService } = await import(
          "../services/transactionService"
        );
        const response =
          userType === "store"
            ? await transactionService.getStoreTransactions(50, 0)
            : await transactionService.getTransactions(50, 0);

        const contactsMap = new Map();

        // Agregar contactos guardados
        savedContactsList.forEach((contact) => {
          contactsMap.set(contact.cbu || contact.id, contact);
        });

        // Agregar contactos desde transacciones
        if (response.success && response.transactions) {
          response.transactions.forEach((transaction) => {
            // Usar otherParty que viene en las transacciones formateadas
            if (transaction.otherParty) {
              const otherParty = transaction.otherParty;
              const contact = {
                id:
                  otherParty.cbu ||
                  otherParty.email ||
                  `contact-${transaction.id}-${
                    otherParty.fullName || otherParty.businessName || "unknown"
                  }`,
                name:
                  otherParty.fullName || otherParty.businessName || "Contacto",
                cbu: otherParty.cbu,
                email: otherParty.email,
                type:
                  otherParty.type === "store" || otherParty.businessName
                    ? "store"
                    : "user",
                lastTransaction: transaction.createdAt,
              };

              // Usar CBU como clave si está disponible, sino email, sino ID
              const key = contact.cbu || contact.email || contact.id;
              if (key && !contactsMap.has(key)) {
                contactsMap.set(key, contact);
              } else if (key && contactsMap.has(key)) {
                // Actualizar fecha de última transacción si es más reciente
                const existing = contactsMap.get(key);
                const existingDate = new Date(existing.lastTransaction || 0);
                const newDate = new Date(transaction.createdAt);
                if (newDate > existingDate) {
                  existing.lastTransaction = transaction.createdAt;
                  contactsMap.set(key, existing);
                }
              }
            }
          });
        }

        // Convertir map a array y ordenar por última transacción
        const contactsList = Array.from(contactsMap.values()).sort((a, b) => {
          const dateA = new Date(a.lastTransaction || 0);
          const dateB = new Date(b.lastTransaction || 0);
          return dateB - dateA;
        });

        setContacts(contactsList);
      } catch (err) {
        console.error("Error loading contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    if (user && activeTab === "transfer") {
      loadContacts();
    }
  }, [user, userType, activeTab]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleAddMoneySuccess = async (response) => {
    if (response.store && response.store.newBalance !== undefined) {
      // Recargar perfil completo para obtener totalCommissionsEarned actualizado
      if (userType === "store") {
        try {
          const { storeService } = await import("../services/storeService");
          const profileResponse = await storeService.getProfile();
          if (profileResponse.store) {
            setUser(profileResponse.store);
            localStorage.setItem("user", JSON.stringify(profileResponse.store));
          } else {
            setUser({
              ...user,
              balance: response.store.newBalance,
            });
          }
        } catch (err) {
          console.error("Error loading store profile:", err);
          setUser({
            ...user,
            balance: response.store.newBalance,
          });
        }
      } else {
        setUser({
          ...user,
          balance: response.store.newBalance,
        });
      }
      // Notificación de recarga
      addNotification(
        "Recarga exitosa",
        `Se ha acreditado ${response.transaction?.amount || "dinero"} ${
          response.transaction?.currency || "USD"
        } a tu cuenta. Nuevo saldo: ${parseFloat(
          response.store.newBalance
        ).toFixed(2)} ${response.transaction?.currency || "USD"}`,
        "success"
      );
    }
  };

  const handleSendMoneySuccess = (response) => {
    if (response.sender && response.sender.balance !== undefined) {
      const updatedUser = {
        ...user,
        balance: response.sender.balance,
      };
      setUser(updatedUser);
      // Actualizar en localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // Notificación de envío
      addNotification(
        "Dinero enviado",
        `Has enviado ${response.transaction?.amount || "dinero"} ${
          response.transaction?.currency || "USD"
        } a ${
          response.recipient?.fullName || "el destinatario"
        }. Nuevo saldo: ${parseFloat(response.sender.balance).toFixed(2)} ${
          response.transaction?.currency || "USD"
        }`,
        "success"
      );
    }
  };

  const handleWithdrawSuccess = (response) => {
    // El código se genera pero el balance no cambia hasta que se procese
    // Solo actualizamos si hay algún cambio
  };

  const handleProcessWithdrawalSuccess = async (response) => {
    if (response.store && response.store.newBalance !== undefined) {
      // Recargar perfil completo para obtener totalCommissionsEarned actualizado
      if (userType === "store") {
        try {
          const { storeService } = await import("../services/storeService");
          const profileResponse = await storeService.getProfile();
          if (profileResponse.store) {
            setUser(profileResponse.store);
            localStorage.setItem("user", JSON.stringify(profileResponse.store));
          } else {
            setUser({
              ...user,
              balance: response.store.newBalance,
            });
          }
        } catch (err) {
          console.error("Error loading store profile:", err);
          setUser({
            ...user,
            balance: response.store.newBalance,
          });
        }
      } else {
        setUser({
          ...user,
          balance: response.store.newBalance,
        });
      }
      // Notificación de retiro procesado
      const commissionEarned = response.transaction?.storeCommission || 0;
      addNotification(
        "Retiro procesado",
        `Se ha procesado un retiro de ${
          response.transaction?.amount || "dinero"
        } ${
          response.transaction?.currency || "USD"
        }. Comisión ganada: ${parseFloat(commissionEarned).toFixed(2)} ${
          response.transaction?.currency || "USD"
        }. Nuevo saldo: ${parseFloat(response.store.newBalance).toFixed(2)} ${
          response.transaction?.currency || "USD"
        }`,
        "success"
      );
    }
  };

  const handleSettingsUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleUserSelect = (selectedUser) => {
    // Si viene con type, usarlo directamente, sino detectar si es tienda
    const profileData = selectedUser.type
      ? selectedUser
      : { ...selectedUser, type: selectedUser.businessName ? "store" : "user" };
    setSelectedProfile(profileData);
    setShowSearchUsersModal(false);
    setShowProfileViewModal(true);
  };

  const handleViewMyProfile = () => {
    setSelectedProfile(null);
    setShowProfileViewModal(true);
  };

  const handleSendMoneyFromProfile = (cbu, recipientName) => {
    setSendMoneyCbu(cbu);
    setSendMoneyRecipient(recipientName);
    setShowSendMoneyModal(true);
  };

  const handleShareAction = (type) => {
    if (type === "qr") {
      setShowMyQRCodeModal(true);
    }
  };

  const copyCBU = () => {
    if (user.cbu) {
      navigator.clipboard.writeText(user.cbu);
      setCopiedCBU(true);
      setTimeout(() => setCopiedCBU(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Fondo decorativo con gradiente moderno */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/30 via-white/20 to-blue-50/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/15 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <h1 className="logo-text text-xl text-blue-600">LocalPay</h1>
              </div>
              <div className="flex items-center gap-4">
                {/* Nombre del usuario */}
                <div className="hidden sm:flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userType === "user" ? user.fullName : user.businessName}
                  </span>
                </div>

                {/* Botón de notificaciones */}
                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  title="Notificaciones"
                >
                  <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length > 9
                        ? "9+"
                        : notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24">
          {/* Contenido según tab activo */}
          {activeTab === "home" && (
            <>
              {/* CBU Card - Al inicio */}
              {userType === "user" && user.cbu && (
                <div className="bg-blue-600 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-500/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="bg-white rounded-lg px-3 py-2 sm:px-5 sm:py-3.5 shadow-md shrink-0">
                        <span className="logo-text text-blue-600 text-lg sm:text-2xl tracking-tight">
                          LocalPay
                        </span>
                      </div>
                      <div className="text-white flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white/90 mb-1">
                          Cuenta N°
                        </p>
                        <div className="overflow-x-auto">
                          <p className="text-base sm:text-xl font-mono font-semibold tracking-wider whitespace-nowrap text-white">
                            {user.cbu}
                          </p>
                        </div>
                      </div>
                    </div>
                    {user.cbu && (
                      <button
                        onClick={copyCBU}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition shrink-0"
                        title="Copiar CBU"
                      >
                        <FontAwesomeIcon
                          icon={copiedCBU ? faCheck : faCopy}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            copiedCBU ? "text-green-300" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {userType === "user" && (
                <>
                  {/* Balance Card */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                          Saldo Disponible
                        </p>
                        <p className="text-2xl sm:text-4xl font-semibold text-gray-900">
                          {user.balance
                            ? `${parseFloat(user.balance).toFixed(2)} ${
                                user.currency || "USD"
                              }`
                            : "0.00 USD"}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 sm:p-3 shrink-0 ml-3 border border-blue-100">
                        <FontAwesomeIcon
                          icon={faWallet}
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide">
                      Acciones Rápidas
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <button
                        onClick={() => setShowSendMoneyModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                          <div className="bg-blue-50 group-hover:bg-blue-100 rounded-lg p-2 sm:p-2.5 transition border border-blue-100">
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Enviar
                            </p>
                            <p className="text-xs text-gray-500">Dinero</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowReceivePaymentModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                          <div className="bg-blue-50 group-hover:bg-blue-100 rounded-lg p-2 sm:p-2.5 transition border border-blue-100">
                            <FontAwesomeIcon
                              icon={faArrowDown}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Recibir
                            </p>
                            <p className="text-xs text-gray-500">Dinero</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => console.log("Recargar cuenta")}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                          <div className="bg-blue-50 group-hover:bg-blue-100 rounded-lg p-2 sm:p-2.5 transition border border-blue-100">
                            <FontAwesomeIcon
                              icon={faCreditCard}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Recargar
                            </p>
                            <p className="text-xs text-gray-500">Cuenta</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowMyQRCodeModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                          <div className="bg-blue-50 group-hover:bg-blue-100 rounded-lg p-2 sm:p-2.5 transition border border-blue-100">
                            <FontAwesomeIcon
                              icon={faQrcode}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Código QR
                            </p>
                            <p className="text-xs text-gray-500">Mi código</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Transacciones Recientes */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Transacciones Recientes
                      </h3>
                      <button
                        onClick={() => {
                          setShowTransactionsModal(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver todas
                      </button>
                    </div>
                    {loadingTransactions ? (
                      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6 text-center">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="w-6 h-6 text-gray-400 animate-spin"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Cargando transacciones...
                        </p>
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6 text-center">
                        <FontAwesomeIcon
                          icon={faHistory}
                          className="w-8 h-8 text-gray-300 mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          No hay transacciones recientes
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentTransactions.slice(0, 5).map((transaction, index) => (
                          <div
                            key={`transaction-${
                              transaction.id || index
                            }-${transaction.createdAt || transaction.updatedAt || index}`}
                            onClick={() => {
                              if (transaction.id) {
                                setSelectedTransactionId(transaction.id);
                                setShowTransactionDetailModal(true);
                              }
                            }}
                            className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-lg p-3 sm:p-4 hover:shadow-md transition cursor-pointer hover:border-blue-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`rounded-lg p-2 ${
                                    transaction.direction === "outgoing"
                                      ? "bg-red-50"
                                      : "bg-green-50"
                                  }`}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      transaction.direction === "outgoing"
                                        ? faArrowUp
                                        : faArrowDown
                                    }
                                    className={`w-4 h-4 ${
                                      transaction.direction === "outgoing"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {transaction.description ||
                                      transaction.type ||
                                      "Transacción"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString("es-ES", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-sm font-semibold ${
                                    transaction.direction === "outgoing"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {transaction.direction === "outgoing"
                                    ? "-"
                                    : "+"}
                                  ${parseFloat(transaction.amount).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {transaction.status === "SUCCESS"
                                    ? "✓"
                                    : transaction.status === "PENDING"
                                    ? "⏳"
                                    : "✗"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* More Actions */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide">
                      Más Opciones
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      <button
                        onClick={() => setShowTransactionsModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Mis Transacciones
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ver historial completo
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowWithdrawMoneyModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faArrowUp}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Retirar Dinero
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Generar código de retiro
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowSearchUsersModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Buscar Usuarios
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ver perfiles
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleViewMyProfile}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Mi Perfil
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ver mi perfil
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => console.log("Historial completo")}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Historial Completo
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Todas las operaciones
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faCog}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Configuración
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ajustes de cuenta
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {userType === "store" && (
                <>
                  {/* Balance Card for Store */}
                  <div className="bg-blue-600 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/90 mb-2">
                          Balance Actual
                        </p>
                        <p className="text-4xl font-semibold text-white">
                          {user.balance
                            ? `${parseFloat(user.balance).toFixed(2)} ${
                                user.currency || "USD"
                              }`
                            : "0.00 USD"}
                        </p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                        <FontAwesomeIcon
                          icon={faWallet}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comisiones Ganadas Card */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-green-400/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/90 mb-1">
                          Comisiones Ganadas
                        </p>
                        <p className="text-xs text-white/80 mb-2">
                          25% de cada transacción procesada
                        </p>
                        <p className="text-3xl font-semibold text-white">
                          {user.totalCommissionsEarned !== undefined
                            ? `${parseFloat(
                                user.totalCommissionsEarned
                              ).toFixed(2)} ${user.currency || "USD"}`
                            : "0.00 USD"}
                        </p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                        <FontAwesomeIcon
                          icon={faDollarSign}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Ciudad
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {user.city || "No proporcionado"}
                      </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Tipo de Negocio
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {user.businessType || "No proporcionado"}
                      </p>
                    </div>
                  </div>

                  {/* Store Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Acciones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <button
                        onClick={() => setShowAddMoneyModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-blue-50 group-hover:bg-blue-100 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-blue-100">
                            <FontAwesomeIcon
                              icon={faArrowDown}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Agregar Dinero
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              A cuenta de usuario
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowProcessWithdrawalModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faArrowUp}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Procesar Retiro
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Escanear QR o código
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowTransactionsModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Transacciones
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ver historial
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowMyQRCodeModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faQrcode}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Código QR
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Generar código
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => console.log("Ver reportes")}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Reportes
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ver estadísticas
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-white hover:border-blue-300 hover:shadow-lg transition text-left group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gray-50 group-hover:bg-blue-50 rounded-lg p-2 sm:p-2.5 transition shrink-0 border border-gray-100">
                            <FontAwesomeIcon
                              icon={faCog}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              Configuración
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Ajustes de tienda
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Tab: Transferir */}
          {activeTab === "transfer" && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Transferir Dinero
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowSendMoneyModal(true);
                      setActiveTab("home");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 flex items-center justify-between transition shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          className="w-6 h-6"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-lg">Enviar Dinero</p>
                        <p className="text-sm text-white/90">
                          Transferir a otro usuario por CBU
                        </p>
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
                  </button>

                  {userType === "user" && (
                    <>
                      <button
                        onClick={() => {
                          setShowReceivePaymentModal(true);
                          setActiveTab("home");
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 flex items-center justify-between transition shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 rounded-lg p-3">
                            <FontAwesomeIcon
                              icon={faArrowDown}
                              className="w-6 h-6"
                            />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-lg">
                              Recibir Dinero
                            </p>
                            <p className="text-sm text-white/90">
                              Mostrar código QR o CBU
                            </p>
                          </div>
                        </div>
                        <FontAwesomeIcon
                          icon={faArrowDown}
                          className="w-5 h-5"
                        />
                      </button>

                      <button
                        onClick={() => {
                          setShowWithdrawMoneyModal(true);
                          setActiveTab("home");
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl p-6 flex items-center justify-between transition shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 rounded-lg p-3">
                            <FontAwesomeIcon
                              icon={faArrowUp}
                              className="w-6 h-6"
                            />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-lg">
                              Retirar Dinero
                            </p>
                            <p className="text-sm text-white/90">
                              Generar código de retiro
                            </p>
                          </div>
                        </div>
                        <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {userType === "store" && (
                    <button
                      onClick={() => {
                        setShowProcessWithdrawalModal(true);
                        setActiveTab("home");
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 flex items-center justify-between transition shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-lg p-3">
                          <FontAwesomeIcon
                            icon={faQrcode}
                            className="w-6 h-6"
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-lg">
                            Procesar Retiro
                          </p>
                          <p className="text-sm text-white/90">
                            Escanear código de retiro
                          </p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Listado de Contactos */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faAddressBook}
                      className="w-5 h-5 text-blue-600"
                    />
                    Contactos
                  </h2>
                  <button
                    onClick={() => {
                      setShowSearchUsersModal(true);
                      setActiveTab("home");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Buscar más
                  </button>
                </div>

                {loadingContacts ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="w-6 h-6 text-gray-400 animate-spin mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      Cargando contactos...
                    </p>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon
                      icon={faAddressBook}
                      className="w-12 h-12 text-gray-300 mb-3"
                    />
                    <p className="text-sm text-gray-500 mb-2">
                      No hay contactos aún
                    </p>
                    <p className="text-xs text-gray-400">
                      Los contactos aparecerán aquí después de realizar
                      transacciones
                    </p>
                    <button
                      onClick={() => {
                        setShowSearchUsersModal(true);
                        setActiveTab("home");
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Buscar usuarios
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {contacts.map((contact, index) => (
                      <button
                        key={`contact-${
                          contact.cbu || contact.email || contact.id || index
                        }-${contact.lastTransaction || index}`}
                        onClick={() => {
                          if (contact.cbu) {
                            setSendMoneyCbu(contact.cbu);
                            setSendMoneyRecipient(contact.name);
                            setShowSendMoneyModal(true);
                            setActiveTab("home");
                          } else {
                            // Si no tiene CBU, buscar el perfil primero
                            setSelectedProfile({
                              ...contact,
                              type: contact.type || "user",
                            });
                            setShowProfileViewModal(true);
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 group-hover:bg-blue-100 rounded-full p-3 transition">
                            <FontAwesomeIcon
                              icon={
                                contact.type === "store"
                                  ? faUsers
                                  : faUserCircle
                              }
                              className="w-5 h-5 text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {contact.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {contact.cbu && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {contact.cbu}
                                </p>
                              )}
                              {contact.email && (
                                <p className="text-xs text-gray-400 truncate">
                                  {contact.email}
                                </p>
                              )}
                            </div>
                            {contact.lastTransaction && (
                              <p className="text-xs text-gray-400 mt-1">
                                Última transacción:{" "}
                                {new Date(
                                  contact.lastTransaction
                                ).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition">
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className="w-4 h-4"
                            />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Transacciones */}
          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Mis Transacciones
                  </h2>
                  <button
                    onClick={() => setShowTransactionsModal(true)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                  >
                    Ver todas
                  </button>
                </div>
                <TransactionsHistoryModal
                  isOpen={true}
                  onClose={() => {}}
                  userType={userType}
                  inline={true}
                  onTransactionClick={(transactionId) => {
                    setSelectedTransactionId(transactionId);
                    setShowTransactionDetailModal(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Tab: Más */}
          {activeTab === "more" && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Más Opciones
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowTransactionsModal(true);
                      setActiveTab("home");
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-blue-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <FontAwesomeIcon
                          icon={faHistory}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Transacciones
                        </p>
                        <p className="text-sm text-gray-500">Ver historial</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowSearchUsersModal(true);
                      setActiveTab("home");
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-blue-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Buscar Usuarios
                        </p>
                        <p className="text-sm text-gray-500">Ver perfiles</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleViewMyProfile}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-blue-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Mi Perfil</p>
                        <p className="text-sm text-gray-500">Ver mi perfil</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowMyQRCodeModal(true);
                      setActiveTab("home");
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-blue-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <FontAwesomeIcon
                          icon={faQrcode}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Mi Código QR
                        </p>
                        <p className="text-sm text-gray-500">
                          Compartir código
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setActiveTab("home");
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-blue-300 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <FontAwesomeIcon
                          icon={faCog}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Configuración
                        </p>
                        <p className="text-sm text-gray-500">
                          Ajustes de cuenta
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de menú inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                  activeTab === "home"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                <span className="text-xs font-medium">Inicio</span>
              </button>
              <button
                onClick={() => setActiveTab("transfer")}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                  activeTab === "transfer"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon icon={faExchangeAlt} className="w-5 h-5" />
                <span className="text-xs font-medium">Transferir</span>
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                  activeTab === "transactions"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon icon={faHistory} className="w-5 h-5" />
                <span className="text-xs font-medium">Transacciones</span>
              </button>
              <button
                onClick={() => setActiveTab("more")}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                  activeTab === "more"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon icon={faEllipsisH} className="w-5 h-5" />
                <span className="text-xs font-medium">Más</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {userType === "store" && (
          <AddMoneyModal
            isOpen={showAddMoneyModal}
            onClose={() => setShowAddMoneyModal(false)}
            onSuccess={handleAddMoneySuccess}
          />
        )}
        {userType === "user" && (
          <>
            <SendMoneyModal
              isOpen={showSendMoneyModal}
              onClose={() => {
                setShowSendMoneyModal(false);
                setSendMoneyCbu("");
                setSendMoneyRecipient("");
              }}
              onSuccess={handleSendMoneySuccess}
              userBalance={user.balance}
              initialCbu={sendMoneyCbu}
              recipientName={sendMoneyRecipient}
            />
            <WithdrawMoneyModal
              isOpen={showWithdrawMoneyModal}
              onClose={() => setShowWithdrawMoneyModal(false)}
              onSuccess={handleWithdrawSuccess}
              userBalance={user.balance}
            />
          </>
        )}
        {userType === "store" && (
          <ProcessWithdrawalModal
            isOpen={showProcessWithdrawalModal}
            onClose={() => setShowProcessWithdrawalModal(false)}
            onSuccess={handleProcessWithdrawalSuccess}
            storeBalance={user.balance}
          />
        )}
        <TransactionsHistoryModal
          isOpen={showTransactionsModal}
          onClose={() => setShowTransactionsModal(false)}
          userType={userType}
          onTransactionClick={(transactionId) => {
            setShowTransactionsModal(false);
            setSelectedTransactionId(transactionId);
            setShowTransactionDetailModal(true);
          }}
        />
        <TransactionDetailModal
          isOpen={showTransactionDetailModal}
          onClose={() => {
            setShowTransactionDetailModal(false);
            setSelectedTransactionId(null);
          }}
          transactionId={selectedTransactionId}
          userType={userType}
        />
        {userType === "user" && (
          <ReceivePaymentModal
            isOpen={showReceivePaymentModal}
            onClose={() => setShowReceivePaymentModal(false)}
            userCbu={user?.cbu}
            userName={user?.fullName}
          />
        )}
        <MyQRCodeModal
          isOpen={showMyQRCodeModal}
          onClose={() => setShowMyQRCodeModal(false)}
          user={user}
          userType={userType}
        />
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          userType={userType}
          onUserUpdate={handleSettingsUpdate}
        />
        <SearchUsersModal
          isOpen={showSearchUsersModal}
          onClose={() => setShowSearchUsersModal(false)}
          onUserSelect={handleUserSelect}
        />
        <ProfileViewModal
          isOpen={showProfileViewModal}
          onClose={() => {
            setShowProfileViewModal(false);
            setSelectedProfile(null);
          }}
          userId={selectedProfile?.id}
          userData={selectedProfile}
          onSendMoney={handleSendMoneyFromProfile}
          onShare={handleShareAction}
        />
        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDeleteNotification={deleteNotification}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />
      </div>
    </div>
  );
};

export default Dashboard;
