import { useState, useEffect, useCallback } from 'react';
import { useGetAllComentarios } from '../hooks/comentario/useGetAllComentarios.jsx';
import { useUpdateComentario } from '../hooks/comentario/useUpdateComentario.jsx';
import '../styles/comentario.css';

const ComentarioDocente = () => {
    const { comentarios, handleGetAllComentarios, loading } = useGetAllComentarios();
    const { handleUpdateComentario, loading: loadingUpdate } = useUpdateComentario();

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
    const [respuesta, setRespuesta] = useState('');

    const refreshComentarios = useCallback(() => {
        handleGetAllComentarios();
    }, [handleGetAllComentarios]);

    useEffect(() => {
        refreshComentarios();
    }, [refreshComentarios]);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const comentariosFiltrados = (comentarios || []).filter((comentario) => {
        const mensaje = comentario.mensaje?.toLowerCase() || '';
        const nombreUsuario = comentario.usuario?.nombreCompleto?.toLowerCase() || '';
        const matchSearch = mensaje.includes(searchTerm.toLowerCase()) || 
                          nombreUsuario.includes(searchTerm.toLowerCase());
        
        if (filtroEstado === 'todos') return matchSearch;
        if (filtroEstado === 'pendientes') return matchSearch && comentario.estado === 'Pendiente';
        if (filtroEstado === 'respondidos') return matchSearch && comentario.estado === 'Respondido';
        if (filtroEstado === 'urgentes') return matchSearch && comentario.nivelUrgencia === 'alta';
        return matchSearch;
    });

    // Estadísticas
    const totalComentarios = comentarios?.length || 0;
    const pendientes = comentarios?.filter(c => c.estado === 'Pendiente').length || 0;
    const urgentessinresponder = comentarios?.filter(c => c.nivelUrgencia === 'alta' && c.estado === 'Pendiente').length || 0;
    const respondidos = comentarios?.filter(c => c.estado === 'Respondido').length || 0;

    const handleOpenRespuesta = (comentario) => {
        setComentarioSeleccionado(comentario);
        setRespuesta(comentario.respuesta || '');
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setComentarioSeleccionado(null);
        setRespuesta('');
    };

    const handleSubmitRespuesta = async (e) => {
        e.preventDefault();
        if (!comentarioSeleccionado) return;

        const dataToSend = {
            respuesta: respuesta,
            estado: 'Respondido'
        };

        const response = await handleUpdateComentario(comentarioSeleccionado.id, dataToSend);
        if (response) {
            handleClosePopup();
            refreshComentarios();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserInitials = (nombreCompleto) => {
        if (!nombreCompleto) return '??';
        const words = nombreCompleto.split(' ');
        return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
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
                <h1>📋 Gestión de Comentarios</h1>
            </div>

            {/* Estadísticas */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '15px', 
                marginBottom: '20px',
                padding: '0 20px'
            }}>
                <div style={{ 
                    background: '#e3f2fd', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    textAlign: 'center' 
                }}>
                    <h3 style={{ margin: 0, color: '#1976d2' }}>{totalComentarios}</h3>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>Total</p>
                </div>
                <div style={{ 
                    background: '#fff3e0', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    textAlign: 'center' 
                }}>
                    <h3 style={{ margin: 0, color: '#f57c00' }}>{pendientes}</h3>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>Pendientes</p>
                </div>
                <div style={{ 
                    background: '#ffebee', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    textAlign: 'center' 
                }}>
                    <h3 style={{ margin: 0, color: '#d32f2f' }}>{urgentessinresponder}</h3>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>Urgentes</p>
                </div>
                <div style={{ 
                    background: '#e8f5e9', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    textAlign: 'center' 
                }}>
                    <h3 style={{ margin: 0, color: '#388e3c' }}>{respondidos}</h3>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>Respondidos</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="docente-search-row">
                <input
                    type="text"
                    placeholder="Buscar por mensaje o estudiante..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input-docente"
                />
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                padding: '0 20px', 
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {['todos', 'pendientes', 'urgentes', 'respondidos'].map(filtro => (
                    <button
                        key={filtro}
                        onClick={() => setFiltroEstado(filtro)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            background: filtroEstado === filtro ? '#003366' : '#e0e0e0',
                            color: filtroEstado === filtro ? 'white' : '#333',
                            fontWeight: filtroEstado === filtro ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
                    </button>
                ))}
            </div>

            {/* Lista de comentarios */}
            <div className="comentarios-list">
                {comentariosFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay comentarios que mostrar.</p>
                    </div>
                ) : (
                    comentariosFiltrados.map((comentario) => (
                        <div 
                            key={comentario.id} 
                            className={`comentario-card ${comentario.nivelUrgencia === 'alta' ? 'urgencia-alta' : ''}`}
                            style={{
                                borderLeft: comentario.nivelUrgencia === 'alta' 
                                    ? '4px solid #d32f2f' 
                                    : comentario.estado === 'Respondido' 
                                        ? '4px solid #388e3c' 
                                        : '4px solid #f57c00'
                            }}
                        >
                            <div className="comentario-header-card">
                                <div className="user-info">
                                    <div className="user-avatar" style={{
                                        background: comentario.nivelUrgencia === 'alta' ? '#ffcdd2' : '#e3f2fd'
                                    }}>
                                        {getUserInitials(comentario.usuario?.nombreCompleto)}
                                    </div>
                                    <div>
                                        <span className="user-name">
                                            {comentario.usuario?.nombreCompleto || 'Estudiante'}
                                        </span>
                                        <span className="comentario-date">
                                            {formatDate(comentario.fechaCreacion)}
                                        </span>
                                        <span style={{ 
                                            fontSize: '0.8rem', 
                                            color: '#666',
                                            display: 'block'
                                        }}>
                                            {comentario.usuario?.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="comentario-badges">
                                    <span className={`urgencia-badge ${comentario.nivelUrgencia === 'alta' ? 'alta' : 'normal'}`}>
                                        {comentario.nivelUrgencia === 'alta' ? '🔴 Urgente' : '🟢 Normal'}
                                    </span>
                                    <span className="tipo-badge">{comentario.tipoProblema}</span>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: comentario.estado === 'Respondido' ? '#c8e6c9' : '#fff3e0',
                                        color: comentario.estado === 'Respondido' ? '#2e7d32' : '#e65100'
                                    }}>
                                        {comentario.estado}
                                    </span>
                                </div>
                            </div>

                            <div className="comentario-body">
                                <p style={{ 
                                    background: '#f5f5f5', 
                                    padding: '15px', 
                                    borderRadius: '8px',
                                    margin: '10px 0'
                                }}>
                                    {comentario.mensaje}
                                </p>

                                {comentario.archivos && comentario.archivos.length > 0 && (
                                    <div className="archivos-section">
                                        <p className="archivos-title">📎 Archivos adjuntos:</p>
                                        {comentario.archivos.map((archivo, idx) => (
                                            <div key={idx} className="archivo-item-estudiante">
                                                <span className="archivo-icon">📄</span>
                                                <a 
                                                    href={`/api/comentario/archivo/${comentario.id}/${idx}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="archivo-link"
                                                >
                                                    {archivo.nombre || archivo.originalname}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {comentario.respuesta && (
                                    <div style={{
                                        background: '#e8f5e9',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginTop: '10px'
                                    }}>
                                        <p style={{ 
                                            fontWeight: 'bold', 
                                            color: '#2e7d32',
                                            marginBottom: '5px'
                                        }}>
                                            ✅ Tu respuesta:
                                        </p>
                                        <p style={{ margin: 0 }}>{comentario.respuesta}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                padding: '10px 0 0',
                                borderTop: '1px solid #eee',
                                marginTop: '10px'
                            }}>
                                <button
                                    onClick={() => handleOpenRespuesta(comentario)}
                                    style={{
                                        padding: '8px 20px',
                                        background: comentario.estado === 'Respondido' ? '#e0e0e0' : '#003366',
                                        color: comentario.estado === 'Respondido' ? '#666' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {comentario.estado === 'Respondido' ? '✏️ Editar respuesta' : '💬 Responder'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Responder */}
            {isPopupOpen && comentarioSeleccionado && (
                <div className="modal-overlay" onClick={handleClosePopup}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-estudiante">
                            <h2>Responder Comentario</h2>
                            <button className="btn-cancelar-header" onClick={handleClosePopup}>✕</button>
                        </div>
                        <div className="modal-content-estudiante">
                            <div style={{
                                background: '#f5f5f5',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                    Mensaje de {comentarioSeleccionado.usuario?.nombreCompleto}:
                                </p>
                                <p style={{ margin: 0 }}>{comentarioSeleccionado.mensaje}</p>
                            </div>
                            
                            <form onSubmit={handleSubmitRespuesta}>
                                <div className="form-group">
                                    <label>Tu respuesta *</label>
                                    <textarea
                                        value={respuesta}
                                        onChange={(e) => setRespuesta(e.target.value)}
                                        placeholder="Escribe tu respuesta..."
                                        required
                                        minLength={5}
                                        maxLength={500}
                                        style={{ minHeight: '150px' }}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-cancelar" onClick={handleClosePopup}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-enviar" disabled={loadingUpdate}>
                                        {loadingUpdate ? 'Enviando...' : 'Enviar Respuesta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComentarioDocente;
