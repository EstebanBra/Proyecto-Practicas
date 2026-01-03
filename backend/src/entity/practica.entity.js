"use strict";
import { EntitySchema } from "typeorm";

const PracticaSchema = new EntitySchema({
  name: "Practica",
  tableName: "practicas",
  columns: {
    id_practica: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_estudiante: {
      type: "int",
      nullable: false,
    },
    id_docente: {
      type: "int",
      nullable: true, // Nullable para prácticas externas sin docente asignado
    },
    // Datos de la empresa
    empresa: {
      type: "varchar",
      length: 255,
      nullable: true, // Para prácticas de ofertas publicadas
    },
    // Datos del supervisor
    supervisor_nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    supervisor_email: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    supervisor_telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    fecha_inicio: {
      type: "date",
      nullable: true,
    },
    fecha_fin: {
      type: "date",
      nullable: true,
    },
    horas_practicas: {
      type: "int",
      nullable: true,
    },
    semanas: {
      type: "int",
      nullable: true,
    },
    tipo_presencia: {
      type: "enum",
      enum: ["presencial", "virtual", "hibrido"],
      default: "presencial",
    },
    tipo_practica: {
      type: "enum",
      enum: ["publicada", "externa"], // publicada = desde ofertas, externa = ingresada por estudiante
      default: "publicada",
    },
    documentos: {
      type: "simple-json",
      nullable: true, // Array de objetos con info de documentos
    },
    nota_practica: {
      type: "decimal",
      precision: 2,
      scale: 1,
      nullable: true,
    },
    estado: {
      type: "enum",
      enum: [
        "activa",
        "en_progreso",
        "finalizada",
        "cancelada",
        "pendiente_revision",
      ],
      enumName: "estado_enum",

      default: "activa",
    },
    fecha_creacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    estudiante: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_estudiante" },
      onDelete: "CASCADE",
    },
    docente: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_docente" },
      onDelete: "SET NULL",
      nullable: true,
    },
  },
});

export default PracticaSchema;
