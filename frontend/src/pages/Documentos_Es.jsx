// Documentos_Es.jsx - VERSIÓN CON NOTA_REVISION Y COMENTARIO
import { useState, useEffect } from "react";
import "@styles/docs_finales.css";

import useGetDocumentos from "@hooks/documentos_finales/useGetDocumentos";
import useSubirDocumento from "@hooks/documentos_finales/useSubirDocumento";

const DocsFinales = () => {
    const [informeFile, setInformeFile] = useState(null);
    const [autoevaluacionFile, setAutoevaluacionFile] = useState(null);
    const [filter, setFilter] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null); // Para mostrar comentario

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const { uploading, handleSubirDocumento } = useSubirDocumento(fetchDocumentos);

    useEffect(() => {
        fetchDocumentos();
    }, []);

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

        try {
            const formData = new FormData();

            if (informeFile) {
                formData.append("informe", informeFile);
            }

            if (autoevaluacionFile) {
                formData.append("autoevaluacion", autoevaluacionFile);
            }

            formData.append("id_practica", 1);
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

    const filteredDocs = Array.isArray(documentos)
        ? documentos.filter((d) =>
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

    const tieneInforme = documentos?.some(d => d.tipo === "informe");
    const tieneAutoevaluacion = documentos?.some(d => d.tipo === "autoevaluacion");

    return (
        <div className="documentos-container">
            <div className="documentos-content">
                <div className="documentos-header">
                    <h2 className="documentos-title">Subida de Documentos Finales</h2>
                    <p className="documentos-subtitle">
                        Sube tu informe final y autoevaluación. El docente calificará ambos documentos.
                    </p>
                </div>

                <div className="upload-section-main">
                    <div className="upload-buttons-row">
                        {/* Sección Informe */}
                        <div className="file-slot">
                            {tieneInforme ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <button
                                        className="upload-btn"
                                        onClick={() => {
                                            const informe = documentos.find(d => d.tipo === "informe");
                                            if (informe) window.open(informe.ruta_archivo, "_blank");
                                        }}
                                    >
                                        Ver Informe
                                    </button>
                                    <div className="nota-display">
                                        <strong>Estado: </strong>
                                        {getEstadoConNota(documentos.find(d => d.tipo === "informe"))}
                                    </div>
                                    <div className="comentario-display">
                                        <strong>Comentario: </strong>
                                        {mostrarComentarioCompleto(documentos.find(d => d.tipo === "informe"))}
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

                        {/* Sección Autoevaluación */}
                        <div className="file-slot">
                            {tieneAutoevaluacion ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <button
                                        className="upload-btn"
                                        onClick={() => {
                                            const autoEval = documentos.find(d => d.tipo === "autoevaluacion");
                                            if (autoEval) window.open(autoEval.ruta_archivo, "_blank");
                                        }}
                                    >
                                        Ver Autoevaluación
                                    </button>
                                    <div className="nota-display">
                                        <strong>Estado: </strong>
                                        {getEstadoConNota(documentos.find(d => d.tipo === "autoevaluacion"))}
                                    </div>
                                    <div className="comentario-display">
                                        <strong>Comentario: </strong>
                                        {mostrarComentarioCompleto(documentos.find(d => d.tipo === "autoevaluacion"))}
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
                                disabled={uploading || (!informeFile && !autoevaluacionFile)}
                            >
                                {uploading ? "Subiendo..." : "Subir Archivos"}
                            </button>
                        ) : null}
                    </div>

                    <div className="main-actions" style={{ marginTop: "20px" }}>
                        <button className="btn-upload">Reglamento</button>
                        <button className="btn-download">Descargar Plantillas</button>
                    </div>
                </div>

                <div className="table-section">
                    <div className="top-bar-docs">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Buscar documento..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="document-table">
                        <div className="table-header">
                            <div>Nombre</div>
                            <div>Fecha entrega</div>
                            <div>Estado</div>
                            <div>Tipo</div>
                            <div>Nota</div>
                            <div>Comentario</div>
                        </div>

                        {loadingDocs && (
                            <div className="row-main"><div>Cargando documentos...</div></div>
                        )}

                        {!loadingDocs && filteredDocs.length === 0 && (
                            <div className="row-main"><div>No se encontraron documentos</div></div>
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
                                    <div className="comentario-columna" title={doc.comentario || "Sin comentarios"}>
                                        {mostrarComentario(doc)}
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
