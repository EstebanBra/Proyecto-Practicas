import { useState } from 'react';
import '@styles/filedrop.css';

const FileDrop = ({ onChange, accept = ".pdf,.doc,.docx", files = [] }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev + 1);
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev - 1);
        if (dragCounter === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setDragCounter(0);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const filteredFiles = droppedFiles.filter((file) => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            return accept.includes(ext);
        });

        if (filteredFiles.length > 0) {
            const combinedFiles = [...files, ...filteredFiles];
            const fakeEvent = {
                target: {
                    files: combinedFiles
                }
            };
            onChange(fakeEvent);
        }
    };

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            const combinedFiles = [...files, ...selectedFiles];
            const fakeEvent = {
                target: {
                    files: combinedFiles
                }
            };
            onChange(fakeEvent);
            e.target.value = '';
        }
    };

    const removeFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        const fakeEvent = {
            target: {
                files: updatedFiles
            }
        };
        onChange(fakeEvent);
    };

    return (
        <div className="filedrop-container">
            <div
                className={`filedrop-area ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-input"
                    multiple
                    accept={accept}
                    onChange={handleFileInput}
                    className="file-input"
                />
                <label htmlFor="file-input" className="filedrop-label">
                    <div className="filedrop-icon">📁</div>
                    <div className="filedrop-text">
                        <p className="filedrop-main">Arrastra tus archivos aqui (Documento de Postulacion, Curriculum)</p>
                        <p className="filedrop-sub">O haz clic para seleccionar tus archivos</p>
                    </div>
                </label>
            </div>

            {files.length > 0 && (
                <div className="files-list">
                    <p className="files-list-title">archivos seleccionados:</p>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index} className="file-item">
                                <span className="file-name">
                                    {typeof file === 'string' ? file : file?.name || 'archivo'}
                                </span>
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeFile(index)}
                                    title="Eliminar este archivo"
                                    aria-label="Eliminar archivo"
                                >
                                    &#10005;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileDrop;