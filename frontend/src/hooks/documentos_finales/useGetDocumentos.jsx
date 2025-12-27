import { useState, useEffect, useCallback } from 'react';
import { getDocumentoById, getDocumentos } from '@services/documentos_finales.service.js';

const useGetDocumentos = () => {
    const [documentos, setDocumentos] = useState([]);
    const [documentoActual, setDocumentoActual] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDocumentos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getDocumentos();
            console.log("Respuesta de API:", response);

            if (response.error) {
                console.error(response.error);
                setDocumentos([]);
                return;
            }

            if (Array.isArray(response)) {
                setDocumentos(response);
            } else if (response && Array.isArray(response.data)) {
                setDocumentos(response.data);
            } else if (response && response.data) {
                setDocumentos([response.data]);
            } else {
                setDocumentos([]);
            }
        } catch (error) {
            console.error("Error al obtener los documentos: ", error);
            setDocumentos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDocumentoById = async (id) => {
        setLoading(true);
        try {
            const response = await getDocumentoById(id);
            if (response.error) {
                console.error(response.error);
                return null;
            }
            setDocumentoActual(response);
            return response;
        } catch (error) {
            console.error("Error al obtener el documento: ", error);
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
        fetchDocumentos,
        fetchDocumentoById,
        setDocumentos,
        setDocumentoActual,
    };
};

export default useGetDocumentos;