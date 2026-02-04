
import { Request, Response } from "express";
import { Treinador } from "../models/Treinador";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export class AuthController {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            const treinador = await Treinador.findOne({ where: { email } });

            if (!treinador) {
                return res.status(404).json({ message: "Treinador Not found." });
            }

            const passwordIsValid = bcrypt.compareSync(
                password,
                treinador.password
            );

            if (!passwordIsValid) {
                return res.status(401).json({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            const token = jwt.sign(
                { id: treinador.id, role: treinador.role },
                JWT_SECRET,
                {
                    expiresIn: 86400 // 24 hours
                }
            );

            return res.status(200).json({
                id: treinador.id,
                name: treinador.name,
                email: treinador.email,
                role: treinador.role,
                accessToken: token
            });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    async register(req: Request, res: Response) {
        // This replicates TreinadorService.create logic but focused on Auth
        // Treinador model hooks handle password hashing
        try {
            const { name, email, password, role } = req.body;
            const treinador = await Treinador.create({
                name,
                email,
                password,
                role: role ? role : "TREINADOR"
            });
            return res.status(201).json(treinador);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}
