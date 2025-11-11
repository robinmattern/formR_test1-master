const API_BASE = `${window.FVARS.SERVER_API_URL}/docs` 
let currentDoc = null;

// Load documents on page load
document.addEventListener('DOMContentLoaded', loadDocuments);

async function loadDocuments() {
    try {
        const response = await fetch(API_BASE);
        const documents = await response.json();
        
        const select = document.getElementById('docSelect');
        select.innerHTML = '<option value="">Choose a document...</option>';
        
        documents.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.log(`  Error loading documents: ${encodeURIComponent(error.message)}`);
    }
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            fileInput.value = '';
            loadDocuments();
            console.log(`  File uploaded successfully`);
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.log(`  Error uploading file: ${encodeURIComponent(error.message)}`);
    }
}

async function showDocInfo() {
    const select = document.getElementById('docSelect');
    const docId = select.value;
    
    if (!docId) {
        document.getElementById('docInfo').innerHTML = 'Select a document to view its information.';
        document.getElementById('downloadBtn').style.display = 'none';
        document.getElementById('deleteBtn').style.display = 'none';
        currentDoc = null;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${docId}`);
        const doc = await response.json();
        currentDoc = doc;

        const date = new Date(doc.lastModified).toLocaleString();
        document.getElementById('docInfo').innerHTML = `
            Title: ${doc.title}<br>
            Path: ./${doc.filepath}<br>
            Updated: ${date}<br>
            Type: ${doc.type}
        `;
        
        document.getElementById('downloadBtn').style.display = 'inline-block';
        document.getElementById('deleteBtn').style.display = 'inline-block';
    } catch (error) {
        console.log(`  Error loading document info: ${encodeURIComponent(error.message)}`);
    }
}

function downloadDoc() {
    if (currentDoc) {
        const link = document.createElement('a');
        link.href = `http://localhost:3251/${currentDoc.filepath}`;
        link.download = currentDoc.title;
        link.click();
    }
}

async function deleteDoc() {
    if (!currentDoc) return;
    
    if (confirm(`Are you sure you want to delete "${currentDoc.title}"?`)) {
        try {
            const response = await fetch(`${API_BASE}/${currentDoc.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadDocuments();
                document.getElementById('docInfo').innerHTML = 'Select a document to view its information.';
                document.getElementById('downloadBtn').style.display = 'none';
                document.getElementById('deleteBtn').style.display = 'none';
                currentDoc = null;
                console.log(`  Document deleted successfully`);
            }
        } catch (error) {
            console.log(`  Error deleting document: ${encodeURIComponent(error.message)}`);
        }
    }
}