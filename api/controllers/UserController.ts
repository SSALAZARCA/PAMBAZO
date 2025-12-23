import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        role,
        is_active,
        search,
        page = 1,
        limit = 10
      } = req.query;

      const filters = {
        role: role as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
        search: search as string,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100) // Máximo 100 por página
      };

      const users = await this.userService.getUsers();

      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);

      ApiResponse.success(
        res,
        usersWithoutPasswords,
        'Usuarios obtenidos exitosamente'
      );

    } catch (error: any) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = id as string;

      if (!userId) {
        throw new ApiError(400, 'INVALID_ID', 'ID de usuario requerido');
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      // Remover contraseña de la respuesta
      // Remover contraseña de la respuesta
      const { password_hash, ...userWithoutPassword } = user;

      ApiResponse.success(res, userWithoutPassword, 'Usuario obtenido exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role, phone, is_active = true } = req.body;

      // Verificar si el email ya existe
      const existingUser = await this.userService.getUserByEmail(email);
      if (existingUser) {
        throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario
      const newUser = await this.userService.createUser({
        username: name,
        email,
        password_hash: hashedPassword,
        role,
        phone,
        is_active
      });

      // Remover contraseña de la respuesta
      // Remover contraseña de la respuesta
      const { password_hash: _, ...userWithoutPassword } = newUser;

      ApiResponse.created(res, userWithoutPassword, 'Usuario creado exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = id as string;

      if (!userId) {
        throw new ApiError(400, 'INVALID_ID', 'ID de usuario requerido');
      }

      const { name, email, password, role, first_name, last_name, phone, is_active } = req.body;

      const updateData: any = {};
      if (name) updateData.username = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (phone) updateData.phone = phone;
      if (is_active !== undefined) updateData.is_active = is_active;

      // Si se está actualizando la contraseña, hashearla
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 12);
      }

      const updatedUser = await this.userService.updateUser(userId, updateData);
      if (!updatedUser) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      // Remover contraseña de la respuesta
      // Remover contraseña de la respuesta
      const { password_hash, ...userWithoutPassword } = updatedUser;

      ApiResponse.success(res, userWithoutPassword, 'Usuario actualizado exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = id as string;

      if (!userId) {
        throw new ApiError(400, 'INVALID_ID', 'ID de usuario requerido');
      }

      // Verificar que el usuario no se esté eliminando a sí mismo
      if (req.user && req.user.id === userId) {
        throw new ApiError(400, 'CANNOT_DELETE_SELF', 'No puedes eliminar tu propia cuenta');
      }

      // Verificar que el usuario existe
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      // No permitir eliminar al propietario
      if (user.role === 'owner') {
        throw new ApiError(400, 'CANNOT_DELETE_OWNER', 'No se puede eliminar al propietario');
      }

      const deleted = await this.userService.deleteUser(userId);
      if (!deleted) {
        throw new ApiError(500, 'DELETE_FAILED', 'Error al eliminar usuario');
      }

      ApiResponse.noContent(res, 'Usuario eliminado exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const userId = id as string;

      if (!userId) {
        throw new ApiError(400, 'INVALID_ID', 'ID de usuario requerido');
      }

      if (typeof is_active !== 'boolean') {
        throw new ApiError(400, 'INVALID_STATUS', 'El estado debe ser true o false');
      }

      // Verificar que el usuario no se esté desactivando a sí mismo
      if (req.user && req.user.id === userId && !is_active) {
        throw new ApiError(400, 'CANNOT_DEACTIVATE_SELF', 'No puedes desactivar tu propia cuenta');
      }

      // Verificar que el usuario existe
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      // No permitir desactivar al propietario
      if (user.role === 'owner' && !is_active) {
        throw new ApiError(400, 'CANNOT_DEACTIVATE_OWNER', 'No se puede desactivar al propietario');
      }

      const updatedUser = await this.userService.updateUser(userId, { is_active });
      if (!updatedUser) {
        throw new ApiError(500, 'UPDATE_FAILED', 'Error al actualizar estado del usuario');
      }

      // Remover contraseña de la respuesta
      // Remover contraseña de la respuesta
      const { password_hash, ...userWithoutPassword } = updatedUser;

      ApiResponse.success(
        res,
        userWithoutPassword,
        `Usuario ${is_active ? 'activado' : 'desactivado'} exitosamente`
      );

    } catch (error: any) {
      next(error);
    }
  };
}
