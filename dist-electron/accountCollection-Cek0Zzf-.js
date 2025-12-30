import { g as n } from "./index-ThqdRj4W.js";
const r = {
  create(t) {
    const e = n().prepare(`
            INSERT INTO account_collections (name, note)
            VALUES (?, ?)
        `).run(t.name, t.note || null);
    return this.getById(e.lastInsertRowid);
  },
  getAll() {
    return n().prepare(`
            SELECT ac.*,
                   COUNT(a.id) AS account_count
            FROM account_collections ac
            LEFT JOIN accounts a ON a.collection_id = ac.id
            GROUP BY ac.id
            ORDER BY ac.created_at DESC
        `).all();
  },
  getById(t) {
    return n().prepare(`
            SELECT ac.*,
                   COUNT(a.id) AS account_count
            FROM account_collections ac
            LEFT JOIN accounts a ON a.collection_id = ac.id
            WHERE ac.id = ?
            GROUP BY ac.id
        `).get(t);
  },
  update(t, c) {
    const a = n(), e = [], o = [];
    return c.name !== void 0 && (e.push("name = ?"), o.push(c.name)), c.note !== void 0 && (e.push("note = ?"), o.push(c.note)), e.push("updated_at = CURRENT_TIMESTAMP"), o.push(t), a.prepare(`
            UPDATE account_collections SET ${e.join(", ")} WHERE id = ?
        `).run(...o), this.getById(t);
  },
  delete(t) {
    const c = n();
    return c.prepare("UPDATE accounts SET collection_id = NULL WHERE collection_id = ?").run(t), c.prepare("DELETE FROM account_collections WHERE id = ?").run(t);
  },
  getAccounts(t) {
    return n().prepare(`
            SELECT * FROM accounts
            WHERE collection_id = ?
            ORDER BY created_at DESC
        `).all(t);
  }
};
export {
  r as AccountCollectionModel
};
