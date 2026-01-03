import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export class CustomerModel {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM customers ORDER BY created_at DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
    return stmt.get(id);
  }

  static create(data) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO customers
       (id, name, email, phone, company, address, customer_tier, discount_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      id,
      data.name,
      data.email || null,
      data.phone || null,
      data.company || null,
      data.address || null,
      data.customer_tier || 'standard',
      data.discount_rate || 0
    );

    return this.getById(id);
  }

  static update(id, data) {
    const stmt = db.prepare(
      `UPDATE customers
       SET name = ?, email = ?, phone = ?, company = ?, address = ?,
           customer_tier = ?, discount_rate = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    );

    stmt.run(
      data.name,
      data.email,
      data.phone,
      data.company,
      data.address,
      data.customer_tier,
      data.discount_rate,
      id
    );

    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    return stmt.run(id);
  }

  static search(query) {
    const stmt = db.prepare(
      'SELECT * FROM customers WHERE name LIKE ? OR company LIKE ? OR email LIKE ?'
    );
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm);
  }
}
