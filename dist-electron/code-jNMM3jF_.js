import { g as getDatabase } from "./index-B4ntsY6U.js";
const CodeModel = {
  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
            INSERT INTO codes (code, status, collection_id)
            VALUES (?, ?, ?)
        `);
    const result = stmt.run(
      data.code.toUpperCase(),
      data.status || "active",
      data.collection_id || null
    );
    return this.getById(result.lastInsertRowid);
  },
  getAll(collectionId = null, status = null) {
    const db = getDatabase();
    const where = [];
    const params = [];
    if (collectionId !== null && collectionId !== void 0) {
      where.push("collection_id = ?");
      params.push(collectionId);
    }
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    return db.prepare(`
            SELECT * FROM codes ${whereClause}
            ORDER BY created_at DESC
        `).all(...params);
  },
  getById(id) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM codes WHERE id = ?").get(id);
  },
  update(id, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];
    if (data.code !== void 0) {
      fields.push("code = ?");
      values.push(data.code.toUpperCase());
    }
    if (data.status !== void 0) {
      fields.push("status = ?");
      values.push(data.status);
    }
    if (data.collection_id !== void 0) {
      fields.push("collection_id = ?");
      values.push(data.collection_id);
    }
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = db.prepare(`
            UPDATE codes SET ${fields.join(", ")} WHERE id = ?
        `);
    stmt.run(...values);
    return this.getById(id);
  },
  delete(id) {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM codes WHERE id = ?");
    return stmt.run(id);
  },
  bulkCreate(codes, collectionId = null) {
    const db = getDatabase();
    const insert = db.prepare(`
            INSERT INTO codes (code, status, collection_id)
            VALUES (?, ?, ?)
        `);
    const insertMany = db.transaction((codes2) => {
      for (const code of codes2) {
        insert.run(
          code.code.toUpperCase(),
          code.status || "active",
          code.collection_id !== void 0 ? code.collection_id : collectionId || null
        );
      }
    });
    insertMany(codes);
    return this.getAll(collectionId || null);
  }
};
export {
  CodeModel
};
