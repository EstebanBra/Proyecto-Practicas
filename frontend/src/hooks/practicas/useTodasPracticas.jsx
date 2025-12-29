import { useState, useEffect, useCallback } from 'react';
import { obtenerTodasPracticas } from '@services/practica.service.js';

export function useTodasPracticas() {
    const [practicas, setPracticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPracticas = async () => {
            try {
                setLoading(true);
                const result = await obtenerTodasPracticas();

                if (result.status === "Error") {
                    setError(result.message);
                } else {
                    setPracticas(result.data || []);
                }
            } catch (err) {
                setError("Error al cargar las prácticas");
            } finally {
                setLoading(false);
            }
        };

        fetchPracticas();
    }, []);

    const refetch = useCallback(async () => {
        setLoading(true);
        const result = await obtenerTodasPracticas();
        if (result.status === "Error") {
            setError(result.message);
        } else {
            setPracticas(result.data || []);
            setError(null);
        }
        setLoading(false);
    }, []);

    return { practicas, loading, error, refetch };
}
