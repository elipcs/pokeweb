import { EquipeRepository } from "../repository/EquipeRepository";
import { Pokemon } from "../models/Pokemon";

const equipeRepository = new EquipeRepository();

export class EquipeService {
  async getAll(params?: { page?: number; limit?: number; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await equipeRepository.getAllEquipes({
      limit,
      offset,
      name: params?.name
    });
  }

  async getById(id: number) {
    const equipe = await equipeRepository.getEquipeById(id);
    if (!equipe) {
      throw new Error("Equipe não encontrada");
    }
    return equipe;
  }

  async getByTreinador(treinadorId: number, params?: { page?: number; limit?: number; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await equipeRepository.getEquipesByTreinador(treinadorId, {
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
    return await equipeRepository.createEquipe(name, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; treinadorId: number }>
  ) {
    const equipe = await equipeRepository.updateEquipe(id, data);
    if (!equipe) {
      throw new Error("Equipe não encontrada");
    }
    return equipe;
  }

  async delete(id: number) {
    const deleted = await equipeRepository.deleteEquipe(id);
    if (!deleted) {
      throw new Error("Equipe não encontrada");
    }
    return true;
  }
  async addPokemonToTeam(teamId: number, pokemonId: number) {
    const count = await equipeRepository.countPokemonsInEquipe(teamId);
    if (count >= 6) {
      throw new Error("Equipe cheia. Máximo de 6 Pokémons permitidos.");
    }

    const { Pokemon } = require("../models/Pokemon");
    const pokemon = await Pokemon.findByPk(pokemonId);

    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }

    await pokemon.update({
      teamId,
      boxId: null,
      teamPosition: count + 1
    });

    return pokemon;
  }

  async removePokemonFromTeam(teamId: number, pokemonId: number) {
    const { Pokemon } = require("../models/Pokemon");
    const pokemon = await Pokemon.findByPk(pokemonId);

    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }

    if (pokemon.teamId !== teamId) {
      throw new Error("Pokémon não pertence a esta equipe");
    }

    await pokemon.update({
      teamId: null,
      teamPosition: null
    });

    return true;
  }

  async reorderPokemon(teamId: number, pokemonIds: number[]) {
    const { Pokemon } = require("../models/Pokemon");
    const pokemons = await Pokemon.findAll({ where: { teamId } });

    // Validate if all pokemons belong to the team
    for (const id of pokemonIds) {
      if (!pokemons.find((p: any) => p.id === id)) {
        throw new Error(`Pokémon ${id} não pertence a esta equipe`);
      }
    }

    // Update positions
    for (let i = 0; i < pokemonIds.length; i++) {
      const pokemon = pokemons.find((p: any) => p.id === pokemonIds[i]);
      if (pokemon) {
        await pokemon.update({ teamPosition: i + 1 });
      }
    }

    return true;
  }
}



