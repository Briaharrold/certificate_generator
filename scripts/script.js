let certificates = [];
let currentIndex = 0;
let selectedTemplate = 'template1';
let certificateText = 'Certificate of Completion'; // Default text
let certificateDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // Default to today's date

const img = document.querySelector("img");
img.loading = "lazy";

function generateCertificates() {
    const input = document.getElementById('nameInput').value;
    const lines = input.trim().split('\n');
    selectedTemplate = document.getElementById('templateSelect').value;
    
    // Get certificate text and date from input fields
    const textInput = document.getElementById('certificateText');
    const dateInput = document.getElementById('certificateDate');
    
    if (textInput && textInput.value.trim()) {
        certificateText = textInput.value.trim();
    }
    
  if (dateInput && dateInput.value) {
    const [year, month, day] = dateInput.value.split('-');
    const localDate = new Date(year, month - 1, day);
    certificateDate = localDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
    
    console.log('Selected template:', selectedTemplate);
    console.log('Certificate text:', certificateText);
    console.log('Certificate date:', certificateDate);
    
    certificates = lines
        .map(line => {
            if (/\d/.test(line)) {
                alert('Names should not contain numbers. Please correct the input.');
                return null;
            }
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
    }
    else {
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
                ${createCertificateHTML(cert.firstName, cert.lastName, selectedTemplate)}
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

function createCertificateHTML(firstName, lastName, selectedTemplate) {
    const fullName = firstName + '  ' + lastName;
    console.log('Full name:', fullName, 'Length:', fullName.length);

  let fullNameFontSize = '87px';
if (fullName.length >= 35) {
    alert('Name is too long! Please shorten the name to 34 characters or less please ;)');
    return '';
}
else if (fullName.length >= 34) {
    fullNameFontSize = '45px';
}
else if (fullName.length >= 33) {
    fullNameFontSize = '46px';
}
else if (fullName.length >= 32) {
    fullNameFontSize = '46px';
}
else if (fullName.length >= 31) {
    fullNameFontSize = '46px';
}
else if (fullName.length >= 30) {
    fullNameFontSize = '46px';
}
//Line breaks here 
else if (fullName.length >= 29) {
    fullNameFontSize = '37px';
}
else if (fullName.length >= 28) {
    fullNameFontSize = '47px';
}
else if (fullName.length >= 27) {
    fullNameFontSize = '47px';
}
else if (fullName.length >= 26) {
    fullNameFontSize = '47px';
}
else if (fullName.length >= 25) {
    fullNameFontSize = '58px';
}
else if (fullName.length >= 24) {
    fullNameFontSize = '59px';
}
else if (fullName.length >= 23) {
    fullNameFontSize = '62px';
}
else if (fullName.length >= 22) {
    fullNameFontSize = '57px';
}
else if (fullName.length >= 21) {
    fullNameFontSize = '58px';
}
else if (fullName.length >= 20) {
    fullNameFontSize = '59px';
}
else if (fullName.length >= 19) {
    fullNameFontSize = '60px';
}
else if (fullName.length >= 18) {
    fullNameFontSize = '61px';
}
else if (fullName.length >= 17) {
    fullNameFontSize = '70px';
}
else if (fullName.length >= 16) {
    fullNameFontSize = '74px';
}
else if (fullName.length >= 15) {
    fullNameFontSize = '77px';
}
else if (fullName.length >= 14) {
    fullNameFontSize = '80px';
}
else if (fullName.length >= 13) {
    fullNameFontSize = '83px';
}
else if (fullName.length >= 12) {
    fullNameFontSize = '85px';
}
else {
    fullNameFontSize = '87px';
} 
    return `
    <div class="certificate" style="background-image: url('../images/${selectedTemplate === 'template1' ? 'certificate-template.png' : 'certificate-template2.png'}'); background-size: cover; background-position: center;">
        <div class="certificate-text-overlay">
            ${certificateText}
        </div>
        <div class="certificate-name-overlay date-font" style="font-size: ${fullNameFontSize} !important;">
            <span class="name-orange">${firstName}</span>${lastName ? '<span class="name-blue"> ' + lastName + '</span>' : ''}
        </div>
        <div class="certificate-date-overlay">
            ${certificateDate}
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
    printArea.innerHTML = `<div class="print-certificate">${createCertificateHTML(certificates[currentIndex].firstName, certificates[currentIndex].lastName, selectedTemplate)}</div>`;
    printArea.style.display = 'block';

    setTimeout(() => {
        window.print();
        printArea.style.display = 'none';
    }, 100);
}

function printAll() {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = certificates.map(cert =>
        `<div class="print-certificate">${createCertificateHTML(cert.firstName, cert.lastName, selectedTemplate)}</div>`
    ).join('');
    printArea.style.display = 'block';
    setTimeout(() => {
        window.print();
        printArea.style.display = 'none';
    }, 100);
}