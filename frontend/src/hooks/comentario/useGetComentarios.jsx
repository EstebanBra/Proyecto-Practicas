import { useState, useCallback } from "react";
import { getComentarios } from "@services/comentario.service.js";

export function useGetComentarios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comentarios, setComentarios] = useState([]);

  const handleGetComentarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getComentarios();
      setComentarios(response?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { handleGetComentarios, loading, error, comentarios };
}
