/*
 * Repository Item - COMENTADO TEMPORARIAMENTE
 * Será ativado em entregas futuras
 */

/*
import { Item } from "../models/Item";

export class ItemRepository {
  // Criar um novo Item
  async createItem(name: string, description: string, treinadorId: number) {
    const item = await Item.create({
      name,
      description,
      treinadorId
    });

    return item;
  }

  // Listar todos os Items
  async getAllItems() {
    return await Item.findAll();
  }

  // Buscar Item por ID
  async getItemById(id: number) {
    return await Item.findByPk(id);
  }

  // Buscar Items por Treinador
  async getItemsByTreinador(treinadorId: number) {
    return await Item.findAll({
      where: { treinadorId }
    });
  }

  // Atualizar Item
  async updateItem(id: number, data: Partial<{
    name: string;
    description: string;
    treinadorId: number;
  }>) {
    const item = await Item.findByPk(id);
    if (!item) return null;
    
    return await item.update(data);
  }

  // Deletar Item
  async deleteItem(id: number) {
    const item = await Item.findByPk(id);
    if (!item) return false;
    
    await item.destroy();
    return true;
  }
}
*/
