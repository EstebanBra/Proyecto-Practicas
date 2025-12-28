import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import '@styles/form.css';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';

const Form = ({ title, fields, buttonText, onSubmit, footerContent, backgroundColor, persistKey }) => {
    let initialValues = {};
    if (persistKey) {
        const saved = sessionStorage.getItem(persistKey);
        if (saved) initialValues = JSON.parse(saved);
    }

    const { register, handleSubmit, formState: { errors }, getValues } = useForm({ defaultValues: initialValues });
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        if (!persistKey) return;
        const subscription = () => {
            const vals = getValues();
            sessionStorage.setItem(persistKey, JSON.stringify(vals));
        };
        const interval = setInterval(subscription, 500);
        return () => clearInterval(interval);
    }, [persistKey, getValues]);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);

    const onFormSubmit = (data) => {
        if (persistKey) sessionStorage.removeItem(persistKey);
        onSubmit(data);
    };

    // Esta función nos mostrará en consola si hay errores de validación
    const onError = (errors) => {
        console.log("El formulario tiene errores de validación y no se enviará:", errors);
    };

    // Función auxiliar para determinar el tipo de input (texto o password)
    const getInputType = (field) => {
        if (field.type === 'password' && field.name === 'password') {
            return showPassword ? 'text' : 'password';
        }
        if (field.type === 'password' && field.name === 'newPassword') {
            return showNewPassword ? 'text' : 'password';
        }
        return field.type || 'text';
    };

    return (
        <form
            className="form"
            style={{ backgroundColor: backgroundColor }}
            onSubmit={handleSubmit(onFormSubmit, onError)} 
            autoComplete="off"
        >
            <h1>{title}</h1>
            {fields.map((field, index) => (
                <div className="container_inputs" key={index}>
                    {field.label && <label htmlFor={field.name}>{field.label}</label>}
                    
                    {field.fieldType === 'input' && (
                        <input
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                minLength: field.minLength ? { value: field.minLength, message: `Mínimo ${field.minLength} caracteres` } : false,
                                maxLength: field.maxLength ? { value: field.maxLength, message: `Máximo ${field.maxLength} caracteres` } : false,
                                min: field.min ? { value: field.min, message: `El valor mínimo es ${field.min}` } : false,
                                max: field.max ? { value: field.max, message: `El valor máximo es ${field.max}` } : false,
                                pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                                validate: field.validate || {},
                            })}
                            name={field.name}
                            placeholder={field.placeholder}
                            type={getInputType(field)}
                            disabled={field.disabled}
                            min={field.min}
                            max={field.max}
                        />
                    )}

                    {field.fieldType === 'textarea' && (
                        <textarea
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                minLength: field.minLength ? { value: field.minLength, message: `Mínimo ${field.minLength} caracteres` } : false,
                                maxLength: field.maxLength ? { value: field.maxLength, message: `Máximo ${field.maxLength} caracteres` } : false,
                            })}
                            name={field.name}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                        />
                    )}

                    {field.fieldType === 'select' && (
                        <select
                            {...register(field.name, {
                                required: field.required ? 'Seleccione una opción' : false,
                            })}
                            name={field.name}
                            disabled={field.disabled}
                        >
                            <option value="">Seleccionar opción</option>
                            {field.options && field.options.map((option, optIndex) => (
                                <option key={optIndex} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Iconos de Password */}
                    {field.type === 'password' && field.name === 'password' && (
                        <span className="toggle-password-icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                            <img src={showPassword ? ViewIcon : HideIcon} alt="Toggle Password" />
                        </span>
                    )}
                    {field.type === 'password' && field.name === 'newPassword' && (
                        <span className="toggle-password-icon" onClick={toggleNewPasswordVisibility} style={{ cursor: 'pointer' }}>
                            <img src={showNewPassword ? ViewIcon : HideIcon} alt="Toggle New Password" />
                        </span>
                    )}

                    {/* Mensajes de Error */}
                    <div className={`error-message ${errors[field.name] ? 'visible' : ''}`} style={{color: 'red', fontSize: '0.8rem', minHeight: '1.2rem'}}>
                        {errors[field.name]?.message || ''}
                    </div>
                </div>
            ))}
            
            {buttonText && <button type="submit">{buttonText}</button>}
            {footerContent && <div className="footerContent">{footerContent}</div>}
        </form>
    );
};

export default Form;