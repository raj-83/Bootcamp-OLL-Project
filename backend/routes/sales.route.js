import express from 'express';
import Sales from '../models/sales.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all sales for a student
router.get('/my-sales', protect, async (req, res) => {
  try {
    const sales = await Sales.find({ student: req.user._id })
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// Get sales for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
      const studentId = req.params.studentId;
      
      // Find sales for the student
      const sales = await Sales.find({ student: studentId }).sort({ date: -1 });
      
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Create a new sale
router.post('/', protect, async (req, res) => {
  try {
    const { product, amount, customer, notes } = req.body;
    
    const newSale = await Sales.create({
      student: req.user._id,
      product,
      amount,
      customer,
      notes,
      date: new Date()
    });

    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Get sales statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Get daily sales for the last 30 days
    const dailySales = await Sales.aggregate([
      {
        $match: {
          student: req.user._id,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get monthly sales for the current year
    const currentYear = today.getFullYear();
    const monthlySales = await Sales.aggregate([
      {
        $match: {
          student: req.user._id,
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      dailySales: dailySales.map(sale => ({
        date: sale._id,
        amount: sale.amount
      })),
      monthlySales: monthlySales.map(sale => ({
        date: new Date(currentYear, sale._id - 1).toLocaleString('default', { month: 'short' }),
        amount: sale.amount
      }))
    });
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    res.status(500).json({ error: 'Failed to fetch sales statistics' });
  }
});

export default router; 