import { useState, useEffect, useCallback } from 'react';
import { getDocumentos, getDocumentoById } from '@services/documentos_finales_f.service.js';

const useGetDocumentos = () => {
    const [documentos, setDocumentos] = useState([]);
    const [documentoActual, setDocumentoActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDocumentos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDocumentos();
            if (response?.error) {
                setError(response.error);
                setDocumentos([]);
            } else if (Array.isArray(response)) {
                setDocumentos(response);
            } else {
                setError("Formato de respuesta inválido");
                setDocumentos([]);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError("Error al cargar documentos");
            setDocumentos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDocumentoById = async (id) => {
        setLoading(true);
        const response = await getDocumentoById(id);
        if (response?.error) {
            setError(response.error);
            setDocumentoActual(null);
        } else {
            setDocumentoActual(response);
        }
        setLoading(false);
        return response;
    };

    useEffect(() => {
        fetchDocumentos();
    }, [fetchDocumentos]);

    return {
        documentos,
        documentoActual,
        loading,
        error,
        fetchDocumentos,
        fetchDocumentoById,
        setDocumentos,
        setDocumentoActual,
    };
};

export default useGetDocumentos;
