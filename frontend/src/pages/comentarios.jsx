import { useState, useEffect, useCallback } from 'react';
import { useGetComentarios } from '../hooks/comentario/useGetComentarios.jsx';
import { useCreateComentario } from '../hooks/comentario/useCreateComentario.jsx';
import { useUpdateComentario } from '../hooks/comentario/useUpdateComentario.jsx';
import { useDeleteComentario } from '../hooks/comentario/useDeleteComentario.jsx';
import { downloadArchivoComentario } from '../services/comentario.service.js';
import FileUploadComentario from '../components/FileUploadComentario.jsx';
import Swal from 'sweetalert2';
import '../styles/comentario.css';

const Comentarios = () => {
    const { comentarios, handleGetComentarios, loading } = useGetComentarios();
    const { handleCreateComentario, loading: loadingCreate } = useCreateComentario();
    const { handleUpdateComentario, loading: loadingUpdate } = useUpdateComentario();
    const { handleDeleteComentario } = useDeleteComentario();

    const [searchTerm, setSearchTerm] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editingComentario, setEditingComentario] = useState(null);
    const [expandedMensaje, setExpandedMensaje] = useState({});
    const [expandedRespuesta, setExpandedRespuesta] = useState({});
    
    const [formData, setFormData] = useState({
        mensaje: '',
        nivelUrgencia: 'normal',
        tipoProblema: 'General'
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editFormData, setEditFormData] = useState({
        mensaje: '',
        nivelUrgencia: 'normal',
        tipoProblema: 'General',
        estado: 'Pendiente'
    });
    const [selectedFilesEdit, setSelectedFilesEdit] = useState([]);

    const refreshComentarios = useCallback(() => {
        handleGetComentarios();
    }, [handleGetComentarios]);

    useEffect(() => {
        refreshComentarios();
    }, [refreshComentarios]);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const comentariosFiltrados = (comentarios || [])
        .filter((comentario) => {
            const mensaje = comentario.mensaje?.toLowerCase() || '';
            return mensaje.includes(searchTerm.toLowerCase());
        });

    const handleOpenCreate = () => {
        setFormData({
            mensaje: '',
            nivelUrgencia: 'normal',
            tipoProblema: 'General'
        });
        setSelectedFiles([]);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleOpenEdit = (comentario) => {
        setEditingComentario(comentario);
        setEditFormData({
            mensaje: comentario.mensaje || '',
            nivelUrgencia: comentario.nivelUrgencia || 'normal',
            tipoProblema: comentario.tipoProblema || 'General',
            estado: comentario.estado || 'Pendiente'
        });
        setSelectedFilesEdit([]);
        setIsEditPopupOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditPopupOpen(false);
        setEditingComentario(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleFilesSelected = (files) => {
        setSelectedFiles(files);
    };

    const handleFilesSelectedEdit = (files) => {
        setSelectedFilesEdit(files);
    };

    // Función de validación para comentarios
    const validateComentario = (data, archivos, isEdit = false) => {
        const mensaje = (data.mensaje || '').trim();
        
        if (!mensaje) {
            return { valid: false, message: 'El mensaje no puede estar vacío.' };
        }
        if (/^\d+$/.test(mensaje)) {
            return { valid: false, message: 'El mensaje no puede contener solo números.' };
        }
        if (/^[^A-Za-z0-9]+$/.test(mensaje)) {
            return { valid: false, message: 'El mensaje no puede contener solo caracteres especiales.' };
        }
        if (mensaje.length < 5) {
            return { valid: false, message: 'El mensaje debe tener al menos 5 caracteres.' };
        }
        if (mensaje.length > 500) {
            return { valid: false, message: 'El mensaje no puede exceder los 500 caracteres.' };
        }

        const nivel = data.nivelUrgencia;
        if (nivel && !['normal', 'alta'].includes(nivel)) {
            return { valid: false, message: 'Nivel de urgencia inválido.' };
        }

        const tipo = data.tipoProblema;
        if (tipo && !['Personal', 'General', 'De Empresa'].includes(tipo)) {
            return { valid: false, message: 'Tipo de problema inválido.' };
        }

        if (isEdit) {
            const estado = data.estado;
            if (estado && !['Abierto', 'Respondido', 'Pendiente'].includes(estado)) {
                return { valid: false, message: 'Estado inválido.' };
            }
        }

        if (archivos && archivos.length > 5) {
            return { valid: false, message: 'No se pueden subir más de 5 archivos.' };
        }

        return { valid: true };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar antes de enviar
        const validation = validateComentario(formData, selectedFiles, false);
        if (!validation.valid) {
            Swal.fire({
                icon: 'warning',
                title: 'Validación',
                text: validation.message,
                timer: 3000
            });
            return;
        }

        const dataToSend = {
            mensaje: formData.mensaje.trim(),
            nivelUrgencia: formData.nivelUrgencia,
            tipoProblema: formData.tipoProblema,
            archivos: selectedFiles
        };

        const response = await handleCreateComentario(dataToSend);
        if (response) {
            handleClosePopup();
            refreshComentarios();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingComentario) return;

        // Validar antes de enviar
        const validation = validateComentario(editFormData, selectedFilesEdit, true);
        if (!validation.valid) {
            Swal.fire({
                icon: 'warning',
                title: 'Validación',
                text: validation.message,
                timer: 3000
            });
            return;
        }

        const dataToSend = {
            mensaje: editFormData.mensaje.trim(),
            nivelUrgencia: editFormData.nivelUrgencia,
            tipoProblema: editFormData.tipoProblema,
            estado: editFormData.estado,
            archivos: selectedFilesEdit.length > 0 ? selectedFilesEdit : undefined
        };

        const response = await handleUpdateComentario(editingComentario.id, dataToSend);
        if (response) {
            handleCloseEdit();
            refreshComentarios();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getUserInitials = (nombreCompleto) => {
        if (!nombreCompleto) return '??';
        const words = nombreCompleto.split(' ');
        return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
    };

    const getUrgenciaClass = (nivel) => {
        return nivel === 'alta' ? 'alta' : 'normal';
    };

    const truncateText = (text, max = 220) => {
        if (!text) return '';
        return text.length > max ? text.substring(0, max) + '...' : text;
    };

    const isLongText = (text, max = 220) => text && text.length > max;

    const toggleExpandMensaje = (id) => {
        setExpandedMensaje(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpandRespuesta = (id) => {
        setExpandedRespuesta(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <div className="comentarios-estudiante-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Cargando comentarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="comentarios-estudiante-container">
            <div className="comentarios-header">
                <h1>💬 Mis Comentarios</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Buscar comentarios..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <button 
                        className="btn-crear-comentario" 
                        onClick={handleOpenCreate}
                        disabled={loadingCreate}
                    >
                        + Nuevo Comentario
                    </button>
                </div>
            </div>

            <div className="comentarios-list">
                {comentariosFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <p>No tienes comentarios aún. ¡Crea uno nuevo!</p>
                    </div>
                ) : (
                    comentariosFiltrados.map((comentario) => (
                        <div key={comentario.id} className="comentario-card">
                            <div className="comentario-header-card">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {getUserInitials(comentario.usuario?.nombreCompleto)}
                                    </div>
                                    <div>
                                        <span className="user-name">
                                            {comentario.usuario?.nombreCompleto || 'Usuario'}
                                        </span>
                                        <span className="comentario-date">
                                            {formatDate(comentario.fechaCreacion)}
                                        </span>
                                    </div>
                                </div>
                                <div className="comentario-badges">
                                    <span className={`urgencia-badge ${getUrgenciaClass(comentario.nivelUrgencia)}`}>
                                        {comentario.nivelUrgencia === 'alta' ? '🔴 Alta' : '🟢 Normal'}
                                    </span>
                                    <span className="tipo-badge">{comentario.tipoProblema}</span>
                                    {comentario.estado !== 'Respondido' && (
                                        <button 
                                            className="btn-editar" 
                                            onClick={() => handleOpenEdit(comentario)}
                                        >
                                            ✏️ Editar
                                        </button>
                                    )}
                                    <button
                                        className="btn-eliminar"
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: '¿Eliminar comentario?',
                                                text: 'Esta acción es irreversible.',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#dc2626',
                                                cancelButtonColor: '#6b7280',
                                                confirmButtonText: 'Sí, eliminar',
                                                cancelButtonText: 'Cancelar'
                                            });
                                            if (result.isConfirmed) {
                                                await handleDeleteComentario(comentario.id);
                                                refreshComentarios();
                                                Swal.fire('Eliminado', 'El comentario ha sido eliminado.', 'success');
                                            }
                                        }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>

                            <div className="comentario-body">
                                <p>
                                    {expandedMensaje[comentario.id] 
                                        ? comentario.mensaje 
                                        : truncateText(comentario.mensaje)}
                                    {isLongText(comentario.mensaje) && (
                                        <button 
                                            onClick={() => toggleExpandMensaje(comentario.id)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: '#0066cc', 
                                                cursor: 'pointer',
                                                marginLeft: '5px'
                                            }}
                                        >
                                            {expandedMensaje[comentario.id] ? 'Ver menos' : 'Ver más'}
                                        </button>
                                    )}
                                </p>

                                {comentario.archivos && comentario.archivos.length > 0 && (
                                    <div className="archivos-section">
                                        <p className="archivos-title">📎 Archivos adjuntos:</p>
                                        {comentario.archivos.map((archivo, idx) => (
                                            <div key={idx} className="archivo-item-estudiante">
                                                <span className="archivo-icon">📄</span>
                                                <button
                                                    onClick={() => downloadArchivoComentario(comentario.id, idx, archivo.nombre || archivo.originalname)}
                                                    className="archivo-link"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066cc', textDecoration: 'underline' }}
                                                >
                                                    {archivo.nombre || archivo.originalname}
                                                </button>
                                                {archivo.tamaño && (
                                                    <span className="archivo-size">
                                                        ({(archivo.tamaño / 1024).toFixed(1)} KB)
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {comentario.respuesta && (
                                <div className="respuesta-docente">
                                    <div className="respuesta-header">
                                        <div className="profesor-avatar">👨‍🏫</div>
                                        <div>
                                            <span className="profesor-name">Respuesta del Docente</span>
                                            <span className="respuesta-date">{formatDate(comentario.fechaRespuesta)}</span>
                                        </div>
                                    </div>
                                    <p className="respuesta-text">
                                        {expandedRespuesta[comentario.id] 
                                            ? comentario.respuesta 
                                            : truncateText(comentario.respuesta)}
                                        {isLongText(comentario.respuesta) && (
                                            <button 
                                                onClick={() => toggleExpandRespuesta(comentario.id)}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: '#0066cc', 
                                                    cursor: 'pointer',
                                                    marginLeft: '5px'
                                                }}
                                            >
                                                {expandedRespuesta[comentario.id] ? 'Ver menos' : 'Ver más'}
                                            </button>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Crear Comentario */}
            {isPopupOpen && (
                <div className="modal-overlay" onClick={handleClosePopup}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-estudiante">
                            <h2>Nuevo Comentario</h2>
                            <button className="btn-cancelar-header" onClick={handleClosePopup}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-content-estudiante">
                            <div className="form-group">
                                <label>Mensaje *</label>
                                <textarea
                                    name="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleInputChange}
                                    placeholder="Describe tu consulta o problema..."
                                    required
                                    minLength={5}
                                    maxLength={500}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nivel de Urgencia</label>
                                    <select 
                                        name="nivelUrgencia" 
                                        value={formData.nivelUrgencia} 
                                        onChange={handleInputChange}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tipo de Problema</label>
                                    <select 
                                        name="tipoProblema" 
                                        value={formData.tipoProblema} 
                                        onChange={handleInputChange}
                                    >
                                        <option value="General">General</option>
                                        <option value="Personal">Personal</option>
                                        <option value="De Empresa">De Empresa</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Archivos (opcional)</label>
                                <FileUploadComentario onFilesSelected={handleFilesSelected} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancelar" onClick={handleClosePopup}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-enviar" disabled={loadingCreate}>
                                    {loadingCreate ? 'Enviando...' : 'Enviar Comentario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Comentario */}
            {isEditPopupOpen && editingComentario && (
                <div className="modal-overlay" onClick={handleCloseEdit}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-estudiante">
                            <h2>Editar Comentario</h2>
                            <button className="btn-cancelar-header" onClick={handleCloseEdit}>✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="modal-content-estudiante">
                            <div className="form-group">
                                <label>Mensaje *</label>
                                <textarea
                                    name="mensaje"
                                    value={editFormData.mensaje}
                                    onChange={handleEditInputChange}
                                    placeholder="Describe tu consulta o problema..."
                                    required
                                    minLength={5}
                                    maxLength={500}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nivel de Urgencia</label>
                                    <select 
                                        name="nivelUrgencia" 
                                        value={editFormData.nivelUrgencia} 
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tipo de Problema</label>
                                    <select 
                                        name="tipoProblema" 
                                        value={editFormData.tipoProblema} 
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="General">General</option>
                                        <option value="Personal">Personal</option>
                                        <option value="De Empresa">De Empresa</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Archivos adicionales (opcional)</label>
                                <FileUploadComentario onFilesSelected={handleFilesSelectedEdit} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancelar" onClick={handleCloseEdit}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-enviar" disabled={loadingUpdate}>
                                    {loadingUpdate ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comentarios;
