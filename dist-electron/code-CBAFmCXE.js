import { g as c } from "./index-ThqdRj4W.js";
const i = {
  create(e) {
    const s = c().prepare(`
            INSERT INTO codes (code, status, collection_id)
            VALUES (?, ?, ?)
        `).run(
      e.code.toUpperCase(),
      e.status || "active",
      e.collection_id || null
    );
    return this.getById(s.lastInsertRowid);
  },
  getAll(e = null, t = null) {
    const o = c(), s = [], n = [];
    e != null && (s.push("collection_id = ?"), n.push(e)), t && (s.push("status = ?"), n.push(t));
    const r = s.length ? `WHERE ${s.join(" AND ")}` : "";
    return o.prepare(`
            SELECT * FROM codes ${r}
            ORDER BY created_at DESC
        `).all(...n);
  },
  getById(e) {
    return c().prepare("SELECT * FROM codes WHERE id = ?").get(e);
  },
  update(e, t) {
    const o = c(), s = [], n = [];
    return t.code !== void 0 && (s.push("code = ?"), n.push(t.code.toUpperCase())), t.status !== void 0 && (s.push("status = ?"), n.push(t.status)), t.collection_id !== void 0 && (s.push("collection_id = ?"), n.push(t.collection_id)), s.push("updated_at = CURRENT_TIMESTAMP"), n.push(e), o.prepare(`
            UPDATE codes SET ${s.join(", ")} WHERE id = ?
        `).run(...n), this.getById(e);
  },
  delete(e) {
    return c().prepare("DELETE FROM codes WHERE id = ?").run(e);
  },
  bulkCreate(e, t = null) {
    const o = c(), s = o.prepare(`
            INSERT INTO codes (code, status, collection_id)
            VALUES (?, ?, ?)
        `);
    return o.transaction((r) => {
      for (const u of r)
        s.run(
          u.code.toUpperCase(),
          u.status || "active",
          u.collection_id !== void 0 ? u.collection_id : t || null
        );
    })(e), this.getAll(t || null);
  }
};
export {
  i as CodeModel
};
