import { g as n } from "./index-ThqdRj4W.js";
const i = {
  create(e) {
    const o = n().prepare(`
            INSERT INTO proxy_collections (name, note)
            VALUES (?, ?)
        `).run(e.name, e.note || null);
    return this.getById(o.lastInsertRowid);
  },
  getAll() {
    return n().prepare(`
            SELECT pc.*,
                   COUNT(p.id) AS proxy_count
            FROM proxy_collections pc
            LEFT JOIN proxies p ON p.collection_id = pc.id
            GROUP BY pc.id
            ORDER BY pc.created_at DESC
        `).all();
  },
  getById(e) {
    return n().prepare(`
            SELECT pc.*,
                   COUNT(p.id) AS proxy_count
            FROM proxy_collections pc
            LEFT JOIN proxies p ON p.collection_id = pc.id
            WHERE pc.id = ?
            GROUP BY pc.id
        `).get(e);
  },
  update(e, t) {
    const r = n(), o = [], p = [];
    return t.name !== void 0 && (o.push("name = ?"), p.push(t.name)), t.note !== void 0 && (o.push("note = ?"), p.push(t.note)), o.push("updated_at = CURRENT_TIMESTAMP"), p.push(e), r.prepare(`
            UPDATE proxy_collections SET ${o.join(", ")} WHERE id = ?
        `).run(...p), this.getById(e);
  },
  delete(e) {
    const t = n();
    return t.prepare("UPDATE proxies SET collection_id = NULL WHERE collection_id = ?").run(e), t.prepare("DELETE FROM proxy_collections WHERE id = ?").run(e);
  },
  getProxies(e) {
    return n().prepare(`
            SELECT * FROM proxies
            WHERE collection_id = ?
            ORDER BY created_at DESC
        `).all(e);
  }
};
export {
  i as ProxyCollectionModel
};
