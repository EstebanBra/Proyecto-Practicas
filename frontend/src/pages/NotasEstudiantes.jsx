import React, { useState, useMemo, useCallback } from 'react';
import { useNotasEstudiantes } from '@hooks/notafinales/useNotasEstudiantes.jsx';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/notasDocente.css';
import useGetDocumentos from '@hooks/documentos/useGetDocumentos';
import { exportarNotasFinalesExcelService }
    from '@services/notaFinal.servicef.js';
import Swal from "sweetalert2";


const DocenteNotas = () => {
    const {
        estudiantes,
        filtroActual,
        loading,
        error,
        calculando,
        calcularNotaEstudiante,
        reload
    } = useNotasEstudiantes();

    const { documentos } = useGetDocumentos();
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [estudianteExpandido] = useState(null);

    const estudiantesConNotasReales = useMemo(() => {
        if (!Array.isArray(estudiantes) || !Array.isArray(documentos)) return [];

        return estudiantes.map(est => {
            const practicaIdReal =
                est.practica_id ??
                documentos.find(d => Number(d.id_usuario) === Number(est.id_estudiante))
                    ?.id_practica;

            const docs = documentos.filter(
                d => Number(d.id_practica) === Number(practicaIdReal)
            );

            const informeDoc = docs.find(d => d.tipo === 'informe');
            const autoDoc = docs.find(d => d.tipo === 'autoevaluacion');

            return {
                ...est,
                practica_id: practicaIdReal,
                nota_informe: informeDoc?.nota_revision ?? null,
                nota_autoevaluacion: autoDoc?.nota_revision ?? null,
                _docInforme: informeDoc,
                _docAutoevaluacion: autoDoc,
            };
        });

    }, [estudiantes, documentos]);

    const estudiantesFiltrados = useMemo(() => {
        if (!estudiantesConNotasReales || !Array.isArray(estudiantesConNotasReales)) return [];

        return estudiantesConNotasReales.filter(est => {
            if (!filtroBusqueda.trim()) return true;

            const busqueda = filtroBusqueda.toLowerCase();
            const nombre = (est.estudiante?.nombre_completo ||
                est.estudiante?.nombre ||
                est.estudiante?.email ||
                '').toLowerCase();
            const rut = est.estudiante?.rut?.toLowerCase() || '';
            const email = est.estudiante?.email?.toLowerCase() || '';

            return nombre.includes(busqueda) ||
                rut.includes(busqueda) ||
                email.includes(busqueda) ||
                est.practica_id?.toString().includes(busqueda);
        });
    }, [estudiantesConNotasReales, filtroBusqueda]);

    const tieneDocumentosCalificados = useCallback((estudiante) => {
        const informe = estudiante.nota_informe != null;
        const autoevaluacion = estudiante.nota_autoevaluacion != null;

        return {
            tiene: informe && autoevaluacion,
            informe: informe ? estudiante.nota_informe : null,
            autoevaluacion: autoevaluacion ? estudiante.nota_autoevaluacion : null
        };
    }, []);

    const handleCalcularNota = useCallback(async (idPractica, nombreEstudiante) => {

        // Confirmación previa
        const confirmacion = await Swal.fire({
            title: 'Calcular nota final',
            html: `¿Calcular nota final para <strong>${nombreEstudiante}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, calcular',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        // Ejecutar cálculo
        const result = await calcularNotaEstudiante(idPractica, nombreEstudiante);

        // Si el usuario canceló dentro del proceso
        if (result?.cancelled) {
            return;
        }

        // Determinar éxito aún si viene success:false pero mensaje indica que sí
        const fueExitoso =
            result?.success ||
            result?.message?.toLowerCase()?.includes('exitosamente') ||
            result?.message?.toLowerCase()?.includes('calculada');

        if (fueExitoso) {
            showSuccessAlert(
                'Éxito',
                `Nota calculada exitosamente para ${nombreEstudiante}`
            );

            // Pequeño delay para que el backend termine de persistir
            setTimeout(() => {
                reload();
            }, 500);

        } else {
            showErrorAlert(
                'Error al calcular',
                result?.message || 'No fue posible calcular la nota'
            );
        }

    }, [calcularNotaEstudiante, reload]);

    const handleDescargarExcel = async () => {
        const result = await exportarNotasFinalesExcelService();

        if (!result.success) {z
            return showErrorAlert('Error', result.message);
        }

        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', 'notas-finales.xlsx');

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        showSuccessAlert('Descarga lista', 'Archivo generado correctamente');
    };

    if (loading) {
        return (
            <div className="notas-docente-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando estudiantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notas-docente-container">
            <div className="notas-docente-content">
                <div className="notas-header">
                    <h1 className="notas-title">Gestión de Notas</h1>
                    <div className="notas-controls">
                        <input
                            type="text"
                            className="filtro-input"
                            placeholder="Buscar estudiante..."
                            value={filtroBusqueda}
                            onChange={(e) => setFiltroBusqueda(e.target.value)}
                        />
                        <button
                            onClick={handleDescargarExcel}
                            className="btn-exportar-excel"
                        >
                            Descargar Excel
                        </button>
                        <button onClick={reload} className="btn-refresh">
                            Actualizar
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                {!loading && estudiantesFiltrados.length === 0 ? (
                    <div className="no-estudiantes">
                        <h3>No hay estudiantes</h3>
                        <p>No se encontraron estudiantes {filtroActual === 'listos' ? 'listos para calificar' :
                            filtroActual === 'pendientes' ? 'con documentos pendientes' :
                                'asignados'}.</p>
                    </div>
                ) : (
                    <div className="tabla-estudiantes">
                        <table className="estudiantes-table">
                            <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>RUT</th>
                                <th>Documentos</th>
                                <th>Nota Final</th>
                            </tr>
                            </thead>
                            <tbody>
                            {estudiantesFiltrados.map((estudiante) => {
                                const docsInfo = tieneDocumentosCalificados(estudiante);
                                const tieneNota = estudiante.nota_final != null;
                                const puedeCalcular = docsInfo.tiene && !tieneNota;
                                const estaExpandido = estudianteExpandido === estudiante.id_estudiante;

                                const nombreEstudiante = estudiante.estudiante?.nombre_completo ||
                                    estudiante.estudiante?.nombre ||
                                    estudiante.estudiante?.email ||
                                    'Estudiante';

                                return (
                                    <React.Fragment key={`${estudiante.id_estudiante}-${estudiante.practica_id}`}>
                                        <tr className="estudiante-row">
                                            <td className="estudiante-cell">
                                                <div className="estudiante-info">
                                                    <strong>{nombreEstudiante}</strong>
                                                    <small>{estudiante.estudiante?.email || ''}</small>
                                                </div>
                                            </td>
                                            <td>{estudiante.estudiante?.rut || 'N/A'}</td>
                                            <td className="documentos-cell">
                                                <div className="documentos-estado">
                                                    <span className={`doc-badge ${docsInfo.informe ? 'completo' : 'incompleto'}`}>
                                                        Informe: {docsInfo.informe ? parseFloat(docsInfo.informe).toFixed(1) : '✗'}
                                                    </span>
                                                    <span className={`doc-badge ${docsInfo.autoevaluacion ? 'completo' : 'incompleto'}`}>
                                                        Autoevaluación: {docsInfo.autoevaluacion ? parseFloat(docsInfo.autoevaluacion).toFixed(1) : '✗'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                 <span className="practica-info">
                                                     <small>
                                                           {estudiante.nota_practica != null
                                                                     ? `Nota práctica: ${parseFloat(estudiante.nota_practica).toFixed(1)}`
                                                             : 'Sin nota de práctica'}
                                                     </small>
                                                 </span>
                                            </td>

                                            <td className="acciones-cell">
                                                <div className="acciones-buttons">
                                                    {puedeCalcular && (
                                                        <button
                                                            className="btn-calcular"
                                                            onClick={() => handleCalcularNota(estudiante.practica_id, nombreEstudiante)}
                                                            disabled={calculando[estudiante.id_estudiante]}
                                                        >
                                                            {calculando[estudiante.id_estudiante] ? 'Calculando...' : 'Calcular'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {estaExpandido && (
                                            <tr className="detalles-row">
                                                <td colSpan="6">
                                                    <div className="detalles-estudiante">
                                                        <h4>Detalles de {nombreEstudiante}</h4>

                                                        <div className="detalles-grid">
                                                            <div className="detalle-info">
                                                                <h5>📊 Estado de documentos:</h5>
                                                                {docsInfo.tiene ? (
                                                                    <div className="documentos-calificados">
                                                                        <p>✅ <strong>Informe:</strong> {parseFloat(docsInfo.informe).toFixed(1)} (70% del total)</p>
                                                                        <p>✅ <strong>Autoevaluación:</strong> {parseFloat(docsInfo.autoevaluacion).toFixed(1)} (30% del total)</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="documentos-pendientes">
                                                                        <p>Faltan documentos por calificar:</p>
                                                                        <ul>
                                                                            {!docsInfo.informe && (
                                                                                <li>
                                                                                    ✗ Informe no calificado
                                                                                </li>
                                                                            )}
                                                                            {!docsInfo.autoevaluacion && (
                                                                                <li>
                                                                                    ✗ Autoevaluación no calificada
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {tieneNota && (
                                                                <div className="detalle-info">
                                                                    <h5>📈 Información de nota:</h5>
                                                                    <div className="desglose-nota">
                                                                        <p><strong>Nota Final:</strong> {parseFloat(estudiante.nota_final).toFixed(1)}</p>
                                                                        <p><strong>Cálculo:</strong> ({parseFloat(docsInfo.informe).toFixed(1)} × 0.7) + ({parseFloat(docsInfo.autoevaluacion).toFixed(1)} × 0.3) = {parseFloat(estudiante.nota_final).toFixed(1)}</p>
                                                                        <p><strong>Fecha cálculo:</strong> {estudiante.fecha_calculo ?
                                                                            new Date(estudiante.fecha_calculo).toLocaleDateString() : 'N/A'}</p>
                                                                        <p><strong>Estado:</strong>
                                                                            <span className={`estado-badge ${estudiante.nota_final >= 4 ? 'aprobado' : 'reprobado'}`}>
                                                                                {estudiante.nota_final >= 4 ? 'Aprobado' : 'Reprobado'}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocenteNotas;
