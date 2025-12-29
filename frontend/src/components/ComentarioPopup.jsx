import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FileUpload from './FileUpload';
import '@styles/popup.css';
import CloseIcon from '@assets/XIcon.svg';

export default function ComentarioPopup({ show, setShow, data, action, mode = 'create' }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: data ? data[0] : {}
    });
    
    const [selectedFiles, setSelectedFiles] = useState([]);

    const onSubmit = (formData) => {
        action({
            ...formData,
            archivos: selectedFiles
        });
        setSelectedFiles([]);
        reset();
    };

    const handleClose = () => {
        setShow(false);
        setSelectedFiles([]);
        reset();
    };

    return (
        <div>
            {show && (
                <div className="bg">
                    <div className="popup comentario-popup">
                        <button className='close' onClick={handleClose}>
                            <img src={CloseIcon} />
                        </button>
                        
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <h1>{mode === 'create' ? 'Crear Comentario' : 'Editar Comentario'}</h1>
                            
                            <div className="form-group">
                                <label htmlFor="mensaje">Mensaje *</label>
                                <textarea
                                    id="mensaje"
                                    placeholder="Escribe tu comentario aquí..."
                                    {...register('mensaje', {
                                        required: 'El mensaje es obligatorio',
                                        minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                                        maxLength: { value: 500, message: 'Máximo 500 caracteres' }
                                    })}
                                    rows="5"
                                />
                                {errors.mensaje && <span className="error">{errors.mensaje.message}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nivelUrgencia">Nivel de Urgencia *</label>
                                    <select
                                        id="nivelUrgencia"
                                        {...register('nivelUrgencia', { required: 'Selecciona un nivel' })}
                                        defaultValue={data?.[0]?.nivelUrgencia || 'normal'}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="normal">Normal</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                    {errors.nivelUrgencia && <span className="error">{errors.nivelUrgencia.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tipoProblema">Tipo de Problema *</label>
                                    <select
                                        id="tipoProblema"
                                        {...register('tipoProblema', { required: 'Selecciona un tipo' })}
                                        defaultValue={data?.[0]?.tipoProblema || 'General'}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Personal">Personal</option>
                                        <option value="General">General</option>
                                        <option value="De Empresa">De Empresa</option>
                                    </select>
                                    {errors.tipoProblema && <span className="error">{errors.tipoProblema.message}</span>}
                                </div>
                            </div>

                            {mode === 'edit' && (
                                <div className="form-group">
                                    <label htmlFor="estado">Estado</label>
                                    <select
                                        id="estado"
                                        {...register('estado')}
                                        defaultValue={data?.[0]?.estado || 'Pendiente'}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Abierto">Abierto</option>
                                        <option value="Respondido">Respondido</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Adjuntar archivos (Opcional)</label>
                                <FileUpload 
                                    onFilesSelected={setSelectedFiles}
                                    maxFiles={5}
                                />
                            </div>

                            <button type="submit" className="btn-submit">
                                {mode === 'create' ? 'Crear Comentario' : 'Actualizar Comentario'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
