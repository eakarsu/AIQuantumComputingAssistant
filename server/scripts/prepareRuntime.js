'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function main() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== 'true') throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  await sequelize.sync();
  const migrationDir = path.join(__dirname, '..', 'migrations');
  for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()) {
    await sequelize.query(fs.readFileSync(path.join(migrationDir, file), 'utf8'));
  }
  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator';
  if (!email || !password) throw new Error('Provisioned administrator credentials are required');
  const user = await User.findOne({ where: { email } });
  if (user) {
    user.password = await bcrypt.hash(password, 12);
    user.name = name;
    user.role = 'admin';
    await user.save();
  } else {
    await User.create({ email, password, name, role: 'admin' });
  }
}

main().then(() => sequelize.close()).catch(async (error) => {
  console.error(error.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
