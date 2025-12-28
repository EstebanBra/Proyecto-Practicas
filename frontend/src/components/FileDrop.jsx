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
            onChange({ target: { files: filteredFiles } });
        }
    };

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            onChange(e);
        }
    };

    const removeFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        onChange({ 
            target: { 
                files: updatedFiles 
            } 
        });
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
                        <p className="filedrop-main">arrastra archivos aqui</p>
                        <p className="filedrop-sub">o haz clic para seleccionar</p>
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
                                    📄 {file.name}
                                </span>
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeFile(index)}
                                >
                                    ✕
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
