import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcryptjs";

// 1. Atributos que existem na tabela
export interface TreinadorAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

// 2. Atributos necessários para criar (id é auto incremento)
export interface TreinadorCreationAttributes
  extends Optional<TreinadorAttributes, "id" | "role"> { }

// 3. Classe do modelo
export class Treinador
  extends Model<TreinadorAttributes, TreinadorCreationAttributes>
  implements TreinadorAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
}

// 4. Inicialização do modelo (mapeia pra tabela)
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
