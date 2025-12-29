import { useState } from 'react';
import { crearPractica }  from "@services/practica_f.service.js";

export function useCrearPractica() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const crear = async (practicaData) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await crearPractica(practicaData);

            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            } else {
                setData(result);
                return { success: true, data: result };
            }
        } catch (err) {
            const errorMsg = "Error al crear la práctica";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    return { crear, loading, error, data };
}