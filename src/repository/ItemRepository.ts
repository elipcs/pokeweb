import { Item } from "../models/Item";

export class ItemRepository {
  async createItem(name: string, description: string, quantity: number, treinadorId: number) {
    const item = await Item.create({
      name,
      description,
      quantity,
      treinadorId
    });

    return item;
  }

  async getAllItems() {
    return await Item.findAll();
  }

  async getItemById(id: number) {
    return await Item.findByPk(id);
  }

  async getItemsByTreinador(treinadorId: number) {
    return await Item.findAll({
      where: { treinadorId }
    });
  }

  async updateItem(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      quantity: number;
      treinadorId: number;
    }>
  ) {
    const item = await Item.findByPk(id);
    if (!item) return null;

    return await item.update(data);
  }

  async deleteItem(id: number) {
    const item = await Item.findByPk(id);
    if (!item) return false;

    await item.destroy();
    return true;
  }
}
