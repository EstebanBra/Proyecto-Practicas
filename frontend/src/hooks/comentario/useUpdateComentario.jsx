import { useState } from "react";
import { updateComentario } from '@services/comentario.service.js';

export function useUpdateComentario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comentario, setComentario] = useState(null);

    const handleUpdateComentario = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateComentario(id, data);
            setComentario(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { handleUpdateComentario, loading, error, comentario };
}
