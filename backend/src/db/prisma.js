const { PrismaClient } = require('@prisma/client');

/**
 * Initialize a single Prisma Client instance to avoid exhausting database connections.
 * This instance will be reused across the application.
 */
const prisma = new PrismaClient();

module.exports = prisma;
