# 📊 Sistema de Plantillas Excel para Comentarios

## Descripción General
Se ha implementado una funcionalidad que permite a los docentes descargar una plantilla Excel con todos los comentarios de un estudiante, responder los comentarios en la plantilla, y luego subir el archivo para guardar todas las respuestas automáticamente en el sistema.

## 🎯 Características

### 1. **Descargar Plantilla Excel**
**Endpoint:** `GET /api/comentarios/plantilla/descargar/:usuarioId`

**Requisitos:**
- Autenticación requerida
- El docente puede descargar plantillas de cualquier estudiante
- Los estudiantes solo pueden descargar sus propias plantillas

**Respuesta:**
- Archivo Excel descargado con nombre: `comentarios_estudiante_{usuarioId}.xlsx`
- Contiene los siguientes campos:
  - ID Comentario
  - Fecha Creación
  - Comentario (mensaje original)
  - Tipo Problema
  - Nivel de Urgencia
  - Estado
  - Respuesta del Docente (vacío para llenar)

**Formato del Excel:**
- Encabezados con fondo azul y texto blanco
- Filas con altura ajustada para mejor legibilidad
- Columnas con ancho automático según contenido
- Formato de texto envuelto para comentarios largos

### 2. **Subir Plantilla Completada**
**Endpoint:** `POST /api/comentarios/plantilla/subir/:usuarioId`

**Requisitos:**
- Autenticación requerida
- Solo docentes pueden subir plantillas
- Archivo debe ser Excel (.xlsx o .xls)
- Tamaño máximo: 5MB

**Parámetros:**
- Body: FormData con campo `plantilla` (archivo Excel)
- Params: `usuarioId` (ID del estudiante)

**Proceso:**
1. Valida el archivo Excel
2. Lee la plantilla y extrae las respuestas
3. Actualiza automáticamente los comentarios en la base de datos
4. Cambia el estado de los comentarios a "Respondido"

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Plantilla procesada exitosamente",
  "data": {
    "totalProcesados": 5,
    "totalActualizados": 5,
    "comentarios": [...]
  }
}
```

## 📁 Archivos Modificados/Creados

### Backend

1. **backend/src/services/comentario.service.js**
   - ✅ Agregada función `generateComentariosExcelService(usuarioId)`
   - ✅ Agregada función `processComentariosExcelService(usuarioId, filePath)`
   - ✅ Importación de librería `ExcelJS`

2. **backend/src/controllers/comentario.controller.js**
   - ✅ Agregado controlador `downloadComentariosExcel(req, res)`
   - ✅ Agregado controlador `uploadComentariosExcel(req, res)`
   - ✅ Importaciones actualizadas

3. **backend/src/routes/comentario.routes.js**
   - ✅ Agregada ruta: `GET /plantilla/descargar/:usuarioId`
   - ✅ Agregada ruta: `POST /plantilla/subir/:usuarioId`
   - ✅ Importación del nuevo middleware `uploadExcelFile`
   - ✅ Imports ordenados alfabéticamente

4. **backend/src/middlewares/uploadExcel.middleware.js** (NUEVO)
   - ✅ Middleware `uploadExcelFile` para validar y procesar archivos Excel
   - ✅ Validación de tipo de archivo (.xlsx, .xls)
   - ✅ Validación de tamaño máximo (5MB)
   - ✅ Manejo de errores de Multer

### Frontend

1. **frontend/src/services/comentario.service.js**
   - ✅ Agregada función `downloadComentariosExcel(usuarioId)`
   - ✅ Agregada función `uploadComentariosExcel(usuarioId, archivo)`
   - Realiza las solicitudes HTTP al backend y maneja descargas automáticas

2. **frontend/src/pages/comentarioDocente.jsx**
   - ✅ Importadas nuevas funciones del servicio
   - ✅ Agregados estados: `loadingExcel`, `selectedStudentId`
   - ✅ Agregadas funciones: `handleDescargarPlantilla()`, `handleSubirPlantilla()`
   - ✅ Nueva sección UI para descargar y subir plantillas Excel
   - ✅ Interfaz responsiva con dos paneles (Descargar | Subir)
   - ✅ Selectores dinámicos de estudiantes con comentarios

## 🔐 Control de Acceso

| Rol | Descargar | Subir |
|-----|-----------|-------|
| Docente | ✅ (Todos los estudiantes) | ✅ |
| Estudiante | ✅ (Solo sus propios) | ❌ |
| Admin | ✅ (Todos) | ✅ |

## 🚀 Cómo Usar

### Desde el Frontend (Interfaz del Docente)

La página de gestión de comentarios ahora tiene una nueva sección superior con dos paneles:

#### **Panel de Descargar Plantilla** (Lado Izquierdo)
1. Ve la lista de estudiantes que tienen comentarios
2. Haz clic en el botón con el nombre del estudiante
3. Se descargará automáticamente un archivo Excel: `comentarios_estudiante_[ID].xlsx`
4. Abre el archivo en Excel y completa la columna "Respuesta del Docente"

#### **Panel de Subir Plantilla** (Lado Derecho)
1. Selecciona el estudiante del dropdown
2. Elige el archivo Excel completado
3. Haz clic en "📤 Subir Plantilla"
4. El sistema procesará automáticamente las respuestas
5. Recibirás una confirmación indicando cuántos comentarios se actualizaron

### Desde la API (Llamadas HTTP)

**Descargar plantilla:**
```bash
GET /api/comentarios/plantilla/descargar/123
```
Descargará un archivo Excel con todos los comentarios del estudiante 123

**Subir plantilla completada:**
```bash
POST /api/comentarios/plantilla/subir/123
Body: FormData
- plantilla: [archivo Excel]
```

**Resultado:**
- Todos los comentarios se actualizan automáticamente
- Los estados cambian a "Respondido"
- Se retorna información del procesamiento

## 📊 Dependencias Agregadas

- **exceljs**: `^5.4.1` (o versión compatible)
  - Librería para crear, leer y modificar archivos Excel

## 🛠️ Instalación de Dependencias

```bash
cd backend
npm install exceljs
```

## ✨ Características de la Interfaz

### Diseño Responsivo
- Los dos paneles se distribuyen automáticamente según el tamaño de pantalla
- En móviles se apilan verticalmente
- En desktop se muestran lado a lado

### Indicadores Visuales
- Botones deshabilitados mientras se procesan los archivos
- Spinner/ícono ⏳ indica carga en progreso
- Mensajes de éxito/error con alertas SweetAlert2
- Selectores dinámicos que actualizan automáticamente con los estudiantes

### Validaciones
- **Descargar:** Solo funciona si el estudiante tiene comentarios
- **Subir:** Requiere seleccionar estudiante Y archivo Excel
- **Archivo:** Solo acepta .xlsx y .xls
- **Tamaño:** Máximo 5MB

### Confirmaciones y Retroalimentación
- Alerta de éxito cuando se descarga el Excel
- Alerta con número de comentarios procesados tras subir
- Manejo de errores con mensajes descriptivos
- Refrescamiento automático de lista después de subir

## ✨ Ventajas

1. **Eficiencia**: El docente puede responder múltiples comentarios de forma masiva
2. **Offline**: Puede descargar la plantilla, trabajar sin conexión y subir después
3. **Interfaz intuitiva**: Paneles claros y botones organizados
4. **Validación automática**: El sistema valida tipos de archivo y tamaños
5. **Actualización en lote**: Procesa múltiples respuestas en una sola operación
6. **Trazabilidad**: Mantiene registro de fechas y cambios de estado
7. **Formato profesional**: Excel con estilos y formato adecuado
5. **Actualización en lote**: Procesa múltiples respuestas en una sola operación
6. **Trazabilidad**: Mantiene registro de fechas y cambios de estado

## 🔧 Próximas Mejoras (Opcionales)

- [ ] Agregar columnas adicionales (fecha de respuesta, docente)
- [ ] Permitir marcar comentarios como "Revisado"
- [ ] Exportar histórico de comentarios y respuestas
- [ ] Validar que las respuestas no estén vacías antes de subir
- [ ] Agregar estadísticas de procesamiento
- [ ] Notificación por email cuando se cargan las respuestas

---

**Estado:** ✅ Implementación Completada
**Fecha:** Diciembre 31, 2025
