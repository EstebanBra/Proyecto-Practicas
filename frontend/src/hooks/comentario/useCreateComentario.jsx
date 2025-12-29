import { useState } from "react";
import { createComentario } from '@services/comentario.service.js';
import Swal from 'sweetalert2';

export function useCreateComentario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateComentario = async (dataComentario) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createComentario(dataComentario);
            // El backend devuelve { status: "Success", message, data }
            if (response.status === 'Success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: response.message || 'Comentario creado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });
                return response;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al crear el comentario',
                    timer: 3000
                });
                return null;
            }
        } catch (error) {
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al crear el comentario',
                timer: 3000
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { handleCreateComentario, loading, error };
}


