const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Set up storage directories for local use
const upload = multer({ dest: 'uploads/' });

app.post('/api/tables', upload.single('dbFile'), (req, res) => {
    const dbPath = req.file.path;
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
        if (err) {
            cleanup();
            return res.status(500).json({ error: 'Failed to open DB' });
        }
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
            cleanup();
            if (err) return res.status(500).json({ error: 'Failed to read tables' });
            res.json({ tables: rows.map(r => r.name) });
        });
        function cleanup() {
            db.close();
            fs.unlink(dbPath, () => {});
        }
    });
});

app.post('/api/export', upload.single('dbFile'), (req, res) => {
    const dbPath = req.file.path;
    const table = req.body.table;
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
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
                    fields.map(k => (typeof row[k] === 'string' && row[k].includes(',') ? `"${row[k].replace(/"/g, '""')}"` : row[k])).join(',')
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
