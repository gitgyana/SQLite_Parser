document.addEventListener('DOMContentLoaded', () => {
    const dbFileInput = document.getElementById('dbFile');
    const fileNameSpan = document.getElementById('file-label');
    const tableSelect = document.querySelector('label[for="tableSelect"]');
    const selectElement = document.getElementById('tableSelect');
    const option = selectElement.querySelector('option[value="ALL"]');

    tableSelect.style.display = 'none';
    selectElement.style.display = 'none';
    option.style.display = 'none';

    dbFileInput.addEventListener('change', () => {
        fileNameSpan.textContent = dbFileInput.files[0] ? dbFileInput.files[0].name : 'No file chosen';

        tableSelect.style.display = 'block';
        selectElement.style.display = 'block';
        option.style.display = 'block';
    });
});
