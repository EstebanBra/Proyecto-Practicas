import { useState, useEffect } from 'react';
import '@styles/bitacoras.css';
import {
    useCreateBitacora,
    useBitacoras,
    useUltimaSemana,
    useDocumentoBitacora,
    useDocumentos,
    useBuscarPorRut
} from '../hooks/bitacora/useBitacora.jsx';
import { useFileUpload } from '../hooks/files/useFileUpload.jsx';
import FileUpload from '../components/FileUpload.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { showAlert } from '../helpers/sweetAlert.js';
// Importamos el servicio
import { bitacoraService } from '../services/bitacora.service.js';

const Bitacoras = () => {
    const { user } = useAuth();
    const userRole = user?.rol;
    const isEstudiante = userRole === 'estudiante';
    const isDocente = userRole === 'docente';
    const isAdmin = userRole === 'administrador';

    // 1. Estado para el ID
    const [idPractica, setIdPractica] = useState(null);
    const [tienePracticaActiva, setTienePracticaActiva] = useState(false);
    const [cargandoPractica, setCargandoPractica] = useState(true);

    // Estado para manejar la actualización de estado de bitácoras
    const [actualizandoEstado, setActualizandoEstado] = useState(null);

    // 2. DEFINICIÓN DE TODOS LOS HOOKS (Deben ir PRIMERO)
    
    // Hooks de bitácoras
    const { createBitacora, loading: creatingBitacora } = useCreateBitacora();
    const { bitacoras, loading: loadingBitacoras, fetchBitacoras } = useBitacoras(idPractica);
    const { ultimaSemana, fetchUltimaSemana } = useUltimaSemana(idPractica);

    // Hooks de documentos (Aquí está fetchDocumentos)
    const { subirArchivo, registrarDocumento, loading: uploadingFile } = useDocumentoBitacora();
    const { fetchDocumentos } = useDocumentos(idPractica);
    const { files, uploadError, addFile, removeFile, clearFiles, getFileToUpload } = useFileUpload();

    // Hook de búsqueda
    const { resultado: resultadoBusqueda, loading: buscando, error: errorBusqueda, buscarPorRut, limpiarBusqueda } = useBuscarPorRut();

    // Estados locales
    const [formData, setFormData] = useState({
        semana: '',
        descripcion_actividades: '',
        resultados_aprendizajes: '',
        horas_trabajadas: ''
    });

    const [archivoSubido, setArchivoSubido] = useState(null);
    const [documentoId, setDocumentoId] = useState(null);
    const [rutBusqueda, setRutBusqueda] = useState('');

    // 3. AHORA SÍ VAN LOS USE-EFFECT (Porque fetchDocumentos ya existe arriba)

    // Efecto A: Obtener el ID Real de la práctica
    useEffect(() => {
        if (isEstudiante) {
            const cargarPractica = async () => {
                setCargandoPractica(true);
                const { data } = await bitacoraService.obtenerMiPractica();
                if (data && data.data && data.data.id_practica) {
                    setIdPractica(data.data.id_practica);
                    setTienePracticaActiva(true);
                } else {
                    setIdPractica(null);
                    setTienePracticaActiva(false);
                }
                setCargandoPractica(false);
            };
            cargarPractica();
        } else {
            setCargandoPractica(false);
        }
    }, [isEstudiante]);

    // Efecto B: Cargar datos cuando ya tenemos el ID
    useEffect(() => {
        if (isEstudiante && idPractica) {
            fetchBitacoras();
            fetchUltimaSemana();
            fetchDocumentos(); // <--- Ahora sí funciona porque useDocumentos se declaró arriba
        }
    }, [idPractica, isEstudiante, fetchBitacoras, fetchUltimaSemana, fetchDocumentos]);

    // ... (El resto de tus funciones handleInputChange, handleSubmit, render, etc. siguen igual)
    // COPIA AQUÍ EL RESTO DEL COMPONENTE IGUAL QUE ANTES
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileAdd = (file) => {
        const added = addFile(file);
        if (!added && uploadError) {
            showAlert('Error', uploadError, 'error');
        }
    };

    const handleUploadFile = async () => {
        if (files.length === 0) {
            showAlert('Advertencia', 'Por favor selecciona un archivo primero', 'warning');
            return;
        }

        try {
            const fileToUpload = getFileToUpload();
            if (!fileToUpload) {
                showAlert('Error', 'No se pudo obtener el archivo', 'error');
                return;
            }

            const { data, error } = await subirArchivo(fileToUpload);

            if (error) {
                showAlert('Error', error, 'error');
                return;
            }

            const documentData = {
                id_practica: idPractica,
                ...data.data
            };

            const { data: docData, error: docError } = await registrarDocumento(documentData);

            if (docError) {
                showAlert('Error', docError, 'error');
                return;
            }

            setDocumentoId(docData.data.id_documento);
            setArchivoSubido({
                nombre: data.data.nombre_archivo,
                id: docData.data.id_documento
            });
            clearFiles();
            fetchDocumentos();
            showAlert('Éxito', 'Archivo subido correctamente', 'success');
        } catch (error) {
            showAlert('Error', error.message, 'error');
        }
    };

    const handleRemoveUploadedFile = () => {
        setArchivoSubido(null);
        setDocumentoId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const semanaNum = parseInt(formData.semana);
        if (semanaNum <= ultimaSemana) {
            showAlert('Error', `La semana debe ser mayor a ${ultimaSemana}`, 'error');
            return;
        }

        if (formData.descripcion_actividades.length < 50) {
            showAlert('Error', 'La descripción debe tener al menos 50 caracteres', 'error');
            return;
        }

        if (formData.resultados_aprendizajes.length < 25) {
            showAlert('Error', 'Los resultados deben tener al menos 25 caracteres', 'error');
            return;
        }

        const bitacoraData = {
            id_practica: idPractica,
            semana: semanaNum,
            descripcion_actividades: formData.descripcion_actividades,
            resultados_aprendizajes: formData.resultados_aprendizajes,
            horas_trabajadas: parseFloat(formData.horas_trabajadas),
            ...(documentoId && { id_documento: documentoId })
        };

        const { error } = await createBitacora(bitacoraData);

        if (error) {
            showAlert('Error', error, 'error');
            return;
        }

        showAlert('Éxito', 'Bitácora registrada correctamente', 'success');

        setFormData({
            semana: '',
            descripcion_actividades: '',
            resultados_aprendizajes: '',
            horas_trabajadas: ''
        });
        setDocumentoId(null);
        setArchivoSubido(null);
        clearFiles();

        fetchBitacoras();
        fetchUltimaSemana();
        fetchDocumentos();
    };

    const handleBuscarRut = async (e) => {
        e.preventDefault();
        if (!rutBusqueda.trim()) {
            showAlert('Advertencia', 'Por favor ingresa un RUT', 'warning');
            return;
        }
        await buscarPorRut(rutBusqueda.trim());
    };

    const handleLimpiarBusqueda = () => {
        setRutBusqueda('');
        limpiarBusqueda();
    };

    // Función para cambiar el estado de una bitácora (para docentes)
    const handleCambiarEstado = async (idBitacora, nuevoEstado) => {
        setActualizandoEstado(idBitacora);
        try {
            const { error } = await bitacoraService.actualizarEstado(idBitacora, nuevoEstado);
            
            if (error) {
                showAlert('Error', error, 'error');
                return;
            }

            showAlert('Éxito', `Bitácora marcada como "${nuevoEstado}"`, 'success');
            
            // Recargar las bitácoras después de actualizar
            if (rutBusqueda) {
                await buscarPorRut(rutBusqueda.trim());
            }
        } catch {
            showAlert('Error', 'Error al actualizar el estado', 'error');
        } finally {
            setActualizandoEstado(null);
        }
    };

    // Función para eliminar una bitácora (para docentes)
    const handleEliminarBitacora = async (idBitacora, semana) => {
        // Confirmar antes de eliminar
        const confirmacion = window.confirm(`¿Estás seguro de eliminar la bitácora de la Semana ${semana}? Esta acción no se puede deshacer.`);
        
        if (!confirmacion) return;

        try {
            const { error } = await bitacoraService.eliminarBitacora(idBitacora);
            
            if (error) {
                showAlert('Error', error, 'error');
                return;
            }

            showAlert('Éxito', 'Bitácora eliminada correctamente', 'success');
            
            // Recargar las bitácoras después de eliminar
            if (rutBusqueda) {
                await buscarPorRut(rutBusqueda.trim());
            }
        } catch {
            showAlert('Error', 'Error al eliminar la bitácora', 'error');
        }
    };

    const renderBitacoraCard = (bitacora, index) => (
        <div key={bitacora.id_bitacora || index} className="bitacora-card">
            <div className="bitacora-header-card">
                <h3>Semana {bitacora.semana}</h3>
                <span className={`estado-badge ${bitacora.estado_revision}`}>
                    {bitacora.estado_revision === 'aprobado' && '✔ Aprobado'}
                    {bitacora.estado_revision === 'rechazado' && '✗ Rechazado'}
                    {bitacora.estado_revision === 'en_progreso' && '⧗ En Revisión'}
                    {bitacora.estado_revision === 'pendiente' && '⏳ Pendiente'}
                    {bitacora.estado_revision === 'completado' && '✓ Completado'}
                </span>
            </div>

            <div className="bitacora-content">
                <div className="info-row">
                    <span className="label">🕐 Horas:</span>
                    <span className="value">{bitacora.horas_trabajadas}h</span>
                </div>

                <div className="info-row">
                    <span className="label">📅 Fecha:</span>
                    <span className="value">
                        {new Date(bitacora.fecha_registro).toLocaleDateString('es-CL')}
                    </span>
                </div>

                <div className="activities-section">
                    <h4>Actividades:</h4>
                    <p>{bitacora.descripcion_actividades}</p>
                </div>

                <div className="learnings-section">
                    <h4>Aprendizajes:</h4>
                    <p>{bitacora.resultados_aprendizajes}</p>
                </div>

                {bitacora.nombre_archivo && (
                    <div className="document-attached">
                        <span>📎 {bitacora.nombre_archivo}</span>
                    </div>
                )}

                {bitacora.nota && (
                    <div className="info-row">
                        <span className="label">📊 Nota:</span>
                        <span className="value">{bitacora.nota}</span>
                    </div>
                )}

                {/* Botones de cambio de estado para docentes/admin */}
                {(isDocente || isAdmin) && (
                    <div className="estado-actions">
                        <p className="estado-actions-label">Cambiar estado:</p>
                        <div className="estado-buttons">
                            <button
                                className={`btn-estado btn-completado ${bitacora.estado_revision === 'completado' ? 'active' : ''}`}
                                onClick={() => handleCambiarEstado(bitacora.id_bitacora, 'completado')}
                                disabled={actualizandoEstado === bitacora.id_bitacora || bitacora.estado_revision === 'completado'}
                            >
                                {actualizandoEstado === bitacora.id_bitacora ? '⏳' : '✓'} Completado
                            </button>
                            <button
                                className={`btn-estado btn-aprobado ${bitacora.estado_revision === 'aprobado' ? 'active' : ''}`}
                                onClick={() => handleCambiarEstado(bitacora.id_bitacora, 'aprobado')}
                                disabled={actualizandoEstado === bitacora.id_bitacora || bitacora.estado_revision === 'aprobado'}
                            >
                                {actualizandoEstado === bitacora.id_bitacora ? '⏳' : '✔'} Aprobado
                            </button>
                            <button
                                className={`btn-estado btn-rechazado ${bitacora.estado_revision === 'rechazado' ? 'active' : ''}`}
                                onClick={() => handleCambiarEstado(bitacora.id_bitacora, 'rechazado')}
                                disabled={actualizandoEstado === bitacora.id_bitacora || bitacora.estado_revision === 'rechazado'}
                            >
                                {actualizandoEstado === bitacora.id_bitacora ? '⏳' : '✗'} Rechazado
                            </button>
                        </div>
                        
                        {/* Botón de eliminar bitácora */}
                        <div className="eliminar-action" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <button
                                className="btn-estado btn-eliminar"
                                onClick={() => handleEliminarBitacora(bitacora.id_bitacora, bitacora.semana)}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                            >
                                🗑️ Eliminar Bitácora
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (isEstudiante) {
        // Mostrar cargando mientras se verifica la práctica
        if (cargandoPractica) {
            return (
                <div className="bitacoras-container">
                    <div className="bitacoras-header">
                        <h1>📝 Gestión de Bitácoras</h1>
                    </div>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Cargando información de tu práctica...</p>
                    </div>
                </div>
            );
        }

        // Mostrar mensaje si no tiene práctica activa (postulación pendiente o no postulado)
        if (!tienePracticaActiva) {
            return (
                <div className="bitacoras-container">
                    <div className="bitacoras-header">
                        <h1>📝 Gestión de Bitácoras</h1>
                    </div>
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '50px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '10px',
                        margin: '20px',
                        border: '1px solid #ffc107'
                    }}>
                        <h2 style={{ color: '#856404' }}>⏳ Aún no tienes una práctica activa</h2>
                        <p style={{ color: '#856404', marginTop: '15px' }}>
                            Para poder registrar bitácoras, primero debes postular a una oferta de práctica 
                            y esperar a que el docente <strong>acepte</strong> tu postulación.
                        </p>
                        <p style={{ color: '#856404', marginTop: '10px' }}>
                            Una vez que tu postulación sea aceptada, podrás comenzar a 
                            registrar tus bitácoras semanales aquí.
                        </p>
                        <div style={{ marginTop: '20px' }}>
                            <a href="/ofertas-publicas" style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}>
                                Ver Ofertas de Práctica
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        // Si tiene práctica activa, mostrar el formulario
        return (
            <div className="bitacoras-container">
                <div className="bitacoras-header">
                    <h1>📝 Gestión de Bitácoras</h1>
                </div>

                <form className="bitacora-form" onSubmit={handleSubmit}>
                    <h2>Registrar Nueva Bitácora</h2>

                    <div className="form-section">
                        <h3>📋 Información de la Bitácora</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="semana">Semana *</label>
                                <div className="semana-info">
                                    <span className="badge-info">Última registrada: {ultimaSemana || 0}</span>
                                </div>
                                <input
                                    type="number"
                                    id="semana"
                                    name="semana"
                                    value={formData.semana}
                                    onChange={handleInputChange}
                                    min={ultimaSemana + 1}
                                    max="20"
                                    placeholder={`Semana ${ultimaSemana + 1} o mayor`}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="horas_trabajadas">Horas Trabajadas *</label>
                                <p className="hint">En intervalos de 0.5</p>
                                <input
                                    type="number"
                                    id="horas_trabajadas"
                                    name="horas_trabajadas"
                                    value={formData.horas_trabajadas}
                                    onChange={handleInputChange}
                                    step="0.5"
                                    min="0.5"
                                    max="40"
                                    placeholder="Ej: 8"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion_actividades">Descripción de Actividades *</label>
                            <p className="hint">Mínimo 50 caracteres</p>
                            <textarea
                                id="descripcion_actividades"
                                name="descripcion_actividades"
                                value={formData.descripcion_actividades}
                                onChange={handleInputChange}
                                placeholder="Describe las actividades realizadas durante esta semana..."
                                rows="4"
                                required
                            />
                            <span className={`char-count ${formData.descripcion_actividades.length >= 50 ? 'valid' : ''}`}>
                                {formData.descripcion_actividades.length}/50 mín
                            </span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="resultados_aprendizajes">Resultados de Aprendizaje *</label>
                            <p className="hint">Mínimo 25 caracteres</p>
                            <textarea
                                id="resultados_aprendizajes"
                                name="resultados_aprendizajes"
                                value={formData.resultados_aprendizajes}
                                onChange={handleInputChange}
                                placeholder="¿Qué aprendiste esta semana?"
                                rows="3"
                                required
                            />
                            <span className={`char-count ${formData.resultados_aprendizajes.length >= 25 ? 'valid' : ''}`}>
                                {formData.resultados_aprendizajes.length}/25 mín
                            </span>
                        </div>
                    </div>

                    <div className="form-section document-section">
                        <h3>📎 Adjuntar Documento (Opcional)</h3>
                        <p className="section-description">
                            Puedes adjuntar un archivo PDF, DOCX, ZIP o RAR (máx. 10 MB)
                        </p>
                        <p className="file-suggestion">
                            💡 <strong>Sugerencia:</strong> Para mejor organización, nombra tu archivo como 
                            <em> "Informe_Bitacora_Semana_X"</em> o similar.
                        </p>

                        {archivoSubido ? (
                            <div className="uploaded-file-preview">
                                <div className="file-preview-info">
                                    <span className="file-icon">📄</span>
                                    <div className="file-preview-details">
                                        <p className="file-preview-name">{archivoSubido.nombre}</p>
                                        <p className="file-preview-status">✔ Listo para guardar</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-remove-file"
                                    onClick={handleRemoveUploadedFile}
                                >
                                    ✕ Quitar
                                </button>
                            </div>
                        ) : (
                            <>
                                <FileUpload
                                    files={files}
                                    onAddFile={handleFileAdd}
                                    onRemoveFile={removeFile}
                                    error={uploadError}
                                    label=""
                                />

                                {files.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn-upload-file"
                                        onClick={handleUploadFile}
                                        disabled={uploadingFile}
                                    >
                                        {uploadingFile ? '⏳ Subiendo...' : '📤 Subir Archivo'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={creatingBitacora}>
                            {creatingBitacora ? '⏳ Guardando...' : '💾 Guardar Bitácora'}
                        </button>
                    </div>
                </form>

                <div className="bitacoras-section">
                    <h2>📋 Mis Bitácoras ({bitacoras?.length || 0})</h2>
                    
                    {loadingBitacoras ? (
                        <div className="loading">⏳ Cargando...</div>
                    ) : bitacoras && bitacoras.length > 0 ? (
                        <div className="bitacoras-grid">
                            {bitacoras.map((bitacora, index) => renderBitacoraCard(bitacora, index))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No hay bitácoras registradas</h3>
                            <p>Completa el formulario para crear tu primera bitácora</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isDocente || isAdmin) {
        return (
            <div className="bitacoras-container">
                <div className="bitacoras-header">
                    <h1>🔍 Revisar Bitácoras de Estudiantes</h1>
                </div>

                <div className="search-section">
                    <form className="search-form" onSubmit={handleBuscarRut}>
                        <div className="search-input-group">
                            <label htmlFor="rutBusqueda">Buscar por RUT del Estudiante</label>
                            <div className="search-row">
                                <input
                                    type="text"
                                    id="rutBusqueda"
                                    value={rutBusqueda}
                                    onChange={(e) => setRutBusqueda(e.target.value)}
                                    placeholder="12.345.678-9 (Con puntos y guión)"
                                    className="search-input"
                                />
                                <button type="submit" className="btn-search" disabled={buscando}>
                                    {buscando ? '⏳ Buscando...' : '🔍 Buscar'}
                                </button>
                                {resultadoBusqueda && (
                                    <button type="button" className="btn-clear" onClick={handleLimpiarBusqueda}>
                                        ✕ Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    {errorBusqueda && (
                        <div className="error-message">
                            ⚠️ {errorBusqueda}
                        </div>
                    )}
                </div>

                {resultadoBusqueda && (
                    <div className="search-results">
                        <div className="estudiante-info">
                            <h3>👤 Información del Estudiante</h3>
                            <div className="info-card">
                                <p><strong>Nombre:</strong> {resultadoBusqueda.estudiante?.nombre || 'No disponible'}</p>
                                <p><strong>RUT:</strong> {resultadoBusqueda.estudiante?.rut}</p>
                                <p><strong>Email:</strong> {resultadoBusqueda.estudiante?.email}</p>
                                {resultadoBusqueda.practica && (
                                    <p><strong>Estado Práctica:</strong> 
                                        <span className={`estado-practica ${resultadoBusqueda.practica.estado}`}>
                                            {resultadoBusqueda.practica.estado}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bitacoras-section">
                            <h3>📋 Bitácoras del Estudiante ({resultadoBusqueda.bitacoras?.length || 0})</h3>
                            
                            {resultadoBusqueda.bitacoras && resultadoBusqueda.bitacoras.length > 0 ? (
                                <div className="bitacoras-grid">
                                    {resultadoBusqueda.bitacoras.map((bitacora, index) => renderBitacoraCard(bitacora, index))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <h3>No hay bitácoras</h3>
                                    <p>Este estudiante aún no ha registrado bitácoras</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!resultadoBusqueda && !buscando && !errorBusqueda && (
                    <div className="empty-state initial-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Buscar Bitácoras</h3>
                        <p>Ingresa el RUT de un estudiante para ver sus bitácoras registradas</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bitacoras-container">
            <div className="empty-state">
                <div className="empty-icon">⚠️</div>
                <h3>Acceso no autorizado</h3>
                <p>No tienes permisos para ver esta página</p>
            </div>
        </div>
    );
};

export default Bitacoras;
