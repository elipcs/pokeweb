import rateLimit from "express-rate-limit";

// Configuração geral de Rate Limiting
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP por janela
    message: {
        message: "Muitas requisições vindas deste IP, por favor tente novamente em 15 minutos."
    },
    standardHeaders: true, // Retorna informação do limite nos headers `RateLimit-*`
    legacyHeaders: false, // Desativa os headers `X-RateLimit-*`
});

// Configuração mais restrita para rotas de autenticação (Login/Registro)
export const authRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Limite de 5 tentativas por IP por hora
    message: {
        message: "Muitas tentativas de login/registro. Por favor, tente novamente em uma hora."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
