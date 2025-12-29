import { useState } from 'react';
import { actualizarPractica }  from "@services/practica_f.service.js";

export function useActualizarPractica() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const actualizar = async (id, datosActualizacion) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await actualizarPractica(id, datosActualizacion);

            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            } else {
                setData(result);
                return { success: true, data: result };
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            const errorMsg = "Error al actualizar la práctica";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    return { actualizar, loading, error, data };
}