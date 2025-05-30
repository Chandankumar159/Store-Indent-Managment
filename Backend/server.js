// server.js (In-memory backend, no database required)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ====== In-memory "database" ======
let users = [];
let items = [
  { id: "1", name: "Pen", quantity: 10, threshold: 5 },
  { id: "2", name: "Notebook", quantity: 20, threshold: 5 },
  { id: "3", name: "Marker", quantity: 3, threshold: 5 }
];
let indents = [];
let indentCounter = 1;

// ====== Email Utility (Just logs to console) ======
const sendMail = async (to, subject, text) => {
  // Simulate email by logging to console
  console.log(`[EMAIL to ${to}] ${subject}: ${text}`);
};

// ====== Middleware ======
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = users.find(u => u.id === decoded.id);
    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// ====== Auth Routes ======
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields required' });
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: (users.length + 1).toString(), name, email, password: hash, role };
    users.push(user);
    res.status(201).json({ message: 'Registered' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ====== Item Routes ======
app.get('/api/items', auth, (req, res) => {
  res.json(items.filter(item => item.quantity > 0));
});
app.get('/api/items/threshold', auth, requireRole(['STORE']), (req, res) => {
  res.json(items.filter(item => item.quantity < 5));
});
app.post('/api/items', auth, requireRole(['ADMIN']), (req, res) => {
  const { name, quantity, threshold } = req.body;
  const item = { id: (items.length + 1).toString(), name, quantity, threshold };
  items.push(item);
  res.status(201).json(item);
});

// ====== Indent Routes ======

// User raises indent
app.post('/api/indents', auth, (req, res) => {
  const { items: reqItems } = req.body; // [{item, requestedQty}]
  if (!reqItems || !Array.isArray(reqItems) || reqItems.length === 0) return res.status(400).json({ message: "Items required" });
  // Validate items exist
  for (const it of reqItems) {
    const item = items.find(i => i.id === it.item);
    if (!item || item.quantity <= 0) return res.status(400).json({ message: "Item not available" });
  }
  const indent = {
    id: (indentCounter++).toString(),
    user: req.user.id,
    items: reqItems.map(it => ({ item: it.item, requestedQty: it.requestedQty, issuedQty: 0 })),
    status: "PENDING",
    approvals: { hod: false, admin: false },
    createdAt: new Date()
  };
  indents.push(indent);

  // Notify HOD/Admin (simulate)
  const hods = users.filter(u => u.role === 'HOD');
  const admins = users.filter(u => u.role === 'ADMIN');
  const emails = [...hods, ...admins].map(u => u.email);
  if (emails.length)
    sendMail(emails.join(','), 'New Indent Raised', 'A new indent has been raised.');

  // Confirmation to user
  sendMail(req.user.email, 'Indent Submitted', 'Your indent is submitted and pending approval.');
  res.status(201).json(indent);
});

// User's own indents
app.get('/api/indents/my', auth, (req, res) => {
  const myIndents = indents.filter(indent => indent.user === req.user.id)
    .map(indent => ({
      ...indent,
      items: indent.items.map(it => ({
        ...it,
        item: items.find(i => i.id === it.item) || { name: "Deleted Item" }
      }))
    }));
  res.json(myIndents);
});

// HOD/Admin: Pending approvals
app.get('/api/indents/pending', auth, requireRole(['HOD', 'ADMIN']), (req, res) => {
  const query = req.user.role === 'HOD'
    ? (indent) => !indent.approvals.hod
    : (indent) => !indent.approvals.admin;
  const pending = indents.filter(query).map(indent => ({
    ...indent,
    user: users.find(u => u.id === indent.user),
    items: indent.items.map(it => ({
      ...it,
      item: items.find(i => i.id === it.item) || { name: "Deleted Item" }
    }))
  }));
  res.json(pending);
});

// HOD/Admin: Approve indent
app.put('/api/indents/:id/approve', auth, requireRole(['HOD', 'ADMIN']), (req, res) => {
  const indent = indents.find(i => i.id === req.params.id);
  if (!indent) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'HOD') indent.approvals.hod = true;
  if (req.user.role === 'ADMIN') indent.approvals.admin = true;
  if (indent.approvals.hod && indent.approvals.admin) indent.status = 'APPROVED';

  // Notify user
  const user = users.find(u => u.id === indent.user);
  sendMail(user.email, 'Indent Approved', 'Your indent is approved.');
  res.json(indent);
});

// Store: Get approved indents
app.get('/api/indents/approved', auth, requireRole(['STORE']), (req, res) => {
  const approved = indents.filter(indent =>
    indent.approvals.hod && indent.approvals.admin &&
    ['APPROVED', 'PARTIAL'].includes(indent.status)
  ).map(indent => ({
    ...indent,
    user: users.find(u => u.id === indent.user),
    items: indent.items.map(it => ({
      ...it,
      item: items.find(i => i.id === it.item) || { name: "Deleted Item" }
    }))
  }));
  res.json(approved);
});

// Store: Issue items
app.put('/api/indents/:id/issue', auth, requireRole(['STORE']), (req, res) => {
  const { issuedItems } = req.body; // [{item, issuedQty}]
  const indent = indents.find(i => i.id === req.params.id);
  if (!indent) return res.status(404).json({ message: 'Indent not found' });
  if (!(indent.approvals.hod && indent.approvals.admin))
    return res.status(400).json({ message: 'Not approved' });

  let allFulfilled = true;
  let anyPartial = false;

  for (const issuedItem of issuedItems) {
    const indentItem = indent.items.find(i => i.item === issuedItem.item);
    if (!indentItem) continue;
    indentItem.issuedQty += Number(issuedItem.issuedQty);

    // Update stock
    const item = items.find(i => i.id === issuedItem.item);
    if (item) {
      item.quantity -= Number(issuedItem.issuedQty);
      // Threshold alert
      if (item.quantity < item.threshold) {
        const storeUsers = users.filter(u => u.role === 'STORE');
        if (storeUsers.length)
          sendMail(storeUsers.map(u => u.email).join(','), `Item Below Threshold: ${item.name}`, `Item ${item.name} is below threshold.`);
      }
    }

    if (indentItem.issuedQty < indentItem.requestedQty) {
      allFulfilled = false;
      anyPartial = true;
    }
  }

  if (allFulfilled) indent.status = 'FULFILLED';
  else if (anyPartial) indent.status = 'PARTIAL';

  // Mail confirmation to user
  const user = users.find(u => u.id === indent.user);
  sendMail(user.email, 'Items Issued', `Your items have been issued. Status: ${indent.status}`);
  res.json(indent);
});

// ====== Start Server ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`In-memory backend running on port ${PORT}`));
