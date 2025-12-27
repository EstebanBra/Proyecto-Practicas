import { useState, useEffect, useCallback } from "react";
import "@styles/docs_finales.css";

import useGetDocumentos from "@hooks/documentos_finales/useGetDocumentos";
import useSubirDocumento from "@hooks/documentos_finales/useSubirDocumento";
import useCrearAutoevaluacion from "@hooks/evaluaciones_finales/useCrearAutoevaluacion";
import useGetEvaluaciones from "@hooks/evaluaciones_finales/useGetEvaluaciones";

const DocsFinales = () => {
    const [informeFile, setInformeFile] = useState(null);
    const [autoevaluacionFile, setAutoevaluacionFile] = useState(null);
    const [filter, setFilter] = useState("");
    const [mostrarFormNota, setMostrarFormNota] = useState(false);
    const [notaAutoevaluacion, setNotaAutoevaluacion] = useState("");
    const [comentarioAutoevaluacion, setComentarioAutoevaluacion] = useState("");
    const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
    const [autoevaluaciones, setAutoevaluaciones] = useState([]);
    const [cargandoAutoevaluaciones, setCargandoAutoevaluaciones] = useState(false);

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const { uploading, handleSubirDocumento } = useSubirDocumento(fetchDocumentos);
    const { submitting: subiendoAutoevaluacion, handleCrearAutoevaluacion } = useCrearAutoevaluacion();
    const { fetchAutoevaluacionesByDocumento } = useGetEvaluaciones();

    useEffect(() => {
        fetchDocumentos();
    }, []);

    useEffect(() => {
        const cargarAutoevaluaciones = async () => {
            if (!documentos || documentos.length === 0) return;

            const docsAutoevaluacion = documentos.filter(doc => doc.tipo === "autoevaluacion");

            if (docsAutoevaluacion.length === 0) {
                setAutoevaluaciones([]);
                return;
            }

            setCargandoAutoevaluaciones(true);

            try {
                const promesas = docsAutoevaluacion.map(doc =>
                    fetchAutoevaluacionesByDocumento(doc.id_documento)
                );

                const resultados = await Promise.all(promesas);

                const todasAutoevaluaciones = resultados.flat();
                setAutoevaluaciones(todasAutoevaluaciones);
            } catch (error) {
                console.error("Error cargando autoevaluaciones:", error);
            } finally {
                setCargandoAutoevaluaciones(false);
            }
        };

        cargarAutoevaluaciones();
    }, [documentos]);

    const actualizarAutoevaluaciones = useCallback(async (documentoId) => {
        if (!documentoId) return;

        try {
            const nuevasEvaluaciones = await fetchAutoevaluacionesByDocumento(documentoId);

            setAutoevaluaciones(prev => {
                const filtradas = prev.filter(e => e.id_documento !== documentoId);
                return [...filtradas, ...nuevasEvaluaciones];
            });
        } catch (error) {
            console.error("Error actualizando autoevaluaciones:", error);
        }
    }, [fetchAutoevaluacionesByDocumento]);

    const handleFileChange = (e, tipo) => {
        const file = e.target.files[0];
        if (!file) return;

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
            if (informeFile) formData.append("informe", informeFile);
            if (autoevaluacionFile) formData.append("autoevaluacion", autoevaluacionFile);
            formData.append("id_practica", 1);

            const result = await handleSubirDocumento(formData);

            if (result.success) {
                setInformeFile(null);
                setAutoevaluacionFile(null);
                // Recargar documentos
                await fetchDocumentos();
            }
        } catch (err) {
            console.error("Error al subir archivos:", err);
        }
    };

    const handleEnviarNotaAutoevaluacion = async () => {
        if (!notaAutoevaluacion || notaAutoevaluacion < 1 || notaAutoevaluacion > 7) {
            alert("Debe ingresar una nota válida entre 1.0 y 7.0");
            return;
        }

        if (!documentoSeleccionado) {
            alert("No hay documento seleccionado");
            return;
        }

        const autoevaluacionData = {
            id_documento: documentoSeleccionado.id_documento,
            nota: parseFloat(notaAutoevaluacion),
            comentario: comentarioAutoevaluacion || ""
        };

        try {
            const result = await handleCrearAutoevaluacion(autoevaluacionData);

            if (result.success) {
                setMostrarFormNota(false);
                setNotaAutoevaluacion("");
                setComentarioAutoevaluacion("");
                setDocumentoSeleccionado(null);
                alert("Nota de autoevaluación enviada correctamente");

                await actualizarAutoevaluaciones(documentoSeleccionado.id_documento);
            }
        } catch (err) {
            console.error("Error al enviar nota de autoevaluación:", err);
            alert("Error al enviar la nota de autoevaluación");
        }
    };

    const filteredDocs = Array.isArray(documentos)
        ? documentos.filter((d) =>
            d.nombre_archivo?.toLowerCase().includes(filter.toLowerCase())
        )
        : [];

    const getNotaPorDocumento = useCallback((documentoId) => {
        if (!documentoId) return "-";

        const autoevaluacion = autoevaluaciones.find(e => e.id_documento === documentoId);

        if (autoevaluacion) {
            return autoevaluacion.nota;
        }

        const doc = documentos.find(d => d.id_documento === documentoId);
        if (doc && doc.tipo === "autoevaluacion") {
            return "Pendiente";
        }

        return "-";
    }, [autoevaluaciones, documentos]);

    const documentosCompletos = Array.isArray(documentos)
        ? documentos.filter(d => d.tipo === "informe").length > 0 &&
        documentos.filter(d => d.tipo === "autoevaluacion").length > 0
        : false;

    const tieneAutoevaluacionSubida = Array.isArray(documentos)
        ? documentos.some(d => d.tipo === "autoevaluacion")
        : false;

    const getDocumentoAutoevaluacion = useCallback(() => {
        return documentos.find(d => d.tipo === "autoevaluacion");
    }, [documentos]);

    const notaDocumentoAutoevaluacion = getDocumentoAutoevaluacion()
        ? getNotaPorDocumento(getDocumentoAutoevaluacion().id_documento)
        : "Pendiente";

    return (
        <div className="documentos-container">
            <div className="documentos-content">
                <div className="documentos-header">
                    <h2 className="documentos-title">Subida de Informes</h2>
                </div>

                <div className="upload-section-main">
                    <div className="upload-buttons-row">
                        <div className="file-slot">
                            {documentos.some(d => d.tipo === "informe") ? (
                                <button
                                    className="upload-btn"
                                    onClick={() => {
                                        const informe = documentos.find(d => d.tipo === "informe");
                                        if (informe) window.open(informe.ruta_archivo, "_blank");
                                    }}
                                >
                                    Ver Informe
                                </button>
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

                        <div className="file-slot">
                            {tieneAutoevaluacionSubida ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <button
                                        className="upload-btn"
                                        onClick={() => {
                                            const autoEval = getDocumentoAutoevaluacion();
                                            if (autoEval) window.open(autoEval.ruta_archivo, "_blank");
                                        }}
                                        disabled={cargandoAutoevaluaciones}
                                    >
                                        {cargandoAutoevaluaciones ? "Cargando..." : "Ver Autoevaluación"}
                                    </button>

                                    <button
                                        className="upload-btn"
                                        onClick={() => {
                                            const doc = getDocumentoAutoevaluacion();
                                            setDocumentoSeleccionado(doc);
                                            setMostrarFormNota(true);
                                        }}
                                        style={{ background: "#28a745" }}
                                        disabled={cargandoAutoevaluaciones}
                                    >
                                        {cargandoAutoevaluaciones
                                            ? "Cargando..."
                                            : notaDocumentoAutoevaluacion === "Pendiente"
                                                ? "Ingresar Nota Autoevaluación"
                                                : "Modificar Nota Autoevaluación"}
                                    </button>
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

                        {!documentosCompletos && (
                            <button
                                onClick={handleSubirArchivos}
                                className="btn-upload"
                                disabled={uploading || (!informeFile && !autoevaluacionFile)}
                            >
                                {uploading ? "Subiendo..." : "Subir"}
                            </button>
                        )}
                    </div>

                    {/* FORMULARIO MODAL PARA INGRESAR NOTA DE AUTOEVALUACIÓN */}
                    {mostrarFormNota && (
                        <div style={{
                            marginTop: "20px",
                            padding: "20px",
                            border: "2px solid #003366",
                            borderRadius: "10px",
                            background: "white",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                        }}>
                            <h3 style={{ color: "#003366", marginBottom: "15px" }}>
                                Nota de Autoevaluación
                            </h3>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                    Nota (1.0 - 7.0): *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="7"
                                    value={notaAutoevaluacion}
                                    onChange={(e) => setNotaAutoevaluacion(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        fontSize: "16px"
                                    }}
                                    placeholder="Ej: 6.5"
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                    Comentario (opcional):
                                </label>
                                <textarea
                                    value={comentarioAutoevaluacion}
                                    onChange={(e) => setComentarioAutoevaluacion(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        minHeight: "80px",
                                        fontSize: "14px"
                                    }}
                                    placeholder="Agregue un comentario sobre su autoevaluación..."
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    onClick={handleEnviarNotaAutoevaluacion}
                                    disabled={subiendoAutoevaluacion}
                                    style={{
                                        background: "#28a745",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {subiendoAutoevaluacion ? "Enviando..." : "Enviar Nota"}
                                </button>

                                <button
                                    onClick={() => {
                                        setMostrarFormNota(false);
                                        setNotaAutoevaluacion("");
                                        setComentarioAutoevaluacion("");
                                        setDocumentoSeleccionado(null);
                                    }}
                                    style={{
                                        background: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="main-actions" style={{ marginTop: "20px" }}>
                        <button className="btn-upload">Reglamento</button>
                        <button className="btn-download">Descargar Plantillas</button>
                    </div>
                </div>

                {/* Tabla */}
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
                        </div>

                        {(loadingDocs || cargandoAutoevaluaciones) && (
                            <div className="row-main"><div>Cargando documentos...</div></div>
                        )}

                        {!loadingDocs && !cargandoAutoevaluaciones && filteredDocs.length === 0 && (
                            <div className="row-main"><div>No se encontraron documentos</div></div>
                        )}

                        {!loadingDocs && !cargandoAutoevaluaciones && filteredDocs.map((doc) => (
                            <div key={doc.id_documento} className="document-row">
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
                                    <div>{doc.estado_revision}</div>
                                    <div>{doc.tipo === "informe" ? "Informe" : "Autoevaluación"}</div>
                                    <div>
                                        {doc.tipo === "autoevaluacion" ? (
                                            <span style={{
                                                color: getNotaPorDocumento(doc.id_documento) === "Pendiente" ? "#ff9800" : "#28a745",
                                                fontWeight: "bold"
                                            }}>
                                                {getNotaPorDocumento(doc.id_documento)}
                                            </span>
                                        ) : (
                                            <span>{getNotaPorDocumento(doc.id_documento)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsFinales;