/**
 * ItemViewModel.js
 * Encapsulated ViewModel for supplies and gear.
 */
class ItemViewModel {
  #raw;

  constructor(rawData) {
    this.#raw = { ...rawData };
  }

  get id() { return this.#raw.id; }
  get name() { return this.#raw.name; }
  get category() { return this.#raw.category || 'General'; }
  get serialNumber() { return this.#raw.serialNumber || 'N/A'; }
  get location() { return this.#raw.location || 'EcoSpark Hub'; }
  get status() { return this.#raw.status || 'Available'; }
  get assignedTo() { return this.#raw.assignedTo || null; }
  get assignedDepartment() { return this.#raw.assignedDepartment || null; }
  get checkoutDate() { return this.#raw.checkoutDate || null; }
  get expectedReturnDate() { return this.#raw.expectedReturnDate || null; }
  get condition() { return this.#raw.condition || 'Good'; }
  get notes() { return this.#raw.notes || ''; }
  get imageUrl() { return this.#raw.imageUrl || ''; }

  isAvailable() {
    return this.status === 'Available';
  }

  isInUse() {
    return this.status === 'In Use';
  }

  getStatusBadgeHtml() {
    return Formatters.getStatusBadge(this.status);
  }

  getBorrowerInfoHtml() {
    if (this.isInUse()) {
      const returnDate = this.expectedReturnDate ? Formatters.formatDate(this.expectedReturnDate) : 'Open return';
      return `
        <div class="gear-status-box inuse">
          <strong>Held by:</strong> ${Formatters.escapeHtml(this.assignedTo)} (${Formatters.escapeHtml(this.assignedDepartment || 'Staff')})<br/>
          <span class="text-muted">Return due: ${returnDate}</span>
        </div>
      `;
    }
    return `
      <div class="gear-status-box available">
        <strong>Ready for Checkout</strong><br/>
        <span class="text-muted">Located at: ${Formatters.escapeHtml(this.location)}</span>
      </div>
    `;
  }

  toRaw() {
    return { ...this.#raw };
  }
}

window.ItemViewModel = ItemViewModel;
