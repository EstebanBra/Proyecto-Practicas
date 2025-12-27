import { useState, useEffect, useCallback } from 'react';
import { getDocumentoById, getDocumentos } from '@services/documentos_finales_f.service.js';

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

            if (response && response.error) {
                setError(response.error);
                setDocumentos([]);
                return;
            }

            let documentosData = [];

            if (Array.isArray(response)) {
                documentosData = response;
            } else if (response && response.data) {
                if (Array.isArray(response.data)) {
                    documentosData = response.data;
                } else if (response.data) {
                    documentosData = [response.data];
                }
            } else if (response === '' || response === null) {
                documentosData = [];
            }

            setDocumentos(documentosData || []);

            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError("Error de conexión con el servidor");
            setDocumentos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDocumentoById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDocumentoById(id);
            if (response && response.error) {
                setError(response.error);
                return null;
            }
            setDocumentoActual(response);
            return response;
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError("Error al obtener documento específico");
            return null;
        } finally {
            setLoading(false);
        }
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