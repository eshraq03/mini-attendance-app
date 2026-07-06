const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { date, level, records, stats } = JSON.parse(event.body);

    if (!date || !level || !records || !stats) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const query = `
      INSERT INTO attendance_logs (session_date, class_level, records, stats)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_date, class_level)
      DO UPDATE SET records = EXCLUDED.records, stats = EXCLUDED.stats
    `;
    
    await pool.query(query, [date, level, JSON.stringify(records), JSON.stringify(stats)]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Attendance saved successfully', date, level })
    };
  } catch (error) {
    console.error('Error in save_attendance.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
