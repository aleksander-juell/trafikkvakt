const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/children - Get all children
router.get('/', async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      include: { parent: true }
    });
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/children - Create a new child
router.post('/', async (req, res) => {
  try {
    const { name, grade, parentId } = req.body;
    const child = await prisma.child.create({
      data: { name, grade, parentId },
      include: { parent: true }
    });
    res.status(201).json(child);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/children/:id - Get a specific child
router.get('/:id', async (req, res) => {
  try {
    const child = await prisma.child.findUnique({
      where: { id: req.params.id },
      include: { parent: true }
    });
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/children/:id - Update a child
router.put('/:id', async (req, res) => {
  try {
    const { name, grade, parentId } = req.body;
    const child = await prisma.child.update({
      where: { id: req.params.id },
      data: { name, grade, parentId },
      include: { parent: true }
    });
    res.json(child);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/children/:id - Delete a child
router.delete('/:id', async (req, res) => {
  try {
    await prisma.child.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;