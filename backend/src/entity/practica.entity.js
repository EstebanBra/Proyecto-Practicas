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
      nullable: true,
    },
    fecha_inicio: {
      type: "date",
      nullable: false,
    },
    fecha_fin: {
      type: "date",
      nullable: false,
    },
    horas_practicas: {
      type: "int",
      nullable: false,
    },
    semanas: {
      type: "int",
      nullable: false,
    },
    tipo_presencia: {
      type: "enum",
      enum: ["presencial", "virtual", "hibrido"],
      default: "presencial",
    },
    tipo_practica: {
      type: "enum",
      enum: ["publicada", "propia"],
      nullable: false,
    },
    empresa: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    supervisor_nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    supervisor_email: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    supervisor_telefono: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    documentos: {
      type: "simple-json",
      nullable: false,
    },
    observaciones: {
      type: "text",
      nullable: true,
    },
    nota_practica: {
      type: "decimal",
      precision: 2,
      scale: 1,
      nullable: true,
    },
    estado: {
      type: "enum",
      enum: ["Revision_Pendiente", "Aprobada", "Rechazada", "En_Curso", "Finalizada"],
      default: "Revision_Pendiente",
    },
    fecha_creacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    fecha_actualizacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
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
      onDelete: "CASCADE",
    },
  },
});

export default PracticaSchema;