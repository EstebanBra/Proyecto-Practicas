"use strict";

import { useNavigate } from "react-router-dom";
import Form from '@components/Form';
import '@styles/form.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { useCrearPractica } from '@hooks/useCrearPractica.jsx';

const CrearPractica = () => {
    const navigate = useNavigate();
    const { crear, loading, error } = useCrearPractica();

    const handleSubmit = async (data) => {
        try {
            // Normalizar tipo_presencia según el backend
            const datosNormalizados = {
                ...data,
                // Asegurar que tipo_presencia esté en minúsculas
                tipo_presencia: data.tipo_presencia.toLowerCase(),
                tipo_practica: "propia" // Siempre será "propia" para esta página
            };

            const result = await crear(datosNormalizados);

            if (result.success) {
                showSuccessAlert('Éxito', 'Práctica creada exitosamente');
                navigate('/home'); // O a la página de mis prácticas
            } else {
                showErrorAlert('Error', result.error || 'Error al crear la práctica');
            }
        } catch (error) {
            console.error('Error inesperado: ', error);
            showErrorAlert('Error', 'Ocurrió un error inesperado al crear la práctica');
        }
    };

    // No necesitas manejar archivos aquí porque en el backend de prácticas
    // no se suben documentos al crear la práctica (eso se hace en documentos_finales)

    return (
        <main className="container-practica">
            <div className="form-wrapper-practica">
                <h1 className="form-title-practica">Postulación de Práctica Profesional Externa</h1>
                <p className="form-subtitle-practica">Complete todos los campos requeridos para registrar su práctica profesional</p>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <Form
                    title=""
                    fields={[
                        {
                            section: "Información de la Práctica",
                            sectionDescription: "Complete el formulario con los datos de su práctica profesional externa",
                            subsection: "Información de la Empresa",
                            label: "Nombre de la Empresa",
                            name: "empresa",
                            placeholder: "Ingrese el nombre de la empresa",
                            fieldType: 'input',
                            type: "text",
                            required: true,
                            minLength: 3,
                            maxLength: 255
                        },
                        {
                            label: "Tipo de Presencia",
                            name: "tipo_presencia",
                            fieldType: 'select',
                            options: [
                                { value: "", label: "Seleccione el tipo de presencia" },
                                { value: "Presencial", label: "Presencial" },
                                { value: "Virtual", label: "Virtual" },
                                { value: "Hibrido", label: "Hibrido" }
                            ],
                            required: true
                        },
                        {
                            subsection: "Periodo de Práctica",
                            label: "Fecha de Inicio",
                            name: "fecha_inicio",
                            placeholder: "dd - mm - aaaa",
                            fieldType: 'input',
                            type: "date",
                            required: true
                        },
                        {
                            label: "Fecha de Término",
                            name: "fecha_fin",
                            placeholder: "dd - mm - aaaa",
                            fieldType: 'input',
                            type: "date",
                            required: true
                        },
                        {
                            label: "Horas de Práctica",
                            name: "horas_practicas",
                            placeholder: "Ej: 480",
                            fieldType: 'input',
                            type: "number",
                            required: true,
                            min: 1
                        },
                        {
                            label: "Semanas",
                            name: "semanas",
                            placeholder: "Ej: 12",
                            fieldType: 'input',
                            type: "number",
                            required: true,
                            min: 1
                        },
                        {
                            subsection: "Información del Supervisor",
                            label: "Nombre del Supervisor/a",
                            name: "supervisor_nombre",
                            placeholder: "Nombre completo del supervisor",
                            fieldType: 'input',
                            type: "text",
                            required: true,
                            minLength: 3,
                            maxLength: 255,
                            fullWidth: true
                        },
                        {
                            label: "Email del Supervisor/a",
                            name: "supervisor_email",
                            placeholder: "supervisor@empresa.com",
                            fieldType: 'input',
                            type: "email",
                            required: true
                        },
                        {
                            label: "Teléfono del Supervisor/a",
                            name: "supervisor_telefono",
                            placeholder: "+56 9 1234 5678",
                            fieldType: 'input',
                            type: "text",
                            required: true,
                            pattern: /^\+?[\d\s-]{8,20}$/,
                            patternMessage: "Número válido requerido"
                        }
                        // NOTA: Se eliminó el campo de documentos ya que en el backend
                        // de prácticas no se suben archivos al crear la práctica.
                        // Los documentos se suben en la sección de documentos_finales
                        // cuando la práctica está en estado "Finalizada"
                    ]}
                    buttonText={loading ? "Creando..." : "Registrar Práctica"}
                    onSubmit={handleSubmit}
                    disabled={loading}
                />
            </div>
        </main>
    );
};

export default CrearPractica;