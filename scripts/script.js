let certificates = [];
let currentIndex = 0;
let selectedTemplate = 'template1';
let certificateText = 'Certificate of Completion';
let certificateDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
let customTemplateURL = null;

// Position variables (now in percentages)
let textTopPosition = 52;
let nameTopPosition = 51;
let dateBottomPosition = 50;

// Upload logo variables
let schoolLogoURL = null;
let logoSize = 100;
let logoLeft = 2;
let logoTop = 2;

// Drag state
let isDragging = false;
let dragElement = null;
let dragStartX = 0;
let dragStartY = 0;
let elementStartLeft = 0;
let elementStartTop = 0;

// Resize state
let isResizing = false;
let resizeElement = null;
let startFontSize = 0;
let nameFontSize = 87; // Default font size for name

const img = document.querySelector("img");
if (img) {
    img.loading = "lazy";
}

function updateLogoSize() {
    logoSize = document.getElementById('logoSize').value;
    document.getElementById('logoSizeValue').textContent = logoSize + 'px';
    
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
                    successMsg.style.cssText = 'margin-top: 10px; padding: 10px; background: #dcfce7; border: 1px solid #86efac; color: #166534; border-radius: 5px;';
                    uploadSection.appendChild(successMsg);
                }
                successMsg.textContent = `✓ Custom template loaded (${img.width}x${img.height}px)`;
                
                if (certificates.length > 0) {
                    updatePreview();
                }
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
    const lines = input.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        alert('Please enter at least one name.');
        return;
    }
    
    selectedTemplate = document.getElementById('templateSelect').value;
    
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
    
    // Reset font size when generating new certificates
    nameFontSize = 87;
    
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
        document.getElementById('successMessage').innerHTML = `<strong>✓ ${certificates.length} certificate(s) ready!</strong> Drag elements to position them.`;
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
            <div class="preview-wrapper" id="certificatePreview">
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
            <strong>💡 Tip:</strong> Drag elements to move them. Hover over the student name to see resize handles - drag them to adjust font size. For best print results, use landscape mode and enable "Background graphics".
        </div>
    `;
    
    // Initialize drag and drop after preview is rendered
    setTimeout(() => initializeDragAndDrop(), 100);
}

function createCertificateHTML(firstName, lastName, selectedTemplate) {
    const fullName = firstName + '  ' + lastName;

    // Always calculate the appropriate font size based on name length
    let calculatedFontSize = 87;
    
    if (fullName.length >= 35) {
        alert('Name is too long! Please shorten the name to 34 characters or less please ;)');
        return '';
    }
    else if (fullName.length >= 34) calculatedFontSize = 34;
    else if (fullName.length >= 33) calculatedFontSize = 35;
    else if (fullName.length >= 32) calculatedFontSize = 37;
    else if (fullName.length >= 31) calculatedFontSize = 37;
    else if (fullName.length >= 30) calculatedFontSize = 38;
    else if (fullName.length >= 29) calculatedFontSize = 43;
    else if (fullName.length >= 28) calculatedFontSize = 45;
    else if (fullName.length >= 27) calculatedFontSize = 47;
    else if (fullName.length >= 26) calculatedFontSize = 47;
    else if (fullName.length >= 25) calculatedFontSize = 49;
    else if (fullName.length >= 24) calculatedFontSize = 48;
    else if (fullName.length >= 23) calculatedFontSize = 54;
    else if (fullName.length >= 22) calculatedFontSize = 55;
    else if (fullName.length >= 21) calculatedFontSize = 58;
    else if (fullName.length >= 20) calculatedFontSize = 58;
    else if (fullName.length >= 19) calculatedFontSize = 60;
    else if (fullName.length >= 18) calculatedFontSize = 61;
    else if (fullName.length >= 17) calculatedFontSize = 70;
    else if (fullName.length >= 16) calculatedFontSize = 74;
    else if (fullName.length >= 15) calculatedFontSize = 77;
    else if (fullName.length >= 14) calculatedFontSize = 80;
    else if (fullName.length >= 13) calculatedFontSize = 83;
    else if (fullName.length >= 12) calculatedFontSize = 85;
    else calculatedFontSize = 87;
    
    // Use the smaller of the calculated size or the user-adjusted size
    // This ensures long names are always shrunk appropriately
    let fullNameFontSize;
    if (nameFontSize === 87) {
        // First time generating - use calculated size
        fullNameFontSize = calculatedFontSize + 'px';
        nameFontSize = calculatedFontSize; // Store it
    } else {
        // User has resized - use the minimum of calculated and user size
        // This prevents long names from being too big
        fullNameFontSize = Math.min(calculatedFontSize, nameFontSize) + 'px';
    }
    
    let templateURL;
    if (selectedTemplate === 'custom' && customTemplateURL) {
        templateURL = customTemplateURL;
    } else if (selectedTemplate === 'template2') {
        templateURL = './images/certificate-template2.png';
    } else {
        templateURL = './images/certificate-template.png';
    }
    
    const logoHTML = schoolLogoURL ? 
        `<img src="${schoolLogoURL}" 
              class="draggable-logo"
              data-type="logo"
              style="position: absolute; left: ${logoLeft}%; top: ${logoTop}%; width: ${logoSize}px; height: ${logoSize}px; border-radius: 50%; object-fit: cover; z-index: 10; cursor: move;" 
              alt="School Logo" />` 
        : '';
    
    return `
    <div class="certificate" style="background-image: url('${templateURL}'); background-size: cover; background-position: center;">
        ${logoHTML}
        <div class="certificate-text-overlay draggable-element" data-type="text" style="top: ${textTopPosition}% !important; cursor: move;">
            ${certificateText}
        </div>
        <div class="certificate-name-overlay draggable-element resizable-element date-font" data-type="name" style="font-size: ${fullNameFontSize} !important; top: ${nameTopPosition}% !important; cursor: move; position: relative;">
            <span class="name-orange">${firstName}</span>${lastName ? '<span class="name-blue"> ' + lastName + '</span>' : ''}
            <div class="resize-handle resize-handle-left" data-resize-direction="left"></div>
            <div class="resize-handle resize-handle-right" data-resize-direction="right"></div>
        </div>
        <div class="certificate-date-overlay draggable-element" data-type="date" style="bottom: ${dateBottomPosition}% !important; cursor: move;">
            ${certificateDate}
        </div>
    </div>
`;
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    const draggableElements = document.querySelectorAll('.draggable-element, .draggable-logo');
    const resizeHandles = document.querySelectorAll('.resize-handle');
    
    draggableElements.forEach(element => {
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDrag);
    });
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
        handle.addEventListener('touchstart', startResize);
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('mouseup', stopDragOrResize);
    document.addEventListener('touchend', stopDragOrResize);
}

function handleMouseMove(e) {
    if (isDragging) {
        drag(e);
    } else if (isResizing) {
        resize(e);
    }
}

function startDrag(e) {
    // Don't start dragging if clicking on a resize handle
    if (e.target.classList.contains('resize-handle')) {
        return;
    }
    
    isDragging = true;
    dragElement = e.target.closest('.draggable-element, .draggable-logo');
    
    if (!dragElement) return;
    
    // Prevent text selection
    e.preventDefault();
    
    const certificate = dragElement.closest('.certificate');
    const rect = certificate.getBoundingClientRect();
    
    // Get mouse/touch position
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    dragStartX = clientX;
    dragStartY = clientY;
    
    // Get current position
    const elementType = dragElement.dataset.type;
    
    if (elementType === 'logo') {
        const computedStyle = window.getComputedStyle(dragElement);
        elementStartLeft = parseFloat(dragElement.style.left) || 0;
        elementStartTop = parseFloat(dragElement.style.top) || 0;
    } else if (elementType === 'text') {
        elementStartTop = parseFloat(dragElement.style.top) || textTopPosition;
    } else if (elementType === 'name') {
        elementStartTop = parseFloat(dragElement.style.top) || nameTopPosition;
    } else if (elementType === 'date') {
        const bottomValue = parseFloat(dragElement.style.bottom) || dateBottomPosition;
        elementStartTop = 100 - bottomValue;
    }
    
    // Add visual feedback
    dragElement.style.opacity = '0.7';
    dragElement.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging || !dragElement) return;
    
    e.preventDefault();
    
    const certificate = dragElement.closest('.certificate');
    if (!certificate) return;
    
    const rect = certificate.getBoundingClientRect();
    
    // Get mouse/touch position
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    // Calculate movement in pixels
    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;
    
    // Convert to percentages relative to certificate size
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;
    
    const elementType = dragElement.dataset.type;
    
    if (elementType === 'logo') {
        let newLeft = elementStartLeft + deltaXPercent;
        let newTop = elementStartTop + deltaYPercent;
        
        // Clamp values
        newLeft = Math.max(0, Math.min(100, newLeft));
        newTop = Math.max(0, Math.min(100, newTop));
        
        dragElement.style.left = newLeft + '%';
        dragElement.style.top = newTop + '%';
        
        logoLeft = newLeft;
        logoTop = newTop;
    } else {
        let newTop = elementStartTop + deltaYPercent;
        
        // Clamp values
        newTop = Math.max(0, Math.min(100, newTop));
        
        if (elementType === 'text') {
            dragElement.style.top = newTop + '%';
            textTopPosition = newTop;
        } else if (elementType === 'name') {
            dragElement.style.top = newTop + '%';
            nameTopPosition = newTop;
        } else if (elementType === 'date') {
            const bottomValue = 100 - newTop;
            dragElement.style.bottom = bottomValue + '%';
            dateBottomPosition = bottomValue;
        }
    }
}

function stopDragOrResize(e) {
    if (isDragging && dragElement) {
        dragElement.style.opacity = '1';
        dragElement.style.cursor = 'move';
    }
    
    if (isResizing && resizeElement) {
        resizeElement.style.opacity = '1';
    }
    
    isDragging = false;
    dragElement = null;
    isResizing = false;
    resizeElement = null;
}

// New resize functions
function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing = true;
    resizeElement = e.target.closest('.resizable-element');
    
    if (!resizeElement) return;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    dragStartX = clientX;
    
    // Get current font size
    const computedStyle = window.getComputedStyle(resizeElement);
    startFontSize = parseFloat(computedStyle.fontSize);
    
    resizeElement.style.opacity = '0.7';
}

function resize(e) {
    if (!isResizing || !resizeElement) return;
    
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX;
    
    // Calculate new font size (1px movement = 0.5px font size change)
    let newFontSize = startFontSize + (deltaX * 0.5);
    
    // Get the current certificate name to check length
    const cert = certificates[currentIndex];
    const fullName = cert.firstName + '  ' + cert.lastName;
    
    // Calculate the maximum allowed font size based on name length
    let maxAllowedSize = 87;
    if (fullName.length >= 34) maxAllowedSize = 34;
    else if (fullName.length >= 33) maxAllowedSize = 35;
    else if (fullName.length >= 32) maxAllowedSize = 37;
    else if (fullName.length >= 31) maxAllowedSize = 37;
    else if (fullName.length >= 30) maxAllowedSize = 38;
    else if (fullName.length >= 29) maxAllowedSize = 43;
    else if (fullName.length >= 28) maxAllowedSize = 45;
    else if (fullName.length >= 27) maxAllowedSize = 47;
    else if (fullName.length >= 26) maxAllowedSize = 47;
    else if (fullName.length >= 25) maxAllowedSize = 49;
    else if (fullName.length >= 24) maxAllowedSize = 48;
    else if (fullName.length >= 23) maxAllowedSize = 54;
    else if (fullName.length >= 22) maxAllowedSize = 55;
    else if (fullName.length >= 21) maxAllowedSize = 58;
    else if (fullName.length >= 20) maxAllowedSize = 58;
    else if (fullName.length >= 19) maxAllowedSize = 60;
    else if (fullName.length >= 18) maxAllowedSize = 61;
    else if (fullName.length >= 17) maxAllowedSize = 70;
    else if (fullName.length >= 16) maxAllowedSize = 74;
    else if (fullName.length >= 15) maxAllowedSize = 77;
    else if (fullName.length >= 14) maxAllowedSize = 80;
    else if (fullName.length >= 13) maxAllowedSize = 83;
    else if (fullName.length >= 12) maxAllowedSize = 85;
    
    // Clamp font size between 20px and the maximum allowed for this name length
    newFontSize = Math.max(20, Math.min(maxAllowedSize, newFontSize));
    
    resizeElement.style.fontSize = newFontSize + 'px';
    nameFontSize = newFontSize;
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