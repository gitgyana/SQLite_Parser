const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

// POST /tables - receive DB file, return list of tables
app.post('/tables', upload.single('dbFile'), (req, res) => {
    const dbPath = req.file.path;

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            cleanup();
            return res.status(500).json({ error: 'Failed to open DB' });
        }

        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
            cleanup();
            if (err) {
                return res.status(500).json({ error: 'Failed to read tables' });
            }

            const tables = rows.map(r => r.name);
            res.json({ tables });
        });

        function cleanup() {
            db.close();
            fs.unlink(dbPath, () => {});
        }
    });
});

// POST /export - receive DB file + table, return CSV
app.post('/export', upload.single('dbFile'), (req, res) => {
    const dbPath = req.file.path;
    const table = req.body.table;

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            cleanup();
            return res.status(500).send('Failed to open DB');
        }

        const query = table === 'ALL' ?
            "SELECT name FROM sqlite_master WHERE type='table'" :
            null;

        if (query) {
            // Export all tables
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
            // For simplicity, export only first table if multiple (you can extend)
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

                const headers = Object.keys(rows[0]).map(name => ({id: name, title: name}));
                const fileName = `${exportTable}.csv`;
                const filePath = path.join('output', fileName);

                const csvWriter = createCsvWriter({
                    path: filePath,
                    header: headers
                });

                await csvWriter.writeRecords(rows);

                cleanup();

                res.download(filePath, fileName, (err) => {
                    if (err) console.error(err);
                    fs.unlink(filePath, () => {});
                });
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
