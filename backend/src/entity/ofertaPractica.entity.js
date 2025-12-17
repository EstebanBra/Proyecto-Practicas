"use strict";
import { EntitySchema } from "typeorm";

const OfertaPracticaSchema = new EntitySchema({
  name: "OfertaPractica",
  tableName: "ofertas_practicas",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    titulo: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    descripcion_cargo: {
      type: "text",
      nullable: false,
    },
    requisitos: {
      type: "text",
      nullable: false,
    },
    duracion: {
      type: "int", // duración en semanas
      nullable: false,
    },
    modalidad: {
      type: "enum",
      enum: ["presencial", "online"],
      default: "presencial",
      nullable: false,
    },
    jornada: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    ubicacion: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    cupos: {
      type: "int",
      nullable: false,
    },
    fecha_limite: {
      type: "date",
      nullable: false,
    },
    estado: {
      type: "enum",
      enum: ["activa", "cerrada"],
      default: "activa",
    },
    fecha_publicacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    id_encargado: {
      type: "int",
      nullable: false,
    }
  },
  relations: {
    encargado: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_encargado" },
      onDelete: "CASCADE",
    }
  },
});

export default OfertaPracticaSchema;