const express = require('express');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const { queryAI } = require('../services/openRouterService');

function createCrudRoutes(Model, modelName, aiPromptPrefix) {
  const router = express.Router();

  // Helper: build where clause from query params
  function buildWhereClause(query) {
    const where = {};

    // Search across all string fields
    if (query.search) {
      const stringFields = Object.entries(Model.rawAttributes)
        .filter(([, attr]) => {
          const type = attr.type.constructor.name || attr.type.key;
          return type === 'STRING' || type === 'TEXT';
        })
        .map(([name]) => name);

      if (stringFields.length > 0) {
        where[Op.or] = stringFields.map(field => ({
          [field]: { [Op.iLike]: `%${query.search}%` }
        }));
      }
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by category
    if (query.category) {
      where.category = query.category;
    }

    // Date range filter on createdAt
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt[Op.gte] = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt[Op.lte] = new Date(query.endDate + 'T23:59:59.999Z');
      }
    }

    return where;
  }

  // Helper: build order clause
  function buildOrderClause(query) {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder || 'DESC').toUpperCase();
    return [[sortBy, sortOrder]];
  }

  // AI Query (general) - must be before /:id routes
  router.post('/ai/query', authMiddleware, async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const fullPrompt = `${aiPromptPrefix}\n\n${prompt}`;
      const aiResult = await queryAI(fullPrompt, context);
      res.json(aiResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats
  router.get('/stats', authMiddleware, async (req, res) => {
    try {
      const total = await Model.count();

      // By status
      const byStatus = {};
      if (Model.rawAttributes.status) {
        const statusGroups = await Model.findAll({
          attributes: ['status', [Model.sequelize.fn('COUNT', '*'), 'count']],
          group: ['status'],
          raw: true
        });
        statusGroups.forEach(row => {
          byStatus[row.status || 'null'] = parseInt(row.count, 10);
        });
      }

      // By category
      const byCategory = {};
      if (Model.rawAttributes.category) {
        const categoryGroups = await Model.findAll({
          attributes: ['category', [Model.sequelize.fn('COUNT', '*'), 'count']],
          group: ['category'],
          raw: true
        });
        categoryGroups.forEach(row => {
          byCategory[row.category || 'null'] = parseInt(row.count, 10);
        });
      }

      // Recent count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentCount = await Model.count({
        where: { createdAt: { [Op.gte]: sevenDaysAgo } }
      });

      res.json({ total, byStatus, byCategory, recentCount });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export as JSON
  router.get('/export', authMiddleware, async (req, res) => {
    try {
      const where = buildWhereClause(req.query);
      const order = buildOrderClause(req.query);
      const items = await Model.findAll({ where, order });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${modelName.toLowerCase().replace(/\s+/g, '-')}-export.json"`);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export as CSV
  router.get('/export/csv', authMiddleware, async (req, res) => {
    try {
      const where = buildWhereClause(req.query);
      const order = buildOrderClause(req.query);
      const items = await Model.findAll({ where, order, raw: true });

      if (items.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${modelName.toLowerCase().replace(/\s+/g, '-')}-export.csv"`);
        return res.send('');
      }

      const headers = Object.keys(items[0]);
      const csvRows = [headers.join(',')];

      for (const item of items) {
        const values = headers.map(h => {
          let val = item[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') val = JSON.stringify(val);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        csvRows.push(values.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${modelName.toLowerCase().replace(/\s+/g, '-')}-export.csv"`);
      res.send(csvRows.join('\n'));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk import
  router.post('/import', authMiddleware, async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Request body must contain a non-empty "items" array.' });
      }

      const created = await Model.bulkCreate(items, { validate: true });
      res.status(201).json({ message: `${created.length} items imported successfully.`, count: created.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk delete
  router.post('/bulk/delete', authMiddleware, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Request body must contain a non-empty "ids" array.' });
      }

      const count = await Model.destroy({ where: { id: { [Op.in]: ids } } });
      res.json({ message: `${count} items deleted.`, count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk update
  router.post('/bulk/update', authMiddleware, async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Request body must contain a non-empty "ids" array.' });
      }
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Request body must contain an "updates" object.' });
      }

      const [count] = await Model.update(updates, { where: { id: { [Op.in]: ids } } });
      res.json({ message: `${count} items updated.`, count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all with search, filter, sort, pagination
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const where = buildWhereClause(req.query);
      const order = buildOrderClause(req.query);

      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;

      const { count: total, rows: data } = await Model.findAndCountAll({
        where,
        order,
        limit,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      res.json({ data, total, page, totalPages, limit });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get by id
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      await item.update(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      await item.destroy();
      res.json({ message: `${modelName} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Duplicate a record
  router.post('/:id/duplicate', authMiddleware, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });

      const data = item.toJSON();
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;

      // Append " (Copy)" to name or title field
      if (data.name) {
        data.name = data.name + ' (Copy)';
      } else if (data.title) {
        data.title = data.title + ' (Copy)';
      }

      const newItem = await Model.create(data);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Analysis
  router.post('/:id/analyze', authMiddleware, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });

      const itemData = item.toJSON();
      const prompt = `${aiPromptPrefix}\n\nAnalyze this ${modelName}:\n${JSON.stringify(itemData, null, 2)}\n\nProvide:\n1. Detailed technical analysis\n2. Strengths and weaknesses\n3. Optimization suggestions\n4. Potential applications\n5. Risk assessment\n6. Recommended next steps`;

      const aiResult = await queryAI(prompt);

      await item.update({ aiAnalysis: aiResult });
      res.json({ item, aiResult });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createCrudRoutes;
