import { DatabaseService } from './DatabaseService';

export type UserRole = 'owner' | 'admin' | 'waiter' | 'kitchen' | 'customer';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password_hash?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
}

export class UserService {
  async getUserById(id: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password_hash, role, first_name, last_name, 
             phone, is_active, created_at, updated_at, last_login
      FROM users 
      WHERE id = ?
    `;

    return await DatabaseService.get(query, [id]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password_hash, role, first_name, last_name,
             phone, is_active, created_at, updated_at, last_login
      FROM users 
      WHERE email = ?
    `;

    return await DatabaseService.get(query, [email]);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, password_hash, role, first_name, last_name,
             phone, is_active, created_at, updated_at, last_login
      FROM users 
      WHERE username = ?
    `;

    return await DatabaseService.get(query, [username]);
  }

  async getUsers(): Promise<User[]> {
    const query = `
      SELECT id, username, email, role, first_name, last_name, phone, is_active, 
             created_at, updated_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `;

    return await DatabaseService.all(query);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userData.username,
      userData.email,
      userData.password_hash,
      userData.role,
      userData.first_name || null,
      userData.last_name || null,
      userData.phone || null,
      userData.is_active ? 1 : 0
    ];

    const result = await DatabaseService.run(query, values);
    return await this.getUserById(result.lastID.toString()) as User;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (userData.username !== undefined) {
      updateFields.push('username = ?');
      values.push(userData.username);
    }

    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      values.push(userData.email);
    }

    if (userData.password_hash !== undefined) {
      updateFields.push('password_hash = ?');
      values.push(userData.password_hash);
    }

    if (userData.role !== undefined) {
      updateFields.push('role = ?');
      values.push(userData.role);
    }

    if (userData.first_name !== undefined) {
      updateFields.push('first_name = ?');
      values.push(userData.first_name);
    }

    if (userData.last_name !== undefined) {
      updateFields.push('last_name = ?');
      values.push(userData.last_name);
    }

    if (userData.phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(userData.phone);
    }

    if (userData.is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(userData.is_active ? 1 : 0);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await DatabaseService.run(query, values);
    return await this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await DatabaseService.run(query, [id]);
    return (result.changes || 0) > 0;
  }

  async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await DatabaseService.run(query, [id]);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const query = `
      SELECT id, username, email, password_hash, role, first_name, last_name, phone, is_active, 
             created_at, updated_at, last_login
      FROM users 
      WHERE role = ? AND is_active = 1
      ORDER BY created_at DESC
    `;

    return await DatabaseService.all(query, [role]);
  }
}
