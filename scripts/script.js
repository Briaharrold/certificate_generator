let certificates = [];
let currentIndex = 0;
let selectedTemplate = 'template1';
let certificateText = 'Certificate of Completion';
let certificateDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
let customTemplateURL = null;

// Position variables
let textTopPosition = 52;
let nameTopPosition = 51;
let dateBottomPosition = 50;

// Upload logo variables
let schoolLogoURL = null;
let logoSize = 100;
let logoPosition = 'custom';

// logo custom position variables
let logoHorizontal = 2;
let logoVertical = 2;

const img = document.querySelector("img");
if (img) {
    img.loading = "lazy";
}

function getLogoPositionStyles() {
    // Preset positions
    const presets = {
        'top-left': { top: '2%', left: '2%' },
        'top-center': { top: '2%', left: '50%', transform: 'translateX(-50%)' },
        'top-right': { top: '2%', right: '2%' },
        'bottom-left': { bottom: '2%', left: '2%' },
        'bottom-center': { bottom: '2%', left: '50%', transform: 'translateX(-50%)' },
        'bottom-right': { bottom: '2%', right: '2%' }
    };
    
    // If custom, use slider values
    if (logoPosition === 'custom') {
        return {
            top: logoVertical + '%',
            left: logoHorizontal + '%'
        };
    }
    
    return presets[logoPosition] || presets['top-left'];
}

function updateLogoPosition() {
    logoPosition = document.getElementById('logoPosition').value;
    
    // If a preset is selected, update sliders to match
    if (logoPosition !== 'custom') {
        const presetValues = {
            'top-left': { h: 2, v: 2 },
            'top-center': { h: 50, v: 2 },
            'top-right': { h: 98, v: 2 },
            'bottom-left': { h: 2, v: 98 },
            'bottom-center': { h: 50, v: 98 },
            'bottom-right': { h: 98, v: 98 }
        };
        
        if (presetValues[logoPosition]) {
            logoHorizontal = presetValues[logoPosition].h;
            logoVertical = presetValues[logoPosition].v;
            
            document.getElementById('logoHorizontal').value = logoHorizontal;
            document.getElementById('logoVertical').value = logoVertical;
            document.getElementById('logoHorizontalValue').textContent = logoHorizontal + '%';
            document.getElementById('logoVerticalValue').textContent = logoVertical + '%';
        }
    }
    
    // Update preview if certificates exist
    if (certificates.length > 0) {
        updatePreview();
    }
}

function updateLogoCustomPosition() {
    // Set to custom mode when sliders are moved
    document.getElementById('logoPosition').value = 'custom';
    logoPosition = 'custom';
    
    logoHorizontal = parseFloat(document.getElementById('logoHorizontal').value);
    logoVertical = parseFloat(document.getElementById('logoVertical').value);
    
    document.getElementById('logoHorizontalValue').textContent = logoHorizontal + '%';
    document.getElementById('logoVerticalValue').textContent = logoVertical + '%';
    
    // Update preview if certificates exist
    if (certificates.length > 0) {
        updatePreview();
    }
}

// ONLY ONE updateLogoSize function
function updateLogoSize() {
    logoSize = document.getElementById('logoSize').value;
    document.getElementById('logoSizeValue').textContent = logoSize + 'px';
    
    // Update preview if certificates exist
    if (certificates.length > 0) {
        updatePreview();
    }
}

function toggleCustomUpload() {
    const select = document.getElementById('templateSelect');
    const uploadSection = document.getElementById('customUploadSection');
    
    if (select.value === 'custom') {
        uploadSection.style.display = 'block';
    } else {
        uploadSection.style.display = 'none';
        customTemplateURL = null;
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // File size check (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            alert('Logo file too large! Please upload an image under 2MB.');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                compressAndResizeLogo(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function compressAndResizeLogo(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let width = img.width;
    let height = img.height;
    const maxSize = 400;
    
    if (width > height) {
        if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
        }
    } else {
        if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
        }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    schoolLogoURL = canvas.toDataURL('image/jpeg', 0.8);
    
    document.getElementById('logoPreview').style.display = 'block';
    document.getElementById('logoPreviewImg').src = schoolLogoURL;
    
    console.log('Logo uploaded and compressed:', width, 'x', height);
    
    if (certificates.length > 0) {
        updatePreview();
    }
}

function updateLogoPreview() {
    updateLogoPosition();
}

function removeLogo() {
    schoolLogoURL = null;
    document.getElementById('logoPreview').style.display = 'none';
    document.getElementById('schoolLogo').value = '';
    
    if (certificates.length > 0) {
        updatePreview();
    }
}

function handleCustomUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert('File too large! Please upload an image under 2MB.');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                if (img.width < 1280 || img.height < 720) {
                    alert('⚠️ Warning: Image resolution is low. For best print quality, use at least 1920x1440px.');
                }
                
                if (img.height > img.width) {
                    if (!confirm('This appears to be a portrait image. Certificates typically print better in landscape. Continue anyway?')) {
                        event.target.value = '';
                        return;
                    }
                }
                
                customTemplateURL = e.target.result;
                console.log('Custom template uploaded:', img.width, 'x', img.height);
                
                const uploadSection = document.getElementById('customUploadSection');
                let successMsg = uploadSection.querySelector('.upload-success');
                if (!successMsg) {
                    successMsg = document.createElement('div');
                    successMsg.className = 'upload-success';
                    successMsg.style.color = '#16a34a';
                    successMsg.style.marginTop = '5px';
                    successMsg.style.fontWeight = 'bold';
                    uploadSection.appendChild(successMsg);
                }
                successMsg.innerHTML = `✓ Template uploaded! (${img.width}x${img.height}px)`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function updateTextPosition() {
    textTopPosition = document.getElementById('textTopPosition').value;
    nameTopPosition = document.getElementById('nameTopPosition').value;
    dateBottomPosition = document.getElementById('dateTopPosition').value;
    
    document.getElementById('textTopValue').textContent = textTopPosition + '%';
    document.getElementById('nameTopValue').textContent = nameTopPosition + '%';
    document.getElementById('dateTopValue').textContent = dateBottomPosition + '%';
    
    if (certificates.length > 0) {
        updatePreview();
    }
}

function generateCertificates() {
    const input = document.getElementById('nameInput').value;
    const lines = input.trim().split('\n');
    selectedTemplate = document.getElementById('templateSelect').value;
    
    if (selectedTemplate === 'custom' && !customTemplateURL) {
        alert('Please upload a custom template first!');
        return;
    }
    
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

    let fullNameFontSize = '87px';
    if (fullName.length >= 35) {
        alert('Name is too long! Please shorten the name to 34 characters or less please ;)');
        return '';
    }
    else if (fullName.length >= 34) fullNameFontSize = '34px';
    else if (fullName.length >= 33) fullNameFontSize = '35px';
    else if (fullName.length >= 32) fullNameFontSize = '37px';
    else if (fullName.length >= 31) fullNameFontSize = '37px';
    else if (fullName.length >= 30) fullNameFontSize = '38px';
    else if (fullName.length >= 29) fullNameFontSize = '43px';
    else if (fullName.length >= 28) fullNameFontSize = '45px';
    else if (fullName.length >= 27) fullNameFontSize = '47px';
    else if (fullName.length >= 26) fullNameFontSize = '47px';
    else if (fullName.length >= 25) fullNameFontSize = '49px';
    else if (fullName.length >= 24) fullNameFontSize = '48px';
    else if (fullName.length >= 23) fullNameFontSize = '54px';
    else if (fullName.length >= 22) fullNameFontSize = '55px';
    else if (fullName.length >= 21) fullNameFontSize = '58px';
    else if (fullName.length >= 20) fullNameFontSize = '58px';
    else if (fullName.length >= 19) fullNameFontSize = '60px';
    else if (fullName.length >= 18) fullNameFontSize = '61px';
    else if (fullName.length >= 17) fullNameFontSize = '70px';
    else if (fullName.length >= 16) fullNameFontSize = '74px';
    else if (fullName.length >= 15) fullNameFontSize = '77px';
    else if (fullName.length >= 14) fullNameFontSize = '80px';
    else if (fullName.length >= 13) fullNameFontSize = '83px';
    else if (fullName.length >= 12) fullNameFontSize = '85px';
    else fullNameFontSize = '87px';
    
    let templateURL;
    if (selectedTemplate === 'custom' && customTemplateURL) {
        templateURL = customTemplateURL;
    } else if (selectedTemplate === 'template2') {
        templateURL = './images/certificate-template2.png';
    } else {
        templateURL = './images/certificate-template.png';
    }
    
    const logoStyles = getLogoPositionStyles();
    const logoStyleString = Object.entries(logoStyles)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
    
    const logoHTML = schoolLogoURL ? 
        `<img src="${schoolLogoURL}" 
              style="position: absolute; ${logoStyleString}; width: ${logoSize}px; height: ${logoSize}px; border-radius: 50%; object-fit: cover; z-index: 10;" 
              alt="School Logo" />` 
        : '';
    
    return `
    <div class="certificate" style="background-image: url('${templateURL}'); background-size: cover; background-position: center;">
        ${logoHTML}
        <div class="certificate-text-overlay" style="top: ${textTopPosition}% !important;">
            ${certificateText}
        </div>
        <div class="certificate-name-overlay date-font" style="font-size: ${fullNameFontSize} !important; top: ${nameTopPosition}% !important;">
            <span class="name-orange">${firstName}</span>${lastName ? '<span class="name-blue"> ' + lastName + '</span>' : ''}
        </div>
        <div class="certificate-date-overlay" style="bottom: ${dateBottomPosition}% !important;">
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
    
    if (selectedTemplate === 'custom' && customTemplateURL) {
        setTimeout(() => {
            window.print();
            printArea.style.display = 'none';
        }, 500);
    } else {
        const img = new Image();
        img.onload = () => {
            setTimeout(() => {
                window.print();
                printArea.style.display = 'none';
            }, 500);
        };
        img.onerror = () => {
            setTimeout(() => {
                window.print();
                printArea.style.display = 'none';
            }, 500);
        };
        // Setting the image source
        img.src = `./images/${selectedTemplate === 'template1' ? 'certificate-template.png' : 'certificate-template2.png'}`;
    }
}

function printAll() {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = certificates.map(cert =>
        `<div class="print-certificate">${createCertificateHTML(cert.firstName, cert.lastName, selectedTemplate)}</div>`
    ).join('');
    printArea.style.display = 'block';
    
    if (selectedTemplate === 'custom' && customTemplateURL) {
        setTimeout(() => {
            window.print();
            printArea.style.display = 'none';
        }, 1000);
    } else {
        const img = new Image();
        img.onload = () => {
            setTimeout(() => {
                window.print();
                printArea.style.display = 'none';
            }, 1000);
        };
        img.onerror = () => {
            setTimeout(() => {
                window.print();
                printArea.style.display = 'none';
            }, 1000);
        };
        img.src = `./images/${selectedTemplate === 'template1' ? 'certificate-template.png' : 'certificate-template2.png'}`;
    }
}