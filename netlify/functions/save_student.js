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
    const { name, roll, class: level } = JSON.parse(event.body);

    if (!name || !roll || !level) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const query = 'INSERT INTO students (name, roll_number, class_level) VALUES ($1, $2, $3) RETURNING id';
    const result = await pool.query(query, [name, roll, level]);

    const newId = result.rows[0].id.toString();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: newId, name, roll, class: level })
    };
  } catch (error) {
    console.error('Error in save_student.js:', error);
    
    if (error.code === '23505') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'Roll number already exists' })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
