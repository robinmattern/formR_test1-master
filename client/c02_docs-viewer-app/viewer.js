// Document renderer for different file types
async function renderDocument(fileType, fileUrl, containerId) {
    const container = document.getElementById(containerId);
    
    try {
        switch (fileType.toLowerCase()) {
            case 'txt':
                await renderText(fileUrl, container);
                break;
            case 'json':
                await renderJSON(fileUrl, container);
                break;
            case 'md':
                await renderMarkdown(fileUrl, container);
                break;
            case 'html':
                renderHTML(fileUrl, container);
                break;
            case 'pdf':
                await renderPDF(fileUrl, container);
                break;
            case 'docx':
                await renderWord(fileUrl, container);
                break;
            case 'xlsx':
                await renderExcel(fileUrl, container);
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                renderImage(fileUrl, container);
                break;
            case 'mp4':
            case 'webm':
            case 'mov':
            case 'avi':
                renderVideo(fileUrl, container);
                break;
            default:
                const p1 = document.createElement('p');
                p1.textContent = `File type "${fileType}" not supported for viewing. `;
                const a1 = document.createElement('a');
                a1.href = fileUrl;
                a1.download = '';
                a1.textContent = 'Download file';
                p1.appendChild(a1);
                container.innerHTML = '';
                container.appendChild(p1);
        }
    } catch (error) {
        const p2 = document.createElement('p');
        p2.textContent = `Error rendering document: ${error.message}. `;
        const a2 = document.createElement('a');
        a2.href = fileUrl;
        a2.download = '';
        a2.textContent = 'Download file';
        p2.appendChild(a2);
        container.innerHTML = '';
        container.appendChild(p2);
    }
}

async function renderText(fileUrl, container) {
    const response = await fetch(fileUrl);
    const text = await response.text();
    const lines = text.split('\n');
    const numberedLines = lines.map((line, i) => `${(i + 1).toString().padStart(3, ' ')}: ${line}`).join('\n');
    
    const div = document.createElement('div');
    div.className = 'line-numbers';
    div.textContent = numberedLines;
    container.innerHTML = '';
    container.appendChild(div);
}

async function renderJSON(fileUrl, container) {
    const response = await fetch(fileUrl);
    const json = await response.json();
    const formatted = JSON.stringify(json, null, 2);
    
    const pre = document.createElement('pre');
    pre.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 4px;';
    pre.textContent = formatted;
    container.innerHTML = '';
    container.appendChild(pre);
}

async function renderMarkdown(fileUrl, container) {
    const response = await fetch(fileUrl);
    const markdown = await response.text();
    const html = marked.parse(markdown);
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: 500px; border: 1px solid #ccc;';
    iframe.sandbox = 'allow-same-origin allow-scripts';
    iframe.srcdoc = html;
    container.innerHTML = '';
    container.appendChild(iframe);
}

function renderHTML(fileUrl, container) {
    const iframe = document.createElement('iframe');
    iframe.src = fileUrl;
    iframe.style.cssText = 'width: 100%; height: 500px; border: 1px solid #ccc;';
    iframe.sandbox = 'allow-same-origin';
    container.innerHTML = '';
    container.appendChild(iframe);
}

async function renderPDF(fileUrl, container) {
    const pdf = await pdfjsLib.getDocument(fileUrl).promise;
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-container';
    container.innerHTML = '';
    container.appendChild(pdfContainer);
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.2 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.display = 'block';
        canvas.style.margin = '10px 0';
        
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        pdfContainer.appendChild(canvas);
    }
}

async function renderWord(fileUrl, container) {
    const response = await fetch( fileUrl );
    const arrayBuffer = await response.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: 500px; border: 1px solid #ccc;';
    iframe.sandbox = 'allow-same-origin allow-scripts';
    iframe.srcdoc = result.value;
    container.innerHTML = '';
    container.appendChild(iframe);
}

async function renderExcel(fileUrl, container) {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    container.innerHTML = '';
    
    workbook.SheetNames.forEach(sheetName => {
        const h4 = document.createElement('h4');
        h4.textContent = `Sheet: ${sheetName}`;
        container.appendChild(h4);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const table = document.createElement('table');
        table.style.cssText = 'border-collapse: collapse; width: 100%;';
        
        jsonData.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.style.cssText = 'border: 1px solid #ccc; padding: 4px;';
                td.textContent = cell || '';
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        
        container.appendChild(table);
    });
}

function renderImage(fileUrl, container) {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    const img = document.createElement('img');
    img.src = fileUrl;
    img.style.cssText = 'max-width: 100%; height: auto; border: 1px solid #ccc;';
    img.alt = 'Document image';
    div.appendChild(img);
    container.innerHTML = '';
    container.appendChild(div);
}

function renderVideo(fileUrl, container) {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    const video = document.createElement('video');
    video.controls = true;
    video.style.cssText = 'max-width: 100%; height: auto;';
    const source = document.createElement('source');
    source.src = fileUrl;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.textContent = 'Your browser does not support the video tag.';
    div.appendChild(video);
    container.innerHTML = '';
    container.appendChild(div);
}