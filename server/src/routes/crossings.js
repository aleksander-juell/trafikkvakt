const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/crossings - Get all crossings
router.get('/', async (req, res) => {
  try {
    const crossings = await prisma.crossing.findMany({
      include: {
        duties: {
          include: {
            parent: true,
            week: true
          }
        }
      }
    });
    res.json(crossings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crossings - Create a new crossing
router.post('/', async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const crossing = await prisma.crossing.create({
      data: { name, location, description }
    });
    res.status(201).json(crossing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/crossings/:id - Get a specific crossing
router.get('/:id', async (req, res) => {
  try {
    const crossing = await prisma.crossing.findUnique({
      where: { id: req.params.id },
      include: {
        duties: {
          include: {
            parent: true,
            week: true
          }
        }
      }
    });
    if (!crossing) {
      return res.status(404).json({ error: 'Crossing not found' });
    }
    res.json(crossing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/crossings/:id - Update a crossing
router.put('/:id', async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const crossing = await prisma.crossing.update({
      where: { id: req.params.id },
      data: { name, location, description }
    });
    res.json(crossing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/crossings/:id - Delete a crossing
router.delete('/:id', async (req, res) => {
  try {
    await prisma.crossing.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;