import { g as getDatabase } from "./index-B4ntsY6U.js";
const ProxyCollectionModel = {
  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
            INSERT INTO proxy_collections (name, note)
            VALUES (?, ?)
        `);
    const result = stmt.run(data.name, data.note || null);
    return this.getById(result.lastInsertRowid);
  },
  getAll() {
    const db = getDatabase();
    return db.prepare(`
            SELECT pc.*,
                   COUNT(p.id) AS proxy_count
            FROM proxy_collections pc
            LEFT JOIN proxies p ON p.collection_id = pc.id
            GROUP BY pc.id
            ORDER BY pc.created_at DESC
        `).all();
  },
  getById(id) {
    const db = getDatabase();
    return db.prepare(`
            SELECT pc.*,
                   COUNT(p.id) AS proxy_count
            FROM proxy_collections pc
            LEFT JOIN proxies p ON p.collection_id = pc.id
            WHERE pc.id = ?
            GROUP BY pc.id
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
            UPDATE proxy_collections SET ${updates.join(", ")} WHERE id = ?
        `);
    stmt.run(...values);
    return this.getById(id);
  },
  delete(id) {
    const db = getDatabase();
    db.prepare("UPDATE proxies SET collection_id = NULL WHERE collection_id = ?").run(id);
    const stmt = db.prepare("DELETE FROM proxy_collections WHERE id = ?");
    return stmt.run(id);
  },
  getProxies(collectionId) {
    const db = getDatabase();
    return db.prepare(`
            SELECT * FROM proxies
            WHERE collection_id = ?
            ORDER BY created_at DESC
        `).all(collectionId);
  }
};
export {
  ProxyCollectionModel
};
