import { useState, useEffect, useCallback } from 'react';
import {
    getEvaluacionesByDocente,
    getEvaluacionByDocumento,
} from '@services/evaluacionFinal.service.js';

const useGetEvaluaciones = () => {
    const [evaluacionesDocente, setEvaluacionesDocente] = useState([]);
    const [evaluacionDocumento, setEvaluacionDocumento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvaluacionesDocente = useCallback(async () => {
        setLoading(true);
        const response = await getEvaluacionesByDocente();
        if (response?.error) {
            setError(response.error);
            setEvaluacionesDocente([]);
        } else {
            setEvaluacionesDocente(response);
        }
        setLoading(false);
    }, []);

    const fetchEvaluacionByDocumento = useCallback(async (id_documento) => {
        setLoading(true);
        const response = await getEvaluacionByDocumento(id_documento);
        setEvaluacionDocumento(response?.error ? null : response);
        setLoading(false);
        return response;
    }, []);

    useEffect(() => {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        if (usuario?.rol === 'docente') {
            fetchEvaluacionesDocente();
        }
    }, [fetchEvaluacionesDocente]);

    return {
        evaluacionesDocente,
        evaluacionDocumento,
        loading,
        error,
        fetchEvaluacionesDocente,
        fetchEvaluacionByDocumento,
    };
};

export default useGetEvaluaciones;
