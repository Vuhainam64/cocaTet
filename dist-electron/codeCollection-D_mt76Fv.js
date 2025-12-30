import { g as o } from "./index-ThqdRj4W.js";
const l = {
  create(e) {
    const t = o().prepare(`
            INSERT INTO code_collections (name, note)
            VALUES (?, ?)
        `).run(e.name, e.note || null);
    return this.getById(t.lastInsertRowid);
  },
  getAll() {
    return o().prepare(`
            SELECT cc.*,
                   COUNT(c.id) AS code_count
            FROM code_collections cc
            LEFT JOIN codes c ON c.collection_id = cc.id
            GROUP BY cc.id
            ORDER BY cc.created_at DESC
        `).all();
  },
  getById(e) {
    return o().prepare(`
            SELECT cc.*,
                   COUNT(c.id) AS code_count
            FROM code_collections cc
            LEFT JOIN codes c ON c.collection_id = cc.id
            WHERE cc.id = ?
            GROUP BY cc.id
        `).get(e);
  },
  update(e, c) {
    const d = o(), t = [], n = [];
    return c.name !== void 0 && (t.push("name = ?"), n.push(c.name)), c.note !== void 0 && (t.push("note = ?"), n.push(c.note)), t.push("updated_at = CURRENT_TIMESTAMP"), n.push(e), d.prepare(`
            UPDATE code_collections SET ${t.join(", ")} WHERE id = ?
        `).run(...n), this.getById(e);
  },
  delete(e) {
    const c = o();
    return c.prepare("UPDATE codes SET collection_id = NULL WHERE collection_id = ?").run(e), c.prepare("DELETE FROM code_collections WHERE id = ?").run(e);
  },
  getCodes(e) {
    return o().prepare(`
            SELECT * FROM codes
            WHERE collection_id = ?
            ORDER BY created_at DESC
        `).all(e);
  }
};
export {
  l as CodeCollectionModel
};
