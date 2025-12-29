import { useState, useEffect } from 'react';
import useGetDocumentos from '@hooks/documentos/useGetDocumentos.jsx';
import useSubirDocumento from '@hooks/documentos/useSubirDocumento.jsx';
import { usePracticasEstudiante } from '@hooks/practicas/usePracticasEstudiante.jsx';
import '@styles/documentosFinales.css';

const DocumentosFinales = () => {
    const [informeFile, setInformeFile] = useState(null);
    const [autoevaluacionFile, setAutoevaluacionFile] = useState(null);
    const [idPracticaSeleccionada, setIdPracticaSeleccionada] = useState(null);

    const { documentos, loading: loadingDocs, fetchDocumentos } = useGetDocumentos();
    const { uploading, handleSubirDocumento } = useSubirDocumento(fetchDocumentos);
    const { practicas, loading: loadingPracticas } = usePracticasEstudiante();

    // Plantillas para descargar
    const PLANTILLAS = [
        {
            nombre: "Anexo D. Plantilla Informe PP.pdf",
            url: "https://adecca.ubiobio.cl/file/download/eyJub21icmUiOiJBbmV4byBELlBsYW50aWxsYUluZm9ybWVQUC5wZGYiLCJhcmNoaXZvIjoiMTc0MzE3OTE2NDEyMDM0NC5wZGYiLCJwYXRoIjoiMjAyNVwvY3Vyc29zXC81ODY5NVwvNDQxMDc4XC8xNzQzMTc5MTY0MTIwMzQ0LnBkZiJ9"
        },
        {
            nombre: "Anexo E. Bitácora PP.docx",
            url: "https://adecca.ubiobio.cl/file/download/eyJub21icmUiOiJBbmV4byBFLmJpdFx1MDBlMWNvcmFQUC5kb2N4IiwiYXJjaGl2byI6IjE3NDMxNzkxNjUwMjAzNDQuZG9jeCIsInBhdGgiOiIyMDI1XC9jdXJzb3NcLzU4Njk1XC80NDEwNzhcLzE3NDMxNzkxNjUwMjAzNDQuZG9jeCJ9"
        }
    ];

    useEffect(() => {
        fetchDocumentos();
    }, []);

    useEffect(() => {
        // Seleccionar la primera práctica válida (activa, en_progreso o finalizada)
        if (practicas.length > 0 && !idPracticaSeleccionada) {
            const practicaValida = practicas.find(p => 
                ['activa', 'en_progreso', 'finalizada'].includes(p.estado)
            );
            if (practicaValida) {
                setIdPracticaSeleccionada(practicaValida.id_practica);
            }
        }
    }, [practicas, idPracticaSeleccionada]);

    const handleDescargarPlantillas = () => {
        PLANTILLAS.forEach(p => {
            window.open(p.url, '_blank');
        });
    };

    const handleFileChange = (e, tipo) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar formato
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Solo se permiten archivos PDF o DOCX');
            return;
        }

        // Validar tamaño (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
            alert('El archivo no puede superar los 10MB');
            return;
        }

        if (tipo === 'informe') {
            setInformeFile(file);
        } else {
            setAutoevaluacionFile(file);
        }
    };

    const handleRemoveFile = (tipo) => {
        if (tipo === 'informe') {
            setInformeFile(null);
        } else {
            setAutoevaluacionFile(null);
        }
    };

    const handleSubirArchivos = async () => {
        if (!idPracticaSeleccionada) {
            alert('Debe seleccionar una práctica');
            return;
        }

        if (!informeFile && !autoevaluacionFile) {
            alert('Debe seleccionar al menos un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('id_practica', idPracticaSeleccionada);

        if (informeFile) {
            formData.append('informe', informeFile);
        }

        if (autoevaluacionFile) {
            formData.append('autoevaluacion', autoevaluacionFile);
        }

        const result = await handleSubirDocumento(formData);

        if (result.success) {
            setInformeFile(null);
            setAutoevaluacionFile(null);
        }
    };

    // Filtrar documentos de la práctica seleccionada
    const documentosFiltrados = documentos.filter(
        doc => doc.id_practica === idPracticaSeleccionada
    );

    // Verificar si ya existen documentos subidos
    const tieneInforme = documentosFiltrados.some(d => d.tipo === 'informe');
    const tieneAutoevaluacion = documentosFiltrados.some(d => d.tipo === 'autoevaluacion');

    // Obtener práctica seleccionada
    const practicaActual = practicas.find(p => p.id_practica === idPracticaSeleccionada);
    const puedeSubir = practicaActual && ['activa', 'en_progreso', 'finalizada'].includes(practicaActual.estado);

    if (loadingPracticas) {
        return (
            <div className="documentos-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    const practicasValidas = practicas.filter(p => 
        ['activa', 'en_progreso', 'finalizada'].includes(p.estado)
    );

    if (practicasValidas.length === 0) {
        return (
            <div className="documentos-container">
                <div className="documentos-content">
                    <div className="no-practica-message">
                        <h3>No tienes prácticas activas</h3>
                        <p>Para subir documentos finales, primero debes tener una práctica activa, en progreso o finalizada.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="documentos-container">
            <div className="documentos-content">
                <div className="documentos-header">
                    <h1 className="documentos-title">Documentos Finales</h1>
                    <button className="btn-download" onClick={handleDescargarPlantillas}>
                        📄 Descargar Plantillas
                    </button>
                </div>

                {/* Selector de práctica */}
                <div className="practica-selector">
                    <label htmlFor="practica">Seleccionar práctica:</label>
                    <select
                        id="practica"
                        value={idPracticaSeleccionada || ''}
                        onChange={(e) => setIdPracticaSeleccionada(parseInt(e.target.value))}
                    >
                        {practicasValidas.map(practica => (
                            <option key={practica.id_practica} value={practica.id_practica}>
                                {practica.empresa} - {practica.estado}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sección de subida */}
                {puedeSubir && (
                    <div className="upload-section-main">
                        <h3>Subir Documentos</h3>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            Solo se permiten archivos PDF o DOCX (máximo 10MB cada uno)
                        </p>

                        <div className="upload-buttons-row">
                            {/* Informe */}
                            <div className="file-slot">
                                <h4>📋 Informe Final</h4>
                                {tieneInforme ? (
                                    <p style={{ color: '#10b981' }}>✓ Ya subido</p>
                                ) : informeFile ? (
                                    <div className="selected-file">
                                        <span>{informeFile.name}</span>
                                        <button 
                                            className="remove-file" 
                                            onClick={() => handleRemoveFile('informe')}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            id="informe"
                                            accept=".pdf,.docx"
                                            onChange={(e) => handleFileChange(e, 'informe')}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="informe" className="upload-btn">
                                            📁 Seleccionar archivo
                                        </label>
                                    </>
                                )}
                            </div>

                            {/* Autoevaluación */}
                            <div className="file-slot">
                                <h4>📝 Autoevaluación</h4>
                                {tieneAutoevaluacion ? (
                                    <p style={{ color: '#10b981' }}>✓ Ya subida</p>
                                ) : autoevaluacionFile ? (
                                    <div className="selected-file">
                                        <span>{autoevaluacionFile.name}</span>
                                        <button 
                                            className="remove-file" 
                                            onClick={() => handleRemoveFile('autoevaluacion')}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            id="autoevaluacion"
                                            accept=".pdf,.docx"
                                            onChange={(e) => handleFileChange(e, 'autoevaluacion')}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="autoevaluacion" className="upload-btn">
                                            📁 Seleccionar archivo
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {(informeFile || autoevaluacionFile) && (
                            <div className="main-actions">
                                <button 
                                    className="btn-upload" 
                                    onClick={handleSubirArchivos}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Subiendo...' : '📤 Subir Documentos'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tabla de documentos subidos */}
                <div className="table-section">
                    <h3>Mis Documentos</h3>
                    {loadingDocs ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : documentosFiltrados.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                            No has subido documentos para esta práctica
                        </p>
                    ) : (
                        <table className="document-table">
                            <thead className="table-header">
                                <tr>
                                    <th>Tipo</th>
                                    <th>Archivo</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Nota</th>
                                    <th>Comentario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentosFiltrados.map(doc => (
                                    <tr key={doc.id_documento} className="document-row">
                                        <td>
                                            {doc.tipo === 'informe' ? '📋 Informe' : '📝 Autoevaluación'}
                                        </td>
                                        <td>{doc.nombre_archivo}</td>
                                        <td>{new Date(doc.fecha_subida).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`estado-${doc.estado_revision}`}>
                                                {doc.estado_revision}
                                            </span>
                                        </td>
                                        <td className="nota-columna">
                                            {doc.nota_revision || '-'}
                                        </td>
                                        <td className="comentario-columna">
                                            {doc.comentario || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentosFinales;
