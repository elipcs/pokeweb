import { Router, Request, Response } from "express";
import { BoxService } from "../services/BoxService";

const router = Router();
const boxService = new BoxService();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const boxes = await boxService.getAll();
    return res.json(boxes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as boxes", error: error.message });
  }
});

router.get("/treinador/:treinadorId", async (req: Request, res: Response) => {
  try {
    const treinadorId = Number(req.params.treinadorId);
    const boxes = await boxService.getByTreinador(treinadorId);
    return res.json(boxes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as boxes", error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const box = await boxService.getById(id);
    return res.json(box);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Box não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter a box", error: error.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const box = await boxService.create(req.body);
    return res.status(201).json(box);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome e treinadorId são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar a box", error: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const box = await boxService.update(id, req.body);
    return res.json(box);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Box não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar a box", error: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await boxService.delete(id);
    return res.json({ message: "Box removida com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Box não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover a box", error: error.message });
  }
});

export default router;


