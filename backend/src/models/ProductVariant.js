import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export class ProductVariantModel {
  static getByProduct(productId) {
    const stmt = db.prepare('SELECT * FROM product_variants WHERE product_id = ?');
    return stmt.all(productId);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM product_variants WHERE id = ?');
    return stmt.get(id);
  }

  static getByType(productId, variantType) {
    const stmt = db.prepare(
      'SELECT * FROM product_variants WHERE product_id = ? AND variant_type = ?'
    );
    return stmt.all(productId, variantType);
  }

  static create(data) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO product_variants
       (id, product_id, variant_type, variant_name, variant_value, price_modifier, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      id,
      data.product_id,
      data.variant_type,
      data.variant_name,
      data.variant_value,
      data.price_modifier || 0,
      data.stock_quantity || 0
    );

    return this.getById(id);
  }

  static update(id, data) {
    const stmt = db.prepare(
      `UPDATE product_variants
       SET variant_name = ?, variant_value = ?, price_modifier = ?, stock_quantity = ?
       WHERE id = ?`
    );

    stmt.run(
      data.variant_name,
      data.variant_value,
      data.price_modifier,
      data.stock_quantity,
      id
    );

    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM product_variants WHERE id = ?');
    return stmt.run(id);
  }

  static updateStock(id, quantity) {
    const stmt = db.prepare(
      'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?'
    );
    return stmt.run(quantity, id);
  }
}
