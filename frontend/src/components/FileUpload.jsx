import { useRef } from 'react';
import '@styles/fileUpload.css';
import deleteIcon from '../assets/deleteIcon.svg';
import DocumentIcon from '../assets/DocumentIcon.svg';

const FileUpload = ({ files, onAddFile, onRemoveFile, error, label = 'Seleccionar archivo' }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        selectedFiles.forEach(file => {
            onAddFile(file);
        });
        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(file => {
            onAddFile(file);
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="file-upload-container">
            {label && <label className="file-upload-label">{label}</label>}

            <div
                className="file-drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    id="file-input"
                    onChange={handleFileSelect}
                    className="file-input"
                    accept=".pdf,.docx,.doc,.zip,.rar"
                    multiple
                />
                <label htmlFor="file-input" className="file-drop-label">
                    <div className="drop-icon">📁</div>
                    <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="file-types">Tipos aceptados: PDF, DOCX, ZIP, RAR (máx 10 MB)</p>
                </label>
            </div>

            {error && <p className="file-error-message">{error}</p>}

            {files && files.length > 0 && (
                <div className="files-list">
                    <h4 className="files-list-title">Archivos seleccionados ({files.length}):</h4>
                    {files.map((file) => (
                        <div key={file.id} className="file-item">
                            <div className="file-info">
                                <img src={DocumentIcon} alt="documento" className="file-icon" />
                                <div className="file-details">
                                    <p className="file-name">{file.name}</p>
                                    <p className="file-size">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="file-delete-btn"
                                onClick={() => onRemoveFile(file.id)}
                                title="Eliminar archivo"
                            >
                                <img src={deleteIcon} alt="eliminar" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
