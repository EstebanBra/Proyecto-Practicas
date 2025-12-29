import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearPracticaExterna, obtenerMiPractica } from '@services/practica.service.js';
import FileUpload from '@components/FileUpload';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@helpers/sweetAlert.js';
import '@styles/practicaExterna.css';

const PracticaExterna = () => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [practicaActiva, setPracticaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        empresa: '',
        tipo_presencia: 'presencial',
        fecha_inicio: '',
        fecha_fin: '',
        semanas: '',
        supervisor_nombre: '',
        supervisor_email: '',
        supervisor_telefono: ''
    });
    
    // Estado para archivos
    const [archivos, setArchivos] = useState([]);
    const [fileError, setFileError] = useState('');

    // Verificación de seguridad y chequeo de práctica existente
    useEffect(() => {
        const checkAccess = async () => {
            const userStored = sessionStorage.getItem('usuario');
            
            if (!userStored) {
                navigate('/auth');
                return;
            }

            const user = JSON.parse(userStored);

            // Solo estudiantes pueden crear prácticas externas
            if (user.rol !== 'estudiante') {
                showErrorAlert('Acceso Restringido', 'Solo los estudiantes pueden registrar prácticas externas.');
                navigate('/home');
                return;
            }

            // Verificar si ya tiene una práctica activa o en progreso
            try {
                const response = await obtenerMiPractica();
                if (response.status === 'Success' && response.data) {
                    const estadosActivos = ['activa', 'en_progreso', 'pendiente_revision'];
                    if (estadosActivos.includes(response.data.estado)) {
                        setPracticaActiva(response.data);
                    }
                }
            } catch {
                console.log('No hay práctica activa');
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAccess();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddFile = (file) => {
        // Validar tipo de archivo
        const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Solo se permiten archivos PDF o Word (.doc, .docx)');
            return;
        }
        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFileError('El archivo no debe superar los 10MB');
            return;
        }
        setFileError('');
        setArchivos(prev => [...prev, file]);
    };

    const handleRemoveFile = (index) => {
        setArchivos(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!formData.empresa.trim()) {
            showErrorAlert('Error', 'El nombre de la empresa es obligatorio');
            return false;
        }
        if (!formData.fecha_inicio) {
            showErrorAlert('Error', 'La fecha de inicio es obligatoria');
            return false;
        }
        if (!formData.fecha_fin) {
            showErrorAlert('Error', 'La fecha de término es obligatoria');
            return false;
        }
        if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
            showErrorAlert('Error', 'La fecha de término debe ser posterior a la fecha de inicio');
            return false;
        }
        if (!formData.semanas || parseInt(formData.semanas) < 1) {
            showErrorAlert('Error', 'Las semanas de práctica deben ser al menos 1');
            return false;
        }
        if (!formData.supervisor_nombre.trim()) {
            showErrorAlert('Error', 'El nombre del supervisor es obligatorio');
            return false;
        }
        if (!formData.supervisor_email.trim()) {
            showErrorAlert('Error', 'El email del supervisor es obligatorio');
            return false;
        }
        if (!formData.supervisor_telefono.trim()) {
            showErrorAlert('Error', 'El teléfono del supervisor es obligatorio');
            return false;
        }
        if (archivos.length === 0) {
            showErrorAlert('Error', 'Debes adjuntar al menos un documento de respaldo');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Confirmar antes de crear
        const confirmed = await showConfirmAlert(
            '¿Registrar práctica externa?',
            'Al registrar una práctica externa, podrás comenzar a subir tus bitácoras inmediatamente. Esta acción no se puede deshacer.'
        );

        if (!confirmed) return;

        setSubmitting(true);

        const dataToSend = {
            ...formData,
            semanas: parseInt(formData.semanas),
            documentos: archivos.map(f => f.name) // Por ahora solo nombres, después implementar subida real
        };

        try {
            const response = await crearPracticaExterna(dataToSend);
            
            if (response.status === 'Success' || response.data) {
                showSuccessAlert('¡Práctica Registrada!', 'Tu práctica externa fue registrada exitosamente. Ya puedes comenzar a subir tus bitácoras.');
                // Redirigir a bitácoras
                setTimeout(() => {
                    navigate('/bitacoras');
                }, 2000);
            } else {
                showErrorAlert('Error', response.message || 'Error al registrar la práctica');
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            const msg = error?.response?.data?.message || error.message || 'Error de conexión';
            showErrorAlert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return (
            <div className="practica-externa-container loading">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!isAuthorized) return null;

    // Función para formatear fechas correctamente
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        try {
            // Si la fecha viene como string ISO, ajustar zona horaria
            const fechaObj = new Date(fecha);
            // Ajustar para evitar problemas de timezone
            const fechaLocal = new Date(fechaObj.getTime() + fechaObj.getTimezoneOffset() * 60000);
            return fechaLocal.toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Obtener clase y texto del estado
    const getEstadoInfo = (estado) => {
        const estados = {
            'activa': { clase: 'badge-activa', texto: 'Activa' },
            'en_progreso': { clase: 'badge-progreso', texto: 'En Progreso' },
            'pendiente_revision': { clase: 'badge-pendiente', texto: 'Pendiente de Revisión' },
            'finalizada': { clase: 'badge-finalizada', texto: 'Finalizada' },
            'cancelada': { clase: 'badge-cancelada', texto: 'Cancelada' }
        };
        return estados[estado] || { clase: 'badge-default', texto: estado };
    };

    // Si ya tiene una práctica activa
    if (practicaActiva) {
        const estadoInfo = getEstadoInfo(practicaActiva.estado);
        
        return (
            <div className="practica-externa-container">
                <div className="practica-activa-card">
                    <div className="icon-warning">⚠️</div>
                    <h2>Ya tienes una práctica registrada</h2>
                    <div className="practica-info">
                        <p><strong>Empresa:</strong> {practicaActiva.empresa || 'No especificada'}</p>
                        <p><strong>Estado:</strong> <span className={`badge ${estadoInfo.clase}`}>{estadoInfo.texto}</span></p>
                        <p><strong>Fecha inicio:</strong> {formatearFecha(practicaActiva.fecha_inicio)}</p>
                        <p><strong>Fecha fin:</strong> {formatearFecha(practicaActiva.fecha_fin)}</p>
                        {practicaActiva.semanas && (
                            <p><strong>Semanas:</strong> {practicaActiva.semanas}</p>
                        )}
                        {practicaActiva.tipo_presencia && (
                            <p><strong>Modalidad:</strong> {practicaActiva.tipo_presencia}</p>
                        )}
                    </div>
                    <p className="info-text">
                        Debes finalizar tu práctica actual antes de poder registrar una nueva.
                    </p>
                    <div className="action-buttons">
                        <button onClick={() => navigate('/bitacoras')} className="btn-primary">
                            Ir a mis Bitácoras
                        </button>
                        <button onClick={() => navigate('/documentos-finales')} className="btn-secondary">
                            Documentos Finales
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="practica-externa-container">
            <div className="practica-intro">
                <h1>📋 Registrar Práctica Externa</h1>
                <p className="subtitle">
                    Si ya conseguiste una práctica profesional por tu cuenta, regístrala aquí para comenzar a documentar tu experiencia.
                </p>
                <div className="info-box">
                    <span className="info-icon">ℹ️</span>
                    <p>
                        Al registrar tu práctica, se activará automáticamente y podrás comenzar a subir tus bitácoras inmediatamente.
                        <strong> Adjunta el documento con los datos de horas y requisitos de tu práctica.</strong>
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="practica-form">
                <h2>Datos de la Práctica</h2>

                <div className="form-section">
                    <h3>📍 Información de la Empresa</h3>
                    
                    <div className="form-group">
                        <label htmlFor="empresa">Nombre de la Empresa *</label>
                        <input
                            type="text"
                            id="empresa"
                            name="empresa"
                            value={formData.empresa}
                            onChange={handleInputChange}
                            placeholder="Ej: Empresa ABC S.A."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tipo_presencia">Modalidad *</label>
                        <select
                            id="tipo_presencia"
                            name="tipo_presencia"
                            value={formData.tipo_presencia}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="presencial">Presencial</option>
                            <option value="virtual">Virtual / Remoto</option>
                            <option value="hibrido">Híbrido</option>
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h3>📅 Período de Práctica</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
                            <input
                                type="date"
                                id="fecha_inicio"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_fin">Fecha de Término *</label>
                            <input
                                type="date"
                                id="fecha_fin"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={handleInputChange}
                                min={today}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="semanas">Semanas de Práctica *</label>
                        <input
                            type="number"
                            id="semanas"
                            name="semanas"
                            value={formData.semanas}
                            onChange={handleInputChange}
                            placeholder="Número de semanas"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>👤 Datos del Supervisor</h3>
                    
                    <div className="form-group">
                        <label htmlFor="supervisor_nombre">Nombre del Supervisor *</label>
                        <input
                            type="text"
                            id="supervisor_nombre"
                            name="supervisor_nombre"
                            value={formData.supervisor_nombre}
                            onChange={handleInputChange}
                            placeholder="Nombre completo del supervisor"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="supervisor_email">Email del Supervisor *</label>
                            <input
                                type="email"
                                id="supervisor_email"
                                name="supervisor_email"
                                value={formData.supervisor_email}
                                onChange={handleInputChange}
                                placeholder="correo@empresa.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="supervisor_telefono">Teléfono del Supervisor *</label>
                            <input
                                type="tel"
                                id="supervisor_telefono"
                                name="supervisor_telefono"
                                value={formData.supervisor_telefono}
                                onChange={handleInputChange}
                                placeholder="+56 9 1234 5678"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>📎 Documentación de Respaldo</h3>
                    <p className="section-description">
                        Adjunta el documento que acredite tu práctica (carta de aceptación, contrato, etc.) 
                        con la información de horas y requisitos.
                    </p>
                    
                    <FileUpload
                        files={archivos}
                        onAddFile={handleAddFile}
                        onRemoveFile={handleRemoveFile}
                        error={fileError}
                        label="Arrastra o selecciona tu documento"
                    />
                    
                    {archivos.length > 0 && (
                        <div className="archivos-lista">
                            {archivos.map((archivo, index) => (
                                <div key={index} className="archivo-item">
                                    <span className="archivo-icon">📄</span>
                                    <span className="archivo-nombre">{archivo.name}</span>
                                    <span className="archivo-size">
                                        ({(archivo.size / 1024).toFixed(1)} KB)
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveFile(index)}
                                        className="btn-remove-file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={submitting}
                >
                    {submitting ? 'Registrando...' : 'Registrar Práctica'}
                </button>
            </form>
        </div>
    );
};

export default PracticaExterna;
