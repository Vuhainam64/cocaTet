import { getDatabase } from '../index.js';

export const ProxyModel = {
    create(data) {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT INTO proxies (host, port, username, password, type, status, collection_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            data.host,
            data.port,
            data.username || null,
            data.password || null,
            data.type || 'socks5',
            data.status || 'active',
            data.collection_id || null
        );
        return this.getById(result.lastInsertRowid);
    },

    getAll(collectionId = null, status = null) {
        const db = getDatabase();
        const where = [];
        const params = [];
        if (collectionId !== null && collectionId !== undefined) {
            where.push('collection_id = ?');
            params.push(collectionId);
        }
        if (status) {
            where.push('status = ?');
            params.push(status);
        }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        return db.prepare(`
      SELECT * FROM proxies ${whereClause}
      ORDER BY created_at DESC
    `).all(...params);
    },

    getById(id) {
        const db = getDatabase();
        return db.prepare('SELECT * FROM proxies WHERE id = ?').get(id);
    },

    getAvailable() {
        const db = getDatabase();
        return db.prepare(`
      SELECT * FROM proxies WHERE status = 'active' ORDER BY last_used ASC NULLS FIRST
    `).all();
    },

    update(id, data) {
        const db = getDatabase();
        const fields = [];
        const values = [];

        if (data.host !== undefined) {
            fields.push('host = ?');
            values.push(data.host);
        }
        if (data.port !== undefined) {
            fields.push('port = ?');
            values.push(data.port);
        }
        if (data.username !== undefined) {
            fields.push('username = ?');
            values.push(data.username);
        }
        if (data.password !== undefined) {
            fields.push('password = ?');
            values.push(data.password);
        }
        if (data.type !== undefined) {
            fields.push('type = ?');
            values.push(data.type);
        }
        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
        }
        if (data.collection_id !== undefined) {
            fields.push('collection_id = ?');
            values.push(data.collection_id);
        }

        values.push(id);

        const stmt = db.prepare(`
      UPDATE proxies SET ${fields.join(', ')} WHERE id = ?
    `);
        stmt.run(...values);
        return this.getById(id);
    },

    delete(id) {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM proxies WHERE id = ?');
        return stmt.run(id);
    },

    deleteAll() {
        const db = getDatabase();
        const runDeleteAll = db.transaction(() => {
            const countResult = db.prepare('SELECT COUNT(*) as count FROM proxies').get();
            const totalProxies = countResult?.count || 0;

            // Temporarily drop heavy indexes to speed up bulk deletion
            db.exec('DROP INDEX IF EXISTS idx_proxies_status');
            db.exec('DROP INDEX IF EXISTS idx_proxies_collection_id');

            // Delete all proxies in a single fast statement
            const deleteStmt = db.prepare('DELETE FROM proxies');
            deleteStmt.run();

            // Recreate indexes for future queries
            db.exec('CREATE INDEX IF NOT EXISTS idx_proxies_status ON proxies(status)');
            db.exec('CREATE INDEX IF NOT EXISTS idx_proxies_collection_id ON proxies(collection_id)');

            return {
                changes: totalProxies,
                proxiesDeleted: totalProxies,
            };
        });

        return runDeleteAll();
    },

    markUsed(id) {
        const db = getDatabase();
        const stmt = db.prepare('UPDATE proxies SET last_used = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(id);
    },

    bulkCreate(proxies, collectionId = null) {
        const db = getDatabase();
        const insert = db.prepare(`
      INSERT INTO proxies (host, port, username, password, type, status, collection_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        const insertMany = db.transaction((proxies) => {
            for (const proxy of proxies) {
                insert.run(
                    proxy.host,
                    proxy.port,
                    proxy.username || null,
                    proxy.password || null,
                    proxy.type || 'socks5',
                    proxy.status || 'active',
                    proxy.collection_id !== undefined ? proxy.collection_id : collectionId || null
                );
            }
        });

        insertMany(proxies);
        return this.getAll(collectionId || null);
    },

    // Format proxy string for MLX API
    formatForMLX(proxy) {
        if (proxy.username && proxy.password) {
            return `${proxy.host}:${proxy.port}:${proxy.username}:${proxy.password}`;
        }
        return `${proxy.host}:${proxy.port}`;
    },

    // Parse proxy string (format: host:port:user:pass or host:port)
    parseProxyString(proxyString) {
        const parts = proxyString.split(':');
        if (parts.length < 2) {
            throw new Error('Invalid proxy format. Expected: host:port or host:port:user:pass');
        }
        return {
            host: parts[0],
            port: parseInt(parts[1], 10),
            username: parts[2] || null,
            password: parts[3] || null,
            type: 'socks5',
            status: 'active',
        };
    },

    deleteAll(collectionId = null) {
        const db = getDatabase();
        if (collectionId !== null && collectionId !== undefined) {
            const stmt = db.prepare('DELETE FROM proxies WHERE collection_id = ?');
            return stmt.run(collectionId);
        } else {
            const stmt = db.prepare('DELETE FROM proxies');
            return stmt.run();
        }
    },
};
