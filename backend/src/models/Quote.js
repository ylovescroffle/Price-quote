import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export class QuoteModel {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM quotes WHERE id = ?');
    const quote = stmt.get(id);

    if (quote) {
      const itemsStmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?');
      quote.items = itemsStmt.all(id);
    }

    return quote;
  }

  static getByCustomer(customerId) {
    const stmt = db.prepare('SELECT * FROM quotes WHERE customer_id = ? ORDER BY created_at DESC');
    return stmt.all(customerId);
  }

  static getByStatus(status) {
    const stmt = db.prepare('SELECT * FROM quotes WHERE status = ? ORDER BY created_at DESC');
    return stmt.all(status);
  }

  static create(data) {
    const id = uuidv4();
    const quoteNumber = `BG-${Date.now().toString().slice(-8)}`;

    const stmt = db.prepare(
      `INSERT INTO quotes
       (id, quote_number, customer_id, customer_name, status, subtotal, discount_amount,
        tax_rate, tax_amount, total, valid_until, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      id,
      quoteNumber,
      data.customer_id,
      data.customer_name,
      data.status || 'draft',
      data.subtotal || 0,
      data.discount_amount || 0,
      data.tax_rate || 0,
      data.tax_amount || 0,
      data.total || 0,
      data.valid_until || null,
      data.notes || null
    );

    return this.getById(id);
  }

  static update(id, data) {
    const stmt = db.prepare(
      `UPDATE quotes
       SET status = ?, subtotal = ?, discount_amount = ?, tax_rate = ?,
           tax_amount = ?, total = ?, valid_until = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    );

    stmt.run(
      data.status,
      data.subtotal,
      data.discount_amount,
      data.tax_rate,
      data.tax_amount,
      data.total,
      data.valid_until,
      data.notes,
      id
    );

    return this.getById(id);
  }

  static updateStatus(id, status) {
    const stmt = db.prepare('UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);
    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM quotes WHERE id = ?');
    return stmt.run(id);
  }

  static addItem(quoteId, itemData) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO quote_items
       (id, quote_id, product_id, product_name, variant_id, variant_info,
        quantity, unit_price, discount_percent, discount_amount, subtotal, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      id,
      quoteId,
      itemData.product_id,
      itemData.product_name,
      itemData.variant_id || null,
      itemData.variant_info || null,
      itemData.quantity,
      itemData.unit_price,
      itemData.discount_percent || 0,
      itemData.discount_amount || 0,
      itemData.subtotal,
      itemData.notes || null
    );

    return id;
  }

  static removeItem(itemId) {
    const stmt = db.prepare('DELETE FROM quote_items WHERE id = ?');
    return stmt.run(itemId);
  }

  static getItems(quoteId) {
    const stmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?');
    return stmt.all(quoteId);
  }

  static recalculate(id) {
    const items = this.getItems(id);
    const quote = this.getById(id);

    if (!quote) return null;

    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      subtotal += item.subtotal;
      totalDiscount += item.discount_amount;
    });

    const taxAmount = subtotal * (quote.tax_rate / 100);
    const total = subtotal + taxAmount;

    return this.update(id, {
      ...quote,
      subtotal,
      discount_amount: totalDiscount,
      tax_amount: taxAmount,
      total
    });
  }
}
