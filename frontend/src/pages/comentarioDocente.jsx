import { useState, useEffect, useCallback } from 'react';
import { useGetAllComentarios } from '../hooks/comentario/useGetAllComentarios.jsx';
import { useUpdateComentario } from '../hooks/comentario/useUpdateComentario.jsx';
import { useDeleteComentario } from '../hooks/comentario/useDeleteComentario.jsx';
import { downloadArchivoComentario, downloadComentariosExcel, uploadComentariosExcel } from '../services/comentario.service.js';
import Swal from 'sweetalert2';
import '../styles/comentario.css';

const ComentarioDocente = () => {
    const { comentarios, handleGetAllComentarios, loading } = useGetAllComentarios();
    const { handleUpdateComentario, loading: loadingUpdate } = useUpdateComentario();
    const { handleDeleteComentario } = useDeleteComentario();

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
    const [respuesta, setRespuesta] = useState('');
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const refreshComentarios = useCallback(() => {
        handleGetAllComentarios();
    }, [handleGetAllComentarios]);

    useEffect(() => {
        refreshComentarios();
    }, [refreshComentarios]);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const comentariosFiltrados = (comentarios || [])
        .filter((comentario) => {
            const mensaje = comentario.mensaje?.toLowerCase() || '';
            const nombreUsuario = comentario.usuario?.nombreCompleto?.toLowerCase() || '';
            const matchSearch = mensaje.includes(searchTerm.toLowerCase()) || 
                              nombreUsuario.includes(searchTerm.toLowerCase());
            
            if (filtroEstado === 'todos') return matchSearch;
            if (filtroEstado === 'pendientes') return matchSearch && comentario.estado === 'Pendiente';
            if (filtroEstado === 'respondidos') return matchSearch && comentario.estado === 'Respondido';
            if (filtroEstado === 'urgentes') return matchSearch && comentario.nivelUrgencia === 'alta';
            return matchSearch;
        })
        .sort((a, b) => {
            // Urgentes primero
            const urgA = a.nivelUrgencia === 'alta';
            const urgB = b.nivelUrgencia === 'alta';
            if (urgA !== urgB) return urgA ? -1 : 1;

            // Pendientes antes que respondidos
            const pendA = a.estado === 'Pendiente';
            const pendB = b.estado === 'Pendiente';
            if (pendA !== pendB) return pendA ? -1 : 1;

            // Más recientes primero
            const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
            const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
            return fechaB - fechaA;
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

        const respuestaTrim = (respuesta || '').trim();
        if (!respuestaTrim) {
            await Swal.fire('Respuesta inválida', 'La respuesta no puede estar vacía.', 'warning');
            return;
        }
        if (!/[A-Za-z]/.test(respuestaTrim)) {
            await Swal.fire('Respuesta inválida', 'La respuesta debe incluir letras, no solo números o símbolos.', 'warning');
            return;
        }

        const dataToSend = {
            respuesta: respuestaTrim,
            estado: 'Respondido'
        };

        const response = await handleUpdateComentario(comentarioSeleccionado.id, dataToSend);
        if (response) {
            handleClosePopup();
            refreshComentarios();
        }
    };

    const handleDescargarPlantilla = async (usuarioId) => {
        setLoadingExcel(true);
        try {
            const result = await downloadComentariosExcel(usuarioId);
            if (result.success) {
                await Swal.fire('Éxito', 'Plantilla descargada correctamente', 'success');
            } else {
                await Swal.fire('Error', result.message || 'Error al descargar la plantilla', 'error');
            }
        } catch {
            await Swal.fire('Error', 'Error al descargar la plantilla', 'error');
        } finally {
            setLoadingExcel(false);
        }
    };

    const handleSubirPlantilla = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || !e.target.plantilla.files[0]) {
            await Swal.fire('Error', 'Por favor selecciona un estudiante y un archivo', 'warning');
            return;
        }

        setLoadingExcel(true);
        try {
            const archivo = e.target.plantilla.files[0];
            const result = await uploadComentariosExcel(selectedStudentId, archivo);
            
            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    html: `Plantilla procesada correctamente<br><br>Comentarios actualizados: ${result.data?.totalActualizados || 0}`,
                    confirmButtonText: 'Aceptar'
                });
                refreshComentarios();
                setSelectedStudentId('');
                e.target.reset();
            } else {
                await Swal.fire('Error', result.message || 'Error al subir la plantilla', 'error');
            }
        } catch {
            await Swal.fire('Error', 'Error al procesar la plantilla', 'error');
        } finally {
            setLoadingExcel(false);
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

            {/* Sección de Plantillas Excel */}
            <div style={{
                background: '#f0f4f8',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '20px',
                margin: '0 20px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {/* Descargar Plantilla */}
                <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                }}>
                    <h3 style={{ 
                        margin: '0 0 15px', 
                        color: '#003366',
                        fontSize: '1.1rem'
                    }}>📥 Descargar Plantilla</h3>
                    <p style={{ 
                        margin: '0 0 10px',
                        fontSize: '0.9rem',
                        color: '#666'
                    }}>Selecciona un estudiante para descargar sus comentarios en Excel</p>
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        {/* Obtener estudiantes únicos */}
                        {(() => {
                            const estudiantesUnicos = Array.from(
                                new Map(
                                    (comentarios || []).map(c => [c.usuarioId, c.usuario])
                                ).values()
                            );
                            return estudiantesUnicos.length > 0 ? (
                                estudiantesUnicos.map(estudiante => (
                                    <button
                                        key={estudiante.id}
                                        onClick={() => handleDescargarPlantilla(estudiante.id)}
                                        disabled={loadingExcel}
                                        style={{
                                            padding: '8px 15px',
                                            background: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: loadingExcel ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold',
                                            opacity: loadingExcel ? 0.6 : 1,
                                            fontSize: '0.9rem'
                                        }}
                                        title={`Descargar comentarios de ${estudiante.nombreCompleto}`}
                                    >
                                        {loadingExcel ? '⏳' : '📊'} {estudiante.nombreCompleto?.split(' ')[0]}
                                    </button>
                                ))
                            ) : (
                                <p style={{ color: '#666' }}>No hay estudiantes con comentarios</p>
                            );
                        })()}
                    </div>
                </div>

                {/* Subir Plantilla */}
                <div style={{
                    background: 'linear-gradient(135deg, #f7fbff 0%, #eef5ff 100%)',
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1px solid #d5e4ff',
                    boxShadow: '0 6px 18px rgba(0, 51, 102, 0.06)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                            <h3 style={{ 
                                margin: '0 0 6px', 
                                color: '#003366',
                                fontSize: '1.1rem'
                            }}>📤 Subir Plantilla Completada</h3>
                            <p style={{ 
                                margin: 0,
                                fontSize: '0.9rem',
                                color: '#4a5b76'
                            }}>Carga el Excel con tus respuestas para actualizar los comentarios</p>
                        </div>
                        <span style={{
                            background: '#e6f2ff',
                            color: '#0b63d1',
                            padding: '6px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}>Paso 2</span>
                    </div>
                    <form onSubmit={handleSubirPlantilla} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#2c3e50', fontWeight: 600 }}>Estudiante</label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid #ccd8eb',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(11, 99, 209, 0.15)'}
                                onBlur={(e) => e.target.style.boxShadow = 'none'}
                                required
                            >
                                <option value="">Selecciona un estudiante</option>
                                {(() => {
                                    const estudiantesUnicos = Array.from(
                                        new Map(
                                            (comentarios || []).map(c => [c.usuarioId, c.usuario])
                                        ).values()
                                    );
                                    return estudiantesUnicos.map(estudiante => (
                                        <option key={estudiante.id} value={estudiante.id}>
                                            {estudiante.nombreCompleto}
                                        </option>
                                    ));
                                })()}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#2c3e50', fontWeight: 600 }}>Archivo Excel</label>
                            <div style={{
                                border: '1px dashed #b7c7e2',
                                borderRadius: '12px',
                                padding: '12px',
                                background: '#f9fbff'
                            }}>
                                <input
                                    type="file"
                                    name="plantilla"
                                    accept=".xlsx,.xls"
                                    required
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ccd8eb',
                                        cursor: 'pointer',
                                        width: '100%',
                                        background: 'white'
                                    }}
                                />
                                <p style={{ margin: '8px 0 0', color: '#63738a', fontSize: '0.85rem' }}>
                                    Solo .xlsx o .xls • Máx 5 MB
                                </p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loadingExcel || !selectedStudentId}
                            style={{
                                padding: '12px 16px',
                                background: loadingExcel || !selectedStudentId ? '#cfd8e3' : 'linear-gradient(90deg, #0b63d1 0%, #0a84ff 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: loadingExcel || !selectedStudentId ? 'not-allowed' : 'pointer',
                                fontWeight: 700,
                                letterSpacing: '0.2px',
                                boxShadow: loadingExcel || !selectedStudentId ? 'none' : '0 8px 16px rgba(11, 99, 209, 0.18)',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (loadingExcel || !selectedStudentId) return;
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 10px 20px rgba(11, 99, 209, 0.22)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = loadingExcel || !selectedStudentId ? 'none' : '0 8px 16px rgba(11, 99, 209, 0.18)';
                            }}
                        >
                            {loadingExcel ? '⏳ Procesando...' : '📤 Subir Plantilla'}
                        </button>
                    </form>
                </div>
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
                                                <button
                                                    onClick={() => downloadArchivoComentario(comentario.id, idx, archivo.nombre || archivo.originalname)}
                                                    className="archivo-link"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066cc', textDecoration: 'underline' }}
                                                >
                                                    {archivo.nombre || archivo.originalname}
                                                </button>
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
                                gap: '10px',
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
                                <button
                                    className="btn-eliminar-docente"
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
