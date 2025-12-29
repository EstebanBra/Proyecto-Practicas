import { useEffect, useState, useCallback } from 'react';
import '../styles/comentario.css';
import { useGetComentarios } from '../hooks/comentario/useGetComentarios';
import { useCreateComentario } from '../hooks/comentario/useCreateComentario';
import { useUpdateComentario } from '../hooks/comentario/useUpdateComentario';
import FileUpload from '../components/FileUpload';
import Swal from 'sweetalert2';

const Comentarios = () => {
    const { comentarios, handleGetComentarios, loading } = useGetComentarios();
    const { handleCreateComentario, loading: loadingCreate } = useCreateComentario();
    const { handleUpdateComentario, loading: loadingUpdate } = useUpdateComentario();

    const [searchTerm, setSearchTerm] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editingComentario, setEditingComentario] = useState(null);
    const [editModalKey, setEditModalKey] = useState(0);
    const [expandedMensaje, setExpandedMensaje] = useState({});
    const [expandedRespuesta, setExpandedRespuesta] = useState({});
    
    const [formData, setFormData] = useState({
        mensaje: '',
        nivelUrgencia: '',
        tipoProblema: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editFormData, setEditFormData] = useState({
        mensaje: '',
        nivelUrgencia: '',
        tipoProblema: '',
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
            const mensaje = comentario?.mensaje || '';
            return mensaje.toLowerCase().includes(searchTerm.toLowerCase());
        });

    const handleOpenCreate = () => {
        setFormData({
            mensaje: '',
            nivelUrgencia: '',
            tipoProblema: ''
        });
        setSelectedFiles([]);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedFiles([]);
    };

    const handleOpenEdit = (comentario) => {
        setEditingComentario(comentario);
        setEditFormData({
            mensaje: comentario.mensaje || '',
            nivelUrgencia: comentario.nivelUrgencia || '',
            tipoProblema: comentario.tipoProblema || '',
            estado: comentario.estado || 'Pendiente'
        });
        setSelectedFilesEdit([]);
        setEditModalKey((prev) => prev + 1);
        setIsEditPopupOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditPopupOpen(false);
        setSelectedFilesEdit([]);
        setEditingComentario(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleFilesSelected = (files) => {
        setSelectedFiles(files);
    };

    const handleFilesSelectedEdit = (files) => {
        setSelectedFilesEdit(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validación cliente antes de enviar
        const validation = validateComentario(formData, selectedFiles, false);
        if (!validation.valid) {
            return Swal.fire({ icon: 'error', title: 'Error', text: validation.message });
        }

        const dataToSend = new FormData();
        dataToSend.append('mensaje', formData.mensaje);
        dataToSend.append('nivelUrgencia', formData.nivelUrgencia);
        dataToSend.append('tipoProblema', formData.tipoProblema);
        selectedFiles.forEach(file => dataToSend.append('archivos', file));

        await handleCreateComentario(dataToSend);
        refreshComentarios();
        handleClosePopup();
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingComentario) return;
        // Validación cliente antes de enviar edición
        const validation = validateComentario(editFormData, selectedFilesEdit, true);
        if (!validation.valid) {
            return Swal.fire({ icon: 'error', title: 'Error', text: validation.message });
        }

        const dataToSend = new FormData();
        dataToSend.append('mensaje', editFormData.mensaje);
        dataToSend.append('nivelUrgencia', editFormData.nivelUrgencia);
        dataToSend.append('tipoProblema', editFormData.tipoProblema);
        dataToSend.append('estado', editFormData.estado || 'Pendiente');
        selectedFilesEdit.forEach(file => dataToSend.append('archivos', file));

        await handleUpdateComentario(editingComentario.id, dataToSend);
        refreshComentarios();
        handleCloseEdit();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserInitials = (nombreCompleto) => {
        if (!nombreCompleto) return '?';
        const partes = nombreCompleto.trim().split(/\s+/);
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    };

    const getUrgenciaClass = (nivel) => {
        return nivel === 'alta' ? 'urgencia-badge alta' : 'urgencia-badge normal';
    };

    const truncateText = (text, max = 220) => {
        if (!text) return '';
        return text.length > max ? `${text.slice(0, max)}...` : text;
    };

    // Client-side validation mirroring backend Joi rules
    const validateComentario = (data, archivos, isEdit) => {
        const mensaje = (data.mensaje || '').trim();
        if (!mensaje) return { valid: false, message: 'El mensaje no puede estar vacío.' };
        if (/^\d+$/.test(mensaje)) return { valid: false, message: 'El mensaje no puede contener solo números.' };
            if (/^[^A-Za-z0-9]+$/.test(mensaje)) return { valid: false, message: 'El mensaje no puede contener solo caracteres especiales.' };
        if (mensaje.length < 5) return { valid: false, message: 'El mensaje debe tener al menos 5 caracteres.' };
        if (mensaje.length > 500) return { valid: false, message: 'El mensaje no puede exceder los 500 caracteres.' };

        const nivel = data.nivelUrgencia;
        if (nivel && !['normal', 'alta'].includes(nivel)) return { valid: false, message: 'Nivel de urgencia inválido.' };

        const tipo = data.tipoProblema;
        if (tipo && !['Personal', 'General', 'De Empresa'].includes(tipo)) return { valid: false, message: 'Tipo de problema inválido.' };

        if (isEdit) {
            const estado = data.estado;
            if (estado && !['Abierto','Respondido','Pendiente'].includes(estado)) return { valid: false, message: 'Estado inválido.' };
        }

        if (archivos && archivos.length > 5) return { valid: false, message: 'No se pueden subir más de 5 archivos.' };

        return { valid: true };
    };

    const isLongText = (text, max = 220) => text && text.length > max;

    const toggleExpandMensaje = (id) => {
        setExpandedMensaje((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpandRespuesta = (id) => {
        setExpandedRespuesta((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="comentarios-estudiante-container">
            <div className="comentarios-header">
                <h1>Mis Comentarios</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <button className="btn-crear-comentario" onClick={handleOpenCreate} disabled={loadingCreate}>
                        + Nuevo Comentario
                    </button>
                </div>
            </div>

            {isPopupOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header-estudiante">
                            <h2>Mis Comentarios</h2>
                            <button className="btn-cancelar-header" onClick={handleClosePopup}>
                                Cancelar
                            </button>
                        </div>

                        <div className="modal-content-estudiante">
                            <h3>Crear Nuevo Comentario</h3>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Comentario</label>
                                    <textarea
                                        name="mensaje"
                                        value={formData.mensaje}
                                        onChange={handleInputChange}
                                        placeholder="Describe tu situación o consulta..."
                                        required
                                        minLength={5}
                                        maxLength={500}
                                        rows={6}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nivel de Urgencia</label>
                                        <select
                                            name="nivelUrgencia"
                                            value={formData.nivelUrgencia}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled>Seleccione nivel</option>
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
                                            required
                                        >
                                            <option value="" disabled>Seleccione tipo</option>
                                            <option value="General">General</option>
                                            <option value="Personal">Personal</option>
                                            <option value="De Empresa">De Empresa</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Archivos Adjuntos</label>
                                    <FileUpload 
                                        onFilesSelected={handleFilesSelected}
                                        maxFiles={5}
                                    />
                                    {selectedFiles.length > 0 && (
                                        <div className="files-preview">
                                            <p className="files-count">Archivos adjuntos ({selectedFiles.length})</p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-enviar" disabled={loadingCreate}>
                                        {loadingCreate ? 'Enviando...' : 'Enviar Comentario'}
                                    </button>
                                    <button type="button" className="btn-cancelar" onClick={handleClosePopup}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isEditPopupOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header-estudiante">
                            <h2>Editar Comentario</h2>
                            <button className="btn-cancelar-header" onClick={handleCloseEdit}>
                                Cancelar
                            </button>
                        </div>

                        <div className="modal-content-estudiante">
                            <h3>Actualiza tu comentario</h3>
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group">
                                    <label>Comentario</label>
                                    <textarea
                                        name="mensaje"
                                        value={editFormData.mensaje}
                                        onChange={handleEditInputChange}
                                        placeholder="Edita tu comentario..."
                                        required
                                        minLength={5}
                                        maxLength={500}
                                        rows={6}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nivel de Urgencia</label>
                                        <select
                                            name="nivelUrgencia"
                                            value={editFormData.nivelUrgencia}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            <option value="" disabled>Seleccione nivel</option>
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
                                            required
                                        >
                                            <option value="" disabled>Seleccione tipo</option>
                                            <option value="General">General</option>
                                            <option value="Personal">Personal</option>
                                            <option value="De Empresa">De Empresa</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Archivos Adjuntos</label>
                                    <FileUpload 
                                        key={editModalKey}
                                        onFilesSelected={handleFilesSelectedEdit}
                                        maxFiles={5}
                                    />
                                    {selectedFilesEdit.length > 0 && (
                                        <div className="files-preview">
                                            <p className="files-count">Archivos adjuntos ({selectedFilesEdit.length})</p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-enviar" disabled={loadingUpdate}>
                                        {loadingUpdate ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button type="button" className="btn-cancelar" onClick={handleCloseEdit}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="comentarios-list">
                {loading ? (
                    <div className="empty-state">Cargando...</div>
                ) : comentariosFiltrados.length === 0 ? (
                    <div className="empty-state">No hay comentarios.</div>
                ) : (
                    comentariosFiltrados.map((comentario) => (
                        <div key={comentario.id} className="comentario-card">
                            <div className="comentario-header-card">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {getUserInitials(comentario.usuario?.nombreCompleto)}
                                    </div>
                                    <div>
                                        <div className="user-name">
                                            {comentario.usuario?.nombreCompleto || `Usuario #${comentario.usuarioId}`}
                                        </div>
                                        <div className="comentario-date">
                                            {formatDate(comentario.fechaCreacion)}
                                        </div>
                                    </div>
                                </div>
                                <div className="comentario-badges">
                                    <span className={getUrgenciaClass(comentario.nivelUrgencia)}>
                                        {comentario.nivelUrgencia === 'alta' ? '⚠️ Urgencia Alta' : 'Normal'}
                                    </span>
                                    <span className="tipo-badge">{comentario.tipoProblema}</span>
                                    {!comentario.respuesta && (
                                        <button
                                            type="button"
                                            className="btn-editar"
                                            onClick={() => handleOpenEdit(comentario)}
                                        >
                                            Editar
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="comentario-body">
                                <p title={comentario.mensaje}>
                                    {expandedMensaje[comentario.id]
                                        ? comentario.mensaje
                                        : truncateText(comentario.mensaje)}
                                </p>
                                {isLongText(comentario.mensaje) && (
                                    <button
                                        type="button"
                                        className="btn-crear-comentario"
                                        onClick={() => toggleExpandMensaje(comentario.id)}
                                    >
                                        {expandedMensaje[comentario.id] ? 'Ver menos' : 'Ver completo'}
                                    </button>
                                )}

                                {comentario.archivos && comentario.archivos.length > 0 && (
                                    <div className="archivos-section">
                                        <p className="archivos-title">Archivos adjuntos:</p>
                                        {comentario.archivos.map((archivo, index) => (
                                            <div key={index} className="archivo-item-estudiante">
                                                <span className="archivo-icon">📎</span>
                                                <a
                                                    href={`http://localhost:3000/api/comentario/archivo/${comentario.id}/${index}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="archivo-link"
                                                >
                                                    {archivo.nombre}
                                                </a>
                                                <span className="archivo-size">
                                                    {archivo.tamaño ? `${(archivo.tamaño / 1024 / 1024).toFixed(1)} MB` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {comentario.respuesta && (
                                    <div className="respuesta-docente">
                                        <div className="respuesta-header">
                                            <div className="profesor-avatar">P</div>
                                            <div>
                                                <div className="profesor-name">Prof. María González</div>
                                                <div className="respuesta-date">{formatDate(comentario.fechaCreacion)}</div>
                                            </div>
                                        </div>
                                        <p className="respuesta-text" title={comentario.respuesta}>
                                            {expandedRespuesta[comentario.id]
                                                ? comentario.respuesta
                                                : truncateText(comentario.respuesta, 180)}
                                        </p>
                                        {isLongText(comentario.respuesta, 180) && (
                                            <button
                                                type="button"
                                                className="btn-crear-comentario"
                                                onClick={() => toggleExpandRespuesta(comentario.id)}
                                            >
                                                {expandedRespuesta[comentario.id] ? 'Ver menos' : 'Ver respuesta completa'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comentarios;
