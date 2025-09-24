const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/parents - Get all parents
router.get('/', async (req, res) => {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        children: true,
        duties: {
          include: {
            crossing: true,
            week: true
          }
        }
      }
    });
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/parents - Create a new parent
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const parent = await prisma.parent.create({
      data: { name, email, phone },
      include: { children: true }
    });
    res.status(201).json(parent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/parents/:id - Get a specific parent
router.get('/:id', async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id: req.params.id },
      include: {
        children: true,
        duties: {
          include: {
            crossing: true,
            week: true
          }
        }
      }
    });
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    res.json(parent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/parents/:id - Update a parent
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const parent = await prisma.parent.update({
      where: { id: req.params.id },
      data: { name, email, phone },
      include: { children: true }
    });
    res.json(parent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/parents/:id - Delete a parent
router.delete('/:id', async (req, res) => {
  try {
    await prisma.parent.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;