import { getDatabase } from '../index.js';

export const CodeCollectionModel = {
    create(data) {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO code_collections (name, note)
            VALUES (?, ?)
        `);
        const result = stmt.run(data.name, data.note || null);
        return this.getById(result.lastInsertRowid);
    },

    getAll() {
        const db = getDatabase();
        return db.prepare(`
            SELECT cc.*,
                   COUNT(c.id) AS code_count
            FROM code_collections cc
            LEFT JOIN codes c ON c.collection_id = cc.id
            GROUP BY cc.id
            ORDER BY cc.created_at DESC
        `).all();
    },

    getById(id) {
        const db = getDatabase();
        return db.prepare(`
            SELECT cc.*,
                   COUNT(c.id) AS code_count
            FROM code_collections cc
            LEFT JOIN codes c ON c.collection_id = cc.id
            WHERE cc.id = ?
            GROUP BY cc.id
        `).get(id);
    },

    update(id, data) {
        const db = getDatabase();
        const updates = [];
        const values = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.note !== undefined) {
            updates.push('note = ?');
            values.push(data.note);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const stmt = db.prepare(`
            UPDATE code_collections SET ${updates.join(', ')} WHERE id = ?
        `);
        stmt.run(...values);
        return this.getById(id);
    },

    delete(id) {
        const db = getDatabase();
        db.prepare('UPDATE codes SET collection_id = NULL WHERE collection_id = ?').run(id);
        const stmt = db.prepare('DELETE FROM code_collections WHERE id = ?');
        return stmt.run(id);
    },

    getCodes(collectionId) {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM codes
            WHERE collection_id = ?
            ORDER BY created_at DESC
        `).all(collectionId);
    },
};

