import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service.js';
import Form from "@components/Form";
import useRegister from '@hooks/auth/useRegister.jsx';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/form.css';

const Register = () => {
	const navigate = useNavigate();
	const {
        errorEmail,
        errorRut,
        errorData,
        handleInputChange
    } = useRegister();

    const registerSubmit = async (data) => {
        try {
            const response = await register(data);
            if (response.status === 'Success') {
                showSuccessAlert('¡Registrado!', 'Usuario registrado exitosamente.');
                setTimeout(() => {
                    navigate('/auth');
                }, 3000)
            } else if (response.status === 'Client error') {
                errorData(response.details);
            }
        } catch (error) {
            console.error("Error al registrar un usuario: ", error);
            showErrorAlert('Cancelado', 'Ocurrió un error al registrarse.');
        }
    }

    //cepta 1.111.111-1 hasta 999.999.999-K (Mucho más robusta)
    const patternRut = new RegExp(/^\d{1,3}\.\d{3}\.\d{3}-[\dkK]$/);

	return (
		<main className="container">
			<Form
				title="Crea tu cuenta"
				fields={[
					{
						label: "Nombre completo",
						name: "nombreCompleto",
						placeholder: "Juan Pérez López",
                        fieldType: 'input',
						type: "text",
						required: true,
						minLength: 5,
						maxLength: 100,
					},
                    {
                        label: "Correo electrónico",
                        name: "email",
                        placeholder: "correo@ejemplo.com",
                        fieldType: 'input',
                        type: "email",
                        required: true,
                        minLength: 5,
                        maxLength: 100,
                        errorMessageData: errorEmail,
                        onChange: (e) => handleInputChange('email', e.target.value)
                    },
                    {
						label: "Rut",
                        name: "rut",
                        placeholder: "12345678-9",
                        fieldType: 'input',
                        type: "text",
						minLength: 7,
						maxLength: 20,
						required: true,
                        errorMessageData: errorRut,
                        onChange: (e) => handleInputChange('rut', e.target.value)
                    },
                    {
                        label: "Rol",
                        name: "rol",
                        fieldType: 'select',
                        options: [
                            { value: 'estudiante', label: 'Estudiante' },
                            { value: 'docente', label: 'Docente (Evaluador)' }
                        ],
                        required: true,
                    },
                    {
                        label: "Contraseña",
                        name: "password",
                        placeholder: "**********",
                        fieldType: 'input',
                        type: "password",
                        required: true,
                        minLength: 6,
                        maxLength: 100,
                    },
				]}
				buttonText="Registrarse"
				onSubmit={registerSubmit}
				footerContent={
					<p>
						¿Ya tienes cuenta?, <a href="/auth">¡Inicia sesión aquí!</a>
					</p>
				}
			/>
		</main>
	);
};

export default Register;