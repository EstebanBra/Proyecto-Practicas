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
            if (response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Comentario actualizado exitosamente',
                    timer: 2000
                });
            }else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al actualizar el comentario',  
                    timer: 2000
                });
            }
            setComentario(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { handleUpdateComentario, loading, error, comentario };
}
