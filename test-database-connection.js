// pages/api/test-database.js
// Create this file in your Next.js project: pages/api/test-database.js
// Then visit: https://yourdomain.com/api/test-database

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'], // Reduce logging for web
});

export default async function handler(req, res) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // Test 1: Basic connection
    results.tests.push({ test: '1. Basic Connection', status: 'testing...' });
    await prisma.$connect();
    results.tests[0].status = '✅ Success';
    results.tests[0].message = 'Database connected successfully';

    // Test 2: Check if Agent table exists
    results.tests.push({ test: '2. Agent Table Check', status: 'testing...' });
    const tableExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'Agent'
    `;
    
    if (tableExists[0].count > 0) {
      results.tests[1].status = '✅ Success';
      results.tests[1].message = 'Agent table exists';
      
      // Test 3: Count agents
      results.tests.push({ test: '3. Count Agents', status: 'testing...' });
      const agentCount = await prisma.agent.count();
      results.tests[2].status = '✅ Success';
      results.tests[2].message = `Found ${agentCount} agents in database`;
      
    } else {
      results.tests[1].status = '❌ Failed';
      results.tests[1].message = 'Agent table does not exist - run the SQL commands first';
    }

    // Test 4: Database info
    results.tests.push({ test: '4. Database Info', status: 'testing...' });
    const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as current_db, NOW() as server_time`;
    results.tests[results.tests.length - 1].status = '✅ Success';
    results.tests[results.tests.length - 1].message = `Database: ${dbInfo[0].current_db}`;
    results.tests[results.tests.length - 1].serverTime = dbInfo[0].server_time;

    results.overall = '🎉 Database is working correctly!';

  } catch (error) {
    const errorTest = {
      test: 'Error Details',
      status: '❌ Failed',
      error: error.message,
      suggestions: []
    };

    if (error.message.includes('ECONNREFUSED')) {
      errorTest.suggestions.push('Check DATABASE_URL hostname');
      errorTest.suggestions.push('Verify database server is running');
    }
    
    if (error.message.includes('Access denied')) {
      errorTest.suggestions.push('Check username and password in DATABASE_URL');
    }
    
    if (error.message.includes('Unknown database')) {
      errorTest.suggestions.push('Check database name in DATABASE_URL');
    }

    if (error.message.includes("Table 'Agent' doesn't exist")) {
      errorTest.suggestions.push('Run the SQL commands in phpMyAdmin to create the Agent table');
    }

    results.tests.push(errorTest);
    results.overall = '❌ Database connection failed';

  } finally {
    await prisma.$disconnect();
  }

  // Return results as JSON
  res.status(200).json(results);
}