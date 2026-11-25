/**
 * DocumentViewModel.js
 * Encapsulated ViewModel for documents and project files.
 */
class DocumentViewModel {
  #raw;

  constructor(rawData) {
    this.#raw = { ...rawData };
  }

  get id() { return this.#raw.id; }
  get title() { return this.#raw.title; }
  get filename() { return this.#raw.filename; }
  get folderId() { return this.#raw.folderId; }
  get category() { return this.#raw.category || 'General'; }
  get fileType() { return (this.#raw.fileType || 'doc').toLowerCase(); }
  get fileSize() { return this.#raw.fileSize || '10 KB'; }
  get author() { return this.#raw.author || 'EcoSpark Staff'; }
  get description() { return this.#raw.description || ''; }
  get tags() { return Array.isArray(this.#raw.tags) ? [...this.#raw.tags] : []; }
  get content() { return this.#raw.content || ''; }
  get version() { return this.#raw.version || '1.0'; }
  get updatedAt() { return this.#raw.updatedAt || new Date().toISOString(); }

  getTypeIconHtml() {
    let typeClass = 'doc-type-doc';
    let label = 'DOC';

    if (this.fileType.includes('pdf')) {
      typeClass = 'doc-type-pdf';
      label = 'PDF';
    } else if (this.fileType.includes('cad') || this.fileType.includes('stl')) {
      typeClass = 'doc-type-cad';
      label = 'CAD';
    } else if (this.fileType.includes('md') || this.fileType.includes('markdown')) {
      typeClass = 'doc-type-markdown';
      label = 'MD';
    }

    return `<div class="doc-type-icon ${typeClass}">${label}</div>`;
  }

  toRaw() {
    return { ...this.#raw };
  }
}

window.DocumentViewModel = DocumentViewModel;
