import { useState } from "react";
import { updateComentario } from '@services/comentario.service.js';
import Swal from 'sweetalert2';

export function useUpdateComentario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comentario, setComentario] = useState(null);

    const handleUpdateComentario = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateComentario(id, data);
            // El backend devuelve { status: "Success", message, data }
            if (response.status === 'Success') {
                setComentario(response.data);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: response.message || 'Comentario actualizado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });
                return response;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al actualizar el comentario',
                    timer: 3000
                });
                return null;
            }
        } catch (error) {
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al actualizar el comentario',
                timer: 3000
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { handleUpdateComentario, loading, error, comentario };
}
