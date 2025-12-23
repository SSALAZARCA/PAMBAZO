import crypto from 'crypto';
import { DatabaseService } from './DatabaseService';

export class RefreshTokenService {
    /**
     * Genera un refresh token y lo guarda en la base de datos
     */
    static async createRefreshToken(userId: string): Promise<string> {
        // Generar token aleatorio
        const token = crypto.randomBytes(64).toString('hex');

        // Hashear el token antes de guardarlo
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Calcular fecha de expiración (7 días)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Guardar en base de datos
        await DatabaseService.run(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
            [userId, tokenHash, expiresAt.toISOString()]
        );

        return token;
    }

    /**
     * Verifica si un refresh token es válido
     */
    static async verifyRefreshToken(token: string): Promise<string | null> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const result = await DatabaseService.get(
            `SELECT user_id, expires_at, revoked 
       FROM refresh_tokens 
       WHERE token_hash = ?`,
            [tokenHash]
        );

        if (!result) {
            return null;
        }

        // Verificar si está revocado
        if (result.revoked === 1) {
            return null;
        }

        // Verificar si expiró
        const expiresAt = new Date(result.expires_at);
        if (expiresAt < new Date()) {
            // Eliminar token expirado
            await this.revokeRefreshToken(token);
            return null;
        }

        return result.user_id;
    }

    /**
     * Revoca un refresh token
     */
    static async revokeRefreshToken(token: string): Promise<void> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await DatabaseService.run(
            `UPDATE refresh_tokens 
       SET revoked = 1 
       WHERE token_hash = ?`,
            [tokenHash]
        );
    }

    /**
     * Revoca todos los refresh tokens de un usuario
     */
    static async revokeAllUserTokens(userId: string): Promise<void> {
        await DatabaseService.run(
            `UPDATE refresh_tokens 
       SET revoked = 1 
       WHERE user_id = ?`,
            [userId]
        );
    }

    /**
     * Limpia tokens expirados (ejecutar periódicamente)
     */
    static async cleanExpiredTokens(): Promise<void> {
        const now = new Date().toISOString();

        await DatabaseService.run(
            `DELETE FROM refresh_tokens 
       WHERE expires_at < ? OR revoked = 1`,
            [now]
        );
    }

    /**
     * Rota un refresh token (genera uno nuevo y revoca el anterior)
     */
    static async rotateRefreshToken(oldToken: string): Promise<string | null> {
        const userId = await this.verifyRefreshToken(oldToken);

        if (!userId) {
            return null;
        }

        // Revocar el token anterior
        await this.revokeRefreshToken(oldToken);

        // Crear nuevo token
        const newToken = await this.createRefreshToken(userId);

        return newToken;
    }
}
