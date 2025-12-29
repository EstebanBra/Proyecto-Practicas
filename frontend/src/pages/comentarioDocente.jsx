import { useEffect, useState, useCallback } from 'react';
import '../styles/comentario.css';
import { useGetAllComentarios } from '../hooks/comentario/useGetAllComentarios';
import { useUpdateComentario } from '../hooks/comentario/useUpdateComentario';
import Swal from 'sweetalert2';
import { useDeleteComentario } from '../hooks/comentario/useDeleteComentario';

const ComentarioDocente = () => {
    const { comentarios, handleGetAllComentarios, loading } = useGetAllComentarios();
    const { handleUpdateComentario, loading: loadingUpdate } = useUpdateComentario();
    const { handleDeleteComentario } = useDeleteComentario();

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
    const [respuesta, setRespuesta] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const refreshComentarios = useCallback(() => {
        handleGetAllComentarios();
    }, [handleGetAllComentarios]);

    useEffect(() => {
        refreshComentarios();
    }, [refreshComentarios]);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const comentariosFiltrados = (comentarios || []).filter((comentario) => {
        const mensaje = comentario?.mensaje || '';
        const nombreUsuario = comentario?.usuario?.nombreCompleto || '';
        const term = searchTerm.trim().toLowerCase();
        // Si no hay término de búsqueda, consideramos que coincide
        const coincideBusqueda = term === ''
            ? true
            : (mensaje + ' ' + nombreUsuario).toLowerCase().includes(term);

        if (filtroEstado === 'todos') return coincideBusqueda;
        if (filtroEstado === 'pendientes') return coincideBusqueda && comentario.estado === 'Pendiente';
        if (filtroEstado === 'respondidos') return coincideBusqueda && comentario.estado === 'Respondido';

        return coincideBusqueda;
    });

    // Estadísticas
    const totalComentarios = comentarios?.length || 0;
    const pendientes = comentarios?.filter(c => c.estado === 'Pendiente').length || 0;
    const urgentessinresponder = comentarios?.filter(c => c.nivelUrgencia === 'alta' && c.estado === 'Pendiente').length || 0;
    const respondidos = comentarios?.filter(c => c.estado === 'Respondido').length || 0;

    const handleOpenRespuesta = (comentario) => {
        setComentarioSeleccionado(comentario);
        setRespuesta(comentario.respuesta || '');
        setSelectedFiles([]);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setComentarioSeleccionado(null);
        setRespuesta('');
        setSelectedFiles([]);
    };

    

    const handleSubmitRespuesta = async (e) => {
        e.preventDefault();
        if (!comentarioSeleccionado) return;

        // Validación cliente: no vacío, no solo números, longitud 5-500
        const respTrim = (respuesta || '').trim();
        if (!respTrim) return Swal.fire({ icon: 'error', title: 'Error', text: 'La respuesta no puede estar vacía.' });
        if (/^\d+$/.test(respTrim)) return Swal.fire({ icon: 'error', title: 'Error', text: 'La respuesta no puede contener solo números.' });
        // No permitir respuestas que sean solo caracteres especiales (sin letras ni dígitos)
        if (/^[^A-Za-z0-9]+$/.test(respTrim)) return Swal.fire({ icon: 'error', title: 'Error', text: 'La respuesta no puede contener solo caracteres especiales.' });
        if (respTrim.length < 5) return Swal.fire({ icon: 'error', title: 'Error', text: 'La respuesta debe tener al menos 5 caracteres.' });
        if (respTrim.length > 500) return Swal.fire({ icon: 'error', title: 'Error', text: 'La respuesta no puede exceder los 500 caracteres.' });

        const dataToSend = new FormData();
        dataToSend.append('respuesta', respTrim);
        dataToSend.append('estado', 'Respondido');
        selectedFiles.forEach(file => dataToSend.append('archivos', file));

        await handleUpdateComentario(comentarioSeleccionado.id, dataToSend);
        refreshComentarios();
        handleClosePopup();
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

    return (
        <div className="comentarios-docente-container">
            <div className="docente-header">
                <h1>Portal del Docente</h1>
                <p className="subtitle">Gestión de Comentarios - Prácticas Profesionales</p>
                <div className="header-actions-docente">
                    <input
                        type="text"
                        className="search-input-docente"
                        placeholder="Buscar por mensaje o estudiante..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {/* Estadísticas */}
            <div className="estadisticas-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">💬</div>
                    <div className="stat-content">
                        <div className="stat-label">Total de Comentarios</div>
                        <div className="stat-value">{totalComentarios}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">🕐</div>
                    <div className="stat-content">
                        <div className="stat-label">Pendientes</div>
                        <div className="stat-value">{pendientes}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div className="stat-content">
                        <div className="stat-label">Urgentes Sin Responder</div>
                        <div className="stat-value">{urgentessinresponder}</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="filtros-container">
                <div className="tabs">
                    <button 
                        className={filtroEstado === 'todos' ? 'tab active' : 'tab'}
                        onClick={() => setFiltroEstado('todos')}
                    >
                        Todos ({totalComentarios})
                    </button>
                    <button 
                        className={filtroEstado === 'pendientes' ? 'tab active' : 'tab'}
                        onClick={() => setFiltroEstado('pendientes')}
                    >
                        Pendientes ({pendientes})
                    </button>
                    <button 
                        className={filtroEstado === 'respondidos' ? 'tab active' : 'tab'}
                        onClick={() => setFiltroEstado('respondidos')}
                    >
                        Respondidos ({respondidos})
                    </button>
                </div>
            </div>

            {/* Modal de Respuesta */}
            {isPopupOpen && comentarioSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal-container-docente">
                        <h2 className="modal-title-docente">Responder Comentario</h2>
                        
                        <div className="comentario-original">
                            <div className="user-info-modal">
                                <div className="user-avatar">
                                    {getUserInitials(comentarioSeleccionado.usuario?.nombreCompleto)}
                                </div>
                                <div>
                                    <div className="user-name">
                                        {comentarioSeleccionado.usuario?.nombreCompleto || `Usuario #${comentarioSeleccionado.usuarioId}`}
                                    </div>
                                    <div className="comentario-date">
                                        {formatDate(comentarioSeleccionado.fechaCreacion)}
                                    </div>
                                </div>
                                <div className="badges-inline">
                                    <span className={comentarioSeleccionado.nivelUrgencia === 'alta' ? 'urgencia-badge alta' : 'urgencia-badge normal'}>
                                        {comentarioSeleccionado.nivelUrgencia === 'alta' ? 'Urgencia Alta' : 'Normal'}
                                    </span>
                                    <span className="tipo-badge">{comentarioSeleccionado.tipoProblema}</span>
                                </div>
                            </div>

                            
                            
                            <div className="mensaje-original">
                                <p>{comentarioSeleccionado.mensaje}</p>
                            </div>

                            {comentarioSeleccionado.archivos && comentarioSeleccionado.archivos.length > 0 && (
                                <div className="archivos-section-small">
                                    <p className="archivos-title-small">Archivos adjuntos:</p>
                                    {comentarioSeleccionado.archivos.map((archivo, index) => (
                                        <div key={index} className="archivo-item-small">
                                            <span className="archivo-icon">📎</span>
                                            <a
                                                href={`http://localhost:3000/api/comentario/archivo/${comentarioSeleccionado.id}/${index}`}
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
                        </div>

                        <form onSubmit={handleSubmitRespuesta}>
                            <div className="form-group">
                                <label>Escribe tu respuesta</label>
                                <textarea
                                    value={respuesta}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    placeholder="Escribe tu respuesta aquí..."
                                    required
                                    minLength={5}
                                    maxLength={500}
                                    rows={6}
                                />
                            </div>

                            <div className="form-actions-modal">
                                <button type="submit" className="btn-enviar-respuesta" disabled={loadingUpdate}>
                                    {loadingUpdate ? 'Enviando...' : 'Enviar Respuesta'}
                                </button>
                                <button type="button" className="btn-cancelar-modal" onClick={handleClosePopup}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de Comentarios */}
            <div className="comentarios-list-docente">
                {loading ? (
                    <div className="empty-state">Cargando...</div>
                ) : comentariosFiltrados.length === 0 ? (
                    <div className="empty-state">No hay comentarios.</div>
                ) : (
                    comentariosFiltrados.map((comentario) => (
                        <div 
                            key={comentario.id} 
                            className={`comentario-card-docente ${comentario.nivelUrgencia === 'alta' ? 'urgente' : ''}`}
                        >
                            <div className="comentario-header-docente">
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
                                    <span className={comentario.nivelUrgencia === 'alta' ? 'urgencia-badge alta' : 'urgencia-badge normal'}>
                                        {comentario.nivelUrgencia === 'alta' ? '⚠️ Urgencia Alta' : 'Normal'}
                                    </span>
                                    <span className="tipo-badge">{comentario.tipoProblema}</span>
                                </div>
                            </div>

                            <div className="comentario-body-docente">
                                <p>{comentario.mensaje}</p>

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
                                    <div className="tu-respuesta">
                                        <div className="respuesta-header-tu">
                                            <span className="icon-respuesta">💬</span>
                                            <span className="label-respuesta">Tu Respuesta</span>
                                            <span className="fecha-respuesta">{formatDate(comentario.fechaCreacion)}</span>
                                        </div>
                                        <p className="respuesta-text">{comentario.respuesta}</p>
                                    </div>
                                )}
                            </div>

                            <div className="comentario-actions">
                                <button 
                                    className="btn-responder"
                                    onClick={() => handleOpenRespuesta(comentario)}
                                >
                                    ← Responder
                                </button>
                                {comentario.respuesta && (
                                    <button
                                        className="btn-editar"
                                        onClick={() => handleOpenRespuesta(comentario)}
                                        style={{ marginLeft: 8 }}
                                    >
                                        Editar Respuesta
                                    </button>
                                )}
                                <button
                                    className="btn-eliminar-docente"
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: '¿Eliminar comentario?',
                                            text: 'Esta acción es irreversible.',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'Sí, eliminar',
                                            cancelButtonText: 'Cancelar'
                                        });
                                        if (result.isConfirmed) {
                                            const ok = await handleDeleteComentario(comentario.id);
                                            if (ok) refreshComentarios();
                                        }
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ComentarioDocente;
