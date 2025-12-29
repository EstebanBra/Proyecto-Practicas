import {useNavigate} from "react-router-dom";
import Form from '@components/Form';
import '@styles/form.css';
import {showErrorAlert, showSuccessAlert} from '@helpers/sweetAlert.js';
import {useState} from 'react';
import instance from '@services/root.service.js';

const CrearPractica = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);

    const handleSubmit = async (data) => {
        try {
            const formData = new FormData();
            
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            files.forEach((file) => {
                formData.append('documentos', file);
            });

            const response = await instance.post('/practicas/crear', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'Success') {
                showSuccessAlert('Éxito', 'Práctica creada sin problemas');
                navigate('/home');
            } else {
                showErrorAlert('Error', response.data.message || 'Error al crear la práctica');
            }
        } catch (error) {
            console.error('Error: ', error);
            showErrorAlert('Error', error.response?.data?.message || 'Error al crear la práctica');
        }
    };

    const handleFileChange = (e) => {
        let selectedFiles = [];
        if (e.target.files instanceof FileList) {
            selectedFiles = Array.from(e.target.files);
        } else if (Array.isArray(e.target.files)) {
            selectedFiles = e.target.files;
        }
        setFiles(selectedFiles);
    };

   return (
        <main className="container-practica">
            <div className="form-wrapper-practica">
                <h1 className="form-title-practica">Postulación de Práctica Profesional Externa</h1>
                <p className="form-subtitle-practica">Complete todos los campos requeridos para registrar su práctica profesional</p>
                
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
                            patternMessage: "numero valido requerido"
                        },
                        {
                            subsection: "Documentos Requeridos",
                            label: "Documentos Requeridos",
                            name: "documentos",
                            fieldType: 'filedrop',
                            required: true,
                            onChange: handleFileChange,
                            accept: ".pdf,.doc,.docx",
                            fullWidth: true,
                            files: files
                        }
                    ]}
                    buttonText="Registrar Práctica"
                    onSubmit={handleSubmit}
                />
            </div>
        </main>
    );
};

export default CrearPractica;