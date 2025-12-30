import { useState, useMemo, useCallback } from 'react';
import { useNotasEstudiantes } from '@hooks/notafinales/useNotasEstudiantes.jsx';
import useGetDocumentos from '@hooks/documentos/useGetDocumentos.jsx';
import '@styles/notasDocente.css';

const NotasEstudiantes = () => {
    const { notas, loading, error, reload } = useNotasEstudiantes();
    const { documentos } = useGetDocumentos();
    const [filtro, setFiltro] = useState('');
    const [orden, setOrden] = useState('desc');
    const [estudianteExpandido, setEstudianteExpandido] = useState(null);

    const notasFiltradas = useMemo(() => {
        return notas
            .filter(nota => {
                const nombre = nota.estudiante?.nombre?.toLowerCase() || '';
                const rut = nota.estudiante?.rut?.toLowerCase() || '';
                const searchTerm = filtro.toLowerCase();

                return nombre.includes(searchTerm) ||
                    rut.includes(searchTerm) ||
                    nota.practica_id?.toString().includes(searchTerm);
            })
            .sort((a, b) => {
                if (orden === 'asc') {
                    return (a.nota_final || 0) - (b.nota_final || 0);
                }
                return (b.nota_final || 0) - (a.nota_final || 0);
            });
    }, [notas, filtro, orden]);

    const estadisticas = useMemo(() => {
        if (notasFiltradas.length === 0) return null;

        const notasValores = notasFiltradas
            .map(n => parseFloat(n.nota_final) || 0)
            .filter(n => !isNaN(n));

        if (notasValores.length === 0) return null;

        const promedio = notasValores.reduce((a, b) => a + b, 0) / notasValores.length;
        const maxima = Math.max(...notasValores);
        const minima = Math.min(...notasValores);

        return { promedio, maxima, minima };
    }, [notasFiltradas]);

    const toggleExpandirEstudiante = useCallback((estudianteId) => {
        setEstudianteExpandido(prev => prev === estudianteId ? null : estudianteId);
    }, []);

    const getDocumentosEstudiante = useCallback((estudianteId) => {
        if (!estudianteId) return [];
        return documentos.filter(doc => doc.estudiante_id === estudianteId);
    }, [documentos]);

    if (loading) {
        return (
            <div className="notas-docente-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando notas de estudiantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notas-docente-container">
            <div className="notas-docente-content">
                <div className="notas-header">
                    <h1 className="notas-title">Notas de Estudiantes</h1>
                    <div className="notas-controls">
                        <input
                            type="text"
                            className="filtro-input"
                            placeholder="Buscar por nombre, RUT o ID práctica..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        <select
                            className="orden-select"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                        >
                            <option value="desc">Nota: Mayor a menor</option>
                            <option value="asc">Nota: Menor a mayor</option>
                        </select>
                        <button
                            onClick={reload}
                            className="btn-refresh"
                        >
                            Actualizar
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                {estadisticas && (
                    <div className="estadisticas">
                        <div className="estadistica-item">
                            <span className="estadistica-label">Promedio:</span>
                            <span className="estadistica-valor">{estadisticas.promedio.toFixed(1)}</span>
                        </div>
                        <div className="estadistica-item">
                            <span className="estadistica-label">Nota Máxima:</span>
                            <span className="estadistica-valor nota-alta">{estadisticas.maxima.toFixed(1)}</span>
                        </div>
                        <div className="estadistica-item">
                            <span className="estadistica-label">Nota Mínima:</span>
                            <span className="estadistica-valor nota-baja">{estadisticas.minima.toFixed(1)}</span>
                        </div>
                        <div className="estadistica-item">
                            <span className="estadistica-label">Total Estudiantes:</span>
                            <span className="estadistica-valor">{notasFiltradas.length}</span>
                        </div>
                    </div>
                )}

                {notasFiltradas.length === 0 ? (
                    <div className="no-notas">
                        <h3>No hay notas registradas</h3>
                        <p>No se encontraron notas para los estudiantes asignados.</p>
                    </div>
                ) : (
                    <div className="tabla-notas">
                        <table className="notas-table">
                            <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>RUT</th>
                                <th>ID Práctica</th>
                                <th>Nota Final</th>
                                <th>Prom. Bitácoras</th>
                                <th>Nota Informe</th>
                                <th>Nota Autoevaluación</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Documentos</th>
                            </tr>
                            </thead>
                            <tbody>
                            {notasFiltradas.map((nota) => {
                                const documentosEst = getDocumentosEstudiante(nota.estudiante?.id);
                                const estaExpandido = estudianteExpandido === nota.estudiante?.id;
                                const notaFinal = parseFloat(nota.nota_final) || 0;
                                const promedioBitacoras = parseFloat(nota.promedio_bitacoras) || 0;
                                const notaInforme = parseFloat(nota.nota_informe) || 0;
                                const notaAutoevaluacion = parseFloat(nota.nota_autoevaluacion) || 0;

                                return (
                                    <tbody key={nota.id}>
                                    <tr className="nota-row">
                                        <td className="estudiante-cell">
                                            <div className="estudiante-info">
                                                <strong>{nota.estudiante?.nombre || 'N/A'}</strong>
                                                <small>{nota.estudiante?.email || ''}</small>
                                            </div>
                                        </td>
                                        <td>{nota.estudiante?.rut || 'N/A'}</td>
                                        <td>{nota.practica_id}</td>
                                        <td className="nota-final-cell">
                                                    <span className={`nota-badge ${notaFinal >= 4 ? 'aprobado' : 'reprobado'}`}>
                                                        {notaFinal.toFixed(1)}
                                                    </span>
                                        </td>
                                        <td>{promedioBitacoras.toFixed(1)}</td>
                                        <td>{notaInforme.toFixed(1)}</td>
                                        <td>{notaAutoevaluacion.toFixed(1)}</td>
                                        <td>
                                                    <span className={`estado-badge ${nota.estado || 'desconocido'}`}>
                                                        {nota.estado || 'N/A'}
                                                    </span>
                                        </td>
                                        <td>
                                            {nota.fecha_calculo ?
                                                new Date(nota.fecha_calculo).toLocaleDateString() :
                                                'N/A'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-ver-documentos"
                                                onClick={() => toggleExpandirEstudiante(nota.estudiante?.id)}
                                            >
                                                {estaExpandido ? 'Ocultar' : 'Ver'} ({documentosEst.length})
                                            </button>
                                        </td>
                                    </tr>

                                    {/* SIEMPRE MOSTRAR LA FILA DE DOCUMENTOS CUANDO SE EXPANDE */}
                                    {estaExpandido && (
                                        <tr className="documentos-row">
                                            <td colSpan="10">
                                                <div className="documentos-detalle">
                                                    <h4>📚 Documentos de {nota.estudiante?.nombre}:</h4>
                                                    {documentosEst.length > 0 ? (
                                                        <div className="documentos-list">
                                                            <table className="documentos-detalle-table">
                                                                <thead>
                                                                <tr>
                                                                    <th>Nombre</th>
                                                                    <th>Tipo</th>
                                                                    <th>Fecha</th>
                                                                    <th>Estado</th>
                                                                    <th>Nota</th>
                                                                    <th>Comentarios</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {documentosEst.map((doc, index) => (
                                                                    <tr key={`${doc.id || index}-${nota.id}`}>
                                                                        <td>{doc.nombre || 'Sin nombre'}</td>
                                                                        <td>
                                                                                        <span className={`tipo-documento tipo-${doc.tipo || 'otro'}`}>
                                                                                            {doc.tipo === 'informe' ? '📄 Informe' :
                                                                                                doc.tipo === 'autoevaluacion' ? '📝 Autoevaluación' :
                                                                                                    doc.tipo === 'bitacora' ? '📓 Bitácora' :
                                                                                                        '📎 ' + (doc.tipo || 'Otro')}
                                                                                        </span>
                                                                        </td>
                                                                        <td>
                                                                            {doc.fecha_subida
                                                                                ? new Date(doc.fecha_subida).toLocaleDateString()
                                                                                : 'N/A'
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                                        <span className={`estado-documento ${doc.estado || 'pendiente'}`}>
                                                                                            {doc.estado === 'revisado' ? '✅ Revisado' :
                                                                                                doc.estado === 'pendiente' ? '⏳ Pendiente' :
                                                                                                    doc.estado === 'aprobado' ? '✅ Aprobado' :
                                                                                                        doc.estado === 'rechazado' ? '❌ Rechazado' :
                                                                                                            doc.estado || 'Pendiente'}
                                                                                        </span>
                                                                        </td>
                                                                        <td className="nota-revision-cell">
                                                                            {doc.nota_revision != null ? (
                                                                                <span className={`nota-revision ${doc.nota_revision >= 4 ? 'aprobado' : 'reprobado'}`}>
                                                                                                {parseFloat(doc.nota_revision).toFixed(1)}
                                                                                            </span>
                                                                            ) : doc.estado === 'revisado' ? (
                                                                                <span className="sin-nota">Sin calificar</span>
                                                                            ) : (
                                                                                <span className="no-revisado">No revisado</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="comentarios-cell">
                                                                            {doc.comentario || 'Sin comentarios'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="no-documentos-estudiante">
                                                            <p>Este estudiante no tiene documentos registrados.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="exportar-section">
                    <button className="btn-exportar">
                        Exportar a Excel
                    </button>
                    <button className="btn-exportar">
                        Generar Reporte PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotasEstudiantes;