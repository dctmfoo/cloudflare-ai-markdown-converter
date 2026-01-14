// Format configuration - shared between frontend and backend
export interface FormatConfig {
  enabled: boolean;
  extensions: string[];
  mimeTypes: string[];
  costTier: 'low' | 'high';
  label: string;
  note?: string;
}

export const FORMATS_CONFIG: Record<string, FormatConfig> = {
  pdf: {
    enabled: true,
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    costTier: 'low',
    label: 'PDF',
  },
  images: {
    enabled: false,
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    costTier: 'high',
    label: 'Images',
    note: 'Uses 2 AI models per image (object detection + summarization)',
  },
  html: {
    enabled: true,
    extensions: ['.html'],
    mimeTypes: ['text/html'],
    costTier: 'low',
    label: 'HTML',
  },
  xml: {
    enabled: true,
    extensions: ['.xml'],
    mimeTypes: ['application/xml', 'text/xml'],
    costTier: 'low',
    label: 'XML',
  },
  office: {
    enabled: true,
    extensions: ['.docx', '.xlsx', '.xlsm', '.xlsb', '.xls', '.et'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroenabled.12',
      'application/vnd.ms-excel.sheet.binary.macroenabled.12',
      'application/vnd.ms-excel',
    ],
    costTier: 'low',
    label: 'Office',
  },
  openDocument: {
    enabled: true,
    extensions: ['.odt', '.ods'],
    mimeTypes: [
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
    ],
    costTier: 'low',
    label: 'OpenDocument',
  },
  csv: {
    enabled: true,
    extensions: ['.csv'],
    mimeTypes: ['text/csv'],
    costTier: 'low',
    label: 'CSV',
  },
  apple: {
    enabled: true,
    extensions: ['.numbers'],
    mimeTypes: ['application/vnd.apple.numbers'],
    costTier: 'low',
    label: 'Apple Documents',
  },
};

// Get all enabled formats
export function getEnabledFormats(): FormatConfig[] {
  return Object.values(FORMATS_CONFIG).filter(config => config.enabled);
}

// Get all allowed extensions
export function getAllowedExtensions(): string[] {
  return getEnabledFormats().flatMap(config => config.extensions);
}

// Get all allowed MIME types
export function getAllowedMimeTypes(): string[] {
  return getEnabledFormats().flatMap(config => config.mimeTypes);
}

// Validate if a file is allowed based on extension
export function isExtensionAllowed(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return getAllowedExtensions().includes(extension);
}

// Validate if a file is allowed based on MIME type
export function isMimeTypeAllowed(mimeType: string): boolean {
  return getAllowedMimeTypes().includes(mimeType);
}

// Get validation error message
export function getValidationError(filename: string, mimeType: string): string {
  const extension = filename.substring(filename.lastIndexOf('.'));
  const enabledLabels = getEnabledFormats().map(f => f.label).join(', ');
  
  return `File "${filename}" (${extension}) is not supported. Supported formats: ${enabledLabels}`;
}
