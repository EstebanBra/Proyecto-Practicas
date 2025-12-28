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
        <main className="container">
            <Form
                title="Registrar Practica Externa"
                fields={[
                    {
                        label: "Empresa",
                        name: "empresa",
                        placeholder: "Nombre de la Empresa",
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
                            { value: "Presencial", label: "Presencial" },
                            { value: "Virtual", label: "Virtual" },
                            { value: "Hibrido", label: "Hibrido" }
                        ],
                        required: true
                    },
                    {
                        label: "Fecha de inicio",
                        name: "fecha_inicio",
                        fieldType: 'input',
                        type: "date",
                        required: true
                    },
                    {
                        label: "Nombre de Supervisor/a",
                        name: "supervisor_nombre",
                        placeholder: "Nombre Completo",
                        fieldType: 'input',
                        type: "text",
                        required: true,
                        minLength: 3,
                        maxLength: 255
                    },
                    {
                        label: "Email de Supervisor/a",
                        name: "supervisor_email",
                        placeholder: "correo@empresa.com",
                        fieldType: 'input',
                        type: "email",
                        required: true
                    },
                    {
                        label: "Telefono de Supervisor/a",
                        name: "supervisor_telefono",
                        placeholder: "+56 9 1234 5678",
                        fieldType: 'input',
                        type: "text",
                        required: true,
                        pattern: /^\+?[\d\s-]{8,20}$/,
                        patternMessage: "numero valido requerido"
                    },
                    {
                        label: "Fecha de termino",
                        name: "fecha_fin",
                        fieldType: 'input',
                        type: "date",
                        required: true
                    },
                    {
                        label: "Horas de Practica",
                        name: "horas_practicas",
                        placeholder: "Horas minimas 199",
                        fieldType: 'input',
                        type: "number",
                        required: true,
                        min: 1
                    },
                    {
                        label: "Semanas",
                        name: "semanas",
                        placeholder: "Duracion estimada",
                        fieldType: 'input',
                        type: "number",
                        required: true,
                        min: 1
                    },
                    {
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
                buttonText="Registrar Practica"
                onSubmit={handleSubmit}
            />
        </main>
    );
};

export default CrearPractica;