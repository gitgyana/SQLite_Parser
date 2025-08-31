const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { createObjectCsvStringifier } = require('csv-writer');
const fs = require('fs');

const upload = multer({ dest: '/tmp/' });

function escapeCSVField(value) {
    return typeof value === 'string' && value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
}

function run(req, res) {
    upload.single('dbFile')(req, res, async (err) => {
        if (err || !req.file) {
            return res.status(400).send('No file uploaded');
        }
        const dbPath = req.file.path;
        const table = req.body.table;
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                cleanup();
                return res.status(500).send('Failed to open DB');
            }
            const query = table === 'ALL'
                ? "SELECT name FROM sqlite_master WHERE type='table'"
                : null;
            if (query) {
                db.all(query, [], (err, tables) => {
                    if (err) {
                        cleanup();
                        return res.status(500).send('Failed to read tables');
                    }
                    exportTables(tables.map(t => t.name));
                });
            } else {
                exportTables([table]);
            }

            function exportTables(tables) {
                const exportTable = tables[0];
                db.all(`SELECT * FROM ${exportTable}`, [], async (err, rows) => {
                    if (err) {
                        cleanup();
                        return res.status(500).send('Failed to read table data');
                    }
                    if (!rows.length) {
                        cleanup();
                        return res.status(400).send('Table is empty');
                    }
                    const fields = Object.keys(rows[0]);
                    const header = fields.join(',') + '\n';
                    const data = rows.map(row =>
                        fields.map(k => escapeCSVField(row[k])).join(',')
                    ).join('\n');
                    cleanup();
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', `attachment; filename="${exportTable}.csv"`);
                    res.send(header + data);
                });
            }

            function cleanup() {
                db.close();
                fs.unlink(dbPath, () => {});
            }
        });
    });
}

export default (req, res) => {
    if (req.method === 'POST') {
        run(req, res);
    } else {
        res.status(405).end();
    }
};
