import { ItemRepository } from "../repository/ItemRepository";

const itemRepository = new ItemRepository();

export class ItemService {
  async getAll(params?: { page?: number; limit?: number; category?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await itemRepository.getAllItems({
      limit,
      offset,
      category: params?.category
    });
  }

  async getById(id: number) {
    const item = await itemRepository.getItemById(id);
    if (!item) {
      throw new Error("Item não encontrado");
    }
    return item;
  }

  async getByTreinador(treinadorId: number, params?: { page?: number; limit?: number; category?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await itemRepository.getItemsByTreinador(treinadorId, {
      limit,
      offset,
      category: params?.category
    });
  }

  async create(data: { name?: string; description?: string; category?: string; quantity?: number; treinadorId?: number }) {
    const { name, description, category, quantity, treinadorId } = data;

    if (!name || !category || treinadorId === undefined) {
      throw new Error("Nome, categoria e treinadorId são obrigatórios");
    }

    return await itemRepository.createItem(name, description ?? "", category, quantity ?? 1, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; description: string; category: string; quantity: number; treinadorId: number }>
  ) {
    const item = await itemRepository.updateItem(id, data);
    if (!item) {
      throw new Error("Item não encontrado");
    }
    return item;
  }

  async delete(id: number) {
    const deleted = await itemRepository.deleteItem(id);
    if (!deleted) {
      throw new Error("Item não encontrado");
    }
    return true;
  }
}



