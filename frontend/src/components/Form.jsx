import { useForm } from 'react-hook-form';
import { useState } from 'react';
import '@styles/form.css';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';

const Form = ({ title, fields, buttonText, onSubmit, footerContent, backgroundColor }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <form
            className="form"
            style={{ backgroundColor: backgroundColor }}
            onSubmit={handleSubmit(onFormSubmit)}
            autoComplete="off"
        >
            <h1>{title}</h1>
            {fields.map((field, index) => (
                <div className="container_inputs" key={index}>
                    {field.label && <label htmlFor={field.name}>{field.label}</label>}
                    {(() => {
                        const registerField = register(field.name, {
                            required: field.required ? 'Este campo es obligatorio' : false,
                            minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                            maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                            pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                            validate: field.validate || {},
                        });

                        const handleChange = (e) => {
                            registerField.onChange(e); // mantiene react-hook-form
                            if (field.onChange) field.onChange(e); // notifica a quien pasó onChange
                        };

                        if (field.fieldType === 'input') {
                            return (
                                <input
                                    {...registerField}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    type={field.type === 'password' && field.name === 'password' ? (showPassword ? 'text' : 'password') :
                                        field.type === 'password' && field.name === 'newPassword' ? (showNewPassword ? 'text' : 'password') :
                                        field.type}
                                    defaultValue={field.defaultValue || ''}
                                    disabled={field.disabled}
                                    onChange={handleChange}
                                />
                            );
                        }

                        if (field.fieldType === 'textarea') {
                            return (
                                <textarea
                                    {...registerField}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    defaultValue={field.defaultValue || ''}
                                    disabled={field.disabled}
                                    onChange={handleChange}
                                />
                            );
                        }

                        if (field.fieldType === 'select') {
                            return (
                                <select
                                    {...registerField}
                                    name={field.name}
                                    defaultValue={field.defaultValue || ''}
                                    disabled={field.disabled}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar opción</option>
                                    {field.options && field.options.map((option, optIndex) => (
                                        <option className="options-class" key={optIndex} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            );
                        }

                        return null;
                    })()}
                    {field.type === 'password' && field.name === 'password' && (
                        <span className="toggle-password-icon" onClick={togglePasswordVisibility}>
                            <img src={showPassword ? ViewIcon : HideIcon} />
                        </span>
                    )}
                    {field.type === 'password' && field.name === 'newPassword' && (
                        <span className="toggle-password-icon" onClick={toggleNewPasswordVisibility}>
                            <img src={showNewPassword ? ViewIcon : HideIcon} />
                        </span>
                    )}
                    <div className={`error-message ${errors[field.name] || field.errorMessageData ? 'visible' : ''}`}>
                        {errors[field.name]?.message || field.errorMessageData || ''}
                    </div>
                </div>
            ))}
            {buttonText && <button type="submit">{buttonText}</button>}
            {footerContent && <div className="footerContent">{footerContent}</div>}
        </form>
    );
};

export default Form;