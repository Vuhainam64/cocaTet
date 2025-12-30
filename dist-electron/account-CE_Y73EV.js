import { g as o } from "./index-ThqdRj4W.js";
const l = {
  create(t) {
    const e = o().prepare(`
            INSERT INTO accounts (name, token, status, collection_id)
            VALUES (?, ?, ?, ?)
        `).run(
      t.name,
      t.token,
      t.status || "active",
      t.collection_id || null
    );
    return this.getById(e.lastInsertRowid);
  },
  getAll(t = null, n = null) {
    const u = o(), e = [], s = [];
    t != null && (e.push("collection_id = ?"), s.push(t)), n && (e.push("status = ?"), s.push(n));
    const r = e.length ? `WHERE ${e.join(" AND ")}` : "";
    return u.prepare(`
            SELECT * FROM accounts ${r}
            ORDER BY created_at DESC
        `).all(...s);
  },
  getById(t) {
    return o().prepare("SELECT * FROM accounts WHERE id = ?").get(t);
  },
  update(t, n) {
    const u = o(), e = [], s = [];
    return n.name !== void 0 && (e.push("name = ?"), s.push(n.name)), n.token !== void 0 && (e.push("token = ?"), s.push(n.token)), n.status !== void 0 && (e.push("status = ?"), s.push(n.status)), n.collection_id !== void 0 && (e.push("collection_id = ?"), s.push(n.collection_id)), e.push("updated_at = CURRENT_TIMESTAMP"), s.push(t), u.prepare(`
            UPDATE accounts SET ${e.join(", ")} WHERE id = ?
        `).run(...s), this.getById(t);
  },
  delete(t) {
    return o().prepare("DELETE FROM accounts WHERE id = ?").run(t);
  },
  bulkCreate(t, n = null) {
    const u = o(), e = u.prepare(`
            INSERT INTO accounts (name, token, status, collection_id)
            VALUES (?, ?, ?, ?)
        `);
    return u.transaction((r) => {
      for (const c of r)
        e.run(
          c.name,
          c.token,
          c.status || "active",
          c.collection_id !== void 0 ? c.collection_id : n || null
        );
    })(t), this.getAll(n || null);
  }
};
export {
  l as AccountModel
};
