import { Router, Request, Response } from "express";
import { EquipeService } from "../services/EquipeService";

const router = Router();
const equipeService = new EquipeService();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const equipes = await equipeService.getAll();
    return res.json(equipes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as equipes", error: error.message });
  }
});

router.get("/treinador/:treinadorId", async (req: Request, res: Response) => {
  try {
    const treinadorId = Number(req.params.treinadorId);
    const equipes = await equipeService.getByTreinador(treinadorId);
    return res.json(equipes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as equipes", error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipe = await equipeService.getById(id);
    return res.json(equipe);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Equipe não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter a equipe", error: error.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const equipe = await equipeService.create(req.body);
    return res.status(201).json(equipe);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome e treinadorId são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar a equipe", error: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipe = await equipeService.update(id, req.body);
    return res.json(equipe);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Equipe não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar a equipe", error: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await equipeService.delete(id);
    return res.json({ message: "Equipe removida com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Equipe não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover a equipe", error: error.message });
  }
});

export default router;


