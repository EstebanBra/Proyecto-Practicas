import { useState } from 'react';

const useGetPractica = () => {
    const [practica, setPractica] = useState(null);
    const [loading, setLoading] = useState(false);

    const datosPractica = {
        id_practica: 1,
        id_estudiante: 3,
        id_docente: 2,
        fecha_inicio: "2024-03-01",
        fecha_fin: "2024-06-30",
        horas_practicas: 480,
        semanas: 16,
        tipo_presencia: "presencial",
        tipo_practica: "publicada",
        empresa: "Empresa Tecnológica S.A.",
        supervisor_nombre: "Juan Pérez González",
        supervisor_email: "jperez@empresa.com",
        supervisor_telefono: "+56 9 1234 5678",
        documentos: [
        ],
        estado: "Finalizada",
        observaciones: "Práctica completada satisfactoriamente",
        nota_practica: 6.5,
        estudiante: {
            nombreCompleto: "El Estudiante",
            rut: "20.630.735-8",
            email: "usuario2.2024@gmail.cl"
        },
        docente: {
            nombreCompleto: "El Evaluador",
            rut: "21.151.897-9",
            email: "usuario1.2024@gmail.cl"
        }
    };

    const fetchPractica = async () => {
        setLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 300));
            setPractica(datosPractica);
            return datosPractica;
        } catch (error) {
            console.error("Error:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Si necesitas inicializar automáticamente al usar el hook:
    // useEffect(() => {
    //     fetchPractica();
    // }, []);

    return {
        practica,
        loading,
        fetchPractica,
        setPractica
    };
};

export default useGetPractica;
