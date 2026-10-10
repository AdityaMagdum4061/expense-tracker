const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const categoryList = [
  'Salary',
  'Freelance',
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Housing',
  'Health',
  'Entertainment',
  'Travel',
  'Education',
  'Other',
];

router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading transactions' });
  }
});

router.get('/summary', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error calculating summary' });
  }
});

router.get('/categories', protect, async (req, res) => {
  res.json(categoryList);
});

router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching transaction' });
  }
});

router.post('/', protect, async (req, res) => {
  const { title, amount, type, category, date, notes } = req.body;

  if (!title || !amount || !type || !category) {
    return res.status(400).json({ message: 'Please provide title, amount, type, and category' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date,
      notes,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating transaction' });
  }
});

router.put('/:id', protect, async (req, res) => {
  const { title, amount, type, category, date, notes } = req.body;

  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.title = title || transaction.title;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.notes = notes ?? transaction.notes;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating transaction' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
