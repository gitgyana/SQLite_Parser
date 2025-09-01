const dbFileInput = document.getElementById('dbFile');
const tableSelect = document.getElementById('tableSelect');
const exportBtn = document.getElementById('exportBtn');
const messageDiv = document.getElementById('message');

dbFileInput.addEventListener('change', async () => {
    const file = dbFileInput.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
        messageDiv.textContent = 'File too large. Please use a database under 4MB for online processing.';
        return;
    }

    messageDiv.textContent = 'Reading tables...';
    tableSelect.innerHTML = '<option value="ALL">All Tables</option>';
    tableSelect.disabled = true;
    exportBtn.disabled = true;

    // Send file to backend to get list of tables
    const formData = new FormData();
    formData.append('dbFile', file);

    try {
        const res = await fetch('/api/tables', { // Your backend endpoint to get tables
            method: 'POST',
            body: formData
        });
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

    if (!dbFileInput.files[0]) return;

    messageDiv.style.color = 'black';
    messageDiv.textContent = 'Exporting... Please wait.';

    const formData = new FormData();
    formData.append('dbFile', dbFileInput.files[0]);
    formData.append('table', tableSelect.value);

    try {
        const res = await fetch('/api/export', { // Your backend export endpoint
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

        // The server should respond with a CSV file
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
