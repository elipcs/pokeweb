import { PokemonRepository } from "../repository/PokemonRepository";
import { TreinadorService } from "./TreinadorService";

type EvolutionRule = {
  evolvesTo: string;
  evolutionLevel: number;
};

const EVOLUTION_RULES: Record<string, EvolutionRule> = {
  Charmander: { evolvesTo: "Charmeleon", evolutionLevel: 30 },
  Charmeleon: { evolvesTo: "Charizard", evolutionLevel: 60 },
  Squirtle: { evolvesTo: "Wartortle", evolutionLevel: 30 },
  Wartortle: { evolvesTo: "Blastoise", evolutionLevel: 60 },
  Bulbasaur: { evolvesTo: "Ivysaur", evolutionLevel: 30 },
  Ivysaur: { evolvesTo: "Venusaur", evolutionLevel: 60 },
  Vulpix: { evolvesTo: "Ninetales", evolutionLevel: 30 }
};

export class PokemonService {
  private pokemonRepository: PokemonRepository;
  private treinadorService: TreinadorService;

  constructor(pokemonRepository?: PokemonRepository, treinadorService?: TreinadorService) {
    this.pokemonRepository = pokemonRepository || new PokemonRepository();
    this.treinadorService = treinadorService || new TreinadorService();
  }

  private getEvolutionRuleForName(name: string): EvolutionRule | null {
    return EVOLUTION_RULES[name] || null;
  }

  private getEvolutionRuleForPokemon(pokemon: {
    name: string;
    evolvesTo?: string | null;
    evolutionLevel?: number | null;
  }): EvolutionRule | null {
    const byName = this.getEvolutionRuleForName(pokemon.name);
    if (byName) {
      return byName;
    }

    if (!pokemon.evolvesTo) {
      return null;
    }

    const level = pokemon.evolutionLevel ?? 30;
    return { evolvesTo: pokemon.evolvesTo, evolutionLevel: level };
  }

  private getNextEvolutionMetadata(name: string): { evolvesTo: string | null; evolutionLevel: number | null } {
    const nextRule = this.getEvolutionRuleForName(name);
    if (!nextRule) {
      return { evolvesTo: null, evolutionLevel: null };
    }

    return {
      evolvesTo: nextRule.evolvesTo,
      evolutionLevel: nextRule.evolutionLevel
    };
  }

  private async getPokemonDataFromPokeApi(name: string) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`);
    if (!response.ok) {
      throw new Error("Pokémon não encontrado na PokéAPI");
    }

    const data = await response.json();
    const statsMap: Record<string, number> = {};
    for (const stat of data.stats || []) {
      statsMap[stat.stat.name] = stat.base_stat;
    }

    const type = (data.types || [])
      .map((entry: any) => entry.type?.name)
      .filter(Boolean)
      .join("/");

    return {
      type,
      hp: statsMap["hp"] ?? 1,
      attack: statsMap["attack"] ?? 1,
      defense: statsMap["defense"] ?? 1,
      spAtk: statsMap["special-attack"] ?? 1,
      spDef: statsMap["special-defense"] ?? 1,
      speed: statsMap["speed"] ?? 1
    };
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
    evolvesTo?: string | null;
    evolutionLevel?: number | null;
  }) {
    const {
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
      teamId,
      evolvesTo,
      evolutionLevel
    } =
      data;

    if (!name || trainerId === undefined) {
      throw new Error("Nome e treinador são obrigatórios");
    }

    // Validação: Pokémon não pode estar em box e equipe simultaneamente
    if (boxId !== null && boxId !== undefined && teamId !== null && teamId !== undefined) {
      throw new Error("Um Pokémon não pode estar em uma box e em uma equipe simultaneamente");
    }

    const hasCompleteManualStats = Boolean(
      type &&
      (level ?? 0) >= 1 &&
      (hp ?? 0) > 0 &&
      (attack ?? 0) > 0 &&
      (defense ?? 0) > 0 &&
      (spAtk ?? 0) > 0 &&
      (spDef ?? 0) > 0 &&
      (speed ?? 0) > 0
    );

    let finalType = type;
    let finalLevel = level ?? 1;
    let finalHp = hp;
    let finalAttack = attack;
    let finalDefense = defense;
    let finalSpAtk = spAtk;
    let finalSpDef = spDef;
    let finalSpeed = speed;

    if (!hasCompleteManualStats) {
      const pokeApiData = await this.getPokemonDataFromPokeApi(name);
      finalType = finalType || pokeApiData.type;
      finalLevel = finalLevel >= 1 ? finalLevel : 1;
      finalHp = pokeApiData.hp;
      finalAttack = pokeApiData.attack;
      finalDefense = pokeApiData.defense;
      finalSpAtk = pokeApiData.spAtk;
      finalSpDef = pokeApiData.spDef;
      finalSpeed = pokeApiData.speed;
    }

    const evolutionRule = evolvesTo
      ? { evolvesTo, evolutionLevel: evolutionLevel ?? 30 }
      : this.getEvolutionRuleForName(name);

    return await this.pokemonRepository.createPokemon(
      name,
      finalType!,
      finalLevel,
      finalHp!,
      finalAttack!,
      finalDefense!,
      finalSpAtk!,
      finalSpDef!,
      finalSpeed!,
      trainerId,
      boxId,
      teamId,
      null,
      evolutionRule?.evolvesTo ?? null,
      evolutionRule?.evolutionLevel ?? null
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

    const evolutionRule = this.getEvolutionRuleForPokemon(pokemon);

    const canEvolve = Boolean(evolutionRule && nextLevel >= evolutionRule.evolutionLevel);

    // Mantém metadados de evolução sincronizados para o botão de evoluir.
    if (evolutionRule) {
      updates.evolvesTo = evolutionRule.evolvesTo;
      updates.evolutionLevel = evolutionRule.evolutionLevel;
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

    const evolutionRule = this.getEvolutionRuleForPokemon(pokemon);

    if (!evolutionRule) {
      throw new Error("Este Pokémon não possui evolução cadastrada.");
    }

    if (pokemon.level < evolutionRule.evolutionLevel) {
      throw new Error(`Nível insuficiente para evoluir. Nível necessário: ${evolutionRule.evolutionLevel}`);
    }

    const nextEvolution = this.getNextEvolutionMetadata(evolutionRule.evolvesTo);

    const updates: any = {
      name: evolutionRule.evolvesTo,
      // Massive stat boost on evolution
      hp: pokemon.hp + 20,
      attack: pokemon.attack + 15,
      defense: pokemon.defense + 15,
      spAtk: pokemon.spAtk + 15,
      spDef: pokemon.spDef + 15,
      speed: pokemon.speed + 15,
      evolvesTo: nextEvolution.evolvesTo,
      evolutionLevel: nextEvolution.evolutionLevel
    };

    const evolvedPokemon = await this.pokemonRepository.updatePokemon(id, updates);

    // Award XP to trainer
    if (evolvedPokemon && evolvedPokemon.trainerId) {
      await this.treinadorService.addExperience(evolvedPokemon.trainerId, 50);
    }

    return evolvedPokemon;
  }

  async getByBoxId(boxId: number, params?: { page?: number; limit?: number; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.pokemonRepository.getPokemonsByBoxId(boxId, {
      limit,
      offset,
      name: params?.name
    });
  }

  async getByTeamId(teamId: number, params?: { page?: number; limit?: number }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.pokemonRepository.getPokemonsByTeamId(teamId, {
      limit,
      offset
    });
  }
}
