import { useState, useRef } from 'react';
import '../styles/fileUpload.css';

const FileUploadComentario = ({ onFilesSelected, maxFiles = 5 }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const allowedFormats = ['.pdf', '.docx', '.png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateFile = (file) => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedFormats.includes(ext)) {
            return `Formato no permitido: ${ext}. Solo se permiten PDF, DOCX o PNG.`;
        }
        if (file.size > maxSize) {
            return `El archivo excede el tamaño máximo de 10MB.`;
        }
        return null;
    };

    const addFiles = (newFiles) => {
        const validFiles = [];
        const errors = [];

        Array.from(newFiles).forEach(file => {
            if (files.length + validFiles.length >= maxFiles) {
                errors.push(`Máximo ${maxFiles} archivos permitidos.`);
                return;
            }
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        addFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        addFiles(e.target.files);
        e.target.value = '';
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf': return '📕';
            case 'docx': case 'doc': return '📘';
            case 'png': case 'jpg': case 'jpeg': return '🖼️';
            default: return '📄';
        }
    };

    return (
        <div className="file-upload-container">
            <div 
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.docx,.png"
                    style={{ display: 'none' }}
                />
                <div className="drop-zone-content">
                    <div className="upload-icon">📁</div>
                    <p className="drop-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="drop-subtext">PDF, DOCX o PNG (máx. 10MB cada uno)</p>
                    <p className="drop-info">Máximo {maxFiles} archivos</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="files-list">
                    <p className="files-count">{files.length} archivo(s) seleccionado(s)</p>
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
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
                                    handleRemoveFile(index);
                                }}
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

export default FileUploadComentario;
