import { useState, useEffect } from 'react';
import '@styles/bitacoradocumentos.css';
import { useDocumentos, useDocumentoBitacora } from '../hooks/bitacora/useBitacora.jsx';
import { useFileUpload } from '../hooks/files/useFileUpload.jsx';
import FileUpload from '../components/FileUpload.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { showAlert } from '../helpers/sweetAlert.js';

const BitacoraDocumentos = () => {
    const { user } = useAuth();
    const [idPractica] = useState(() => user?.id_practica || 1);

    const { documentos, loading: loadingDocs, fetchDocumentos } = useDocumentos(idPractica);
    const { subirArchivo, registrarDocumento, loading: uploadingFile } = useDocumentoBitacora();
    const { files, uploadError, addFile, removeFile, clearFiles, getFileToUpload } = useFileUpload();

    const [showUploadForm, setShowUploadForm] = useState(false);

    useEffect(() => {
        fetchDocumentos();
    }, [idPractica, fetchDocumentos]);

    const handleFileAdd = (file) => {
        const added = addFile(file);
        if (!added && uploadError) {
            showAlert('Error', uploadError, 'error');
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            showAlert('Advertencia', 'Por favor selecciona un archivo', 'warning');
            return;
        }

        try {
            // Obtener el archivo original para subir
            const fileToUpload = getFileToUpload();
            if (!fileToUpload) {
                showAlert('Error', 'No se pudo obtener el archivo', 'error');
                return;
            }

            // Subir el archivo
            const { data, error } = await subirArchivo(fileToUpload);

            if (error) {
                showAlert('Error', error, 'error');
                return;
            }

            // Registrar el documento
            const documentData = {
                id_practica: idPractica,
                ...data.data
            };

            const { error: docError } = await registrarDocumento(documentData);

            if (docError) {
                showAlert('Error', docError, 'error');
                return;
            }

            clearFiles();
            setShowUploadForm(false);
            showAlert('Éxito', 'Documento subido correctamente', 'success');
            fetchDocumentos();
        } catch (error) {
            showAlert('Error', error.message, 'error');
        }
    };

    const getFileIcon = (formato) => {
        const icons = {
            'pdf': '📄',
            'docx': '📋',
            'zip': '📦',
            'rar': '📦'
        };
        return icons[formato] || '📄';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="documentos-container">
            <div className="documentos-header">
                <h1>Documentos de Bitácora</h1>
                <button
                    className="btn-upload-document"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                >
                    {showUploadForm ? '✕ Cancelar' : '+ Subir Documento'}
                </button>
            </div>

            {/* Formulario de carga */}
            {showUploadForm && (
                <div className="upload-section">
                    <h2>Subir Nuevo Documento</h2>

                    <FileUpload
                        files={files}
                        onAddFile={handleFileAdd}
                        onRemoveFile={removeFile}
                        error={uploadError}
                        label="Seleccionar Documento"
                    />

                    <div className="upload-actions">
                        <button
                            className="btn-confirm-upload"
                            onClick={handleUpload}
                            disabled={uploadingFile || files.length === 0}
                        >
                            {uploadingFile ? 'Subiendo...' : '📤 Subir Documento'}
                        </button>
                        <button
                            className="btn-clear-files"
                            type="button"
                            onClick={() => {
                                clearFiles();
                                setShowUploadForm(false);
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de documentos */}
            <div className="documentos-list">
                {loadingDocs ? (
                    <div className="loading">Cargando documentos...</div>
                ) : documentos && documentos.length > 0 ? (
                    <div className="documentos-grid">
                        {documentos.map((doc, index) => (
                            <div key={doc.id_documento || index} className="documento-card">
                                <div className="documento-icon">
                                    {getFileIcon(doc.formato)}
                                </div>

                                <div className="documento-info">
                                    <h3 className="documento-nombre">{doc.nombre_archivo}</h3>

                                    <div className="documento-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Formato:</span>
                                            <span className="meta-value">{doc.formato.toUpperCase()}</span>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">Tamaño:</span>
                                            <span className="meta-value">{doc.peso_mb} MB</span>
                                        </div>
                                    </div>

                                    {doc.fecha_subida && (
                                        <p className="fecha-subida">
                                            Subido: {formatDate(doc.fecha_subida)}
                                        </p>
                                    )}

                                    <div className={`estado-revision ${doc.estado_revision || 'pendiente'}`}>
                                        {doc.estado_revision === 'aprobado' && '✔ Aprobado'}
                                        {doc.estado_revision === 'rechazado' && '✗ Rechazado'}
                                        {doc.estado_revision === 'pendiente' && '⏳ Pendiente de Revisión'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📁</div>
                        <h3>No hay documentos</h3>
                        <p>Aún no has subido ningún documento</p>
                        <button
                            className="btn-create-from-empty"
                            onClick={() => setShowUploadForm(true)}
                        >
                            Subir Primer Documento
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BitacoraDocumentos;
