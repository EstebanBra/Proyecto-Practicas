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
            const practicaData = {
                ...data,
                documentos: files.map(file => ({
                    nombre: file.name,
                    url: file.url,
                    tipo: 'carta_aceptacion'
                }))
            };

            const response = await instance.post('/practicas/crear', practicaData);

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
        const selectedFiles = Array.from(e.target.files);
        const newFiles = selectedFiles.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            type: 'carta_aceptacion'
        }));
        setFiles(newFiles);
    };

   return (
        <main className="container">
            <Form
                title="Registrar Práctica"
                fields={[
                    {
                        label: "empresa",
                        name: "empresa",
                        placeholder: "nombre de la empresa",
                        fieldType: 'input',
                        type: "text",
                        required: true,
                        minLength: 3,
                        maxLength: 255
                    },
                    {
                        label: "tipo practica",
                        name: "tipo_practica",
                        fieldType: 'select',
                        options: [
                            { value: "propia", label: "propia" },
                            { value: "publicada", label: "publicada" }
                        ],
                        required: true
                    },
                    {
                        label: "tipo presencia",
                        name: "tipo_presencia",
                        fieldType: 'select',
                        options: [
                            { value: "presencial", label: "presencial" },
                            { value: "virtual", label: "virtual" },
                            { value: "hibrido", label: "hibrido" }
                        ],
                        required: true
                    },
                    {
                        label: "fecha inicio",
                        name: "fecha_inicio",
                        fieldType: 'input',
                        type: "date",
                        required: true
                    },
                    {
                        label: "nombre supervisor",
                        name: "supervisor_nombre",
                        placeholder: "nombre completo",
                        fieldType: 'input',
                        type: "text",
                        required: true,
                        minLength: 3,
                        maxLength: 255
                    },
                    {
                        label: "email supervisor",
                        name: "supervisor_email",
                        placeholder: "correo@empresa.com",
                        fieldType: 'input',
                        type: "email",
                        required: true
                    },
                    {
                        label: "telefono supervisor",
                        name: "supervisor_telefono",
                        placeholder: "+56912345678",
                        fieldType: 'input',
                        type: "text",
                        required: true,
                        pattern: /^\+?[\d\s-]{8,20}$/,
                        patternMessage: "numero valido requerido"
                    },
                    {
                        label: "fecha termino",
                        name: "fecha_fin",
                        fieldType: 'input',
                        type: "date",
                        required: true
                    },
                    {
                        label: "horas practica",
                        name: "horas_practicas",
                        placeholder: "360",
                        fieldType: 'input',
                        type: "number",
                        required: true,
                        min: 1
                    },
                    {
                        label: "semanas",
                        name: "semanas",
                        placeholder: "12",
                        fieldType: 'input',
                        type: "number",
                        required: true,
                        min: 1
                    },
                    {
                        label: "documentos requeridos",
                        name: "documentos",
                        fieldType: 'filedrop',
                        required: true,
                        onChange: handleFileChange,
                        accept: ".pdf,.doc,.docx",
                        fullWidth: true,
                        files: files
                    }
                ]}
                buttonText="registrar practica"
                onSubmit={handleSubmit}
            />
        </main>
    );
};

export default CrearPractica;