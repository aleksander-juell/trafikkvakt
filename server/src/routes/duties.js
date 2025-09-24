const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/duties - Get all duties
router.get('/', async (req, res) => {
  try {
    const { weekId, crossingId } = req.query;
    
    const where = {};
    if (weekId) where.weekId = weekId;
    if (crossingId) where.crossingId = crossingId;
    
    const duties = await prisma.duty.findMany({
      where,
      include: {
        crossing: true,
        parent: true,
        week: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { timeSlot: 'asc' }
      ]
    });
    res.json(duties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/duties - Create a new duty
router.post('/', async (req, res) => {
  try {
    const { crossingId, parentId, weekId, dayOfWeek, timeSlot } = req.body;
    const duty = await prisma.duty.create({
      data: {
        crossingId,
        parentId,
        weekId,
        dayOfWeek,
        timeSlot
      },
      include: {
        crossing: true,
        parent: true,
        week: true
      }
    });
    res.status(201).json(duty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/duties/generate - Generate duties for a week
router.post('/generate', async (req, res) => {
  try {
    const { weekId, crossingIds } = req.body;
    
    // Get all parents
    const parents = await prisma.parent.findMany();
    
    if (parents.length === 0) {
      return res.status(400).json({ error: 'No parents available for duty assignment' });
    }
    
    const duties = [];
    const timeSlots = ['morning', 'afternoon'];
    const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
    
    let parentIndex = 0;
    
    for (const crossingId of crossingIds) {
      for (const dayOfWeek of daysOfWeek) {
        for (const timeSlot of timeSlots) {
          // Check if duty already exists
          const existingDuty = await prisma.duty.findUnique({
            where: {
              crossingId_weekId_dayOfWeek_timeSlot: {
                crossingId,
                weekId,
                dayOfWeek,
                timeSlot
              }
            }
          });
          
          if (!existingDuty) {
            const duty = {
              crossingId,
              parentId: parents[parentIndex % parents.length].id,
              weekId,
              dayOfWeek,
              timeSlot
            };
            duties.push(duty);
            parentIndex++;
          }
        }
      }
    }
    
    // Create all duties
    const createdDuties = await prisma.duty.createMany({
      data: duties
    });
    
    // Fetch the created duties with relations
    const result = await prisma.duty.findMany({
      where: { weekId },
      include: {
        crossing: true,
        parent: true,
        week: true
      }
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/duties/:id - Update a duty
router.put('/:id', async (req, res) => {
  try {
    const { parentId, status } = req.body;
    const duty = await prisma.duty.update({
      where: { id: req.params.id },
      data: { parentId, status },
      include: {
        crossing: true,
        parent: true,
        week: true
      }
    });
    res.json(duty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/duties/:id/swap - Request duty swap
router.post('/:id/swap', async (req, res) => {
  try {
    const { toDutyId, toParentId } = req.body;
    const fromDuty = await prisma.duty.findUnique({
      where: { id: req.params.id },
      include: { parent: true }
    });
    
    if (!fromDuty || !fromDuty.parent) {
      return res.status(404).json({ error: 'Duty or parent not found' });
    }
    
    const swap = await prisma.dutySwap.create({
      data: {
        fromDutyId: req.params.id,
        toDutyId,
        fromParentId: fromDuty.parentId,
        toParentId
      }
    });
    
    res.status(201).json(swap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/duties/:id - Delete a duty
router.delete('/:id', async (req, res) => {
  try {
    await prisma.duty.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;