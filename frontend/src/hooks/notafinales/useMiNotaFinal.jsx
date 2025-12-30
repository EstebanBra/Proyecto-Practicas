import { useState, useEffect, useCallback } from 'react';
import { obtenerMiNotaFinal as serviceObtenerMiNotaFinal } from '@services/notaFinal.servicef.js';
import useGetDocumentos from '../documentos/useGetDocumentos.jsx';

export function useMiNotaFinal() {
    const [nota, setNota] = useState(null);
    const [loadingNota, setLoadingNota] = useState(true);
    const [errorNota, setErrorNota] = useState(null);

    // Usar el hook existente de documentos
    const {
        documentos,
        loading: loadingDocumentos,
        error: errorDocumentos,
        fetchDocumentos
    } = useGetDocumentos();

    const fetchMiNota = useCallback(async () => {
        setLoadingNota(true);
        setErrorNota(null);

        try {
            const result = await serviceObtenerMiNotaFinal();

            if (result.success) {
                setNota(result.data);
            } else {
                // Si no hay nota, no es error, solo no hay datos
                if (result.message.includes("No se encontró") ||
                    result.message.includes("No tienes")) {
                    setNota(null);
                } else {
                    setErrorNota(result.message);
                    setNota(null);
                }
            }
        } catch (err) {
            console.error("Error al cargar nota:", err);
            setErrorNota("Error al cargar la nota");
            setNota(null);
        } finally {
            setLoadingNota(false);
        }
    }, []);

    const reloadAll = useCallback(async () => {
        await Promise.all([fetchMiNota(), fetchDocumentos()]);
    }, [fetchMiNota, fetchDocumentos]);

    useEffect(() => {
        fetchMiNota();
    }, [fetchMiNota]);

    // Determinar si hay documentos de nota (informe/autoevaluacion)
    const documentosNota = documentos?.filter(doc =>
        doc.tipo === 'informe' || doc.tipo === 'autoevaluacion'
    ) || [];

    return {
        // Datos
        nota,
        documentos: documentosNota,
        todosDocumentos: documentos,

        // Estados combinados
        loading: loadingNota || loadingDocumentos,
        error: errorNota || errorDocumentos,

        // Métodos
        fetchMiNota,
        fetchDocumentos,
        reloadAll,

        // Estados individuales
        loadingNota,
        loadingDocumentos,
        errorNota,
        errorDocumentos,

        // Helpers
        tieneNota: !!nota,
        puedeCalcular: !nota && documentosNota.length >= 2
    };
}
