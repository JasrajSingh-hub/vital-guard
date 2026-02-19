import { MongoClient } from 'mongodb';
import 'dotenv/config';

let client = null;
let db = null;

const COLLECTIONS = [
  'patients',
  'vitals',
  'medications',
  'doctor_instructions',
  'nurse_tasks',
  'messages',
  'reports',
  'ai_summaries',
  'discharge_reports'
];

function getCollection(table) {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db.collection(table);
}

export async function initializeDatabase() {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'vitalguard';

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);

  const existing = await db.listCollections().toArray();
  const existingNames = new Set(existing.map(c => c.name));

  for (const name of COLLECTIONS) {
    if (!existingNames.has(name)) {
      await db.createCollection(name);
    }
  }

  await db.collection('patients').createIndex({ patient_id: 1 }, { unique: true });
  await db.collection('vitals').createIndex({ vital_id: 1 }, { unique: true });
  await db.collection('medications').createIndex({ medication_id: 1 }, { unique: true });
  await db.collection('doctor_instructions').createIndex({ instruction_id: 1 }, { unique: true });
  await db.collection('nurse_tasks').createIndex({ task_id: 1 }, { unique: true });
  await db.collection('messages').createIndex({ message_id: 1 }, { unique: true });
  await db.collection('reports').createIndex({ report_id: 1 }, { unique: true });
  await db.collection('ai_summaries').createIndex({ summary_id: 1 }, { unique: true });
  await db.collection('discharge_reports').createIndex({ report_id: 1 }, { unique: true });

  console.log('Database initialized successfully (MongoDB)');
  return db;
}

export function getDb() {
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export async function saveDb() {
  // No-op for MongoDB. Kept for API compatibility.
}

export async function findAll(table) {
  const collection = getCollection(table);
  return collection.find({}, { projection: { _id: 0 } }).toArray();
}

export async function findOne(table, filter) {
  const collection = getCollection(table);
  return collection.findOne(filter, { projection: { _id: 0 } });
}

export async function findMany(table, filter = {}, options = {}) {
  const collection = getCollection(table);
  const cursor = collection.find(filter, { projection: { _id: 0 } });

  if (options.sort) {
    cursor.sort(options.sort);
  }
  if (typeof options.limit === 'number') {
    cursor.limit(options.limit);
  }

  return cursor.toArray();
}

export async function insert(table, item) {
  const collection = getCollection(table);
  await collection.insertOne(item);
  return item;
}

export async function update(table, filter, updates) {
  const collection = getCollection(table);
  const existing = await collection.findOne(filter, { projection: { _id: 0 } });
  if (!existing) {
    return null;
  }

  await collection.updateOne(filter, { $set: updates });
  return { ...existing, ...updates };
}

export async function remove(table, filter) {
  const collection = getCollection(table);
  const existing = await collection.findOne(filter, { projection: { _id: 0 } });
  if (!existing) {
    return null;
  }

  await collection.deleteOne(filter);
  return existing;
}

export default {
  initializeDatabase,
  closeDatabase,
  getDb,
  saveDb,
  findAll,
  findOne,
  findMany,
  insert,
  update,
  remove
};
