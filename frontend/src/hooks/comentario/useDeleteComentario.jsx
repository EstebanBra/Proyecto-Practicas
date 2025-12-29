import { useState } from "react";
import { deleteComentario } from '@services/comentario.service.js';
import Swal from 'sweetalert2';

export function useDeleteComentario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDeleteComentario = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteComentario(id);
            
            // Alerta de Éxito
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El comentario ha sido eliminado.',
                timer: 1500,
                showConfirmButton: false
            });
            return true; // Éxito
        } catch (error) {
            setError(error);
            // Alerta de Error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el comentario.',
            });
            return false; // Fallo
        } finally {
            setLoading(false);
        }
    };

    return { handleDeleteComentario, loading, error };
}