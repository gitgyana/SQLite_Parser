document.addEventListener('DOMContentLoaded', () => {
    const dbFileInput = document.getElementById('dbFile');
    const fileNameSpan = document.getElementById('file-label');

    dbFileInput.addEventListener('change', () => {
        fileNameSpan.textContent = dbFileInput.files[0] ? dbFileInput.files[0].name : 'No file chosen';
    });
});
