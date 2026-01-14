// @ts-check

/**
 * @typedef {Object} ConversionResult
 * @property {string} name
 * @property {'markdown' | 'error'} format
 * @property {string} mimetype
 * @property {number} [tokens]
 * @property {string} [data]
 * @property {string} [error]
 */

// Configure marked for better rendering
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// DOM Elements
const fileInput = /** @type {HTMLInputElement} */ (document.getElementById('fileInput'));
const dropZone = /** @type {HTMLElement} */ (document.getElementById('dropZone'));
const fileList = /** @type {HTMLElement} */ (document.getElementById('fileList'));
const convertBtn = /** @type {HTMLButtonElement} */ (document.getElementById('convertBtn'));
const loading = /** @type {HTMLElement} */ (document.getElementById('loading'));
const uploadSection = /** @type {HTMLElement} */ (document.getElementById('uploadSection'));
const resultsSection = /** @type {HTMLElement} */ (document.getElementById('resultsSection'));
const markdownPreview = /** @type {HTMLElement} */ (document.getElementById('markdownPreview'));
const markdownRaw = /** @type {HTMLElement} */ (document.getElementById('markdownRaw'));
const copyBtn = /** @type {HTMLButtonElement} */ (document.getElementById('copyBtn'));
const downloadBtn = /** @type {HTMLButtonElement} */ (document.getElementById('downloadBtn'));
const viewRawBtn = /** @type {HTMLButtonElement} */ (document.getElementById('viewRawBtn'));
const viewPreviewBtn = /** @type {HTMLButtonElement} */ (document.getElementById('viewPreviewBtn'));
const newConversionBtn = /** @type {HTMLButtonElement} */ (document.getElementById('newConversionBtn'));

/** @type {File[]} */
let selectedFiles = [];
/** @type {string} */
let convertedMarkdown = '';
/** @type {'preview' | 'raw'} */
let viewMode = 'preview';

/**
 * Clean markdown by removing metadata sections
 * @param {string} markdown - The raw markdown text
 * @returns {string} Cleaned markdown
 */
function cleanMarkdown(markdown) {
  // Remove ## Metadata sections and their content until the next heading
  let cleaned = markdown.replace(/## Metadata\n[\s\S]*?(?=\n##[^#]|\n###|$)/g, '');
  
  // Remove multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim and return
  return cleaned.trim();
}

/**
 * Handle file selection
 * @param {FileList | null} files - The selected files
 */
function handleFiles(files) {
  if (!files) return;
  selectedFiles = Array.from(files);
  displayFileList();
  convertBtn.disabled = selectedFiles.length === 0;
}

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Remove a file from the selection
 * @param {number} index - Index of file to remove
 */
function removeFile(index) {
  selectedFiles.splice(index, 1);
  displayFileList();
  convertBtn.disabled = selectedFiles.length === 0;
}

// File Input Change
fileInput.addEventListener('change', (e) => {
  handleFiles(/** @type {HTMLInputElement} */ (e.target).files);
});

// Drag and Drop
dropZone.addEventListener('click', (e) => {
  // Only trigger if clicking the dropzone itself, not buttons inside it
  if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
    return;
  }
  fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer?.files || null);
});

/**
 * Display the list of selected files
 */
function displayFileList() {
  if (selectedFiles.length === 0) {
    fileList.innerHTML = '';
    return;
  }

  fileList.innerHTML = selectedFiles.map((file, index) => `
    <div class="file-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
      <span>${file.name}</span>
      <span class="file-size">${formatFileSize(file.size)}</span>
      <button class="btn-remove" onclick="removeFile(${index})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
}

// Convert Files
convertBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0) return;

  convertBtn.disabled = true;
  loading.style.display = 'block';
  resultsSection.style.display = 'none';

  try {
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    // Use appropriate API URL
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8787/api/convert'
      : '/api/convert';

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Conversion failed');
    }

    const resultData = await response.json();
    const resultsArray = Array.isArray(resultData) ? resultData : [resultData];
    
    // Combine all markdown results
    convertedMarkdown = resultsArray.map(result => {
      if (result.format === 'error') {
        return `## ⚠️ Error converting ${result.name}\n\n${result.error}\n\n---\n\n`;
      }
      return `${result.data}\n\n---\n\n`;
    }).join('\n');

    // Clean up the markdown - remove metadata sections
    convertedMarkdown = cleanMarkdown(convertedMarkdown);
    
    displayResults();
    showResultsSection();
  } catch (error) {
    showError(error.message);
  } finally {
    loading.style.display = 'none';
    convertBtn.disabled = false;
  }
});

function displayResults() {
  if (viewMode === 'preview') {
    markdownPreview.innerHTML = marked.parse(convertedMarkdown);
    markdownPreview.style.display = 'block';
    markdownRaw.style.display = 'none';
  } else {
    markdownRaw.querySelector('code').textContent = convertedMarkdown;
    markdownRaw.style.display = 'block';
    markdownPreview.style.display = 'none';
  }
}

function showResultsSection() {
  uploadSection.style.display = 'none';
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
  uploadSection.style.display = 'none';
  resultsSection.style.display = 'block';
  markdownPreview.innerHTML = `
    <div class="error-message">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div>
        <strong>Conversion Failed</strong>
        <p>${message}</p>
      </div>
    </div>
  `;
  markdownPreview.style.display = 'block';
  markdownRaw.style.display = 'none';
}

// View Mode Toggle
viewRawBtn.addEventListener('click', () => {
  viewMode = 'raw';
  viewRawBtn.classList.add('active');
  viewPreviewBtn.classList.remove('active');
  displayResults();
});

viewPreviewBtn.addEventListener('click', () => {
  viewMode = 'preview';
  viewPreviewBtn.classList.add('active');
  viewRawBtn.classList.remove('active');
  displayResults();
});

// Copy to Clipboard
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(convertedMarkdown);
    
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    `;
    copyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.style.background = '';
    }, 2000);
  } catch (error) {
    alert('Failed to copy to clipboard');
  }
});

// Download Markdown
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([convertedMarkdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Generate filename from first file or use timestamp
  const firstFileName = selectedFiles[0]?.name.replace(/\.[^/.]+$/, '') || 'converted';
  a.download = `${firstFileName}-${Date.now()}.md`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show feedback
  const originalHTML = downloadBtn.innerHTML;
  downloadBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Downloaded!
  `;
  
  setTimeout(() => {
    downloadBtn.innerHTML = originalHTML;
  }, 2000);
});

// New Conversion
newConversionBtn.addEventListener('click', () => {
  uploadSection.style.display = 'block';
  resultsSection.style.display = 'none';
  selectedFiles = [];
  convertedMarkdown = '';
  fileInput.value = '';
  displayFileList();
  convertBtn.disabled = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Initialize
displayFileList();
