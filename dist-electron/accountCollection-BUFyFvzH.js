import { getDatabase } from "./index-a3XnTKBG.js";
const AccountCollectionModel = {
  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
            INSERT INTO account_collections (name, note)
            VALUES (?, ?)
        `);
    const result = stmt.run(data.name, data.note || null);
    return this.getById(result.lastInsertRowid);
  },
  getAll() {
    const db = getDatabase();
    return db.prepare(`
            SELECT ac.*,
                   COUNT(a.id) AS account_count
            FROM account_collections ac
            LEFT JOIN accounts a ON a.collection_id = ac.id
            GROUP BY ac.id
            ORDER BY ac.created_at DESC
        `).all();
  },
  getById(id) {
    const db = getDatabase();
    return db.prepare(`
            SELECT ac.*,
                   COUNT(a.id) AS account_count
            FROM account_collections ac
            LEFT JOIN accounts a ON a.collection_id = ac.id
            WHERE ac.id = ?
            GROUP BY ac.id
        `).get(id);
  },
  update(id, data) {
    const db = getDatabase();
    const updates = [];
    const values = [];
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.note !== void 0) {
      updates.push("note = ?");
      values.push(data.note);
    }
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = db.prepare(`
            UPDATE account_collections SET ${updates.join(", ")} WHERE id = ?
        `);
    stmt.run(...values);
    return this.getById(id);
  },
  delete(id) {
    const db = getDatabase();
    db.prepare("UPDATE accounts SET collection_id = NULL WHERE collection_id = ?").run(id);
    const stmt = db.prepare("DELETE FROM account_collections WHERE id = ?");
    return stmt.run(id);
  },
  getAccounts(collectionId) {
    const db = getDatabase();
    return db.prepare(`
            SELECT * FROM accounts
            WHERE collection_id = ?
            ORDER BY created_at DESC
        `).all(collectionId);
  }
};
export {
  AccountCollectionModel
};
