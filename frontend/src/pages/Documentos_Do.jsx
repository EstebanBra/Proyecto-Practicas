// Documentos_Do.jsx - CON MANEJO DE ERRORES
import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import Search from "../components/Search";
import "../styles/docs_entregados.css";

import useGetDocumentos from "@hooks/documentos_finales/useGetDocumentos.jsx";
import useUpdateEstadoDocumento from "@hooks/documentos_finales/useUpdateEstadoDocumento.jsx";
import useGetEvaluaciones from "@hooks/evaluaciones_finales/useGetEvaluaciones.jsx";
import useUpdateEvaluacion from "@hooks/evaluaciones_finales/useUpdateEvaluacion.jsx";
import useCrearEvaluacion from "@hooks/evaluaciones_finales/useCrearEvaluacion.jsx";

const DocsEntregados = () => {
    const [filter, setFilter] = useState("");
    const [documents, setDocuments] = useState([]);
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const [shouldRefetch, setShouldRefetch] = useState(true);
    const docsPerPage = 6;

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const {
        evaluacionesDocente,
        loading: loadingEval,
        error: errorEval,
        fetchEvaluacionesDocente,
        fetchEvaluacionesByDocumento
    } = useGetEvaluaciones();

    const { updating: updatingEstado, handleUpdateEstados } = useUpdateEstadoDocumento(() => {
        setShouldRefetch(true);
    });

    const { submitting: creatingEval, handleCrearEvaluacion } = useCrearEvaluacion(fetchEvaluacionesByDocumento);
    const { updating: updatingEval, handleUpdateEvaluacion } = useUpdateEvaluacion(fetchEvaluacionesByDocumento);

    const fetchData = useCallback(async () => {
        await fetchDocumentos();
        await fetchEvaluacionesDocente();
        setShouldRefetch(false);
    }, []);

    useEffect(() => {
        if (shouldRefetch) {
            fetchData();
        }
    }, [shouldRefetch, fetchData]);

    useEffect(() => {
        if (documentos.length > 0 && shouldRefetch === false) {
            setDocuments(documentos);
        }
    }, [documentos, shouldRefetch]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleDownload = (ruta_archivo, nombre_archivo) => {
        const link = document.createElement("a");
        link.href = ruta_archivo;
        link.download = nombre_archivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddNote = async (doc) => {
        if (doc.tipo !== "informe") {
            await Swal.fire('Error', 'Solo puede evaluar documentos de tipo informe', 'error');
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Agregar Evaluación',
            html: `
                <input id="swal-nota" class="swal2-input" placeholder="Nota (1.0 - 7.0)" type="number" step="0.1" min="1" max="7">
                <textarea id="swal-comentario" class="swal2-textarea" placeholder="Comentario (opcional)"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const notaInput = document.getElementById('swal-nota');
                const comentarioInput = document.getElementById('swal-comentario');
                const nota = notaInput ? notaInput.value : '';
                const comentario = comentarioInput ? comentarioInput.value : '';

                if (!nota || parseFloat(nota) < 1 || parseFloat(nota) > 7) {
                    Swal.showValidationMessage('La nota debe estar entre 1.0 y 7.0');
                    return false;
                }

                return { nota: parseFloat(nota), comentario };
            }
        });

        if (formValues) {
            const evaluacionesArray = Array.isArray(evaluacionesDocente)
                ? evaluacionesDocente
                : [];

            const evaluacionExistente = evaluacionesArray.find(
                e => e.id_documento === doc.id_documento
            );

            const evaluacionData = {
                id_documento: doc.id_documento,
                nota: formValues.nota,
                comentario: formValues.comentario || "",
                id_usuario: JSON.parse(sessionStorage.getItem('usuario'))?.id
            };

            try {
                const autoevaluacion = documentos.find(d =>
                    d.id_practica === doc.id_practica &&
                    d.tipo === "autoevaluacion"
                );

                if (evaluacionExistente) {
                    await handleUpdateEvaluacion([evaluacionExistente], evaluacionData);
                } else {
                    await handleCrearEvaluacion(evaluacionData);
                }

                const documentosARevisar = [];
                if (doc.estado_revision === "pendiente") {
                    documentosARevisar.push(doc);
                }
                if (autoevaluacion && autoevaluacion.estado_revision === "pendiente") {
                    documentosARevisar.push(autoevaluacion);
                }
                if (documentosARevisar.length > 0) {
                    await handleUpdateEstados(documentosARevisar, "revisado");
                }
                await Swal.fire('¡Éxito!', 'Evaluación guardada correctamente', 'success');
                setShouldRefetch(true);

            } catch (error) {
                console.error('Error al guardar evaluación:', error);
                await Swal.fire('Error', 'No se pudo guardar la evaluación', 'error');
            }
        }
    };

    const handleUpdateEstadoWrapper = async (docs, nuevoEstado) => {
        const documentosArray = Array.isArray(docs) ? docs : [docs];
        const documentosValidos = documentosArray.filter(doc => doc && doc.id_documento);

        if (documentosValidos.length === 0) return;

        await handleUpdateEstados(documentosValidos, nuevoEstado);
        setShouldRefetch(true);
    };

    const filteredDocs = useMemo(() => {
        return documents.filter((doc) => {
            const matchesName = doc.nombre_archivo?.toLowerCase().includes(filter.toLowerCase());
            const matchesEstado = estadoFiltro === "todos" || doc.estado_revision === estadoFiltro;
            return matchesName && matchesEstado;
        });
    }, [documents, filter, estadoFiltro]);

    const getEvaluacionPorDocumento = (docId) => {
        if (!Array.isArray(evaluacionesDocente)) {
            return null;
        }
        return evaluacionesDocente.find(e => e.id_documento === docId);
    };

    const indexOfLast = currentPage * docsPerPage;
    const indexOfFirst = indexOfLast - docsPerPage;
    const currentDocs = filteredDocs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredDocs.length / docsPerPage);

    const handlePageChange = (num) => {
        if (num >= 1 && num <= totalPages) setCurrentPage(num);
    };

    const handleRefresh = () => {
        setShouldRefetch(true);
        setCurrentPage(1);
    };

    if (errorEval) {
        console.error('Error en evaluaciones:', errorEval);
    }

    return (
        <div className="documentos-container">
            <div className="documentos-content">
                {errorEval && (
                    <div style={{
                        background: '#ffe6e6',
                        color: '#cc0000',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        border: '1px solid #ff9999'
                    }}>
                        <strong>Error al cargar evaluaciones:</strong> {errorEval}
                    </div>
                )}

                <div className="tabla-docs">
                    {loadingDocs || loadingEval ? (
                        <p>Cargando documentos...</p>
                    ) : currentDocs.length > 0 ? (
                        currentDocs.map((doc) => {
                            const evaluacion = getEvaluacionPorDocumento(doc.id_documento);

                            return (
                                <div key={doc.id_documento} className="doc-card">
                                    <div className="doc-header">
                                        <p className={`doc-estado ${doc.estado_revision === "revisado" ? "revisado" : ""}`}>
                                            {doc.estado_revision || "pendiente"}
                                        </p>
                                        <p className="doc-nombre">
                                            <strong title={doc.nombre_archivo}>
                                                {doc.nombre_archivo?.length > 25
                                                    ? `${doc.nombre_archivo.slice(0, 25)}...`
                                                    : doc.nombre_archivo}
                                            </strong>
                                        </p>
                                    </div>

                                    <div className="doc-info">
                                        <p className="archivo-item">
                                            <strong>Tipo:</strong> {doc.tipo === "informe" ? "Informe" : "Autoevaluación"}
                                        </p>
                                        <p className="archivo-item">
                                            <strong>Fecha:</strong> {new Date(doc.fecha_subida).toLocaleDateString()}
                                        </p>
                                        <p className="archivo-item">
                                            <strong>Tamaño:</strong> {doc.peso_mb} MB
                                        </p>

                                        {evaluacion?.comentario && (
                                            <p className="comentario" title={evaluacion.comentario}>
                                                <strong>Comentario:</strong> {evaluacion.comentario.length > 80
                                                ? `${evaluacion.comentario.slice(0, 80)}...`
                                                : evaluacion.comentario}
                                            </p>
                                        )}
                                    </div>

                                    {evaluacion?.nota && (
                                        <div className="nota">
                                            <strong>Nota:</strong> {evaluacion.nota}
                                        </div>
                                    )}

                                    <div className="doc-acciones">
                                        <button
                                            onClick={() => handleDownload(doc.ruta_archivo, doc.nombre_archivo)}
                                            disabled={updatingEstado || creatingEval || updatingEval}
                                        >
                                            Descargar
                                        </button>
                                        <button
                                            onClick={() => handleAddNote(doc)}
                                            disabled={updatingEstado || creatingEval || updatingEval}
                                        >
                                            {evaluacion ? "Editar Nota" : "Agregar Nota"}
                                        </button>
                                        <button
                                            onClick={() => handleUpdateEstadoWrapper([doc],
                                                doc.estado_revision === "pendiente" ? "revisado" : "pendiente"
                                            )}
                                            disabled={updatingEstado || creatingEval || updatingEval}
                                        >
                                            {doc.estado_revision === "pendiente" ? "Marcar Revisado" : "Marcar Pendiente"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No hay documentos encontrados.</p>
                    )}
                </div>

                <div className="paginacion">
                    <button
                        onClick={handleRefresh}
                        className="refresh-btn"
                        title="Refrescar datos"
                        disabled={loadingDocs || loadingEval}
                    >
                        ↻
                    </button>

                    <div className="search-container">
                        <Search
                            value={filter}
                            onChange={handleFilterChange}
                            placeholder="     Buscar documento..."
                        />
                    </div>

                    <div className="estado-buttons">
                        {["pendiente", "revisado", "todos"].map((estado) => (
                            <button
                                key={estado}
                                className={`btn-action ${estadoFiltro === estado ? "active" : ""}`}
                                onClick={() => {
                                    setEstadoFiltro(estado);
                                    setCurrentPage(1);
                                }}
                                disabled={updatingEstado || loadingDocs}
                            >
                                {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => handlePageChange(1)} disabled={currentPage === 1 || loadingDocs}>
                        Primero
                    </button>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loadingDocs}>
                        {"<"}
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={currentPage === i + 1 ? "active" : ""}
                            onClick={() => handlePageChange(i + 1)}
                            disabled={updatingEstado || loadingDocs}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loadingDocs}>
                        {">"}
                    </button>
                    <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || loadingDocs}>
                        Último
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocsEntregados;
