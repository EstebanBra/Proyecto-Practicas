import { useState, useCallback } from 'react';
import { obtenerNotaFinalById as serviceObtenerNotaFinalById } from '@services/notaFinal.servicef.js';

export function useNotaById() {
    const [nota, setNota] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotaById = useCallback(async (id) => {
        const numericId = Number(id);

        if (!numericId || Number.isNaN(numericId)) {
            setError("ID de nota no válido");
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await serviceObtenerNotaFinalById(numericId);

            if (result?.success) {
                setNota(result.data ?? null);
                return result.data;
            } else {
                setError(result?.message || "No se encontró la nota");
                return null;
            }
        } catch (err) {
            console.error("Error en fetchNotaById:", err);
            setError("Error al cargar la nota");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearNota = useCallback(() => {
        setNota(null);
        setError(null);
    }, []);

    return {
        nota,
        loading,
        error,
        fetchNotaById,
        reload: fetchNotaById,
        clearNota
    };
}
