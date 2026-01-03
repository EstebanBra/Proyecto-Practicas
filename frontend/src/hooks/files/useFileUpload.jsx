import { useState } from 'react';

export const useFileUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploadError, setUploadError] = useState(null);

    const addFile = (file) => {
        // Validar que el archivo no esté duplicado
        if (files.some(f => f.name === file.name)) {
            setUploadError('El archivo ya ha sido seleccionado');
            return false;
        }

        // Validar tamaño (10 MB máximo)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadError('El archivo excede los 10 MB permitidos');
            return false;
        }

        // Validar tipo de archivo (más flexible)
        const allowedExtensions = ['.pdf', '.docx', '.doc', '.zip', '.rar'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            setUploadError('El archivo debe ser PDF, DOCX, ZIP o RAR');
            return false;
        }

        setUploadError(null);

        // Crear objeto con la información del archivo
        const fileWithId = {
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            file: file // Guardar referencia al archivo original
        };

        setFiles(prevFiles => [...prevFiles, fileWithId]);
        return true;
    };

    const removeFile = (fileId) => {
        setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
        setUploadError(null);
    };

    const clearFiles = () => {
        setFiles([]);
        setUploadError(null);
    };

    // Obtener el archivo original para subir
    const getFileToUpload = () => {
        if (files.length > 0) {
            return files[0].file;
        }
        return null;
    };

    return {
        files,
        uploadError,
        addFile,
        removeFile,
        clearFiles,
        getFileToUpload
    };
};
