#!/usr/bin/env python3
"""
server.py
EcoSpark Innovations Internal Hub - Python Backend Server

Zero-dependency standard library Python HTTP REST server.
Provides exact parity with the Node.js API endpoints.
"""
import os
import sys
import json
import uuid
import re
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def read_json(filename, default=None):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return default if default is not None else []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error reading {filename}]: {e}")
        return default if default is not None else []

def write_json(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def log_audit(action, entity_type, entity_id, entity_name, performed_by, details=None):
    logs = read_json('audit_logs.json', [])
    entry = {
        'id': str(uuid.uuid4()),
        'createdAt': datetime.utcnow().isoformat() + 'Z',
        'updatedAt': datetime.utcnow().isoformat() + 'Z',
        'action': action,
        'entityType': entity_type,
        'entityId': entity_id,
        'entityName': entity_name,
        'performedBy': performed_by or 'EcoSpark Staff',
        'details': details or {}
    }
    logs.insert(0, entry)
    write_json('audit_logs.json', logs[:100])

class EcoSparkApiHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status_code, payload):
        data = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self._send_cors_headers()
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        get_param = lambda k, default=None: qs[k][0] if k in qs and len(qs[k]) > 0 else default

        # Health
        if path == '/api/health':
            return self._send_json(200, {'status': 'UP', 'service': 'EcoSpark Hub Python API', 'timestamp': datetime.utcnow().isoformat() + 'Z'})

        # Stats
        if path == '/api/stats':
            inv = read_json('inventory.json', [])
            docs = read_json('documents.json', [])
            folders = read_json('folders.json', [])
            categories = {}
            for i in inv:
                c = i.get('category', 'General')
                categories[c] = categories.get(c, 0) + 1
            stats = {
                'inventory': {
                    'total': len(inv),
                    'available': sum(1 for i in inv if i.get('status') == 'Available'),
                    'inUse': sum(1 for i in inv if i.get('status') == 'In Use'),
                    'maintenance': sum(1 for i in inv if i.get('status') == 'Maintenance'),
                    'categories': categories
                },
                'documents': {
                    'totalDocuments': len(docs),
                    'totalFolders': len(folders)
                },
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            return self._send_json(200, {'success': True, 'data': stats})

        # Activity
        if path == '/api/activity':
            limit = int(get_param('limit', 25))
            logs = read_json('audit_logs.json', [])
            return self._send_json(200, {'success': True, 'count': len(logs[:limit]), 'data': logs[:limit]})

        # Inventory List
        if path == '/api/inventory':
            items = read_json('inventory.json', [])
            search = get_param('search')
            status = get_param('status')
            category = get_param('category')

            if search:
                s = search.lower()
                items = [i for i in items if s in i.get('name', '').lower() or s in i.get('serialNumber', '').lower() or s in i.get('location', '').lower() or s in (i.get('assignedTo') or '').lower()]
            if status and status != 'All':
                items = [i for i in items if i.get('status', '').lower() == status.lower()]
            if category and category != 'All':
                items = [i for i in items if i.get('category', '').lower() == category.lower()]

            return self._send_json(200, {'success': True, 'count': len(items), 'data': items})

        # Single Inventory Item
        m_item = re.match(r'^/api/inventory/([^/]+)$', path)
        if m_item:
            item_id = m_item.group(1)
            items = read_json('inventory.json', [])
            found = next((i for i in items if i.get('id') == item_id), None)
            if found:
                return self._send_json(200, {'success': True, 'data': found})
            return self._send_json(404, {'error': True, 'message': 'Item not found'})

        # Folders
        if path == '/api/folders':
            folders = read_json('folders.json', [])
            docs = read_json('documents.json', [])
            for f in folders:
                f['itemCount'] = sum(1 for d in docs if d.get('folderId') == f.get('id'))
            return self._send_json(200, {'success': True, 'count': len(folders), 'data': folders})

        # Documents List
        if path == '/api/documents':
            docs = read_json('documents.json', [])
            folder_id = get_param('folderId')
            category = get_param('category')
            tag = get_param('tag')
            search = get_param('search')

            if folder_id and folder_id != 'all':
                docs = [d for d in docs if d.get('folderId') == folder_id]
            if category and category != 'All':
                docs = [d for d in docs if d.get('category', '').lower() == category.lower()]
            if tag and tag != 'All':
                t = tag.lower()
                docs = [d for d in docs if t in [x.lower() for x in d.get('tags', [])]]
            if search:
                s = search.lower()
                docs = [d for d in docs if s in d.get('title', '').lower() or s in d.get('description', '').lower() or s in d.get('filename', '').lower()]

            return self._send_json(200, {'success': True, 'count': len(docs), 'data': docs})

        # Tags
        if path == '/api/tags':
            docs = read_json('documents.json', [])
            tag_set = set()
            for d in docs:
                for t in d.get('tags', []):
                    tag_set.add(t)
            return self._send_json(200, {'success': True, 'data': sorted(list(tag_set))})

        # Static Frontend file serving for GET requests
        if not path.startswith('/api'):
            frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')
            rel_path = 'index.html' if path in ('/', '') else path.lstrip('/')
            filepath = os.path.join(frontend_dir, rel_path)
            if os.path.exists(filepath) and os.path.isfile(filepath):
                ext = os.path.splitext(filepath)[1].lower()
                mimes = {
                    '.html': 'text/html; charset=utf-8',
                    '.css': 'text/css; charset=utf-8',
                    '.js': 'application/javascript; charset=utf-8',
                    '.svg': 'image/svg+xml',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.json': 'application/json',
                    '.ico': 'image/x-icon'
                }
                content_type = mimes.get(ext, 'application/octet-stream')
                try:
                    with open(filepath, 'rb') as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header('Content-Type', content_type)
                    self._send_cors_headers()
                    self.send_header('Content-Length', str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception as e:
                    print(f"Error serving static file {filepath}: {e}")

        return self._send_json(404, {'error': True, 'message': 'Not Found'})

    def do_POST(self):
        path = urlparse(self.path).path
        body = self._parse_body()
        now = datetime.utcnow().isoformat() + 'Z'

        # Checkout
        m_co = re.match(r'^/api/inventory/([^/]+)/checkout$', path)
        if m_co:
            item_id = m_co.group(1)
            items = read_json('inventory.json', [])
            item = next((i for i in items if i.get('id') == item_id), None)
            if not item:
                return self._send_json(404, {'error': True, 'message': 'Item not found'})
            if item.get('status') != 'Available':
                return self._send_json(400, {'error': True, 'message': f"Item is currently {item.get('status')}"})

            staff_name = body.get('staffName')
            if not staff_name:
                return self._send_json(400, {'error': True, 'message': 'Staff name is required'})

            item['status'] = 'In Use'
            item['assignedTo'] = staff_name.strip()
            item['assignedDepartment'] = body.get('department', 'General')
            item['checkoutDate'] = now
            item['expectedReturnDate'] = body.get('expectedReturnDate')
            item['updatedAt'] = now
            if body.get('notes'):
                item['notes'] = body.get('notes').strip()

            write_json('inventory.json', items)
            log_audit('CHECKOUT', 'INVENTORY', item['id'], item['name'], staff_name, body)
            return self._send_json(200, {'success': True, 'message': 'Checked out successfully', 'data': item})

        # Checkin
        m_ci = re.match(r'^/api/inventory/([^/]+)/checkin$', path)
        if m_ci:
            item_id = m_ci.group(1)
            items = read_json('inventory.json', [])
            item = next((i for i in items if i.get('id') == item_id), None)
            if not item:
                return self._send_json(404, {'error': True, 'message': 'Item not found'})
            if item.get('status') == 'Available':
                return self._send_json(400, {'error': True, 'message': 'Item is already Available'})

            prev_holder = item.get('assignedTo')
            item['status'] = 'Available'
            item['assignedTo'] = None
            item['assignedDepartment'] = None
            item['checkoutDate'] = None
            item['expectedReturnDate'] = None
            item['updatedAt'] = now
            if body.get('condition'):
                item['condition'] = body.get('condition')
            if body.get('notes'):
                item['notes'] = body.get('notes').strip()

            write_json('inventory.json', items)
            log_audit('CHECKIN', 'INVENTORY', item['id'], item['name'], body.get('performedBy', 'Staff'), {'returnedFrom': prev_holder})
            return self._send_json(200, {'success': True, 'message': 'Checked in successfully', 'data': item})

        # Create Inventory Item
        if path == '/api/inventory':
            name = body.get('name')
            if not name:
                return self._send_json(400, {'error': True, 'message': 'Item name is required'})
            items = read_json('inventory.json', [])
            new_item = {
                'id': str(uuid.uuid4()),
                'createdAt': now,
                'updatedAt': now,
                'name': name.strip(),
                'category': body.get('category', 'General').strip(),
                'serialNumber': body.get('serialNumber', f"ES-{int(datetime.utcnow().timestamp()) % 10000}").strip(),
                'location': body.get('location', 'Main Office').strip(),
                'status': 'Available',
                'assignedTo': None,
                'assignedDepartment': None,
                'checkoutDate': None,
                'expectedReturnDate': None,
                'condition': body.get('condition', 'Good'),
                'notes': body.get('notes', '').strip(),
                'imageUrl': body.get('imageUrl') or 'assets/gear/default-gear.svg'
            }
            items.append(new_item)
            write_json('inventory.json', items)
            log_audit('CREATE', 'INVENTORY', new_item['id'], new_item['name'], body.get('performedBy', 'Staff'), new_item)
            return self._send_json(201, {'success': True, 'data': new_item})

        # Create Document
        if path == '/api/documents':
            title = body.get('title')
            if not title:
                return self._send_json(400, {'error': True, 'message': 'Title is required'})
            docs = read_json('documents.json', [])
            new_doc = {
                'id': str(uuid.uuid4()),
                'createdAt': now,
                'updatedAt': now,
                'title': title.strip(),
                'filename': body.get('filename') or f"{title.lower().replace(' ', '-')}.{body.get('fileType', 'doc')}",
                'folderId': body.get('folderId', 'root'),
                'category': body.get('category', 'General').strip(),
                'fileType': body.get('fileType', 'doc').lower(),
                'fileSize': body.get('fileSize', '14 KB'),
                'author': body.get('author', 'EcoSpark Staff').strip(),
                'description': body.get('description', '').strip(),
                'tags': [t.strip().lower() for t in body.get('tags', []) if t.strip()],
                'content': body.get('content', ''),
                'version': body.get('version', '1.0')
            }
            docs.append(new_doc)
            write_json('documents.json', docs)
            log_audit('CREATE', 'DOCUMENT', new_doc['id'], new_doc['title'], new_doc['author'], new_doc)
            return self._send_json(201, {'success': True, 'data': new_doc})

        # Create Folder
        if path == '/api/folders':
            name = body.get('name')
            if not name:
                return self._send_json(400, {'error': True, 'message': 'Folder name is required'})
            folders = read_json('folders.json', [])
            new_folder = {
                'id': str(uuid.uuid4()),
                'createdAt': now,
                'updatedAt': now,
                'name': name.strip(),
                'parentId': body.get('parentId'),
                'icon': body.get('icon', 'folder'),
                'color': body.get('color', '#10B981'),
                'description': body.get('description', '').strip(),
                'itemCount': 0
            }
            folders.append(new_folder)
            write_json('folders.json', folders)
            log_audit('CREATE', 'FOLDER', new_folder['id'], new_folder['name'], body.get('performedBy', 'Staff'))
            return self._send_json(201, {'success': True, 'data': new_folder})

        return self._send_json(404, {'error': True, 'message': 'Not Found'})

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}\n")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    server = HTTPServer(('127.0.0.1', port), EcoSparkApiHandler)
    print(f"⚡ EcoSpark Python API Server running at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()
