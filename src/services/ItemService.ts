import { ItemRepository } from "../repository/ItemRepository";

export class ItemService {
  private itemRepository: ItemRepository;

  constructor(itemRepository?: ItemRepository) {
    this.itemRepository = itemRepository || new ItemRepository();
  }

  async getAll(params?: { page?: number; limit?: number; category?: string; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.itemRepository.getAllItems({
      limit,
      offset,
      category: params?.category,
      name: params?.name
    });
  }

  async getById(id: number) {
    const item = await this.itemRepository.getItemById(id);
    if (!item) {
      throw new Error("Item não encontrado");
    }
    return item;
  }

  async getByTreinador(treinadorId: number, params?: { page?: number; limit?: number; category?: string; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.itemRepository.getItemsByTreinador(treinadorId, {
      limit,
      offset,
      category: params?.category,
      name: params?.name
    });
  }

  async create(data: { name?: string; description?: string; category?: string; quantity?: number; treinadorId?: number }) {
    const { name, description, category, quantity, treinadorId } = data;

    if (!name || !category || treinadorId === undefined) {
      throw new Error("Nome, categoria e treinadorId são obrigatórios");
    }

    return await this.itemRepository.createItem(name, description ?? "", category, quantity ?? 1, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; description: string; category: string; quantity: number; treinadorId: number }>
  ) {
    const item = await this.itemRepository.updateItem(id, data);
    if (!item) {
      throw new Error("Item não encontrado");
    }
    return item;
  }

  async delete(id: number) {
    const deleted = await this.itemRepository.deleteItem(id);
    if (!deleted) {
      throw new Error("Item não encontrado");
    }
    return true;
  }

  async useItem(itemId: number, pokemonId: number, trainerId: number) {
    const item = await this.itemRepository.getItemById(itemId);
    if (!item) throw new Error("Item não encontrado");
    if (item.treinadorId !== trainerId) throw new Error("Você não possui este item.");

    const { PokemonRepository } = require("../repository/PokemonRepository");
    const pokemonRepo = new PokemonRepository();
    const pokemon = await pokemonRepo.getPokemonById(pokemonId);

    if (!pokemon) throw new Error("Pokémon não encontrado");
    if (pokemon.trainerId !== trainerId) throw new Error("Este Pokémon não pertence a você.");

    if (item.category === "Cura") {
      const healAmount = 20; // Default Potion heal
      await pokemon.update({ hp: pokemon.hp + healAmount });
    }

    if (item.quantity > 1) {
      await item.update({ quantity: item.quantity - 1 });
    } else {
      await item.destroy();
    }

    return { message: `Item ${item.name} usado com sucesso em ${pokemon.name}`, pokemon };
  }
}
