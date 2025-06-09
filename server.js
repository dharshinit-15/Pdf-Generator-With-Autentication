const express = require('express');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET = 'secret123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const USER = { username: 'user1', password: 'password' };

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid Details' });
  }
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send('Token missing');
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.log('JWT error:', err);
      return res.status(403).send('Invalid token');
    }
    console.log('JWT verified. User:', user);
    req.user = user;
    next();
  });
}

app.post('/generate-pdf', authMiddleware, (req, res) => {
  const { content } = req.body;

  res.setHeader('Content-Disposition', 'attachment; filename="GeneratedPDF.pdf"');
  res.setHeader('Content-Type', 'application/pdf');

  const doc = new PDFDocument();
  doc.pipe(res);
  doc.text(content || 'No content provided');
  doc.end();
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
