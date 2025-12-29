import { useState } from 'react';
import { getComentario } from '@services/comentarioService';

export function useGetComentario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comentario, setComentario] = useState(null);

    const handleGetComentario = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getComentario(id);
            setComentario(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { handleGetComentario, loading, error, comentario };
}
