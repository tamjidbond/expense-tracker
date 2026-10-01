import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Sheets Auth
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Helper function to safely extract numbers from string/currency inputs
const parseAmount = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// GET Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Expenses!A2:J',
    });

    const rows = response.data.values || [];
    const expenses = rows.map((row) => {
      const dateStr = row[1] || '';
      const fallbackMonth = dateStr ? dateStr.substring(0, 7) : new Date().toISOString().substring(0, 7);

      return {
        id: row[0] || `TXN${Date.now()}`,
        date: dateStr,
        item: row[2] || '',
        category: row[3] || 'Food',
        amount: parseAmount(row[4]),
        paymentMethod: row[5] || 'Card',
        notes: row[6] || '',
        month: row[7] || fallbackMonth,
        createdAt: row[8] || '',
        updatedAt: row[9] || '',
      };
    });

    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { date, item, category, amount, paymentMethod, notes } = req.body;
    const id = `TXN${Date.now()}`;
    const numAmount = parseAmount(amount);
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const now = new Date().toISOString();

    const values = [[id, date, item, category, numAmount, paymentMethod, notes || '', month, now, now]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Expenses!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    res.json({
      success: true,
      data: { id, date, item, category, amount: numAmount, paymentMethod, notes, month, createdAt: now, updatedAt: now },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Expense (Update)
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Expenses!A2:J',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) return res.status(404).json({ success: false, error: 'Transaction not found' });

    const targetRow = rowIndex + 2;
    const current = rows[rowIndex];
    const { date, item, category, amount, paymentMethod, notes } = req.body;
    const updatedDate = date || current[1];
    const updatedMonth = updatedDate ? updatedDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const updatedAmount = amount !== undefined ? parseAmount(amount) : parseAmount(current[4]);

    const values = [[
      id,
      updatedDate,
      item || current[2],
      category || current[3],
      updatedAmount,
      paymentMethod || current[5],
      notes !== undefined ? notes : current[6],
      updatedMonth,
      current[8] || new Date().toISOString(),
      new Date().toISOString(),
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Expenses!A${targetRow}:J${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    res.json({ success: true, message: 'Expense updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Expenses!A2:J',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) return res.status(404).json({ success: false, error: 'Transaction not found' });

    const targetRow = rowIndex + 2;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `Expenses!A${targetRow}:J${targetRow}`,
    });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Budgets!A2:F',
    });
    const rows = response.data.values || [];
    const budgets = rows.map((row) => ({
      id: row[0] || '',
      month: row[1] || '',
      amount: parseAmount(row[2]),
      createdAt: row[3] || '',
      updatedAt: row[4] || '',
      notes: row[5] || '',
    }));
    res.json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Budget
app.post('/api/budgets', async (req, res) => {
  try {
    const { month, amount, notes } = req.body;
    const numAmount = parseAmount(amount);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Budgets!A2:F',
    });
    const rows = response.data.values || [];
    const existingIndex = rows.findIndex((row) => row[1] === month);
    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      const targetRow = existingIndex + 2;
      const current = rows[existingIndex];
      const values = [[current[0], month, numAmount, current[3], now, notes || current[5] || '']];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Budgets!A${targetRow}:F${targetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return res.json({ success: true, data: { id: current[0], month, amount: numAmount, notes } });
    } else {
      const id = `BUD${month.replace('-', '')}`;
      const values = [[id, month, numAmount, now, now, notes || '']];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Budgets!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return res.json({ success: true, data: { id, month, amount: numAmount, notes } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Categories
app.get('/api/categories', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Categories!A2:E',
    });
    const rows = response.data.values || [];
    const categories = rows.map((row) => ({
      name: row[0] || '',
      active: row[1] === 'TRUE' || row[1] === 'true' || row[1] === '1',
      monthlyLimit: parseAmount(row[2]),
      color: row[3] || '#10B981',
      notes: row[4] || '',
    }));
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));