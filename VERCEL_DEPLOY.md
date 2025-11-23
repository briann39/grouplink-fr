# Guía de Despliegue en Vercel

Este documento explica cómo desplegar el frontend de LocalPay en Vercel.

## Requisitos Previos

1. Una cuenta en [Vercel](https://vercel.com)
2. El backend desplegado y funcionando (puede estar en Vercel, Railway, Render, etc.)
3. Git configurado en tu proyecto

## Pasos para Desplegar

### 1. Preparar el Proyecto

Asegúrate de que tu proyecto esté en un repositorio Git:

```bash
cd fontend
git init  # Si no está inicializado
git add .
git commit -m "Preparar para despliegue en Vercel"
```

### 2. Conectar con Vercel

#### Opción A: Desde la CLI de Vercel

1. Instala la CLI de Vercel:
```bash
npm i -g vercel
```

2. Inicia sesión:
```bash
vercel login
```

3. Despliega:
```bash
cd fontend
vercel
```

Sigue las instrucciones en pantalla para configurar el proyecto.

#### Opción B: Desde el Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `fontend` (si el proyecto está en la raíz, déjalo vacío)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Configurar Variables de Entorno

En el dashboard de Vercel, ve a tu proyecto → Settings → Environment Variables y agrega:

```
VITE_API_URL=https://tu-backend-url.com/api
```

**Importante**: Reemplaza `https://tu-backend-url.com/api` con la URL real de tu backend.

Ejemplos:
- Si tu backend está en Vercel: `https://tu-backend.vercel.app/api`
- Si está en Railway: `https://tu-backend.railway.app/api`
- Si está en Render: `https://tu-backend.onrender.com/api`
- Si está en un servidor propio: `https://api.tudominio.com/api`

### 4. Configurar Dominio Personalizado (Opcional)

1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los DNS

## Estructura de Archivos

El proyecto ya incluye:
- `vercel.json`: Configuración de Vercel
- `.vercelignore`: Archivos a ignorar en el despliegue

## Comandos Útiles

### Ver logs de despliegue
```bash
vercel logs
```

### Ver información del proyecto
```bash
vercel inspect
```

### Desplegar a producción
```bash
vercel --prod
```

### Desplegar preview
```bash
vercel
```

## Solución de Problemas

### Error: "Build failed"

1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de build en Vercel
3. Asegúrate de que `npm run build` funcione localmente

### Error: "API not found"

1. Verifica que `VITE_API_URL` esté configurada correctamente
2. Asegúrate de que el backend esté desplegado y accesible
3. Verifica que el backend permita CORS desde tu dominio de Vercel

### Error: "404 on routes"

1. Verifica que `vercel.json` tenga la configuración de rewrites
2. Asegúrate de que todas las rutas redirijan a `index.html`

## Notas Importantes

- Las variables de entorno que empiezan con `VITE_` son públicas y se incluyen en el bundle
- No incluyas información sensible en variables `VITE_*`
- El build se ejecuta automáticamente en cada push a la rama principal
- Los previews se crean automáticamente para cada pull request

## Soporte

Si tienes problemas, consulta:
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Vite](https://vitejs.dev)

