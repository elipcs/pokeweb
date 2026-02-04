
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }

    // Remove 'Bearer ' prefix
    const tokenString = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

    jwt.verify(tokenString, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        // Add userId and role to request
        (req as any).userId = decoded.id;
        (req as any).role = decoded.role;
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).role;
    if (role === "ADMIN") {
        next();
        return;
    }
    res.status(403).json({ message: "Require Admin Role!" });
};

export const isOwnerOrAdmin = (getOwnerId: (req: Request) => Promise<number | null>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).userId;
            const role = (req as any).role;

            if (role === "ADMIN") {
                return next();
            }

            const ownerId = await getOwnerId(req);
            if (ownerId === userId) {
                return next();
            }

            return res.status(403).json({ message: "Acesso negado: Você não é o proprietário deste recurso." });
        } catch (error: any) {
            return res.status(500).json({ message: "Erro ao verificar propriedade", error: error.message });
        }
    };
};
