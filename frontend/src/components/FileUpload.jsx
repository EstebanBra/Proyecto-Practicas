import { useState, useRef } from 'react';
import '@styles/fileUpload.css';
import { showErrorAlert } from '../helpers/sweetAlert';

export default function FileUpload({ onFilesSelected, maxFiles = 5 }) {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const allowedTypes = ['.pdf', '.docx', '.png'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const validateFile = (file) => {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            return `El archivo "${file.name}" no es válido. Solo se permiten: PDF, DOCX, PNG`;
        }
        
        if (file.size > maxFileSize) {
            return `El archivo "${file.name}" excede el tamaño máximo de 10MB`;
        }
        
        return null;
    };

    const handleFiles = (newFiles) => {
        const fileArray = Array.from(newFiles);
        
        // Validar cantidad total
        if (files.length + fileArray.length > maxFiles) {
            showErrorAlert('Error', `Solo puedes subir un máximo de ${maxFiles} archivos`);
            return;
        }

        // Validar cada archivo
        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                showErrorAlert('Error', error);
                return;
            }
        }

        // Verificar duplicados
        const newFileNames = fileArray.map(f => f.name);
        const existingFileNames = files.map(f => f.name);
        const duplicates = newFileNames.filter(name => existingFileNames.includes(name));
        
        if (duplicates.length > 0) {
            showErrorAlert('Error', `Los siguientes archivos ya están agregados: ${duplicates.join(', ')}`);
            return;
        }

        const updatedFiles = [...files, ...fileArray];
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const removeFile = (indexToRemove) => {
        const updatedFiles = files.filter((_, index) => index !== indexToRemove);
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFiles(droppedFiles);
        }
    };

    const handleFileInputChange = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length > 0) {
            handleFiles(selectedFiles);
        }
        // Reset input para permitir seleccionar el mismo archivo después de eliminarlo
        e.target.value = '';
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'docx':
                return '📝';
            case 'png':
                return '🖼️';
            default:
                return '📎';
        }
    };

    return (
        <div className="file-upload-container">
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.png"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />
                
                <div className="drop-zone-content">
                    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    
                    {isDragging ? (
                        <p className="drop-text">Suelta los archivos aquí</p>
                    ) : (
                        <>
                            <p className="drop-text">
                                Arrastra y suelta archivos aquí
                            </p>
                            <p className="drop-subtext">
                                o haz clic para seleccionar
                            </p>
                            <p className="drop-info">
                                PDF, DOCX, PNG (máx. 10MB cada uno)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {files.length > 0 && (
                <div className="files-list">
                    <p className="files-count">
                        {files.length} de {maxFiles} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
                    </p>
                    
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
                                onClick={() => removeFile(index)}
                                aria-label="Eliminar archivo"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
