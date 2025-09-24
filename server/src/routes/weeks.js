const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { startOfWeek, endOfWeek, getWeek, getYear } = require('date-fns');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/weeks - Get all weeks
router.get('/', async (req, res) => {
  try {
    const weeks = await prisma.week.findMany({
      include: {
        duties: {
          include: {
            crossing: true,
            parent: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { weekNumber: 'desc' }
      ]
    });
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/weeks - Create a new week
router.post('/', async (req, res) => {
  try {
    const { year, weekNumber, startDate } = req.body;
    
    const start = new Date(startDate);
    const end = endOfWeek(start, { weekStartsOn: 1 }); // Week starts on Monday
    
    const week = await prisma.week.create({
      data: {
        year,
        weekNumber,
        startDate: start,
        endDate: end
      }
    });
    res.status(201).json(week);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/weeks/from-date - Create week from a specific date
router.post('/from-date', async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = new Date(date);
    
    const year = getYear(targetDate);
    const weekNumber = getWeek(targetDate, { weekStartsOn: 1 });
    const start = startOfWeek(targetDate, { weekStartsOn: 1 });
    const end = endOfWeek(targetDate, { weekStartsOn: 1 });
    
    // Check if week already exists
    const existingWeek = await prisma.week.findUnique({
      where: {
        year_weekNumber: {
          year,
          weekNumber
        }
      }
    });
    
    if (existingWeek) {
      return res.json(existingWeek);
    }
    
    const week = await prisma.week.create({
      data: {
        year,
        weekNumber,
        startDate: start,
        endDate: end
      }
    });
    
    res.status(201).json(week);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/weeks/:id - Get a specific week
router.get('/:id', async (req, res) => {
  try {
    const week = await prisma.week.findUnique({
      where: { id: req.params.id },
      include: {
        duties: {
          include: {
            crossing: true,
            parent: true
          }
        }
      }
    });
    if (!week) {
      return res.status(404).json({ error: 'Week not found' });
    }
    res.json(week);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/weeks/:id - Delete a week
router.delete('/:id', async (req, res) => {
  try {
    await prisma.week.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;