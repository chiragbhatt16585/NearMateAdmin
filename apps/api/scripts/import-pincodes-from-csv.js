/*
  Usage:
    node scripts/import-pincodes-from-csv.js /absolute/path/to/pincodes.csv [--truncate]

  CSV Requirements (header names are case-insensitive):
    pincode, city, district, state [, area]

  Notes:
    - Batches inserts in chunks of 1000 rows
    - Skips invalid rows and duplicates (uses skipDuplicates)
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BATCH_SIZE = 1000;

function normalizeHeader(h) {
  return String(h || '').trim().toLowerCase();
}

function pickColumns(record, headerMap) {
  const get = (key) => record[headerMap.get(key)] ?? '';
  return {
    pincode: String(get('pincode')).trim(),
    city: String(get('city')).trim(),
    district: String(get('district')).trim(),
    state: String(get('state')).trim(),
    area: String(get('area') ?? '').trim() || null,
  };
}

function isValidRow(row) {
  // Basic validation: 6-digit pincode and required fields
  if (!/^\d{6}$/.test(row.pincode)) return false;
  if (!row.city || !row.state || !row.district) return false;
  return true;
}

async function main() {
  const csvPath = process.argv[2];
  const shouldTruncate = process.argv.includes('--truncate');

  if (!csvPath) {
    console.error('Error: CSV path required.');
    console.error('Example: node scripts/import-pincodes-from-csv.js /absolute/path/to/pincodes.csv --truncate');
    process.exit(1);
  }

  const absPath = path.isAbsolute(csvPath) ? csvPath : path.resolve(process.cwd(), csvPath);
  if (!fs.existsSync(absPath)) {
    console.error('Error: CSV file not found at', absPath);
    process.exit(1);
  }

  if (shouldTruncate) {
    console.log('🧹 Truncating existing PincodeData...');
    await prisma.pincodeData.deleteMany({});
  }

  console.log('📥 Reading CSV:', absPath);

  const parser = fs
    .createReadStream(absPath)
    .pipe(
      parse({
        bom: true,
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    );

  let headerMap = null; // Map<normalizedHeader, originalHeader>
  let buffer = [];
  let total = 0;
  let skipped = 0;

  const flushBatch = async () => {
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = [];

    try {
      const result = await prisma.pincodeData.createMany({
        data: batch,
        skipDuplicates: true,
      });
      total += result.count;
      process.stdout.write(`\r✅ Inserted: ${total} | Skipped: ${skipped}`);
    } catch (e) {
      console.error('\n❌ Batch insert failed:', e.message);
    }
  };

  for await (const record of parser) {
    if (!headerMap) {
      // Build header map from first record's keys
      headerMap = new Map();
      const keys = Object.keys(record);
      for (const k of keys) {
        headerMap.set(normalizeHeader(k), k);
      }

      // Ensure required headers exist
      const required = ['pincode', 'city', 'district', 'state'];
      for (const r of required) {
        if (!headerMap.has(r)) {
          console.error(`\nError: Missing required column '${r}' in CSV header.`);
          process.exit(1);
        }
      }
      if (!headerMap.has('area')) headerMap.set('area', 'area'); // optional
    }

    const row = pickColumns(record, headerMap);

    if (!isValidRow(row)) {
      skipped += 1;
      continue;
    }

    buffer.push(row);
    if (buffer.length >= BATCH_SIZE) {
      await flushBatch();
    }
  }

  // Flush remaining
  await flushBatch();

  console.log(`\n\n🎉 Done. Inserted ${total} rows. Skipped ${skipped}.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Fatal import error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
