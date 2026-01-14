// Format configuration
const FORMATS_CONFIG = {
  "formats": {
    "pdf": {
      "enabled": true,
      "extensions": [".pdf"],
      "mimeTypes": ["application/pdf"],
      "costTier": "low",
      "label": "PDF"
    },
    "images": {
      "enabled": false,
      "extensions": [".jpg", ".jpeg", ".png", ".webp", ".svg"],
      "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      "costTier": "high",
      "label": "Images",
      "note": "Uses 2 AI models per image (object detection + summarization)"
    },
    "html": {
      "enabled": true,
      "extensions": [".html"],
      "mimeTypes": ["text/html"],
      "costTier": "low",
      "label": "HTML"
    },
    "xml": {
      "enabled": true,
      "extensions": [".xml"],
      "mimeTypes": ["application/xml", "text/xml"],
      "costTier": "low",
      "label": "XML"
    },
    "office": {
      "enabled": true,
      "extensions": [".docx", ".xlsx", ".xlsm", ".xlsb", ".xls", ".et"],
      "mimeTypes": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroenabled.12",
        "application/vnd.ms-excel.sheet.binary.macroenabled.12",
        "application/vnd.ms-excel"
      ],
      "costTier": "low",
      "label": "Office"
    },
    "openDocument": {
      "enabled": true,
      "extensions": [".odt", ".ods"],
      "mimeTypes": [
        "application/vnd.oasis.opendocument.text",
        "application/vnd.oasis.opendocument.spreadsheet"
      ],
      "costTier": "low",
      "label": "OpenDocument"
    },
    "csv": {
      "enabled": true,
      "extensions": [".csv"],
      "mimeTypes": ["text/csv"],
      "costTier": "low",
      "label": "CSV"
    },
    "apple": {
      "enabled": true,
      "extensions": [".numbers"],
      "mimeTypes": ["application/vnd.apple.numbers"],
      "costTier": "low",
      "label": "Apple Documents"
    }
  }
};

// Get enabled formats
function getEnabledFormats() {
  const enabled = [];
  for (const [key, config] of Object.entries(FORMATS_CONFIG.formats)) {
    if (config.enabled) {
      enabled.push(config);
    }
  }
  return enabled;
}

// Get accept string for file input
function getAcceptString() {
  const formats = getEnabledFormats();
  const extensions = formats.flatMap(f => f.extensions);
  return extensions.join(',');
}

// Get format badges for display
function getFormatBadges() {
  const formats = getEnabledFormats();
  return formats.map(f => f.label);
}
