"use strict";
import { EntitySchema } from "typeorm";

const DocumentoSchema = new EntitySchema({
    name: "BitacorasDocumento",
    tableName: "bitacorasDocumentos",
    columns: {
        id_documento: {
            primary: true,
            type: "int",
            generated: true
        },
        id_practica: {
            type: "int",
            nullable: false
        },
        semana: {
            type: "int",
            nullable: true,
            comment: "Número de semana para bitácoras (null para otros tipos de documentos)"
        },
        nombre_archivo: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        ruta_archivo: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        formato: {
            type: "enum",
            enum: ["pdf", "docx", "zip", "rar"],
            nullable: false
        },
        peso_mb: {
            type: "decimal",
            precision: 5,
            scale: 2,
            nullable: false
        },
        estado_revision: {
            type: "enum",
            enum: ["pendiente", "aprobado", "rechazado"],
            default: "pendiente"
        },
        fecha_subida: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        }
    },
    relations: {
        practica: {
            target: "Practica",
            type: "many-to-one",
            joinColumn: { name: "id_practica" },
            onDelete: "CASCADE"
        }
    }
});

export default DocumentoSchema;
