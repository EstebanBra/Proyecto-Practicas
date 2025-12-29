import { useState, useEffect } from "react";
import "@styles/docs_finales.css";

import useGetDocumentos from "@hooks/documentos_finales/useGetDocumentos";
import useSubirDocumento from "@hooks/documentos_finales/useSubirDocumento";
import { usePracticasEstudiante } from "@hooks/practicas/usePracticasEstudiante";

const DocsFinales = () => {
    const [informeFile, setInformeFile] = useState(null);
    const [autoevaluacionFile, setAutoevaluacionFile] = useState(null);
    const [filter] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [idPracticaSeleccionada, setIdPracticaSeleccionada] = useState(null);

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const { uploading, handleSubirDocumento } = useSubirDocumento(fetchDocumentos);
    const { practicas} = usePracticasEstudiante();

    useEffect(() => {
        fetchDocumentos();
    }, []);

    useEffect(() => {
        if (practicas.length > 0 && !idPracticaSeleccionada) {
            setIdPracticaSeleccionada(practicas[0].id_practica);
        }
    }, [practicas, idPracticaSeleccionada]);

    const PLANTILLAS = [
        {
            nombre: "Anexo D. Plantilla Informe PP.pdf",
            url: "https://adecca.ubiobio.cl/file/download/eyJub21icmUiOiJBbmV4byBELlBsYW50aWxsYUluZm9ybWVQUC5wZGYiLCJhcmNoaXZvIjoiMTc0MzE3OTE2NDEyMDM0NC5wZGYiLCJwYXRoIjoiMjAyNVwvY3Vyc29zXC81ODY5NVwvNDQxMDc4XC8xNzQzMTc5MTY0MTIwMzQ0LnBkZiJ9"
        },
        {
            nombre: "Anexo E. bitácora PP.docx",
            url: "https://adecca.ubiobio.cl/file/download/eyJub21icmUiOiJBbmV4byBFLmJpdFx1MDBlMWNvcmFQUC5kb2N4IiwiYXJjaGl2byI6IjE3NDMxNzkxNjUwMjAzNDQuZG9jeCIsInBhdGgiOiIyMDI1XC9jdXJzb3NcLzU4Njk1XC80NDEwNzhcLzE3NDMxNzkxNjUwMjAzNDQuZG9jeCJ9"
        }
    ];

    const handleDescargarPlantillas = () => {
        PLANTILLAS.forEach(plantilla => {
            window.open(plantilla.url, "_blank", "noopener,noreferrer");
        });
    };

    const handleFileChange = (e, tipo) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['.pdf', '.docx'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validTypes.includes(fileExtension)) {
            alert("Solo se permiten archivos PDF o DOCX");
            e.target.value = '';
            return;
        }

        switch (tipo) {
            case "informe":
                setInformeFile(file);
                break;
            case "autoevaluacion":
                setAutoevaluacionFile(file);
                break;
            default:
                break;
        }
    };

    const handleRemoveFile = (tipo) => {
        switch (tipo) {
            case "informe":
                setInformeFile(null);
                break;
            case "autoevaluacion":
                setAutoevaluacionFile(null);
                break;
            default:
                break;
        }
    };

    const handleSubirArchivos = async () => {
        if (!informeFile && !autoevaluacionFile)
            return alert("Debes seleccionar al menos un archivo.");

        if (!idPracticaSeleccionada) {
            return alert("Debes seleccionar una práctica.");
        }

        try {
            const formData = new FormData();

            if (informeFile) {
                formData.append("informe", informeFile);
            }

            if (autoevaluacionFile) {
                formData.append("autoevaluacion", autoevaluacionFile);
            }

            formData.append("id_practica", idPracticaSeleccionada); // USAR LA PRÁCTICA SELECCIONADA
            const result = await handleSubirDocumento(formData);

            if (result.success) {
                setInformeFile(null);
                setAutoevaluacionFile(null);
                await fetchDocumentos();
            }
        } catch (err) {
            console.error("Error al subir archivos:", err);
            alert("Error al subir archivos");
        }
    };

    // Filtrar documentos por la práctica seleccionada
    const documentosFiltradosPorPractica = Array.isArray(documentos)
        ? documentos.filter(doc => doc.id_practica === idPracticaSeleccionada)
        : [];

    const filteredDocs = Array.isArray(documentosFiltradosPorPractica)
        ? documentosFiltradosPorPractica.filter((d) =>
            d.nombre_archivo?.toLowerCase().includes(filter.toLowerCase())
        )
        : [];

    const getEstadoConNota = (doc) => {
        if (doc.estado_revision === "calificado" && doc.nota_revision) {
            return `Calificado: ${doc.nota_revision}`;
        } else if (doc.estado_revision === "revisado") {
            return "Revisado";
        } else if (doc.estado_revision === "pendiente") {
            return "Pendiente";
        }
        return "Pendiente";
    };

    const mostrarNota = (doc) => {
        if (doc.nota_revision !== null && doc.nota_revision !== undefined) {
            return doc.nota_revision;
        }
        return "-";
    };

    const mostrarComentario = (doc) => {
        if (doc.comentario && doc.comentario.trim() !== "") {
            return "-";
        }
        return "-";
    };

    const mostrarComentarioCompleto = (doc) => {
        if (doc.comentario && doc.comentario.trim() !== "") {
            return doc.comentario;
        }
        return "Sin comentarios";
    };

    const tieneInforme = documentosFiltradosPorPractica?.some(d => d.tipo === "informe");
    const tieneAutoevaluacion = documentosFiltradosPorPractica?.some(d => d.tipo === "autoevaluacion");

    // Obtener el informe y autoevaluación específicos de la práctica seleccionada
    const informeSeleccionado = documentosFiltradosPorPractica?.find(d => d.tipo === "informe");
    const autoevaluacionSeleccionada = documentosFiltradosPorPractica?.find(d => d.tipo === "autoevaluacion");

    return (
        <div className="documentos-container">
            <div className="documentos-content">
                <div className="documentos-header">

                    <h2 className="documentos-title">Subida de Documentos Finales</h2>

                </div>

                <div className="upload-section-main">
                    <div className="upload-buttons-row">
                        <div className="file-slot">
                            {tieneInforme ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <button
                                        className="upload-btn"
                                        onClick={() => {
                                            if (informeSeleccionado) window.open(informeSeleccionado.ruta_archivo, "_blank");
                                        }}
                                    >
                                        Ver Informe
                                    </button>
                                    <div className="comentario-display">
                                        <strong>Comentario: </strong>
                                        {mostrarComentarioCompleto(informeSeleccionado)}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label className="upload-btn">
                                        Subir Informe
                                        <input
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={(e) => handleFileChange(e, "informe")}
                                            hidden
                                            disabled={!idPracticaSeleccionada}
                                        />
                                    </label>
                                    {informeFile && (
                                        <div className="selected-file">
                                            <span>{informeFile.name}</span>
                                            <button
                                                className="remove-file"
                                                onClick={() => handleRemoveFile("informe")}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="file-slot">
                            {tieneAutoevaluacion ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <button
                                        className="upload-btn"
                                        onClick={() => {
                                            if (autoevaluacionSeleccionada) window.open(autoevaluacionSeleccionada.ruta_archivo, "_blank");
                                        }}
                                    >
                                        Ver Autoevaluación
                                    </button>
                                    <div className="comentario-display">
                                        <strong>Comentario: </strong>
                                        {mostrarComentarioCompleto(autoevaluacionSeleccionada)}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label className="upload-btn">
                                        Subir Autoevaluación
                                        <input
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={(e) => handleFileChange(e, "autoevaluacion")}
                                            hidden
                                            disabled={!idPracticaSeleccionada}
                                        />
                                    </label>
                                    {autoevaluacionFile && (
                                        <div className="selected-file">
                                            <span>{autoevaluacionFile.name}</span>
                                            <button
                                                className="remove-file"
                                                onClick={() => handleRemoveFile("autoevaluacion")}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {(!tieneInforme && informeFile) || (!tieneAutoevaluacion && autoevaluacionFile) ? (
                            <button
                                onClick={handleSubirArchivos}
                                className="btn-upload"
                                disabled={uploading || (!informeFile && !autoevaluacionFile) || !idPracticaSeleccionada}
                            >
                                {uploading ? "Subiendo..." : "Subir Archivos"}
                            </button>
                        ) : null}
                    </div>

                    <div className="main-actions" style={{ marginTop: "20px" }}>
                        <button
                            className="btn-download"
                            onClick={handleDescargarPlantillas}
                        >
                            Descargar Plantillas
                        </button>
                    </div>
                </div>

                <div className="table-section">

                    <div className="document-table">
                        <div className="table-header">
                            <div>Nombre</div>
                            <div>Fecha entrega</div>
                            <div>Estado</div>
                            <div>Tipo</div>
                            <div>Nota</div>
                        </div>

                        {loadingDocs && (
                            <div className="row-main"><div>Cargando documentos...</div></div>
                        )}

                        {!loadingDocs && filteredDocs.length === 0 && (
                            <div className="row-main"><div>No se encontraron documentos para esta práctica</div></div>
                        )}

                        {!loadingDocs && filteredDocs.map((doc) => (
                            <div
                                key={doc.id_documento}
                                className="document-row"
                                onClick={() => setSelectedDoc(doc)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="row-main">
                                    <div title={doc.nombre_archivo}>
                                        {doc.nombre_archivo?.length > 30
                                            ? `${doc.nombre_archivo.substring(0, 30)}...`
                                            : doc.nombre_archivo}
                                    </div>
                                    <div>
                                        {doc.fecha_subida
                                            ? new Date(doc.fecha_subida).toLocaleDateString()
                                            : "-"}
                                    </div>
                                    <div className={`estado-${doc.estado_revision}`}>
                                        {doc.estado_revision}
                                    </div>
                                    <div>{doc.tipo === "informe" ? "Informe" : "Autoevaluación"}</div>
                                    <div className="nota-columna">
                                        {mostrarNota(doc)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedDoc && selectedDoc.comentario && (
                    <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Comentario del docente</h3>
                                <button className="modal-close" onClick={() => setSelectedDoc(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>{selectedDoc.comentario}</p>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setSelectedDoc(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocsFinales;
