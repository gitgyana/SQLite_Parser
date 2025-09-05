const dbFileInput = document.getElementById('dbFile');
const tableSelect = document.getElementById('tableSelect');
const exportBtn = document.getElementById('exportBtn');
const messageDiv = document.getElementById('message');

let dbInstance = null;

dbFileInput.addEventListener('change', async () => {
    const file = dbFileInput.files[0];
    if (!file) return;

    messageDiv.textContent = 'Reading tables...';
    tableSelect.innerHTML = '<option value="ALL">All Tables</option>';
    tableSelect.disabled = true;
    exportBtn.disabled = true;
    dbInstance = null;

    if (file.size > 4 * 1024 * 1024) {

        messageDiv.textContent = 'Processing large DB locally using browser SQL engine...';
        try {
            const buffer = await file.arrayBuffer();
            if (!window.initSqlJs) throw new Error('sql.js not loaded');
            const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
            dbInstance = new SQL.Database(new Uint8Array(buffer));

            const stmt = dbInstance.prepare("SELECT name FROM sqlite_master WHERE type='table'");
            let row;
            const tables = [];
            while (stmt.step()) {
                row = stmt.getAsObject();
                tables.push(row.name);
            }
            stmt.free();
            tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table;
                option.textContent = table;
                tableSelect.appendChild(option);
            });
            tableSelect.disabled = false;
            exportBtn.disabled = false;
            messageDiv.textContent = 'Select a table and click Export.';
        } catch (err) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Failed to process DB in browser: ' + err.message;
        }
        return;
    }


    const formData = new FormData();
    formData.append('dbFile', file);
    try {
        const res = await fetch('/api/tables', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
            data.tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table;
                option.textContent = table;
                tableSelect.appendChild(option);
            });
        }
        tableSelect.disabled = false;
        exportBtn.disabled = false;
        messageDiv.textContent = 'Select a table and click Export.';
    } catch (err) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Failed to load tables: ' + err.message;
    }
});

document.getElementById('exportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = dbFileInput.files[0];
    if (!file) return;
    messageDiv.style.color = 'black';
    messageDiv.textContent = 'Exporting... Please wait.';

    if (file.size > 4 * 1024 * 1024 && dbInstance) {
        const table = tableSelect.value;
        try {
            let csv = '';
            if (table === 'ALL') {

                csv = 'Exporting all tables in browser is not implemented.';
                throw new Error("Exporting all tables from large DB is not supported yet.");
            } else {

                const res = dbInstance.exec(`SELECT * FROM "${table}"`);
                if (res.length === 0) throw new Error('No data in table');
                const { columns, values } = res[0];
                csv += columns.join(',') + '\n';
                values.forEach(row => {
                    csv += row.map(val =>
                        typeof val === 'string' && val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val
                    ).join(',') + '\n';
                });

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${table}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'CSV downloaded successfully (browser side).';
            }
        } catch (err) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Export failed: ' + err.message;
        }
        return;
    }


    const formData = new FormData();
    formData.append('dbFile', file);
    formData.append('table', tableSelect.value);
    try {
        const res = await fetch('/api/export', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const blob = await res.blob();
        const filename = res.headers.get('Content-Disposition')?.split('filename=')[1] || 'export.csv';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/"/g, '');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'CSV downloaded successfully.';
    } catch (err) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Export failed: ' + err.message;
    }
});
