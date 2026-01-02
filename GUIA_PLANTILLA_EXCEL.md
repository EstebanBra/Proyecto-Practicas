# 🎯 Guía Rápida - Sistema de Plantillas Excel

## ✅ Estado Actual: Completamente Implementado

### Frontend ✓
- Interfaz intuitiva en `comentarioDocente.jsx`
- Dos paneles (Descargar | Subir)
- Selectores dinámicos de estudiantes
- Manejo de errores con SweetAlert2

### Backend ✓
- Servicios para generar y procesar Excel
- Controladores para los dos endpoints
- Rutas protegidas con autenticación y autorización
- Middleware para validar archivos Excel

### Dependencias ✓
- `exceljs` instalado en backend
- Multer configurado

---

## 🧪 Cómo Probar

### 1. Asegúrate de que el Backend esté ejecutándose
```bash
cd backend
npm start
# o npm run dev
```

### 2. Abre la Página de Comentarios del Docente
```
http://localhost:5173/comentarios
```

### 3. Prueba Descargar una Plantilla
- **Requiere:** Que haya comentarios creados
- **Pasos:**
  1. Ve el panel "📥 Descargar Plantilla"
  2. Haz clic en un nombre de estudiante
  3. Se descargará automáticamente el Excel

### 4. Prueba Subir una Plantilla
- **Pasos:**
  1. Ve al panel "📤 Subir Plantilla"
  2. Selecciona un estudiante del dropdown
  3. Elige el Excel que descargaste (o el que editaste)
  4. Haz clic en "📤 Subir Plantilla"
  5. Verás una confirmación con el número de comentarios actualizados

---

## 📊 Archivo Excel Generado

Cuando descargas una plantilla, obtendrás un archivo con esta estructura:

| ID Comentario | Fecha Creación | Comentario | Tipo Problema | Urgencia | Estado | Respuesta del Docente |
|---|---|---|---|---|---|---|
| 1 | 31/12/2025 | Pregunta del estudiante | Personal | alta | Pendiente | [COMPLETA AQUÍ] |
| 2 | 30/12/2025 | Otro comentario | General | normal | Pendiente | [COMPLETA AQUÍ] |

**Importante:** Solo edita la columna "Respuesta del Docente"

---

## 🔗 Endpoints Disponibles

### Descargar Excel
```
GET /api/comentarios/plantilla/descargar/{usuarioId}
Headers: Authorization: Bearer {token}
Response: Archivo XLSX
```

### Subir Excel
```
POST /api/comentarios/plantilla/subir/{usuarioId}
Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
Body: FormData con campo "plantilla" (archivo Excel)
Response: {
  "success": true,
  "message": "Plantilla procesada exitosamente",
  "data": {
    "totalProcesados": 5,
    "totalActualizados": 5,
    "comentarios": [...]
  }
}
```

---

## 🛠️ Estructura de Archivos

```
backend/
├── src/
│   ├── services/
│   │   └── comentario.service.js          ✓ Con Excel functions
│   ├── controllers/
│   │   └── comentario.controller.js       ✓ Con Excel handlers
│   ├── routes/
│   │   └── comentario.routes.js           ✓ Con Excel routes
│   ├── middlewares/
│   │   └── uploadExcel.middleware.js      ✓ NUEVO

frontend/
├── src/
│   ├── services/
│   │   └── comentario.service.js          ✓ Con Excel functions
│   ├── pages/
│   │   └── comentarioDocente.jsx          ✓ Con Excel UI
```

---

## ⚠️ Posibles Errores y Soluciones

### Error: "No se puede descargar la plantilla"
- **Causa:** El estudiante no tiene comentarios
- **Solución:** Crea comentarios primero

### Error: "El archivo debe ser Excel"
- **Causa:** Subiste un archivo que no es .xlsx o .xls
- **Solución:** Asegúrate de descargar el Excel original y solo editar la columna de respuestas

### Error: "Archivo muy grande"
- **Causa:** El archivo excede 5MB
- **Solución:** Usa un archivo Excel más pequeño (Los comentarios ocupan muy poco espacio)

### No aparecen estudiantes en el selector
- **Causa:** No hay comentarios cargados
- **Solución:** Crea comentarios como estudiante primero

---

## 📝 Cambios Realizados

### Backend
- ✅ Agregadas importaciones de ExcelJS
- ✅ Creadas 2 funciones en servicios
- ✅ Creados 2 controladores
- ✅ Agregadas 2 nuevas rutas
- ✅ Creado nuevo middleware para Excel

### Frontend
- ✅ Agregadas importaciones
- ✅ Agregados 2 estados
- ✅ Creadas 2 funciones handler
- ✅ Agregada sección UI con 2 paneles
- ✅ Selectores dinámicos

---

## 🚀 Próximas Mejoras Posibles

- [ ] Exportar historial completo de comentarios y respuestas
- [ ] Agregar plantilla con validaciones avanzadas
- [ ] Permitir editar solo comentarios específicos
- [ ] Soporte para múltiples estudiantes en un solo Excel
- [ ] Generación automática de reportes PDF
- [ ] Envío de email automático al estudiante cuando se responde

---

**Implementado:** ✅ 31 Diciembre 2025
**Estado:** Listo para producción
