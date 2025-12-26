import { useState, useEffect } from 'react';
import { getOfertas, deleteOferta, updateOferta, postularOferta } from '@services/ofertaPractica.service.js';
import OfertaCard from '@components/OfertaCard';
import Form from '@components/Form';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import Swal from 'sweetalert2';
import '@styles/offers.css';

const OfertasPublicas = () => {
    const [ofertas, setOfertas] = useState([]);
    const [ofertaAEditar, setOfertaAEditar] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

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

    // --- LÓGICA DE GESTIÓN (Admin/Docente) ---
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
            titulo: data.titulo,
            descripcion_cargo: data.descripcion_cargo,
            requisitos: data.requisitos,
            duracion: Number(data.duracion),
            modalidad: data.modalidad,
            jornada: data.jornada,
            ubicacion: data.ubicacion,
            cupos: Number(data.cupos),
            fecha_limite: data.fecha_limite
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

    // --- LÓGICA DE POSTULACIÓN (Estudiante) ---
    const handlePostular = async (id) => {
        const result = await Swal.fire({
            title: "¿Deseas postular?",
            text: "Se enviará un correo al profesor encargado con tus datos.",
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
                    showSuccessAlert('¡Postulado!', 'Tu postulación ha sido enviada exitosamente.');

                    // Buscamos la oferta en la lista local y le restamos 1 a los cupos
                    setOfertas(prevOfertas => prevOfertas.map(oferta => {
                        if (oferta.id === id) {
                            return { ...oferta, cupos: oferta.cupos - 1 };
                        }
                        return oferta;
                    }));

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
                        {ofertas.map((oferta) => (
                            <OfertaCard
                                key={oferta.id}
                                oferta={oferta}
                                canManage={canManage}
                                canApply={canApply}
                                onDelete={() => handleDelete(oferta.id)}
                                onEdit={() => handleEditClick(oferta)}
                                onApply={() => handlePostular(oferta.id)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default OfertasPublicas;