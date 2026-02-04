import { Item } from "../models/Item";

export class ItemRepository {
  async createItem(name: string, description: string, category: string, quantity: number, treinadorId: number) {
    const item = await Item.create({
      name,
      description,
      category,
      quantity,
      treinadorId
    });

    return item;
  }

  async getAllItems(options?: { limit?: number; offset?: number; category?: string }) {
    const where: any = {};
    if (options?.category) {
      where.category = options.category;
    }

    return await Item.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async getItemById(id: number) {
    return await Item.findByPk(id);
  }

  async getItemsByTreinador(treinadorId: number, options?: { limit?: number; offset?: number; category?: string }) {
    const where: any = { treinadorId };
    if (options?.category) {
      where.category = options.category;
    }

    return await Item.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async updateItem(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      category: string;
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
