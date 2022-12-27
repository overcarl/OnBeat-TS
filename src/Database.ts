import postgres from 'postgres'

const sqlUrl = process.env.sql as string;

const sql = postgres(sqlUrl);

export default sql;