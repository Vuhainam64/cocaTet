import { getDatabase } from "./index-BKqdccDo.js";
const AccountModel = {
  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
            INSERT INTO accounts (name, token, status, collection_id)
            VALUES (?, ?, ?, ?)
        `);
    const result = stmt.run(
      data.name,
      data.token,
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
            SELECT * FROM accounts ${whereClause}
            ORDER BY created_at DESC
        `).all(...params);
  },
  getById(id) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
  },
  update(id, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];
    if (data.name !== void 0) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.token !== void 0) {
      fields.push("token = ?");
      values.push(data.token);
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
            UPDATE accounts SET ${fields.join(", ")} WHERE id = ?
        `);
    stmt.run(...values);
    return this.getById(id);
  },
  delete(id) {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM accounts WHERE id = ?");
    return stmt.run(id);
  },
  bulkCreate(accounts, collectionId = null) {
    const db = getDatabase();
    const insert = db.prepare(`
            INSERT INTO accounts (name, token, status, collection_id)
            VALUES (?, ?, ?, ?)
        `);
    const insertMany = db.transaction((accounts2) => {
      for (const account of accounts2) {
        insert.run(
          account.name,
          account.token,
          account.status || "active",
          account.collection_id !== void 0 ? account.collection_id : collectionId || null
        );
      }
    });
    insertMany(accounts);
    return this.getAll(collectionId || null);
  }
};
export {
  AccountModel
};
