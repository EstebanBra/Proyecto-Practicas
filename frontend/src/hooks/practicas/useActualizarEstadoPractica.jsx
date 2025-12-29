import { useState } from 'react';
import { actualizarEstadoPractica } from "@services/practica_f.service.js";

export function useActualizarEstadoPractica() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const actualizarEstado = async (id, estado, observaciones) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await actualizarEstadoPractica(id, estado, observaciones);

            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            } else {
                setData(result);
                return { success: true, data: result };
            }
        } catch (err) {
            const errorMsg = "Error al actualizar el estado de la práctica";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    return { actualizarEstado, loading, error, data };
}