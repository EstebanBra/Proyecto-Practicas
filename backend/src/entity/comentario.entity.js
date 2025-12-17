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
        }
    }
});

export default ComentarioSchema;
