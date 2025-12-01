/*
 * Model Item - COMENTADO TEMPORARIAMENTE
 * Será ativado em entregas futuras
 */

/*
import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface ItemAttributes {
  id: number;
  name: string;
  description: string;
  treinadorId: number;
}

export interface ItemCreationAttributes
  extends Optional<ItemAttributes, "id"> {}

export class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public treinadorId!: number;
}

Item.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: "item",
    timestamps: false
  }
);

export default Item;
*/
