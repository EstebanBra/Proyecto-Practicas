import { useState } from "react";
import { deleteComentario } from '@services/comentario.service.js';

export function useDeleteComentario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleDeleteComentario = async (id) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await deleteComentario(id);
            setSuccess(true);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        success,
        handleDeleteComentario,
    };
}