import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export class ProductModel {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id);
  }

  static getWithVariants(id) {
    const product = this.getById(id);
    if (!product) return null;

    const variantsStmt = db.prepare('SELECT * FROM product_variants WHERE product_id = ?');
    product.variants = variantsStmt.all(id);

    const pricesStmt = db.prepare(
      'SELECT * FROM dynamic_prices WHERE product_id = ? AND is_active = 1 ORDER BY created_at DESC'
    );
    product.prices = pricesStmt.all(id);

    return product;
  }

  static create(data) {
    const id = uuidv4();
    const stmt = db.prepare(
      'INSERT INTO products (id, name, description, category, sku, base_price) VALUES (?, ?, ?, ?, ?, ?)'
    );

    stmt.run(id, data.name, data.description, data.category, data.sku, data.base_price);
    return this.getById(id);
  }

  static update(id, data) {
    const stmt = db.prepare(
      'UPDATE products SET name = ?, description = ?, category = ?, base_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );

    stmt.run(data.name, data.description, data.category, data.base_price, id);
    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    return stmt.run(id);
  }

  static search(query) {
    const stmt = db.prepare(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR sku LIKE ?'
    );
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm);
  }

  static getByCategory(category) {
    const stmt = db.prepare('SELECT * FROM products WHERE category = ?');
    return stmt.all(category);
  }
}
