const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const upload = multer({ dest: '/tmp/' });

function run(req, res) {
    upload.single('dbFile')(req, res, (err) => {
        if (err || !req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const dbPath = req.file.path;
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                cleanup();
                return res.status(500).json({ error: 'Failed to open DB' });
            }
            db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
                cleanup();
                if (err) return res.status(500).json({ error: 'Failed to read tables' });
                res.json({ tables: rows.map(r => r.name) });
            });
        });

        function cleanup() {
            db.close();
            fs.unlink(dbPath, () => {});
        }
    });
}

export default (req, res) => {
    if (req.method === 'POST') {
        run(req, res);
    } else {
        res.status(405).end();
    }
};
