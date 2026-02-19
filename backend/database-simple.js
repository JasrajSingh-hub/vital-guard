import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, 'vitalguard.json');

// Default database structure
const defaultData = {
  patients: [],
  vitals: [],
  medications: [],
  doctor_instructions: [],
  nurse_tasks: [],
  messages: [],
  reports: [],
  ai_summaries: [],
  discharge_reports: []
};

let db;

// Initialize database
export async function initializeDatabase() {
  const adapter = new JSONFile(dbPath);
  db = new Low(adapter, defaultData);
  
  await db.read();
  
  // Initialize with default data if empty
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = defaultData;
    await db.write();
  }
  
  console.log('✅ Database initialized successfully');
  return db;
}

// Helper functions
export function getDb() {
  return db;
}

export async function saveDb() {
  await db.write();
}

// Query helpers
export function findAll(table) {
  return db.data[table] || [];
}

export function findOne(table, predicate) {
  return db.data[table]?.find(predicate) || null;
}

export function findMany(table, predicate) {
  return db.data[table]?.filter(predicate) || [];
}

export function insert(table, item) {
  if (!db.data[table]) {
    db.data[table] = [];
  }
  db.data[table].push(item);
  return item;
}

export function update(table, predicate, updates) {
  const index = db.data[table]?.findIndex(predicate);
  if (index !== -1) {
    db.data[table][index] = { ...db.data[table][index], ...updates };
    return db.data[table][index];
  }
  return null;
}

export function remove(table, predicate) {
  const index = db.data[table]?.findIndex(predicate);
  if (index !== -1) {
    const removed = db.data[table].splice(index, 1);
    return removed[0];
  }
  return null;
}

export default {
  initializeDatabase,
  getDb,
  saveDb,
  findAll,
  findOne,
  findMany,
  insert,
  update,
  remove
};
