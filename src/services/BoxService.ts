import { BoxRepository } from "../repository/BoxRepository";

export class BoxService {
  private boxRepository: BoxRepository;

  constructor(boxRepository?: BoxRepository) {
    this.boxRepository = boxRepository || new BoxRepository();
  }

  async getAll(params?: { page?: number; limit?: number; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.boxRepository.getAllBoxes({
      limit,
      offset,
      name: params?.name
    });
  }

  async getById(id: number) {
    const box = await this.boxRepository.getBoxById(id);
    if (!box) {
      throw new Error("Box não encontrada");
    }
    return box;
  }

  async getByTreinador(treinadorId: number, params?: { page?: number; limit?: number; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.boxRepository.getBoxesByTreinador(treinadorId, {
      limit,
      offset,
      name: params?.name
    });
  }

  async create(data: { name?: string; treinadorId?: number }) {
    const { name, treinadorId } = data;
    if (!name || treinadorId === undefined) {
      throw new Error("Nome e treinadorId são obrigatórios");
    }
    return await this.boxRepository.createBox(name, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; treinadorId: number }>
  ) {
    const box = await this.boxRepository.updateBox(id, data);
    if (!box) {
      throw new Error("Box não encontrada");
    }
    return box;
  }

  async delete(id: number) {
    const deleted = await this.boxRepository.deleteBox(id);
    if (!deleted) {
      throw new Error("Box não encontrada");
    }
    return true;
  }

  async transferPokemon(pokemonId: number, targetType: 'box' | 'team', targetId: number) {
    const { Pokemon } = require("../models/Pokemon");
    const pokemon = await Pokemon.findByPk(pokemonId);

    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }

    if (targetType === 'team') {
      const { EquipeRepository } = require("../repository/EquipeRepository");
      const equipeRepo = new EquipeRepository();
      const count = await equipeRepo.countPokemonsInEquipe(targetId);

      if (count >= 6) {
        throw new Error("Equipe cheia");
      }

      await pokemon.update({
        teamId: targetId,
        boxId: null,
        teamPosition: count + 1
      });
    } else {
      await pokemon.update({
        boxId: targetId,
        teamId: null,
        teamPosition: null
      });
    }

    return pokemon;
  }

  async searchPokemon(boxId: number, query: string) {
    const { PokemonRepository } = require("../repository/PokemonRepository");
    const pokemonRepo = new PokemonRepository();
    return await pokemonRepo.getPokemonsInBoxByName(boxId, query);
  }
}
