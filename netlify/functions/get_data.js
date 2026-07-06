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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const studentsResult = await pool.query('SELECT id, name, roll_number, class_level FROM students ORDER BY id ASC');
    const logsResult = await pool.query("SELECT id, TO_CHAR(session_date, 'YYYY-MM-DD') AS session_date, class_level, records, stats FROM attendance_logs ORDER BY session_date DESC");

    const students = studentsResult.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      roll: row.roll_number,
      class: row.class_level
    }));

    const logs = logsResult.rows.map(row => ({
      date: row.session_date,
      level: row.class_level,
      records: row.records,
      stats: row.stats
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ students, logs })
    };
  } catch (error) {
    console.error('Error fetching data in get_data.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
