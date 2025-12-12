import { ItemRepository } from "../repository/ItemRepository";

const itemRepository = new ItemRepository();

export class ItemService {
  async getAll() {
    return await itemRepository.getAllItems();
  }

  async getById(id: number) {
    const item = await itemRepository.getItemById(id);
    if (!item) {
      throw new Error("Item não encontrado");
    }
    return item;
  }

  async getByTreinador(treinadorId: number) {
    return await itemRepository.getItemsByTreinador(treinadorId);
  }

  async create(data: { name?: string; description?: string; quantity?: number; treinadorId?: number }) {
    const { name, description, quantity, treinadorId } = data;

    if (!name || treinadorId === undefined) {
      throw new Error("Nome e treinadorId são obrigatórios");
    }

    return await itemRepository.createItem(name, description ?? "", quantity ?? 1, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; description: string; quantity: number; treinadorId: number }>
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



