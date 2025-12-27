import { useState, useEffect } from 'react';
import {
    getEvaluacionesByDocumento,
    getEvaluacionesByDocente,
    getAutoevaluacionesByDocumento
} from '@services/evaluaciones_finales.service.js';

const useGetEvaluaciones = () => {
    const [evaluacionesDocente, setEvaluacionesDocente] = useState([]);
    const [evaluacionesPorDocumento, setEvaluacionesPorDocumento] = useState([]);
    const [autoevaluaciones, setAutoevaluaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    // Obtener evaluaciones del docente
    const fetchEvaluacionesDocente = async () => {
        setLoading(true);
        try {
            const response = await getEvaluacionesByDocente();
            if (response.error) {
                console.error("Error: ", response.error);
                return;
            }
            setEvaluacionesDocente(response);
        } catch (error) {
            console.error("Error al obtener evaluaciones del docente: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Obtener evaluaciones por documento (docente)
    const fetchEvaluacionesByDocumento = async (id_documento) => {
        setLoading(true);
        try {
            const response = await getEvaluacionesByDocumento(id_documento);
            if (response.error) {
                console.error("Error: ", response.error);
                return [];
            }
            setEvaluacionesPorDocumento(response);
            return response;
        } catch (error) {
            console.error("Error al obtener evaluaciones: ", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Obtener autoevaluaciones por documento (estudiante)
    const fetchAutoevaluacionesByDocumento = async (id_documento) => {
        setLoading(true);
        try {
            const response = await getAutoevaluacionesByDocumento(id_documento);
            if (response.error) {
                console.error("Error: ", response.error);
                return [];
            }
            setAutoevaluaciones(response);
            return response;
        } catch (error) {
            console.error("Error al obtener autoevaluaciones: ", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Solo cargar evaluaciones del docente al inicio
        fetchEvaluacionesDocente();
    }, []);

    return {
        evaluacionesDocente,
        evaluacionesPorDocumento,
        autoevaluaciones,
        loading,
        fetchEvaluacionesDocente,
        fetchEvaluacionesByDocumento,
        fetchAutoevaluacionesByDocumento,
        setEvaluacionesDocente,
        setEvaluacionesPorDocumento,
        setAutoevaluaciones
    };
};

export default useGetEvaluaciones;