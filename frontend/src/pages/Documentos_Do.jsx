import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import Search from "../components/Search";
import "../styles/docs_entregados.css";

import useGetDocumentos from "@hooks/documentos_finales/useGetDocumentos.jsx";
import useUpdateEstadoDocumento from "@hooks/documentos_finales/useUpdateEstadoDocumento.jsx";
import useGetEvaluaciones from "@hooks/evaluaciones_finales/useGetEvaluaciones.jsx";
import useUpdateEvaluacion from "@hooks/evaluaciones_finales/useUpdateEvaluacion.jsx";
import useCrearEvaluacion from "@hooks/evaluaciones_finales/useCrearEvaluacion.jsx";
import { useTodasPracticas } from "@hooks/practicas/useTodasPracticas";

const DocsEntregados = () => {
    const [filter, setFilter] = useState("");
    const [documents, setDocuments] = useState([]);
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const [shouldRefetch, setShouldRefetch] = useState(true);
    const [practicasInfo, setPracticasInfo] = useState({});
    const docsPerPage = 6;

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const {
        evaluacionesDocente,
        loading: loadingEval,
        error: errorEval,
        fetchEvaluacionesDocente,
        fetchEvaluacionesByDocumento
    } = useGetEvaluaciones();

    const { practicas, loading: loadingPracticas, refetch: refetchPracticas } = useTodasPracticas(); // REEMPLAZO

    const { updating: updatingEstado, handleUpdateEstados } = useUpdateEstadoDocumento(() => {
        setShouldRefetch(true);
    });

    const { submitting: creatingEval, handleCrearEvaluacion } = useCrearEvaluacion(fetchEvaluacionesByDocumento);
    const { updating: updatingEval, handleUpdateEvaluacion } =
        useUpdateEvaluacion(fetchEvaluacionesDocente);

    const fetchData = useCallback(async () => {
        await fetchDocumentos();
        await fetchEvaluacionesDocente();
        await refetchPracticas();
        setShouldRefetch(false);
    }, [fetchDocumentos, fetchEvaluacionesDocente, refetchPracticas]);

    useEffect(() => {
        if (shouldRefetch) {
            fetchData();
        }
    }, [shouldRefetch, fetchData]);

    useEffect(() => {
        if (practicas.length > 0 && documentos.length > 0 && shouldRefetch === false) {
            const practicasMap = {};

            practicas.forEach(practica => {
                if (practica && practica.id_practica) {
                    practicasMap[practica.id_practica] = practica;
                }
            });

            setPracticasInfo(practicasMap);

            const documentosEnriquecidos = documentos.map(doc => {
                const practica = practicasMap[doc.id_practica];

                return {
                    ...doc,
                    estudiante_nombre: practica?.estudiante?.nombreCompleto ||
                        practica?.estudiante_nombre ||
                        "Estudiante no disponible",
                    estudiante_rut: practica?.estudiante?.rut ||
                        practica?.estudiante_rut ||
                        "",
                    practica_nombre: practica?.empresa ?
                        `Práctica en ${practica.empresa}` :
                        practica?.nombre ||
                        "Práctica sin nombre",
                    practica_empresa: practica?.empresa ||
                        practica?.empresa_nombre ||
                        "Sin empresa",
                    practica_estado: practica?.estado ||
                        practica?.estado_practica ||
                        "Desconocido",
                    fecha_hora_entrega: doc.fecha_subida ?
                        new Date(doc.fecha_subida).toLocaleString('es-CL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : "Fecha no disponible"
                };
            });

            setDocuments(documentosEnriquecidos);
        }
    }, [practicas, documentos, shouldRefetch]);

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
        const { value: formValues } = await Swal.fire({
            title: `Evaluar ${doc.tipo === 'informe' ? 'Informe' : 'Autoevaluación'}`,
            html: `
                <div style="text-align: left; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                    <p><strong>Estudiante:</strong> ${doc.estudiante_nombre || "N/A"}</p>
                    <p><strong>Práctica:</strong> ${doc.practica_nombre || "N/A"}</p>
                    <p><strong>Fecha entrega documento:</strong> ${doc.fecha_hora_entrega || "N/A"}</p>
                </div>
                <input id="swal-nota" class="swal2-input" placeholder="Nota (1.0 - 7.0)" type="number" step="0.1" min="1" max="7">
                <textarea id="swal-comentario" class="swal2-textarea" placeholder="Comentario (opcional)"></textarea>
                <input type="hidden" id="swal-tipo" value="${doc.tipo}">
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

                return {
                    nota: parseFloat(nota),
                    comentario,
                    tipo: doc.tipo
                };
            }
        });

        if (formValues) {
            const evaluacionesArray = Array.isArray(evaluacionesDocente)
                ? evaluacionesDocente
                : [];

            const evaluacionExistente = evaluacionesArray.find(
                e => e.id_documento === doc.id_documento && e.tipo_documento === doc.tipo
            );

            const evaluacionData = {
                id_documento: doc.id_documento,
                tipo_documento: doc.tipo,
                nota: formValues.nota,
                comentario: formValues.comentario || "",
                id_usuario: JSON.parse(sessionStorage.getItem('usuario'))?.id
            };

            try {
                if (evaluacionExistente) {
                    await handleUpdateEvaluacion(evaluacionExistente, evaluacionData);
                } else {
                    await handleCrearEvaluacion(evaluacionData);
                }
                if (doc.estado_revision === "pendiente") {
                    await handleUpdateEstados([doc], "revisado");
                }
                const docsDePractica = documentos.filter(d =>
                    d.id_practica === doc.id_practica
                );
                const evaluacionesDePractica = evaluacionesArray.filter(e =>
                    docsDePractica.some(d => d.id_documento === e.id_documento)
                );
                if (docsDePractica.length === 2 && evaluacionesDePractica.length === 2) {
                    await handleUpdateEstados(docsDePractica, "revisado");
                }

                await Swal.fire('Guardada', 'Evaluación guardada correctamente', 'success');
                setShouldRefetch(true);

            } catch (error) {
                console.error('Error al guardar evaluación:', error);
                await Swal.fire('Error', 'No se pudo guardar la evaluación', 'error');
            }
        }
    };

    const filteredDocs = useMemo(() => {
        return documents.filter((doc) => {
            const searchTerm = filter.toLowerCase().trim();

            if (!searchTerm) {
                return estadoFiltro === "todos" || doc.estado_revision === estadoFiltro;
            }

            const matchesName = doc.nombre_archivo?.toLowerCase().includes(searchTerm);
            const matchesStudent = doc.estudiante_nombre?.toLowerCase().includes(searchTerm);
            const matchesRut = doc.estudiante_rut?.toLowerCase().includes(searchTerm);
            const matchesPractica = doc.practica_empresa?.toLowerCase().includes(searchTerm);
            const matchesTipo = doc.tipo?.toLowerCase().includes(searchTerm);
            const matchesEstadoPractica = doc.practica_estado?.toLowerCase().includes(searchTerm);

            const matchesEstado = estadoFiltro === "todos" || doc.estado_revision === estadoFiltro;

            return (matchesName || matchesStudent || matchesRut || matchesPractica || matchesTipo || matchesEstadoPractica) && matchesEstado;
        });
    }, [documents, filter, estadoFiltro]);

    const getEvaluacionPorDocumento = (docId, docTipo) => {
        if (!Array.isArray(evaluacionesDocente)) {
            return null;
        }
        return evaluacionesDocente.find(e =>
            e.id_documento === docId && e.tipo_documento === docTipo
        );
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
        setFilter("");
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
                    {(loadingDocs || loadingEval || loadingPracticas) ? (
                        <p>Cargando documentos y datos de prácticas...</p>
                    ) : currentDocs.length > 0 ? (
                        currentDocs.map((doc) => {
                            const evaluacion = getEvaluacionPorDocumento(doc.id_documento, doc.tipo);
                            // eslint-disable-next-line no-unused-vars
                            const practica = practicasInfo[doc.id_practica];

                            return (
                                <div key={doc.id_documento} className="doc-card">
                                    <div className="doc-header">
                                        <p className={`doc-estado ${doc.estado_revision}`}>
                                            {doc.estado_revision || "pendiente"}
                                        </p>
                                        <p className="doc-nombre">
                                            <strong title={doc.nombre_archivo}>
                                                {doc.nombre_archivo?.length > 30
                                                    ? `${doc.nombre_archivo.slice(0, 30)}...`
                                                    : doc.nombre_archivo}
                                            </strong>
                                        </p>
                                    </div>

                                    <div className="doc-info">
                                        <p className="archivo-item">
                                            <strong>Estudiante:</strong> {doc.estudiante_nombre}
                                            {doc.estudiante_rut && ` (${doc.estudiante_rut})`}
                                        </p>
                                        <p className="archivo-item">
                                            <strong>Práctica:</strong> {doc.practica_nombre}
                                        </p>
                                        <p className="archivo-item">
                                            <strong>Tipo documento:</strong> {doc.tipo === "informe" ? "Informe" : "Autoevaluación"}
                                        </p>
                                        <p className="archivo-item">
                                            <strong>Fecha y hora de entrega:</strong> {doc.fecha_hora_entrega}
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
                                            {evaluacion ? "Editar Nota" : "Evaluar"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No hay documentos encontrados con los criterios de búsqueda.</p>
                    )}
                </div>

                <div className="paginacion">
                    <button
                        onClick={handleRefresh}
                        className="refresh-btn"
                        title="Refrescar datos"
                        disabled={loadingDocs || loadingEval || loadingPracticas}
                    >
                        ↻
                    </button>

                    <div className="search-container">
                        <Search
                            value={filter}
                            onChange={handleFilterChange}
                            placeholder="     Buscar"
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
