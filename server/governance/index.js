'use strict';
const { createRouter } = require('./router'); const { sequelize } = require('./store'); const { evaluate } = require('./domain');
const { sequelize: database } = require('../models'); const auth = require('../middleware/auth');
module.exports = createRouter({ db: sequelize(database), auth, evaluate, workflow: 'quantum-knowledge-answer', providers: ['repository','object-storage','parser','embedding-index','quantum-docs-api'], approverRoles: ['quantum_reviewer','knowledge_admin','privacy_officer','admin'] });
