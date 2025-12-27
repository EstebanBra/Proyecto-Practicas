import { useState, useEffect } from 'react';
import {
    getEvaluacionesByDocente,
    getEvaluacionesByDocumento,
    getAutoevaluacionesByEstudiante,
    getAutoevaluacionesByDocumento,
    getEvaluacionesDocenteByDocumento
} from '@services/evaluaciones_finales_f.service.js';

const useGetEvaluaciones = () => {
    const [evaluacionesDocente, setEvaluacionesDocente] = useState([]);
    const [evaluacionesPorDocumento, setEvaluacionesPorDocumento] = useState([]);
    const [autoevaluaciones, setAutoevaluaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvaluacionesDocente = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getEvaluacionesByDocente();

            if (response && response.error) {
                setError(response.error);
                setEvaluacionesDocente([]);
                return;
            }

            if (Array.isArray(response)) {
                setEvaluacionesDocente(response);
            }
            else if (response && response.data && Array.isArray(response.data)) {
                setEvaluacionesDocente(response.data);
            }
            else if (response && typeof response === 'object') {
                setEvaluacionesDocente([response]);
            }
            else {
                setEvaluacionesDocente([]);
            }

        } catch (error) {
            console.error("Error al obtener evaluaciones del docente: ", error);
            setError(error.message);
            setEvaluacionesDocente([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvaluacionesByDocumento = async (id_documento) => {
        setLoading(true);
        try {
            const response = await getEvaluacionesDocenteByDocumento(id_documento);

            let evaluaciones = [];
            if (Array.isArray(response)) {
                evaluaciones = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                evaluaciones = response.data;
            } else if (response && response.data) {
                evaluaciones = [response.data];
            }

            setEvaluacionesPorDocumento(evaluaciones);
            return evaluaciones;
        } catch (error) {
            setEvaluacionesPorDocumento([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchAutoevaluacionesByEstudiante = async () => {
        setLoading(true);
        try {
            const response = await getAutoevaluacionesByEstudiante();

            let autoevaluaciones = [];
            if (Array.isArray(response)) {
                autoevaluaciones = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                autoevaluaciones = response.data;
            }

            setAutoevaluaciones(autoevaluaciones);
            return autoevaluaciones;
        } catch (error) {
            setAutoevaluaciones([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchAutoevaluacionesByDocumento = async (id_documento) => {
        setLoading(true);
        try {
            const response = await getAutoevaluacionesByDocumento(id_documento);

            let autoevaluaciones = [];
            if (Array.isArray(response)) {
                autoevaluaciones = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                autoevaluaciones = response.data;
            }

            return autoevaluaciones;
        } catch (error) {
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        if (usuario?.rol === 'docente') {
            fetchEvaluacionesDocente();
        } else if (usuario?.rol === 'estudiante') {
            fetchAutoevaluacionesByEstudiante();
        }
    }, []);

    return {
        evaluacionesDocente,
        evaluacionesPorDocumento,
        autoevaluaciones,
        loading,
        error,
        fetchEvaluacionesDocente,
        fetchEvaluacionesByDocumento,
        fetchAutoevaluacionesByEstudiante,
        fetchAutoevaluacionesByDocumento,
        setEvaluacionesDocente,
        setEvaluacionesPorDocumento,
        setAutoevaluaciones
    };
};

export default useGetEvaluaciones;