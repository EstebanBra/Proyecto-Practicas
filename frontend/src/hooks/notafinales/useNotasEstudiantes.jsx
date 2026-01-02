import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTodasPracticas } from '../practicas/useTodasPracticas.jsx';
import {
    obtenerNotasEstudiantes,
    calcularNotaFinal
} from '@services/notaFinal.servicef.js';

export function useNotasEstudiantes() {
    const { practicas, loading: loadingPracticas } = useTodasPracticas();

    const [notas, setNotas] = useState([]);
    const [loadingNotas, setLoadingNotas] = useState(true);
    const [error, setError] = useState(null);

    const [filtroActual, setFiltroActual] = useState('todos');
    const [calculando, setCalculando] = useState({});

    const fetchNotas = useCallback(async () => {
        setLoadingNotas(true);
        setError(null);

        const result = await obtenerNotasEstudiantes();

        if (result?.success) {
            setNotas(Array.isArray(result.data) ? result.data : []);
        } else {
            setNotas([]);
            setError(result?.message || 'Error al obtener notas');
        }

        setLoadingNotas(false);
    }, []);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas]);

    const estudiantesCombinados = useMemo(() => {
        if (!Array.isArray(practicas) || practicas.length === 0) return [];

        const mapaNotas = new Map(
            notas.map(n => [n.practica_id, n])
        );

        return practicas
            .filter(p => p.id_estudiante)
            .map(p => {
                const nota = mapaNotas.get(p.id);

                return {
                    id_estudiante: p.id_estudiante,
                    practica_id: p.id,
                    practica_empresa: p.empresa,
                    estudiante: p.estudiante,
                    fecha_inicio: p.fecha_inicio,
                    fecha_fin: p.fecha_fin,
                    estado_practica: p.estado,

                    nota_practica: p.nota_practica ?? null,

                    nota_informe: nota?.nota_informe ?? null,
                    nota_autoevaluacion: nota?.nota_autoevaluacion ?? null,
                    nota_final: nota?.nota_final ?? null,
                    fecha_calculo: nota?.fecha_calculo ?? null,
                };
            });
    }, [practicas, notas]);

    const estudiantesFiltrados = useMemo(() => {
        switch (filtroActual) {
            case 'listos':
                return estudiantesCombinados.filter(
                    e =>
                        e.nota_informe != null &&
                        e.nota_autoevaluacion != null &&
                        e.nota_final == null
                );
            case 'pendientes':
                return estudiantesCombinados.filter(
                    e =>
                        e.nota_informe == null ||
                        e.nota_autoevaluacion == null
                );
            default:
                return estudiantesCombinados;
        }
    }, [estudiantesCombinados, filtroActual]);

    const calcularNotaEstudiante = useCallback(async (idEstudiante) => {
        setCalculando(prev => ({ ...prev, [idEstudiante]: true }));

        const result = await calcularNotaFinal(idEstudiante);

        if (result?.success) {
            await fetchNotas();
        }

        setCalculando(prev => ({ ...prev, [idEstudiante]: false }));
        return result;
    }, [fetchNotas]);

    const cambiarFiltro = useCallback((nuevoFiltro) => {
        setFiltroActual(nuevoFiltro);
    }, []);

    return {
        estudiantes: estudiantesFiltrados,
        filtroActual,
        loading: loadingPracticas || loadingNotas,
        error,
        calculando,
        calcularNotaEstudiante,
        cambiarFiltro,
        reload: fetchNotas,
    };
}