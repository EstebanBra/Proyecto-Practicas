import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import useGetDocumentos from '@hooks/documentos/useGetDocumentos.jsx';
import useUpdateEstadoDocumento from '@hooks/documentos/useUpdateEstadoDocumento.jsx';
import useGetEvaluaciones from '@hooks/evaluaciones/useGetEvaluaciones.jsx';
import useCrearEvaluacion from '@hooks/evaluaciones/useCrearEvaluacion.jsx';
import useUpdateEvaluacion from '@hooks/evaluaciones/useUpdateEvaluacion.jsx';
import { useTodasPracticas } from '@hooks/practicas/useTodasPracticas.jsx';
import '@styles/docsEntregados.css';

const DocsEntregados = () => {
    const [filter, setFilter] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const [practicasInfo, setPracticasInfo] = useState({});
    const docsPerPage = 6;

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const {
        evaluacionesDocente,
        fetchEvaluacionesDocente,
        fetchEvaluacionByDocumento
    } = useGetEvaluaciones();

    const { practicas, loading: loadingPracticas, refetch: refetchPracticas } = useTodasPracticas();
    const { updating: updatingEstado, handleUpdateEstados } = useUpdateEstadoDocumento(fetchDocumentos);
    const { submitting: creatingEval, handleCrearEvaluacion } = useCrearEvaluacion(fetchEvaluacionByDocumento, fetchEvaluacionesDocente);
    const { updating: updatingEval, handleUpdateEvaluacion } =
      useUpdateEvaluacion(fetchEvaluacionesDocente);

    useEffect(() => {
      const fetchData = async () => {
        await Promise.all([
          fetchDocumentos(),
          fetchEvaluacionesDocente(),
          refetchPracticas(),
        ]);
      };

      fetchData();
    }, []);


    // Mapear prácticas por id
    useEffect(() => {
        if (practicas && practicas.length > 0) {
            const info = {};
            practicas.forEach(p => {
                info[p.id_practica] = {
                    empresa: p.empresa,
                    estudiante: p.estudiante
                };
            });
            setPracticasInfo(info);
        }
    }, [practicas]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleDownload = (ruta_archivo) => {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
        const relativePath = ruta_archivo.replace(/\\/g, '/').split('uploads/')[1];
        const downloadUrl = `${baseUrl}/uploads/${relativePath}`;
        window.open(downloadUrl, '_blank');
    };

    const handleAddNote = async (doc) => {
        // Verificar si ya tiene evaluación
        const evaluacionExistente = evaluacionesDocente.find(
            e => e.id_documento === doc.id_documento
        );

        const { value: formValues } = await Swal.fire({
            title: evaluacionExistente ? 'Actualizar Calificación' : 'Agregar Calificación',
            html: `
            <div style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Nota (1.0 - 7.0)</label>
                <input 
                    type="number" 
                    id="swal-nota" 
                    class="swal2-input" 
                    min="1" 
                    max="7" 
                    step="0.1"
                    value="${evaluacionExistente?.nota || ''}"
                    style="width: 100%; margin: 0 0 15px 0;"
                >
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Comentario</label>
                <textarea 
                    id="swal-comentario" 
                    class="swal2-textarea" 
                    placeholder="Comentario sobre el documento..."
                    style="width: 100%; margin: 0; min-height: 100px;"
                >${evaluacionExistente?.comentario || ''}</textarea>
            </div>
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: evaluacionExistente ? 'Actualizar' : 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            preConfirm: () => {
                const nota = parseFloat(document.getElementById('swal-nota').value);
                const comentario = document.getElementById('swal-comentario').value;

                if (isNaN(nota) || nota < 1 || nota > 7) {
                    Swal.showValidationMessage('La nota debe ser un número entre 1.0 y 7.0');
                    return false;
                }

                const caracteresEspeciales = /[<>{}[\];:$%&|~^`@#*+=_¡!¿?\\]/;
                if (caracteresEspeciales.test(comentario)) {
                    Swal.showValidationMessage('El comentario no puede contener caracteres especiales como < > { } [ ] ; : $ % & | ~ ^ ` @ # * + = _ ¡ ! ¿ ? \\');
                    return false;
                }

                return { nota, comentario };
            }
        });

        if (formValues) {
            if (evaluacionExistente) {
                await handleUpdateEvaluacion(evaluacionExistente, formValues);
            } else {
                await handleCrearEvaluacion({
                    id_documento: doc.id_documento,
                    tipo_documento: doc.tipo,
                    nota: formValues.nota,
                    comentario: formValues.comentario
                });
            }
            await fetchDocumentos();
        }
    };
    // Filtrar documentos
    const documentosFiltrados = documentos.filter(doc => {
        const matchesSearch = 
            doc.nombre_archivo?.toLowerCase().includes(filter.toLowerCase()) ||
            practicasInfo[doc.id_practica]?.estudiante?.nombreCompleto?.toLowerCase().includes(filter.toLowerCase()) ||
            practicasInfo[doc.id_practica]?.empresa?.toLowerCase().includes(filter.toLowerCase());

        const matchesEstado = 
            estadoFiltro === "todos" || 
            doc.estado_revision === estadoFiltro;

        return matchesSearch && matchesEstado;
    });

    // Paginación
    const totalPages = Math.ceil(documentosFiltrados.length / docsPerPage);
    const startIndex = (currentPage - 1) * docsPerPage;
    const documentosPaginados = documentosFiltrados.slice(startIndex, startIndex + docsPerPage);

    if (loadingDocs || loadingPracticas) {
        return (
            <div className="docs-entregados-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="docs-entregados-container">
            <div className="docs-entregados-content">
                <div className="docs-header">
                    <h1 className="docs-title">Documentos Entregados</h1>
                    <div className="filtros-container">
                        <input
                            type="text"
                            className="filtro-busqueda"
                            placeholder="Buscar por nombre, alumno o empresa..."
                            value={filter}
                            onChange={handleFilterChange}
                        />
                        <div className="estado-buttons">
                            <button 
                                className={`btn-action ${estadoFiltro === 'todos' ? 'active' : ''}`}
                                onClick={() => { setEstadoFiltro('todos'); setCurrentPage(1); }}
                            >
                                Todos
                            </button>
                            <button 
                                className={`btn-action ${estadoFiltro === 'pendiente' ? 'active' : ''}`}
                                onClick={() => { setEstadoFiltro('pendiente'); setCurrentPage(1); }}
                            >
                                Pendientes
                            </button>
                            <button 
                                className={`btn-action ${estadoFiltro === 'revisado' ? 'active' : ''}`}
                                onClick={() => { setEstadoFiltro('revisado'); setCurrentPage(1); }}
                            >
                                Revisados
                            </button>
                        </div>
                    </div>
                </div>

                {documentosFiltrados.length === 0 ? (
                    <div className="no-docs-message">
                        <h3>No hay documentos</h3>
                        <p>No se encontraron documentos con los filtros aplicados</p>
                    </div>
                ) : (
                    <>
                        <div className="tabla-docs">
                            {documentosPaginados.map(doc => {
                                const practicaData = practicasInfo[doc.id_practica] || {};
                                const evaluacion = evaluacionesDocente.find(e => e.id_documento === doc.id_documento);

                                return (
                                    <div key={doc.id_documento} className="doc-card">
                                        <div className="doc-header">
                                            <div className="doc-nombre">
                                                <strong>
                                                    {doc.tipo === 'informe' ? '📋 Informe Final' : '📝 Autoevaluación'}
                                                </strong>
                                                <span>{doc.nombre_archivo}</span>
                                            </div>
                                            <span className={`doc-estado ${doc.estado_revision}`}>
                                                {doc.estado_revision}
                                            </span>
                                        </div>

                                        <div className="doc-alumno-info">
                                            <p><strong>Alumno:</strong> {doc.usuario?.nombreCompleto || practicaData.estudiante?.nombreCompleto || 'N/A'}</p>
                                            <p><strong>Empresa:</strong> {practicaData.empresa || 'N/A'}</p>
                                            <p><strong>Fecha:</strong> {new Date(doc.fecha_subida).toLocaleDateString()}</p>
                                            <p><strong>Formato:</strong> {doc.formato?.toUpperCase()} ({doc.peso_mb} MB)</p>
                                        </div>

                                        {doc.nota_revision && (
                                            <div style={{ marginBottom: '10px' }}>
                                                <span className="nota">Nota: {doc.nota_revision}</span>
                                            </div>
                                        )}

                                        {doc.comentario && (
                                            <div
                                                className="comentario texto-truncado"
                                                title={doc.comentario}
                                            >
                                                &ldquo;{doc.comentario}&rdquo;
                                            </div>
                                        )}

                                        <div className="doc-acciones">
                                            <button 
                                                className="btn-descargar"
                                                onClick={() => handleDownload(doc.ruta_archivo)}
                                            >
                                                📥 Descargar
                                            </button>
                                            <button 
                                                className="btn-calificar"
                                                onClick={() => handleAddNote(doc)}
                                                disabled={creatingEval || updatingEval}
                                            >
                                                {evaluacion ? '✏️ Editar Nota' : '⭐ Calificar'}
                                            </button>
                                            {doc.estado_revision === 'pendiente' && (
                                                <button
                                                    className="btn-ver-nota"
                                                    onClick={() => handleUpdateEstados([doc], 'revisado')}
                                                    disabled={updatingEstado}
                                                >
                                                    ✓ Marcar Revisado
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="paginacion">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    ← Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={currentPage === page ? 'active' : ''}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DocsEntregados;
