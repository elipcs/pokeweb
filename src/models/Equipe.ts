import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface EquipeAttributes {
  id: number;
  name: string;
  treinadorId: number;
}

export interface EquipeCreationAttributes
  extends Optional<EquipeAttributes, "id"> {}

export class Equipe
  extends Model<EquipeAttributes, EquipeCreationAttributes>
  implements EquipeAttributes
{
  public id!: number;
  public name!: string;
  public treinadorId!: number;
}

Equipe.init(
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
    treinadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "treinador",
        key: "id"
      }
    }
  },
  {
    sequelize,
    tableName: "equipe",
    timestamps: true
  }
);

export default Equipe;
