import { g as o } from "./index-ThqdRj4W.js";
const l = {
  create(e) {
    const t = o().prepare(`
      INSERT INTO proxies (host, port, username, password, type, status, collection_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      e.host,
      e.port,
      e.username || null,
      e.password || null,
      e.type || "socks5",
      e.status || "active",
      e.collection_id || null
    );
    return this.getById(t.lastInsertRowid);
  },
  getAll(e = null, s = null) {
    const n = o(), t = [], r = [];
    e != null && (t.push("collection_id = ?"), r.push(e)), s && (t.push("status = ?"), r.push(s));
    const p = t.length ? `WHERE ${t.join(" AND ")}` : "";
    return n.prepare(`
      SELECT * FROM proxies ${p}
      ORDER BY created_at DESC
    `).all(...r);
  },
  getById(e) {
    return o().prepare("SELECT * FROM proxies WHERE id = ?").get(e);
  },
  getAvailable() {
    return o().prepare(`
      SELECT * FROM proxies WHERE status = 'active' ORDER BY last_used ASC NULLS FIRST
    `).all();
  },
  update(e, s) {
    const n = o(), t = [], r = [];
    return s.host !== void 0 && (t.push("host = ?"), r.push(s.host)), s.port !== void 0 && (t.push("port = ?"), r.push(s.port)), s.username !== void 0 && (t.push("username = ?"), r.push(s.username)), s.password !== void 0 && (t.push("password = ?"), r.push(s.password)), s.type !== void 0 && (t.push("type = ?"), r.push(s.type)), s.status !== void 0 && (t.push("status = ?"), r.push(s.status)), s.collection_id !== void 0 && (t.push("collection_id = ?"), r.push(s.collection_id)), r.push(e), n.prepare(`
      UPDATE proxies SET ${t.join(", ")} WHERE id = ?
    `).run(...r), this.getById(e);
  },
  delete(e) {
    return o().prepare("DELETE FROM proxies WHERE id = ?").run(e);
  },
  deleteAll() {
    const e = o();
    return e.transaction(() => {
      const t = e.prepare("SELECT COUNT(*) as count FROM proxies").get()?.count || 0;
      return e.exec("DROP INDEX IF EXISTS idx_proxies_status"), e.exec("DROP INDEX IF EXISTS idx_proxies_collection_id"), e.prepare("DELETE FROM proxies").run(), e.exec("CREATE INDEX IF NOT EXISTS idx_proxies_status ON proxies(status)"), e.exec("CREATE INDEX IF NOT EXISTS idx_proxies_collection_id ON proxies(collection_id)"), {
        changes: t,
        proxiesDeleted: t
      };
    })();
  },
  markUsed(e) {
    o().prepare("UPDATE proxies SET last_used = CURRENT_TIMESTAMP WHERE id = ?").run(e);
  },
  bulkCreate(e, s = null) {
    const n = o(), t = n.prepare(`
      INSERT INTO proxies (host, port, username, password, type, status, collection_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return n.transaction((p) => {
      for (const u of p)
        t.run(
          u.host,
          u.port,
          u.username || null,
          u.password || null,
          u.type || "socks5",
          u.status || "active",
          u.collection_id !== void 0 ? u.collection_id : s || null
        );
    })(e), this.getAll(s || null);
  },
  // Format proxy string for MLX API
  formatForMLX(e) {
    return e.username && e.password ? `${e.host}:${e.port}:${e.username}:${e.password}` : `${e.host}:${e.port}`;
  },
  // Parse proxy string (format: host:port:user:pass or host:port)
  parseProxyString(e) {
    const s = e.split(":");
    if (s.length < 2)
      throw new Error("Invalid proxy format. Expected: host:port or host:port:user:pass");
    return {
      host: s[0],
      port: parseInt(s[1], 10),
      username: s[2] || null,
      password: s[3] || null,
      type: "socks5",
      status: "active"
    };
  }
};
export {
  l as ProxyModel
};
