import { Router, Request, Response } from "express";
import { PokemonService } from "../services/PokemonService";

const router = Router();
const pokemonService = new PokemonService();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const pokemons = await pokemonService.getAll();
    return res.json(pokemons);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os Pokémons", error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const pokemon = await pokemonService.getById(id);
    return res.json(pokemon);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Pokémon não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter o Pokémon", error: error.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const pokemon = await pokemonService.create(req.body);
    return res.status(201).json(pokemon);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Todos os campos do Pokémon são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar o Pokémon", error: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const pokemon = await pokemonService.update(id, req.body);
    return res.json(pokemon);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Pokémon não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o Pokémon", error: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await pokemonService.delete(id);
    return res.json({ message: "Pokémon removido com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Pokémon não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover o Pokémon", error: error.message });
  }
});

export default router;



