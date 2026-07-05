import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load env variables from root or apps/backend or local packages/database
// We try to locate any dotenv files
const rootDir = path.resolve(__dirname, '../../..');
const envPath = path.resolve(rootDir, 'apps/backend/.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment from: ${envPath}`);
} else {
  dotenv.config();
}

const provider = (process.env.DATABASE_PROVIDER || 'sqlite').toLowerCase();
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  if (provider === 'sqlite') {
    // Default SQLite URL relative to packages/database/prisma/dev.db
    dbUrl = 'file:./dev.db';
    process.env.DATABASE_URL = dbUrl;
    console.log(`No DATABASE_URL found. Using default SQLite database: ${dbUrl}`);
  } else {
    console.error(`ERROR: DATABASE_URL environment variable is required for provider "${provider}"`);
    process.exit(1);
  }
}

console.log(`Initializing database setup for provider: "${provider}"`);

const templatePath = path.resolve(__dirname, '../prisma/schema.template.prisma');
const outputPath = path.resolve(__dirname, '../prisma/schema.prisma');

if (!fs.existsSync(templatePath)) {
  console.error(`Template schema file not found at ${templatePath}`);
  process.exit(1);
}

let template = fs.readFileSync(templatePath, 'utf8');

// Replacement mappings based on provider
let idDef = 'String @id @default(uuid())';
let fkDef = 'String';
let fkOptDef = 'String?';

if (provider === 'mongodb') {
  idDef = 'String @id @default(auto()) @map("_id") @db.ObjectId';
  fkDef = 'String @db.ObjectId';
  fkOptDef = 'String? @db.ObjectId';
}

template = template.replace(/__PROVIDER__/g, provider);
template = template.replace(/__ID__/g, idDef);
template = template.replace(/__FK__/g, fkDef);
template = template.replace(/__FK_OPT__/g, fkOptDef);

// Create prisma folder if not exists
const prismaDir = path.dirname(outputPath);
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

fs.writeFileSync(outputPath, template, 'utf8');
console.log(`Generated Prisma schema at: ${outputPath}`);

// Run prisma generate
try {
  console.log('Running prisma generate...');
  execSync('npx prisma generate', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });
  console.log('Prisma client generated successfully.');
} catch (error) {
  console.error('Failed to run prisma generate:', error);
  process.exit(1);
}

// Push schema changes (or deploy migrations) if not in production, or if explicitly requested
const isProduction = process.env.NODE_ENV === 'production';
const runPush = process.argv.includes('--push') || !isProduction;

if (runPush) {
  try {
    console.log(`Pushing schema changes to database (Provider: ${provider})...`);
    execSync('npx prisma db push --skip-generate', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
    console.log('Database schema pushed successfully.');
  } catch (error) {
    console.error('Failed to push schema changes:', error);
    process.exit(1);
  }
}
