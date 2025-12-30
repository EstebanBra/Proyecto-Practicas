import { useState, useEffect, useCallback } from 'react';
import { obtenerTodasNotas as serviceObtenerTodasNotas } from '@services/notaFinal.servicef.js';

export function useTodasNotas() {
    const [todasNotas, setTodasNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        estudiante: '',
        docente: '',
        estado: ''
    });

    const fetchTodasNotas = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await serviceObtenerTodasNotas();

            if (result.success) {
                setTodasNotas(result.data || []);
                console.log("Todas las notas cargadas:", result.data?.length || 0);
            } else {
                setError(result.message);
                setTodasNotas([]);
            }
        } catch (err) {
            console.error("Error en fetchTodasNotas:", err);
            setError("Error de conexión al cargar todas las notas");
            setTodasNotas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Aplicar filtros
    const notasFiltradas = useCallback(() => {
        let filtradas = todasNotas;

        if (filtros.estudiante) {
            const busqueda = filtros.estudiante.toLowerCase();
            filtradas = filtradas.filter(nota =>
                nota.estudiante?.nombre?.toLowerCase().includes(busqueda) ||
                nota.estudiante?.rut?.toLowerCase().includes(busqueda) ||
                nota.estudiante?.email?.toLowerCase().includes(busqueda)
            );
        }

        if (filtros.docente) {
            const busqueda = filtros.docente.toLowerCase();
            filtradas = filtradas.filter(nota =>
                nota.docente?.nombre?.toLowerCase().includes(busqueda) ||
                nota.docente?.email?.toLowerCase().includes(busqueda)
            );
        }

        if (filtros.estado) {
            filtradas = filtradas.filter(nota =>
                nota.estado?.toLowerCase() === filtros.estado.toLowerCase()
            );
        }

        return filtradas;
    }, [todasNotas, filtros]);

    // Estadísticas
    const estadisticas = useCallback(() => {
        const filtradas = notasFiltradas();
        const total = filtradas.length;
        const promedio = total > 0
            ? (filtradas.reduce((sum, nota) => sum + parseFloat(nota.nota_final || 0), 0) / total).toFixed(1)
            : 0;

        return {
            total,
            promedio,
            aprobados: filtradas.filter(n => parseFloat(n.nota_final || 0) >= 4.0).length,
            reprobados: filtradas.filter(n => parseFloat(n.nota_final || 0) < 4.0).length
        };
    }, [notasFiltradas]);

    useEffect(() => {
        fetchTodasNotas();
    }, [fetchTodasNotas]);

    return {
        todasNotas,
        notasFiltradas: notasFiltradas(),
        loading,
        error,
        filtros,
        setFiltros,
        estadisticas: estadisticas(),
        fetchTodasNotas,
        refresh: fetchTodasNotas
    };
}