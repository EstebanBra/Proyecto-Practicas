import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aceptarPostulante, rechazarPostulante, getOfertas, deleteOferta, updateOferta, postularOferta, getPostulantes } from '@services/ofertaPractica.service.js';
import OfertaCard from '@components/OfertaCard';
import Form from '@components/Form';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import Swal from 'sweetalert2';
import '@styles/offers.css';

const OfertasPublicas = () => {
    const navigate = useNavigate();
    const [ofertas, setOfertas] = useState([]);
    const [ofertaAEditar, setOfertaAEditar] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    // --- ESTADO PARA PAGINACIÓN  ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Mostraremos 6 ofertas por página

    useEffect(() => {
        const fetchOfertas = async () => {
            const response = await getOfertas();
            if (response.status === 'Success' || Array.isArray(response.data)) {
                setOfertas(response.data || []);
            } else {
                showErrorAlert('Error', 'No se pudieron cargar las ofertas.');
            }
        };

        const userStored = sessionStorage.getItem('usuario');
        if (userStored) {
            setCurrentUser(JSON.parse(userStored));
        }

        fetchOfertas();
    }, []);

    // --- LÓGICA DE PAGINACIÓN ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOfertas = ofertas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(ofertas.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // --- LÓGICA: VER POSTULANTES (Solo Docente) ---
const handleVerPostulantes = async (ofertaId) => {
    Swal.fire({ title: 'Cargando postulantes...', didOpen: () => Swal.showLoading() });
    
    const response = await getPostulantes(ofertaId);
    
    if (response.status === 'Success' && response.data) {
        const alumnos = response.data;
        if (alumnos.length === 0) {
            Swal.fire('Info', 'Aún no hay postulantes para esta oferta.', 'info');
            return;
        }

        // Función para obtener el estilo del estado
        const getEstadoBadge = (estado) => {
            switch (estado) {
                case 'pendiente':
                    return '<span style="background:#ffc107;color:#212529;padding:3px 8px;border-radius:12px;font-size:0.8rem;">⏳ Pendiente</span>';
                case 'aceptado':
                    return '<span style="background:#28a745;color:white;padding:3px 8px;border-radius:12px;font-size:0.8rem;">✅ Aceptado</span>';
                case 'rechazado':
                    return '<span style="background:#dc3545;color:white;padding:3px 8px;border-radius:12px;font-size:0.8rem;">❌ Rechazado</span>';
                default:
                    return `<span style="background:#6c757d;color:white;padding:3px 8px;border-radius:12px;font-size:0.8rem;">${estado}</span>`;
            }
        };

        // Generamos la tabla HTML
        let htmlTable = `
            <div style="overflow-x: auto;">
                <table style="width:100%; text-align:left; border-collapse: collapse; font-family: sans-serif;">
                    <thead>
                        <tr style="background:#f8f9fa; border-bottom:2px solid #dee2e6; color: #495057;">
                            <th style="padding:12px 15px;">Nombre</th>
                            <th style="padding:12px 15px;">RUT</th>
                            <th style="padding:12px 15px;">Estado</th>
                            <th style="padding:12px 15px;">Acciones</th> 
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        alumnos.forEach(alumno => {
            const botonesAccion = alumno.estado === 'pendiente' 
                ? `
                    <button 
                        id="btn-aceptar-${alumno.idPostulacion}"
                        class="swal-btn-aceptar"
                        style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;"
                    >
                        ✔ Aceptar
                    </button>
                    <button 
                        id="btn-rechazar-${alumno.idPostulacion}"
                        class="swal-btn-rechazar"
                        style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;"
                    >
                        ✖ Rechazar
                    </button>
                `
                : '<span style="color: #6c757d; font-style: italic;">Ya procesado</span>';

            htmlTable += `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:12px 15px;">${alumno.nombreCompleto}</td>
                    <td style="padding:12px 15px;">${alumno.rut}</td>
                    <td style="padding:12px 15px;">${getEstadoBadge(alumno.estado)}</td>
                    <td style="padding:12px 15px;">
                        ${botonesAccion}
                    </td>
                </tr>
            `;
        });

        htmlTable += `</tbody></table></div>`;

        Swal.fire({
            title: `Postulantes (${alumnos.length})`,
            html: htmlTable,
            width: '900px',
            showConfirmButton: true,
            confirmButtonText: 'Cerrar',
            didOpen: () => {
                alumnos.forEach(alumno => {
                    if (alumno.estado === 'pendiente') {
                        const btnAceptar = document.getElementById(`btn-aceptar-${alumno.idPostulacion}`);
                        const btnRechazar = document.getElementById(`btn-rechazar-${alumno.idPostulacion}`);
                        
                        if (btnAceptar) {
                            btnAceptar.onclick = () => confirmarAceptacion(ofertaId, alumno);
                        }
                        if (btnRechazar) {
                            btnRechazar.onclick = () => confirmarRechazo(ofertaId, alumno);
                        }
                    }
                });
            }
        });
    } else {
        showErrorAlert('Error', 'No se pudo cargar la lista.');
    }
};

// Función auxiliar para manejar el click en "Aceptar"
const confirmarAceptacion = async (ofertaId, alumno) => {
    const result = await Swal.fire({
        title: `¿Aceptar a ${alumno.nombreCompleto}?`,
        text: "Esto iniciará su práctica oficialmente y podrá subir bitácoras.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, aceptar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
        
        const resp = await aceptarPostulante(ofertaId, alumno.id, alumno.idPostulacion);
        
        if (resp.status === 'Success' || resp.data) {
            await Swal.fire('¡Éxito!', 'El estudiante ha sido aceptado correctamente.', 'success');
            handleVerPostulantes(ofertaId); 
        } else {
            Swal.fire('Error', resp.message || 'No se pudo aceptar al estudiante', 'error');
        }
    }
};

// Función auxiliar para manejar el click en "Rechazar"
const confirmarRechazo = async (ofertaId, alumno) => {
    const result = await Swal.fire({
        title: `¿Rechazar a ${alumno.nombreCompleto}?`,
        text: "Esta acción rechazará la postulación del estudiante.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, rechazar',
        confirmButtonColor: '#dc3545',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
        
        const resp = await rechazarPostulante(ofertaId, alumno.id, alumno.idPostulacion);
        
        if (resp.status === 'Success' || resp.data) {
            await Swal.fire('Completado', 'La postulación ha sido rechazada.', 'info');
            handleVerPostulantes(ofertaId); 
        } else {
            Swal.fire('Error', resp.message || 'No se pudo rechazar al estudiante', 'error');
        }
    }
};

    const handleDelete = async (id) => {
        const result = await deleteDataAlert();
        if (result.isConfirmed) {
            try {
                const response = await deleteOferta(id);
                if (response.status === 'Success' || response.data) {
                    showSuccessAlert('Eliminado', 'Oferta eliminada.');
                    setOfertas(prev => prev.filter(offer => offer.id !== id));
                } else {
                    showErrorAlert('Error', response.message);
                }
            } catch {
                showErrorAlert('Error', 'Error al eliminar.');
            }
        }
    };

    const handleEditClick = (oferta) => {
        sessionStorage.setItem('ofertaEditable', JSON.stringify(oferta));
        setOfertaAEditar(oferta);
    };

    const handleUpdateSubmit = async (data) => {
        const dataFormatted = {
            ...data,
            duracion: Number(data.duracion),
            cupos: Number(data.cupos)
        };

        try {
            const response = await updateOferta(ofertaAEditar.id, dataFormatted);
            if (response.status === 'Success' || response.data) {
                showSuccessAlert('Actualizado', 'Oferta actualizada.');
                setOfertas(prev => prev.map(of => (of.id === ofertaAEditar.id ? { ...of, ...dataFormatted } : of)));
                setOfertaAEditar(null);
                sessionStorage.removeItem('ofertaEditable');
            } else {
                showErrorAlert('Error', response.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al actualizar.';
            showErrorAlert('Error', msg);
        }
    };

    const handlePostular = async (id) => {
        const result = await Swal.fire({
            title: "¿Deseas postular?",
            text: "Se enviará un correo al profesor encargado.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, postular",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Enviando postulación...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                const response = await postularOferta(id);
                
                if (response.status === 'Success' || response.data) {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Postulado!',
                        text: 'Tu postulación ha sido enviada exitosamente. Serás redirigido a tus postulaciones.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    navigate('/mis-postulaciones');
                } else {
                    showErrorAlert('Error', response.message || 'No se pudo postular.');
                }
            } catch{
                showErrorAlert('Error', 'Falló el envío de la postulación.');
            }
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const fieldsEditing = [
        { label: 'Título', name: 'titulo', fieldType: 'input', type: 'text', required: true, minLength: 10, maxLength: 255 },
        { label: 'Descripción', name: 'descripcion_cargo', fieldType: 'textarea', required: true, minLength: 10, maxLength: 1000 },
        { label: 'Requisitos', name: 'requisitos', fieldType: 'textarea', required: true, minLength: 10, maxLength: 1000 },
        { label: 'Duración (semanas)', name: 'duracion', fieldType: 'input', type: 'number', required: true, min: 1, max: 52 },
        { label: 'Modalidad', name: 'modalidad', fieldType: 'select', options: [ { value: 'presencial', label: 'Presencial' }, { value: 'online', label: 'Online' } ], required: true },
        { label: 'Jornada', name: 'jornada', fieldType: 'input', type: 'text', required: true, maxLength: 50 },
        { label: 'Ubicación', name: 'ubicacion', fieldType: 'input', type: 'text', required: true, maxLength: 100 },
        { label: 'Cupos', name: 'cupos', fieldType: 'input', type: 'number', required: true, min: 1, max: 100 },
        { label: 'Fecha Límite', name: 'fecha_limite', fieldType: 'input', type: 'date', required: true, min: today },
    ];

    const canManage = currentUser && (currentUser.rol === 'administrador' || currentUser.rol === 'docente');
    const canApply = currentUser && currentUser.rol === 'estudiante';

    return (
        <div className="ofertas-container">
            {ofertaAEditar ? (
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                    <button 
                        onClick={() => { setOfertaAEditar(null); sessionStorage.removeItem('ofertaEditable'); }}
                        style={{ marginBottom: '15px', padding: '8px 12px', cursor: 'pointer' }}
                    >
                        ← Cancelar Edición
                    </button>
                    <Form
                        title="Editar Oferta"
                        fields={fieldsEditing}
                        onSubmit={handleUpdateSubmit}
                        buttonText="Guardar Cambios"
                        backgroundColor="#fff"
                        persistKey="ofertaEditable"
                    />
                </div>
            ) : (
                <>
                    <h1>Ofertas de Práctica Disponibles</h1>
                    <div className="ofertas-list">
                        {currentOfertas.map((oferta) => (
                            <div key={oferta.id} style={{position: 'relative'}}>
                                <OfertaCard
                                    oferta={oferta}
                                    canManage={canManage}
                                    canApply={canApply}
                                    onDelete={() => handleDelete(oferta.id)}
                                    onEdit={() => handleEditClick(oferta)}
                                    onApply={() => handlePostular(oferta.id)}
                                />
                                {/* BOTÓN EXTRA: VER POSTULANTES */}
                                {currentUser && (
                                        currentUser.rol === 'administrador' || 
                                        (currentUser.rol === 'docente' && currentUser.email === oferta.encargado?.email)
                                    ) && (
                                        <button 
                                            onClick={() => handleVerPostulantes(oferta.id)}
                                            style={{ 
                                                width: '100%', marginTop: '5px', padding: '8px', 
                                                backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' 
                                            }}
                                        >
                                            👥 Ver Postulantes
                                        </button>
                                    )}
                            </div>
                        ))}
                    </div>

                    {/* CONTROLES DE PAGINACIÓN */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', paddingBottom: '20px' }}>
                            <button onClick={prevPage} disabled={currentPage === 1} style={{padding: '10px 20px', cursor: 'pointer'}}>
                                &laquo; Anterior
                            </button>
                            <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                                Página {currentPage} de {totalPages}
                            </span>
                            <button onClick={nextPage} disabled={currentPage === totalPages} style={{padding: '10px 20px', cursor: 'pointer'}}>
                                Siguiente &raquo;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OfertasPublicas;