"use strict";
import { EntitySchema } from "typeorm";

const ComentarioSchema = new EntitySchema({
    name: "Comentario",
    tableName: "comentarios",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        mensaje: {
            type: String,
            length: 500
        },
        respuesta: {
            type: String,
            length: 500,
            nullable: true
        },
        fechaCreacion: {
            type: Date,
            default: () => "CURRENT_TIMESTAMP"
        },
        usuarioId: {
            type: Number
        },
        estado: {
            type: String,
            length: 20,
            default: "Abierto"
        },
        nivelUrgencia: {
            type: String,
            length: 20,
            default: "normal"
        },
        tipoProblema: {
            type: String,
            length: 50,
            default: "general"
        },
        archivos: {
            type: "simple-json",
            nullable: true,
            comment: "Array de objetos con información de archivos {nombre, ruta, tipo, tamaño}"
        }
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "usuarioId"
            }
        }
    }
});

export default ComentarioSchema;