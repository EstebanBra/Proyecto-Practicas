import { useState, useEffect, useCallback } from 'react';
import { obtenerNotasEstudiantes as serviceObtenerNotasEstudiantes } from '@services/notaFinal.servicef.js';

export function useNotasEstudiantes() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);

    const fetchNotasEstudiantes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await serviceObtenerNotasEstudiantes();

            if (result.success) {
                const notasData = result.data || [];
                setNotas(notasData);
                setTotal(notasData.length);

                // Log para debug
                console.log("Notas cargadas:", notasData.length);
                if (notasData.length > 0) {
                    console.log("Primera nota:", notasData[0]);
                }

                return notasData;
            } else {
                setError(result.message || "Error al cargar notas");
                setNotas([]);
                setTotal(0);
                return [];
            }
        } catch (err) {
            console.error("Error en fetchNotasEstudiantes:", err);
            setError("Error de conexión al cargar notas de estudiantes");
            setNotas([]);
            setTotal(0);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para buscar por estudiante
    const buscarPorEstudiante = useCallback((busqueda) => {
        if (!busqueda) return notas;

        const busquedaLower = busqueda.toLowerCase();
        return notas.filter(nota =>
            (nota.estudiante?.nombre?.toLowerCase().includes(busquedaLower)) ||
            (nota.estudiante?.rut?.toLowerCase().includes(busquedaLower)) ||
            (nota.estudiante?.email?.toLowerCase().includes(busquedaLower))
        );
    }, [notas]);

    // Función para ordenar
    const ordenarNotas = useCallback((campo, direccion = 'asc') => {
        const notasOrdenadas = [...notas].sort((a, b) => {
            let valorA = a[campo];
            let valorB = b[campo];

            // Manejar valores anidados
            if (campo.includes('.')) {
                const partes = campo.split('.');
                valorA = partes.reduce((obj, key) => obj?.[key], a);
                valorB = partes.reduce((obj, key) => obj?.[key], b);
            }

            if (typeof valorA === 'string') {
                return direccion === 'asc'
                    ? valorA.localeCompare(valorB)
                    : valorB.localeCompare(valorA);
            }

            return direccion === 'asc'
                ? (valorA || 0) - (valorB || 0)
                : (valorB || 0) - (valorA || 0);
        });

        setNotas(notasOrdenadas);
    }, [notas]);

    useEffect(() => {
        fetchNotasEstudiantes();
    }, [fetchNotasEstudiantes]);

    return {
        notas,
        loading,
        error,
        total,
        fetchNotasEstudiantes,
        reload: fetchNotasEstudiantes,
        buscarPorEstudiante,
        ordenarNotas
    };
}