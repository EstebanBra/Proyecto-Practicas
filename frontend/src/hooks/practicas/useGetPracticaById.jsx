import { useState } from 'react';

const useGetPracticaById = () => {
    const [practicasCache, setPracticasCache] = useState({});
    const [loading, setLoading] = useState(false);

    // Datos de ejemplo para múltiples prácticas
    const datosPracticasEjemplo = {
        1: {
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
            estado: "Finalizada",
            observaciones: "Práctica completada satisfactoriamente",
            nota_practica: 6.5,
            estudiante: {
                nombreCompleto: "El Estudiante 1",
                rut: "20.630.735-8",
                email: "estudiante1@gmail.cl"
            },
            docente: {
                nombreCompleto: "El Evaluador",
                rut: "21.151.897-9",
                email: "usuario1.2024@gmail.cl"
            }
        },
        2: {
            id_practica: 2,
            id_estudiante: 4,
            id_docente: 2,
            fecha_inicio: "2024-04-01",
            fecha_fin: "2024-07-31",
            horas_practicas: 360,
            semanas: 12,
            tipo_presencia: "virtual",
            tipo_practica: "propia",
            empresa: "Startup Innovadora Ltda.",
            supervisor_nombre: "María García López",
            supervisor_email: "mgarcia@startup.com",
            supervisor_telefono: "+56 9 8765 4321",
            estado: "En_Curso",
            observaciones: "Práctica en progreso",
            nota_practica: null,
            estudiante: {
                nombreCompleto: "El Estudiante 2",
                rut: "19.456.123-5",
                email: "estudiante2@gmail.cl"
            },
            docente: {
                nombreCompleto: "El Evaluador",
                rut: "21.151.897-9",
                email: "usuario1.2024@gmail.cl"
            }
        },
        3: {
            id_practica: 3,
            id_estudiante: 5,
            id_docente: 2,
            fecha_inicio: "2024-05-01",
            fecha_fin: "2024-08-31",
            horas_practicas: 240,
            semanas: 8,
            tipo_presencia: "hibrido",
            tipo_practica: "publicada",
            empresa: "Corporación Nacional S.A.",
            supervisor_nombre: "Carlos Rodríguez Méndez",
            supervisor_email: "crodriguez@corporacion.com",
            supervisor_telefono: "+56 9 5555 6666",
            estado: "Aprobada",
            observaciones: "Práctica aprobada pendiente de evaluación",
            nota_practica: null,
            estudiante: {
                nombreCompleto: "El Estudiante 3",
                rut: "18.789.456-2",
                email: "estudiante3@gmail.cl"
            },
            docente: {
                nombreCompleto: "El Evaluador",
                rut: "21.151.897-9",
                email: "usuario1.2024@gmail.cl"
            }
        }
    };

    const fetchPractica = async (idPractica) => {
        if (!idPractica) return null;

        // Si ya tenemos la práctica en caché, la devolvemos
        if (practicasCache[idPractica]) {
            return practicasCache[idPractica];
        }

        setLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 100));

            // Obtener práctica de los datos de ejemplo
            const practica = datosPracticasEjemplo[idPractica] || {
                id_practica: idPractica,
                id_estudiante: idPractica + 2,
                empresa: "Empresa Desconocida",
                estado: "Desconocido",
                estudiante: {
                    nombreCompleto: `Estudiante ${idPractica}`,
                    rut: "00.000.000-0"
                }
            };

            // Actualizar caché
            setPracticasCache(prev => ({
                ...prev,
                [idPractica]: practica
            }));

            return practica;
        } catch (error) {
            console.error("Error al obtener práctica:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchPracticas = async (idsPracticas) => {
        if (!Array.isArray(idsPracticas) || idsPracticas.length === 0) {
            return [];
        }

        setLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 150));

            const practicas = idsPracticas
                .map(id => datosPracticasEjemplo[id] || {
                    id_practica: id,
                    id_estudiante: id + 2,
                    empresa: "Empresa Desconocida",
                    estado: "Desconocido",
                    estudiante: {
                        nombreCompleto: `Estudiante ${id}`,
                        rut: "00.000.000-0"
                    }
                })
                .filter(p => p !== null);

            // Actualizar caché
            const nuevasPracticas = {};
            practicas.forEach(p => {
                if (p) {
                    nuevasPracticas[p.id_practica] = p;
                }
            });

            setPracticasCache(prev => ({
                ...prev,
                ...nuevasPracticas
            }));

            return practicas;
        } catch (error) {
            console.error("Error al obtener prácticas:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        practicasCache,
        loading,
        fetchPractica,
        fetchPracticas
    };
};

export default useGetPracticaById;