import { PokemonRepository } from "../repository/PokemonRepository";
import { TreinadorService } from "./TreinadorService";

export class PokemonService {
  private pokemonRepository: PokemonRepository;
  private treinadorService: TreinadorService;

  constructor(pokemonRepository?: PokemonRepository, treinadorService?: TreinadorService) {
    this.pokemonRepository = pokemonRepository || new PokemonRepository();
    this.treinadorService = treinadorService || new TreinadorService();
  }

  async getAll(params?: { page?: number; limit?: number; type?: string; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.pokemonRepository.getAllPokemons({
      limit,
      offset,
      type: params?.type,
      name: params?.name
    });
  }

  async getById(id: number) {
    const pokemon = await this.pokemonRepository.getPokemonById(id);
    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }
    return pokemon;
  }

  async create(data: {
    name?: string;
    type?: string;
    level?: number;
    hp?: number;
    attack?: number;
    defense?: number;
    spAtk?: number;
    spDef?: number;
    speed?: number;
    trainerId?: number;
    boxId?: number | null;
    teamId?: number | null;
  }) {
    const { name, type, level, hp, attack, defense, spAtk, spDef, speed, trainerId, boxId, teamId } =
      data;

    if (
      !name ||
      !type ||
      level === undefined ||
      hp === undefined ||
      attack === undefined ||
      defense === undefined ||
      spAtk === undefined ||
      spDef === undefined ||
      speed === undefined ||
      trainerId === undefined
    ) {
      throw new Error("Todos os campos obrigatórios do Pokémon devem ser preenchidos");
    }

    // Validação: Pokémon não pode estar em box e equipe simultaneamente
    if (boxId !== null && boxId !== undefined && teamId !== null && teamId !== undefined) {
      throw new Error("Um Pokémon não pode estar em uma box e em uma equipe simultaneamente");
    }

    return await this.pokemonRepository.createPokemon(
      name,
      type,
      level,
      hp,
      attack,
      defense,
      spAtk,
      spDef,
      speed,
      trainerId,
      boxId,
      teamId
    );
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      type: string;
      level: number;
      hp: number;
      attack: number;
      defense: number;
      spAtk: number;
      spDef: number;
      speed: number;
      trainerId: number;
      boxId: number | null;
      teamId: number | null;
    }>
  ) {
    // Validação: Pokémon não pode estar em box e equipe simultaneamente
    if (data.boxId !== undefined && data.teamId !== undefined && data.boxId !== null && data.teamId !== null) {
      throw new Error("Um Pokémon não pode estar em uma box e em uma equipe simultaneamente");
    }
    const pokemon = await this.pokemonRepository.updatePokemon(id, data);
    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }
    return pokemon;
  }

  async delete(id: number) {
    const deleted = await this.pokemonRepository.deletePokemon(id);
    if (!deleted) {
      throw new Error("Pokémon não encontrado");
    }
    return true;
  }

  async levelUp(id: number) {
    const pokemon = await this.pokemonRepository.getPokemonById(id);
    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }

    const nextLevel = pokemon.level + 1;
    const updates: any = { level: nextLevel };

    // Simple stat growth
    updates.hp = pokemon.hp + 2;
    updates.attack = pokemon.attack + 1;
    updates.defense = pokemon.defense + 1;
    updates.spAtk = pokemon.spAtk + 1;
    updates.spDef = pokemon.spDef + 1;
    updates.speed = pokemon.speed + 1;

    let canEvolve = false;
    if (pokemon.evolvesTo && pokemon.evolutionLevel && nextLevel >= pokemon.evolutionLevel) {
      canEvolve = true;
    }

    const updatedPokemon = await this.pokemonRepository.updatePokemon(id, updates);

    // Award XP to trainer
    if (updatedPokemon && updatedPokemon.trainerId) {
      await this.treinadorService.addExperience(updatedPokemon.trainerId, 10);
    }

    return { pokemon: updatedPokemon, canEvolve };
  }

  async evolve(id: number) {
    const pokemon = await this.pokemonRepository.getPokemonById(id);
    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }

    if (!pokemon.evolvesTo) {
      throw new Error("Este Pokémon não possui evolução cadastrada.");
    }

    if (pokemon.evolutionLevel && pokemon.level < pokemon.evolutionLevel) {
      throw new Error(`Nível insuficiente para evoluir. Nível necessário: ${pokemon.evolutionLevel}`);
    }

    const updates: any = {
      name: pokemon.evolvesTo,
      // Massive stat boost on evolution
      hp: pokemon.hp + 20,
      attack: pokemon.attack + 15,
      defense: pokemon.defense + 15,
      spAtk: pokemon.spAtk + 15,
      spDef: pokemon.spDef + 15,
      speed: pokemon.speed + 15,
      evolvesTo: null, // Reset evolution info or set to next stage
      evolutionLevel: null
    };

    const evolvedPokemon = await this.pokemonRepository.updatePokemon(id, updates);

    // Award XP to trainer
    if (evolvedPokemon && evolvedPokemon.trainerId) {
      await this.treinadorService.addExperience(evolvedPokemon.trainerId, 50);
    }

    return evolvedPokemon;
  }
}
