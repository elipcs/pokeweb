import { Router, Request, Response } from "express";
import { ItemService } from "../services/ItemService";

const router = Router();
const itemService = new ItemService();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await itemService.getAll();
    return res.json(items);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os itens", error: error.message });
  }
});

router.get("/treinador/:treinadorId", async (req: Request, res: Response) => {
  try {
    const treinadorId = Number(req.params.treinadorId);
    const items = await itemService.getByTreinador(treinadorId);
    return res.json(items);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os itens", error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await itemService.getById(id);
    return res.json(item);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Item não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter o item", error: error.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const item = await itemService.create(req.body);
    return res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome e treinadorId são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar o item", error: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await itemService.update(id, req.body);
    return res.json(item);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Item não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o item", error: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await itemService.delete(id);
    return res.json({ message: "Item removido com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Item não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover o item", error: error.message });
  }
});

export default router;



