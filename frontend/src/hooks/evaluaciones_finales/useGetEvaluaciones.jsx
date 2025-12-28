import { useState, useEffect } from 'react';
import {
    getEvaluacionesByDocente,
    getEvaluacionByDocumento,
} from '@services/evaluaciones_finales_f.service.js';

const useGetEvaluaciones = () => {
    const [evaluacionesDocente, setEvaluacionesDocente] = useState([]);
    const [evaluacionDocumento, setEvaluacionDocumento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvaluacionesDocente = async () => {
        setLoading(true);
        const response = await getEvaluacionesByDocente();
        if (response?.error) {
            setError(response.error);
            setEvaluacionesDocente([]);
        } else {
            setEvaluacionesDocente(response);
        }
        setLoading(false);
    };

    const fetchEvaluacionByDocumento = async (id_documento) => {
        setLoading(true);
        const response = await getEvaluacionByDocumento(id_documento);
        setEvaluacionDocumento(response?.error ? null : response);
        setLoading(false);
        return response;
    };

    useEffect(() => {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        if (usuario?.rol === 'docente') {
            fetchEvaluacionesDocente();
        }
    }, []);

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
