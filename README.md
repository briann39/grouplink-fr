# Frontend - LocalPay

Cliente web de LocalPay construido con React, Vite y Tailwind CSS.

## 📋 Descripción

Aplicación web moderna y responsive que permite a usuarios y comerciantes interactuar con el sistema LocalPay. Incluye dashboards personalizados, modales para transacciones, y soporte completo para códigos QR.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Crea un archivo `.env` en la raíz de esta carpeta (puedes copiar de `.env.example`):

```bash
cp .env.example .env
```

2. Configura la URL del backend en `.env`:

**Para desarrollo local:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Para producción (backend en Vercel u otro hosting):**
```env
VITE_API_URL=https://paylink-lo8a.vercel.app/api
```

**Nota:** Después de cambiar `.env`, reinicia el servidor de desarrollo (`npm run dev`).

### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que asigne Vite)

### Construir para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Previsualizar Build de Producción

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
fontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Login.jsx        # Componente de login
│   │   ├── Register.jsx     # Componente de registro
│   │   ├── ProtectedRoute.jsx
│   │   ├── SendMoneyModal.jsx
│   │   ├── WithdrawMoneyModal.jsx
│   │   ├── ProcessWithdrawalModal.jsx
│   │   ├── TransactionsHistoryModal.jsx
│   │   ├── ReceivePaymentModal.jsx
│   │   └── ...
│   ├── pages/               # Páginas principales
│   │   ├── Dashboard.jsx    # Dashboard de usuario/tienda
│   │   └── PayPage.jsx      # Página pública de pago
│   ├── services/            # Servicios para comunicación con API
│   │   ├── api.js           # Configuración de Axios
│   │   ├── authService.js   # Servicios de autenticación
│   │   ├── transactionService.js
│   │   ├── withdrawalService.js
│   │   └── userService.js
│   ├── App.jsx              # Componente principal con rutas
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Tecnologías

### Core
- **React 19**: Biblioteca de UI
- **Vite 7**: Build tool y dev server
- **React Router DOM 7**: Enrutamiento

### Estilos
- **Tailwind CSS 4**: Framework de CSS utility-first
- **PostCSS**: Procesamiento de CSS
- **Autoprefixer**: Prefijos de navegadores

### UI/Iconos
- **Font Awesome**: Iconos SVG
- **QRCode.react**: Generación de códigos QR
- **html5-qrcode**: Escaneo de códigos QR

### HTTP
- **Axios**: Cliente HTTP para API calls

## 🔌 Rutas

- `/` - Redirige a login
- `/login` - Página de inicio de sesión (unificada para usuarios y tiendas)
- `/register` - Página de registro (con selector de tipo: usuario o tienda)
- `/dashboard/user` - Dashboard para usuarios
- `/dashboard/store` - Dashboard para tiendas
- `/pay` - Página pública de pago (accesible mediante QR)

## 🎯 Características Principales

### Para Usuarios
- ✅ Dashboard personalizado con balance y CBU destacado
- ✅ Envío de dinero por CBU
- ✅ Generación de códigos de retiro (QR y numérico)
- ✅ Recibir pagos mediante QR
- ✅ Historial completo de transacciones
- ✅ Visualización de códigos QR para recibir pagos

### Para Comerciantes
- ✅ Dashboard con balance del comercio
- ✅ Procesar depósitos de usuarios
- ✅ Procesar retiros mediante código o QR
- ✅ Historial de transacciones del comercio
- ✅ Escaneo de códigos QR para procesar retiros

### Diseño
- ✅ Diseño moderno con efecto glassmorphism
- ✅ Responsive (mobile-first)
- ✅ Animaciones suaves
- ✅ Tema claro con paleta de colores azul/blanco/gris
- ✅ Tipografía moderna (Inter, Poppins, Space Grotesk)

## 🎨 Componentes Principales

### Modales

- **SendMoneyModal**: Enviar dinero a otro usuario
- **WithdrawMoneyModal**: Generar código de retiro
- **ProcessWithdrawalModal**: Procesar retiro (comerciantes)
- **TransactionsHistoryModal**: Ver historial de transacciones
- **ReceivePaymentModal**: Mostrar QR para recibir pagos
- **MyQRCodeModal**: Ver código QR personal
- **AddMoneyModal**: Agregar dinero al balance (comerciantes)

### Páginas

- **Dashboard**: Dashboard principal según tipo de usuario
- **PayPage**: Página pública para procesar pagos

## 🔐 Autenticación

El frontend maneja la autenticación mediante:

1. **Login**: Obtiene token JWT del backend
2. **Almacenamiento**: Token guardado en `localStorage`
3. **Interceptores**: Axios automáticamente agrega token a requests
4. **Rutas Protegidas**: `ProtectedRoute` verifica autenticación

### Flujo de Autenticación

```javascript
// Login
const response = await authService.login(email, password);
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Los interceptores agregan automáticamente el token
// Ver: src/services/api.js
```

## 🎨 Estilos y Temas

### Tailwind CSS

El proyecto usa Tailwind CSS 4 con configuración personalizada:

- **Colores principales**: Azul (#2563eb), Blanco, Gris
- **Tipografía**: Inter (body), Poppins/Space Grotesk (títulos)
- **Espaciado**: Sistema de espaciado consistente
- **Breakpoints**: sm, md, lg, xl

### Efecto Glassmorphism

```jsx
className="bg-white/90 backdrop-blur-xl border border-gray-200/50"
```

### Animaciones

- Fondo con gradientes animados
- Transiciones suaves en hover
- Blobs animados en el background

## 📱 Responsive Design

El diseño es completamente responsive:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Se usa el sistema de breakpoints de Tailwind:

```jsx
className="text-sm sm:text-base lg:text-lg"
```

## 🔌 Servicios API

### authService.js
```javascript
import { authService } from './services/authService';

// Login
const response = await authService.login(email, password);

// Register
const response = await authService.register(data);
```

### transactionService.js
```javascript
import { transactionService } from './services/transactionService';

// Enviar dinero
await transactionService.sendMoney(cbu, amount, description);

// Obtener historial
const history = await transactionService.getTransactions(limit, offset);
```

### withdrawalService.js
```javascript
import { withdrawalService } from './services/withdrawalService';

// Generar código
const code = await withdrawalService.generateCode(amount);

// Procesar código (comerciante)
await withdrawalService.processCode(code);
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Construir para producción
npm run preview          # Previsualizar build de producción

# Linting
npm run lint             # Ejecutar ESLint
```

## 📦 Dependencias Principales

- **react**: ^19.2.0
- **react-dom**: ^19.2.0
- **react-router-dom**: ^7.9.6
- **axios**: ^1.13.2
- **tailwindcss**: ^4.1.17
- **@fortawesome/react-fontawesome**: ^3.1.0
- **qrcode.react**: ^4.2.0
- **html5-qrcode**: ^2.3.8

## 🔍 Debugging

### React DevTools

Instala la extensión de Chrome/Firefox para inspeccionar componentes.

### Console Logs

```jsx
useEffect(() => {
  console.log('[Component] State:', { state, props });
}, [state]);
```

### Breakpoints

Usa `debugger;` en el código o breakpoints en Chrome DevTools.

## 🚢 Despliegue

### Build de Producción

```bash
npm run build
```

### Variables de Entorno

En producción, configura:

```env
VITE_API_URL=https://api.localpay.com/api
```

### Servir Archivos Estáticos

Los archivos en `dist/` pueden ser servidos por cualquier servidor web estático:

- **Nginx**
- **Apache**
- **Vercel**
- **Netlify**
- **GitHub Pages**

## 📚 Documentación Relacionada

- [Documentación Principal](../README.md)
- [Documentación de API](../API_DOCUMENTATION.md)
- [Guía de Desarrollo](../DEVELOPMENT_GUIDE.md)

## 🐛 Troubleshooting

### Error: "Failed to fetch"

1. Verifica que el backend esté corriendo
2. Verifica `VITE_API_URL` en `.env`
3. Verifica CORS en el backend

### Error: "Token expired"

El token JWT expira. El usuario debe hacer login nuevamente.

### Error: CORS

Asegúrate de que el backend tenga configurado CORS para el origen del frontend.

---

**Última actualización**: Diciembre 2024
