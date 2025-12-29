import { useState, useCallback } from "react";
import { getAllComentarios } from '@services/comentario.service.js';

export function useGetAllComentarios() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comentarios, setComentarios] = useState([]);

    const handleGetAllComentarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllComentarios();
            setComentarios(response?.data ?? []);
        }
        catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { handleGetAllComentarios, loading, error, comentarios };
}
