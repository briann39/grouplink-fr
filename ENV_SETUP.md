# ⚙️ Configuración de Variables de Entorno - Frontend

## Configurar URL del Backend

Crea un archivo `.env` en la carpeta `fontend/`:

```env
VITE_API_URL=https://paylink-lo8a.vercel.app/api
```

### Para Desarrollo Local

```env
VITE_API_URL=http://localhost:3000/api
```

### Para Producción

```env
VITE_API_URL=https://paylink-lo8a.vercel.app/api
```

## Importante

1. **Después de cambiar `.env`**, reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. **El archivo `.env` está en `.gitignore`** - nunca se commitea por seguridad.

3. **En Vercel**, configura la variable en el dashboard:
   - Settings > Environment Variables
   - Agregar: `VITE_API_URL` = `https://paylink-lo8a.vercel.app/api`

## Verificar

Puedes verificar que la URL está configurada correctamente en la consola del navegador:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

---

**Última actualización**: Diciembre 2024

