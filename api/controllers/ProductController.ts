import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query);
      const { search, category, minPrice, maxPrice } = req.query;

      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (search) {
        query += ' AND name LIKE ?';
        params.push(`%${search}%`);
      }

      if (category) {
        query += ' AND category_id = ?';
        params.push(category);
      }

      if (minPrice) {
        query += ' AND price >= ?';
        params.push(parseFloat(minPrice as string));
      }

      if (maxPrice) {
        query += ' AND price <= ?';
        params.push(parseFloat(maxPrice as string));
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countResult = await DatabaseService.get(countQuery, params);
      const total = countResult?.total || 0;

      // Get paginated data
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const products = await DatabaseService.all(query, params);

      const result = createPaginatedResponse(products, total, page, limit);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await DatabaseService.get(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      if (!product) {
        throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
      }

      ApiResponse.success(res, { product });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, category_id, image_url, is_available, preparation_time } = req.body;

      const id = `prod-${Date.now()}`;
      await DatabaseService.run(
        `INSERT INTO products (id, name, description, price, category_id, image_url, is_available, preparation_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description, price, category_id, image_url, is_available ?? 1, preparation_time ?? 0]
      );

      const product = await DatabaseService.get('SELECT * FROM products WHERE id = ?', [id]);
      ApiResponse.created(res, { product }, 'Producto creado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];

      await DatabaseService.run(
        `UPDATE products SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
        values
      );

      const product = await DatabaseService.get('SELECT * FROM products WHERE id = ?', [id]);
      ApiResponse.success(res, { product }, 'Producto actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await DatabaseService.run('DELETE FROM products WHERE id = ?', [id]);
      ApiResponse.success(res, null, 'Producto eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }
}
