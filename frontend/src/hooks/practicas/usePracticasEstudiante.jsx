import { useState, useEffect } from 'react';
import { obtenerPracticasEstudiante } from "@services/practica_f.service.js";

export function usePracticasEstudiante() {
    const [practicas, setPracticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPracticas = async () => {
            try {
                setLoading(true);
                const result = await obtenerPracticasEstudiante();

                if (result.error) {
                    setError(result.error);
                } else {
                    setPracticas(result);
                }
            } catch (err) {
                setError("Error al cargar las prácticas");
            } finally {
                setLoading(false);
            }
        };

        fetchPracticas();
    }, []);

    const refetch = async () => {
        setLoading(true);
        const result = await obtenerPracticasEstudiante();
        if (result.error) {
            setError(result.error);
        } else {
            setPracticas(result);
            setError(null);
        }
        setLoading(false);
    };

    return { practicas, loading, error, refetch };
}
