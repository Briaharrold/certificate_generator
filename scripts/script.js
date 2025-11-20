let certificates = [];
let currentIndex = 0;

function generateCertificates() {
    const input = document.getElementById('nameInput').value;
    const lines = input.trim().split('\n');
    
    certificates = lines
        .map(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
                const firstName = parts.slice(0, -1).join(' ').toUpperCase();
                const lastName = parts[parts.length - 1].toUpperCase();
                return { firstName, lastName };
            } else if (parts.length === 1 && parts[0]) {
                return { firstName: parts[0].toUpperCase(), lastName: '' };
            }
            return null;
        })
        .filter(name => name !== null);

    if (certificates.length > 0) {
        currentIndex = 0;
        updatePreview();
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('successMessage').innerHTML = `<strong>✓ ${certificates.length} certificate(s) ready!</strong> Use the preview to check them.`;
    } else {
        alert('Please enter at least one valid name.');
    }
}

function updatePreview() {
    const previewSection = document.getElementById('previewSection');
    const cert = certificates[currentIndex];
    
    previewSection.innerHTML = `
        <div class="navigation">
            <div style="font-weight: bold; color: #6b7280;">
                Certificate ${currentIndex + 1} of ${certificates.length}
            </div>
            <div class="nav-buttons">
                <button onclick="prevCertificate()" ${currentIndex === 0 ? 'disabled' : ''}>
                    ← Prev
                </button>
                <button onclick="nextCertificate()" ${currentIndex === certificates.length - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        </div>
        
        <div class="preview-container">
            <div class="preview-wrapper">
                ${createCertificateHTML(cert.firstName, cert.lastName)}
            </div>
        </div>

        <div class="button-group">
            <button class="button button-success" onclick="printCurrent()">
                🖨️ Print Current
            </button>
            <button class="button button-purple" onclick="printAll()">
                🖨️ Print All (${certificates.length})
            </button>
        </div>

        <div class="alert alert-info">
            <strong>💡 Tip:</strong> For best results, print in landscape mode and enable "Background graphics" in your print settings.
        </div>
    `;
}

function createCertificateHTML(firstName, lastName) {
    return `
        <div class="certificate">
            <div class="certificate-name-overlay">
                <span class="name-orange">${firstName}</span>${lastName ? '<span class="name-blue"> ' + lastName + '</span>' : ''}
            </div>
        </div>
    `;
}

function prevCertificate() {
    if (currentIndex > 0) {
        currentIndex--;
        updatePreview();
    }
}

function nextCertificate() {
    if (currentIndex < certificates.length - 1) {
        currentIndex++;
        updatePreview();
    }
}

function printCurrent() {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `<div class="print-certificate">${createCertificateHTML(certificates[currentIndex].firstName, certificates[currentIndex].lastName)}</div>`;
    printArea.style.display = 'block';
    window.print();
    printArea.style.display = 'none';
}

function printAll() {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = certificates.map(cert => 
        `<div class="print-certificate">${createCertificateHTML(cert.firstName, cert.lastName)}</div>`
    ).join('');
    printArea.style.display = 'block';
    window.print();
    printArea.style.display = 'none';
}