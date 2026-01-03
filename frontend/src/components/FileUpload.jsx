import { useRef, useState } from 'react';
import '@styles/fileUpload.css';

const FileUpload = ({ files, onAddFile, onRemoveFile, error, label = 'Seleccionar archivo' }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        selectedFiles.forEach(file => {
            onAddFile(file);
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(file => {
            onAddFile(file);
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase() || '';
        switch (ext) {
            case 'pdf': return '📕';
            case 'docx': case 'doc': return '📘';
            case 'zip': case 'rar': return '📦';
            case 'png': case 'jpg': case 'jpeg': return '🖼️';
            default: return '📄';
        }
    };

    return (
        <div className="file-upload-container">
            {label && <label className="file-upload-label">{label}</label>}

            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    id="file-input"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept=".pdf,.docx,.doc,.zip,.rar"
                    multiple
                />
                <div className="drop-zone-content">
                    <div className="upload-icon">📁</div>
                    <p className="drop-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="drop-subtext">PDF, DOCX, ZIP o RAR</p>
                    <p className="drop-info">Máximo 10 MB por archivo</p>
                </div>
            </div>

            {error && <p className="file-error-message">{error}</p>}

            {files && files.length > 0 && (
                <div className="files-list">
                    <p className="files-count">{files.length} archivo(s) seleccionado(s)</p>
                    {files.map((file) => (
                        <div key={file.id} className="file-item">
                            <span className="file-icon">{getFileIcon(file.name)}</span>
                            <div className="file-info">
                                <p className="file-name">{file.name}</p>
                                <p className="file-size">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                                type="button"
                                className="remove-file-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(file.id);
                                }}
                                title="Eliminar archivo"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
