import { Router, Request, Response } from "express";
import { TreinadorService } from "../services/TreinadorService";

const router = Router();
const treinadorService = new TreinadorService();

// GET
router.get("/", async (req: Request, res: Response) => {
  try {
    const treinadores = await treinadorService.getAll();
    return res.json(treinadores);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os treinadores", error: error.message });
  }
});

// GET 
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const treinador = await treinadorService.getById(id);
    return res.json(treinador);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Treinador não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter o treinador", error: error.message });
  }
});

// POST
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const treinador = await treinadorService.create(name, email, password);
    return res.status(201).json(treinador);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome, email e senha são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar o treinador", error: error.message });
  }
});

// PUT 
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;
    const treinador = await treinadorService.update(id, { name, email, password });
    return res.json(treinador);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Treinador não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o treinador", error: error.message });
  }
});

// DELETE 
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await treinadorService.delete(id);
    return res.json({ message: "Treinador removido com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Treinador não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover o treinador", error: error.message });
  }
});

export default router;

