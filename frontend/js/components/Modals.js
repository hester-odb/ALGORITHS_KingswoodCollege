/**
 * Modals.js
 * Encapsulated Modal Management Component for Checkouts, Returns, Item Creation, and Document Previews.
 */
class Modals {
  static #store;
  static #inventoryService;
  static #documentService;
  static #overlay;

  static init(store, inventoryService, documentService) {
    this.#store = store;
    this.#inventoryService = inventoryService;
    this.#documentService = documentService;

    this.#overlay = document.createElement('div');
    this.#overlay.className = 'modal-overlay';
    this.#overlay.id = 'globalModalOverlay';
    document.body.appendChild(this.#overlay);

    this.#overlay.addEventListener('click', (e) => {
      if (e.target === this.#overlay || e.target.closest('.modal-close-btn') || e.target.closest('[data-modal-close]')) {
        this.close();
      }
    });
  }

  static close() {
    this.#overlay.classList.remove('active');
    this.#overlay.innerHTML = '';
  }

  // 1. Checkout Modal
  static openCheckoutModal(item) {
    const { currentUser } = this.#store.getState();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.#overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${Icons.get('clock')} Check Out Equipment</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="checkoutForm">
          <div class="modal-body">
            <div style="background: var(--color-bg); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
              <strong style="color: var(--color-text-main);">${Formatters.escapeHtml(item.name)}</strong><br/>
              <span class="text-muted" style="font-size: 0.82rem;">SN: ${Formatters.escapeHtml(item.serialNumber)} • ${Formatters.escapeHtml(item.location)}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Borrowing Staff Member *</label>
              <input type="text" class="form-control" name="staffName" value="${Formatters.escapeHtml(currentUser.name)}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Department / Class *</label>
              <input type="text" class="form-control" name="department" value="${Formatters.escapeHtml(currentUser.department)}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Expected Return Date</label>
              <input type="date" class="form-control" name="expectedReturnDate" value="${nextWeek}" min="${today}" />
            </div>

            <div class="form-group">
              <label class="form-label">Operational Notes / Intended Use</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="e.g., Grade 8 robotics workshop in Room 102..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn-primary">${Icons.get('check')} Confirm Check Out</button>
          </div>
        </form>
      </div>
    `;

    this.#overlay.classList.add('active');

    const form = this.#overlay.querySelector('#checkoutForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        staffName: formData.get('staffName'),
        department: formData.get('department'),
        expectedReturnDate: formData.get('expectedReturnDate'),
        notes: formData.get('notes')
      };

      try {
        await this.#inventoryService.checkOutItem(item.id, data, currentUser.name);
        Toast.success(`Successfully checked out ${item.name} to ${data.staffName}!`);
        this.close();
        const freshItems = await this.#inventoryService.getAllItems();
        this.#store.setInventoryData(freshItems);
        this.#store.setActivityLogs(LocalStorageAdapter.getActivity());
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }

  // 2. Checkin / Return Modal
  static openCheckinModal(item) {
    const { currentUser } = this.#store.getState();

    this.#overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${Icons.get('check')} Return Equipment</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="checkinForm">
          <div class="modal-body">
            <div style="background: #FFFBEB; border-left: 4px solid var(--color-amber); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
              <strong style="color: var(--color-amber-dark);">${Formatters.escapeHtml(item.name)}</strong><br/>
              <span style="font-size: 0.82rem; color: var(--color-amber-dark);">Currently held by: ${Formatters.escapeHtml(item.assignedTo)} (${Formatters.escapeHtml(item.assignedDepartment || 'Staff')})</span>
            </div>

            <div class="form-group">
              <label class="form-label">Returned Equipment Condition</label>
              <select class="form-control" name="condition">
                <option value="Excellent" ${item.condition === 'Excellent' ? 'selected' : ''}>Excellent - Clean and fully functioning</option>
                <option value="Good" ${item.condition === 'Good' ? 'selected' : ''}>Good - Minor cosmetic wear</option>
                <option value="Fair" ${item.condition === 'Fair' ? 'selected' : ''}>Fair - Usable, needs maintenance soon</option>
                <option value="Needs Attention">Needs Attention - Damaged or missing cables</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Return Notes</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="e.g., All cables returned, lenses cleaned."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn-amber">${Icons.get('check')} Complete Return</button>
          </div>
        </form>
      </div>
    `;

    this.#overlay.classList.add('active');

    const form = this.#overlay.querySelector('#checkinForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        condition: formData.get('condition'),
        notes: formData.get('notes')
      };

      try {
        await this.#inventoryService.checkInItem(item.id, data, currentUser.name);
        Toast.success(`Returned "${item.name}" to Available inventory!`);
        this.close();
        const freshItems = await this.#inventoryService.getAllItems();
        this.#store.setInventoryData(freshItems);
        this.#store.setActivityLogs(LocalStorageAdapter.getActivity());
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }

  // 3. Add Equipment Modal
  static openItemModal() {
    const { currentUser } = this.#store.getState();

    this.#overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${Icons.get('plus')} Register New Equipment</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="itemForm">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Equipment Name *</label>
              <input type="text" class="form-control" name="name" placeholder="e.g. SparkPen Digital Stylus Set" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select class="form-control" name="category">
                  <option value="Classroom Tools">Classroom Tools</option>
                  <option value="Sensors & Robotics">Sensors & Robotics</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Computing">Computing</option>
                  <option value="Lab Tools">Lab Tools</option>
                  <option value="Audio/Visual">Audio/Visual</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Serial Number / Tag</label>
                <input type="text" class="form-control" name="serialNumber" placeholder="e.g. ES-PEN-0501" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Storage Location *</label>
                <input type="text" class="form-control" name="location" value="MakerLab - Cabinet A" required />
              </div>

              <div class="form-group">
                <label class="form-label">Initial Condition</label>
                <select class="form-control" name="condition">
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Gear Illustration / Icon</label>
              <select class="form-control" name="imageUrl">
                <option value="assets/gear/default-gear.svg">Default EcoSpark Tool Icon</option>
                <option value="assets/gear/projector.svg">Classroom Projector</option>
                <option value="assets/gear/smartpen.svg">Smart Pen Charging Dock</option>
                <option value="assets/gear/sensor-hub.svg">Environmental Sensor Hub</option>
                <option value="assets/gear/laptop-lead.svg">Laptop & Workstation</option>
                <option value="assets/gear/robotics-kit.svg">Robotics & STEM Kit</option>
                <option value="assets/gear/microscope.svg">Digital Lab Microscope</option>
                <option value="assets/gear/sound-pa.svg">Sound PA & Wireless Mic</option>
                <option value="assets/gear/oscilloscope.svg">Electronics Oscilloscope</option>
                <option value="assets/gear/vr-headset.svg">VR Headsets</option>
                <option value="assets/gear/doc-camera.svg">Document Visualizer Camera</option>
                <option value="assets/gear/3d-printer.svg">3D Prototyper / Printer</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Operational Notes</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Specifications, accessories included..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn-primary">${Icons.get('check')} Save to Inventory</button>
          </div>
        </form>
      </div>
    `;

    this.#overlay.classList.add('active');

    const form = this.#overlay.querySelector('#itemForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        name: fd.get('name'),
        category: fd.get('category'),
        serialNumber: fd.get('serialNumber'),
        location: fd.get('location'),
        condition: fd.get('condition'),
        notes: fd.get('notes'),
        imageUrl: fd.get('imageUrl') || 'assets/gear/default-gear.svg'
      };

      try {
        await this.#inventoryService.createItem(data, currentUser.name);
        Toast.success(`Added "${data.name}" to inventory!`);
        this.close();
        const fresh = await this.#inventoryService.getAllItems();
        this.#store.setInventoryData(fresh);
        this.#store.setActivityLogs(LocalStorageAdapter.getActivity());
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }

  // 4. Document Preview Modal
  static openDocPreviewModal(doc) {
    this.#overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">${Formatters.escapeHtml(doc.title)}</h3>
            <span class="text-muted" style="font-size: 0.8rem; font-family: var(--font-mono);">${Formatters.escapeHtml(doc.filename)} • v${doc.version}</span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <span class="badge badge-category">${Formatters.escapeHtml(doc.category)}</span>
            <span class="badge badge-category">Author: ${Formatters.escapeHtml(doc.author)}</span>
            <span class="badge badge-category">Size: ${doc.fileSize}</span>
          </div>

          <div style="background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; max-height: 340px; overflow-y: auto;">${Formatters.escapeHtml(doc.content || doc.description || 'No document content available.')}</div>

          <div class="mt-2">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted);">TAGS:</span>
            <div class="doc-tags-list mt-1">
              ${doc.tags.map(t => `<span class="doc-tag">#${Formatters.escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-modal-close>Close</button>
          <button type="button" class="btn btn-primary" id="downloadDocBtn">${Icons.get('download')} Download Copy</button>
        </div>
      </div>
    `;

    this.#overlay.classList.add('active');

    this.#overlay.querySelector('#downloadDocBtn').addEventListener('click', () => {
      Toast.success(`Downloading ${doc.filename}...`);
    });
  }

  // 5. New Document Modal
  static openNewDocModal() {
    const { currentUser, folders } = this.#store.getState();

    this.#overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${Icons.get('plus')} Upload / Create Document</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="newDocForm">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Document Title *</label>
              <input type="text" class="form-control" name="title" placeholder="e.g. Solar Projector Calibration Standard" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Folder *</label>
                <select class="form-control" name="folderId">
                  ${folders.map(f => `<option value="${f.id}">${Formatters.escapeHtml(f.name)}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Category *</label>
                <select class="form-control" name="category">
                  <option value="Guides & Manuals">Guides & Manuals</option>
                  <option value="Hardware Specs">Hardware Specs</option>
                  <option value="Design Notes">Design Notes</option>
                  <option value="Operations">Operations</option>
                  <option value="Software & Firmware">Software & Firmware</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">File Type</label>
                <select class="form-control" name="fileType">
                  <option value="pdf">PDF Document</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="cad">CAD / 3D Specs</option>
                  <option value="doc">Word (.docx)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tags (comma-separated)</label>
                <input type="text" class="form-control" name="tags" placeholder="e.g. guide, v2, classroom" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Summary / Description</label>
              <textarea class="form-control" name="description" rows="2" placeholder="Brief summary of document purpose..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Document Body / Notes Preview</label>
              <textarea class="form-control" name="content" rows="3" placeholder="# Document content..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn-primary">${Icons.get('check')} Publish Document</button>
          </div>
        </form>
      </div>
    `;

    this.#overlay.classList.add('active');

    const form = this.#overlay.querySelector('#newDocForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const tags = (fd.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean);

      const data = {
        title: fd.get('title'),
        folderId: fd.get('folderId'),
        category: fd.get('category'),
        fileType: fd.get('fileType'),
        tags,
        description: fd.get('description'),
        content: fd.get('content'),
        author: currentUser.name
      };

      try {
        await this.#documentService.createDocument(data, currentUser.name);
        Toast.success(`Published document "${data.title}"!`);
        this.close();
        const freshDocs = await this.#documentService.getAllDocuments();
        const freshFolders = await this.#documentService.getAllFolders();
        this.#store.setDocumentData(freshDocs, freshFolders);
        this.#store.setActivityLogs(LocalStorageAdapter.getActivity());
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }

  // 6. New Folder Modal
  static openNewFolderModal() {
    const { currentUser } = this.#store.getState();

    this.#overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${Icons.get('folder')} Create New Folder</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="newFolderForm">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Folder Name *</label>
              <input type="text" class="form-control" name="name" placeholder="e.g. Robotics Firmware & Libraries" required />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="description" rows="2" placeholder="What files should live in this folder?"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn-primary">${Icons.get('check')} Create Folder</button>
          </div>
        </form>
      </div>
    `;

    this.#overlay.classList.add('active');

    const form = this.#overlay.querySelector('#newFolderForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        name: fd.get('name'),
        description: fd.get('description')
      };

      try {
        await this.#documentService.createFolder(data, currentUser.name);
        Toast.success(`Created folder "${data.name}"!`);
        this.close();
        const freshFolders = await this.#documentService.getAllFolders();
        this.#store.setDocumentData(null, freshFolders);
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
}

window.Modals = Modals;
