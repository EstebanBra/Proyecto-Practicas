import { useState, useCallback } from 'react';
import { bitacoraService, documentoService } from '../../services/bitacora.service.js';

export const useCreateBitacora = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const createBitacora = useCallback(async (bitacoraData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const { data, error: serviceError } = await bitacoraService.crearBitacora(bitacoraData);

            if (serviceError) {
                setError(serviceError);
                return { data: null, error: serviceError };
            }

            setSuccess(true);
            return { data, error: null };
        } catch (err) {
            const errorMessage = err.message || 'Error desconocido';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return { createBitacora, loading, error, success };
};

export const useBitacoras = (idPractica) => {
    const [bitacoras, setBitacoras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBitacoras = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: serviceError } = await bitacoraService.obtenerBitacoras(idPractica);

            if (serviceError) {
                setError(serviceError);
                return;
            }

            setBitacoras(data?.data || []);
        } catch (err) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [idPractica]);

    return { bitacoras, loading, error, fetchBitacoras };
};

export const useUltimaSemana = (idPractica) => {
    const [ultimaSemana, setUltimaSemana] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUltimaSemana = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: serviceError } = await bitacoraService.obtenerUltimaSemana(idPractica);

            if (serviceError) {
                setError(serviceError);
                return;
            }

            setUltimaSemana(data?.data?.ultimaSemana || 0);
        } catch (err) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [idPractica]);

    return { ultimaSemana, loading, error, fetchUltimaSemana };
};

export const useDocumentoBitacora = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const subirArchivo = useCallback(async (file) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: serviceError } = await documentoService.subirArchivo(file);

            if (serviceError) {
                setError(serviceError);
                return { data: null, error: serviceError };
            }

            return { data, error: null };
        } catch (err) {
            const errorMessage = err.message || 'Error desconocido';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const registrarDocumento = useCallback(async (documentoData) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: serviceError } = await documentoService.registrarDocumento(documentoData);

            if (serviceError) {
                setError(serviceError);
                return { data: null, error: serviceError };
            }

            return { data, error: null };
        } catch (err) {
            const errorMessage = err.message || 'Error desconocido';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        subirArchivo,
        registrarDocumento
    };
};

export const useDocumentos = (idPractica) => {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDocumentos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: serviceError } = await documentoService.obtenerDocumentos(idPractica);

            if (serviceError) {
                setError(serviceError);
                return;
            }

            setDocumentos(data?.data || []);
        } catch (err) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [idPractica]);

    return { documentos, loading, error, fetchDocumentos };
};

// Hook para buscar bitácoras por RUT (para docentes)
export const useBuscarPorRut = () => {
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buscarPorRut = useCallback(async (rut) => {
        try {
            setLoading(true);
            setError(null);
            setResultado(null);

            const { data, error: serviceError } = await bitacoraService.buscarPorRut(rut);

            if (serviceError) {
                setError(serviceError);
                return { data: null, error: serviceError };
            }

            setResultado(data?.data || null);
            return { data: data?.data, error: null };
        } catch (err) {
            const errorMessage = err.message || 'Error desconocido';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const limpiarBusqueda = useCallback(() => {
        setResultado(null);
        setError(null);
    }, []);

    return { resultado, loading, error, buscarPorRut, limpiarBusqueda };
};
