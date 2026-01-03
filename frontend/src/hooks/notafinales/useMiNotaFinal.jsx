import { useState, useEffect, useCallback } from 'react';
import { obtenerMiNotaFinal as serviceObtenerMiNotaFinal } from '@services/notaFinal.servicef.js';

export function useMiNotaFinal() {
    const [nota, setNota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMiNota = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await serviceObtenerMiNotaFinal();

            console.log("Resultado de obtenerMiNotaFinal:", result);

            if (result.success) {
                if (result.success) {
                    if (result.data && result.data.data) {
                        setNota(result.data.data);
                    } else {
                        setNota(null);
                    }
                }
            } else {
                // Si no hay nota calculada, no es un error
                if (result.message && (
                    result.message.includes("No se encontró") ||
                    result.message.includes("No tienes") ||
                    result.message.includes("no tiene nota calculada") ||
                    result.message.includes("no existe")
                )) {
                    setNota(null);
                } else {
                    setError(result.message || "Error desconocido");
                }
            }
        } catch (err) {
            console.error("Error al cargar nota:", err);
            setError("Error al cargar la nota");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMiNota();
    }, [fetchMiNota]);

    const reload = useCallback(() => {
        fetchMiNota();
    }, [fetchMiNota]);

    return {
        nota,
        loading,
        error,
        fetchMiNota,
        reload,
        tieneNota: !!nota && nota.nota_final != null
    };
}
