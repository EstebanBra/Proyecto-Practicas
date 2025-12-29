import { useState, useEffect } from 'react';
import { obtenerPracticaPorId }  from "@services/practica_f.service.js";

export function usePracticaPorId(id) {
    const [practica, setPractica] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPractica = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const result = await obtenerPracticaPorId(id);

                if (result.error) {
                    setError(result.error);
                } else {
                    setPractica(result);
                }
            } catch (err) {
                setError("Error al cargar la práctica");
            } finally {
                setLoading(false);
            }
        };

        fetchPractica();
    }, [id]);

    const refetch = async () => {
        if (!id) return;

        setLoading(true);
        const result = await obtenerPracticaPorId(id);
        if (result.error) {
            setError(result.error);
        } else {
            setPractica(result);
            setError(null);
        }
        setLoading(false);
    };

    return { practica, loading, error, refetch };
}