import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcryptjs";

export interface TreinadorAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  level: number;
  experience: number;
}

export interface TreinadorCreationAttributes
  extends Optional<TreinadorAttributes, "id" | "role" | "level" | "experience"> { }

export class Treinador
  extends Model<TreinadorAttributes, TreinadorCreationAttributes>
  implements TreinadorAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public level!: number;
  public experience!: number;
}

Treinador.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "TREINADOR"
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "treinador",
    timestamps: true,
    hooks: {
      beforeCreate: async (treinador: Treinador) => {
        if (treinador.password) {
          const salt = await bcrypt.genSalt(10);
          treinador.password = await bcrypt.hash(treinador.password, salt);
        }
      },
      beforeUpdate: async (treinador: Treinador) => {
        if (treinador.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          treinador.password = await bcrypt.hash(treinador.password, salt);
        }
      }
    }
  }
);

export default Treinador;
