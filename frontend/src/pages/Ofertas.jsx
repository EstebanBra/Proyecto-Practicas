import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para redirigir
import { createOferta } from '@services/ofertaPractica.service.js';
import Form from '@components/Form';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/offers.css';

const Ofertas = () => {
    const navigate = useNavigate();
    const [formKey, setFormKey] = useState(0);
    const [isAuthorized, setIsAuthorized] = useState(false); // Estado para saber si mostramos el form

    //  VERIFICACIÓN DE SEGURIDAD AL CARGAR
    useEffect(() => {
        const userStored = sessionStorage.getItem('usuario');
        
        if (!userStored) {
            navigate('/auth'); // Si no hay usuario, mandar al login
            return;
        }

        const user = JSON.parse(userStored);

        // Si es estudiante, NO debe estar aquí
        if (user.rol === 'estudiante') {
            showErrorAlert('Acceso Restringido', 'Los estudiantes no tienen permiso para crear ofertas.');
            navigate('/ofertas-publicas'); // Lo redirigimos a la página correcta
        } else {
            // Si es docente o admin, permitimos el acceso
            setIsAuthorized(true);
        }
    }, [navigate]);

    const handleCreate = async (data) => {
        console.log('Datos brutos del form:', data); 

        const dataFormatted = {
            ...data,
            duracion: Number(data.duracion),
            cupos: Number(data.cupos)
        };

        try {
            const response = await createOferta(dataFormatted);
            if (response.status === 'Success' || response.data) {
                showSuccessAlert('Creada', 'Oferta creada exitosamente');
                sessionStorage.removeItem('ofertaForm'); 
                setFormKey(prev => prev + 1); 
            } else {
                showErrorAlert('Error', response.message || 'Error desconocido');
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            const msg = error?.response?.data?.message || error.message || 'Error de conexión';
            showErrorAlert('Error', msg);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    // Si no está autorizado, no mostramos nada (para evitar parpadeos antes de redirigir)
    if (!isAuthorized) return null;

    return (
        <div className="ofertas-form">
            <Form
                key={formKey}
                title="Crear Nueva Oferta de Práctica"
                fields={[
                    { label: 'Título', name: 'titulo', fieldType: 'input', type: 'text', required: true, minLength: 10, maxLength: 255 },
                    { label: 'Descripción', name: 'descripcion_cargo', fieldType: 'textarea', required: true, minLength: 10, maxLength: 1000 },
                    { label: 'Requisitos', name: 'requisitos', fieldType: 'textarea', required: true, minLength: 10, maxLength: 1000 },
                    { label: 'Duración (semanas)', name: 'duracion', fieldType: 'input', type: 'number', required: true, min: 1, max: 52 },
                    { label: 'Modalidad', name: 'modalidad', fieldType: 'select', options: [ { value: 'presencial', label: 'Presencial' }, { value: 'online', label: 'Online' } ], required: true },
                    { label: 'Jornada', name: 'jornada', fieldType: 'input', type: 'text', required: true, maxLength: 50 },
                    { label: 'Ubicación', name: 'ubicacion', fieldType: 'input', type: 'text', required: true, maxLength: 100 },
                    { label: 'Cupos', name: 'cupos', fieldType: 'input', type: 'number', required: true, min: 1, max: 100 },
                    { label: 'Fecha Límite', name: 'fecha_limite', fieldType: 'input', type: 'date', required: true, min: today },
                ]}
                onSubmit={handleCreate}
                buttonText="Publicar Oferta"
                persistKey="ofertaForm"
                backgroundColor="#fff"
            />
        </div>
    );
};

export default Ofertas;