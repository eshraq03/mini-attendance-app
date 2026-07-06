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
    const { roll } = JSON.parse(event.body);

    if (!roll) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing roll number' }) };
    }

    const query = 'DELETE FROM students WHERE roll_number = $1';
    await pool.query(query, [roll]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Student deleted successfully', roll })
    };
  } catch (error) {
    console.error('Error in delete_student.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
