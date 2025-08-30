const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

// Input CSV from cloned repo (repo is at NearMateWeb/data/All-India-Pincode-Directory)
const inputPath = path.resolve(__dirname, '../../../data/All-India-Pincode-Directory/all-india-pincode-html-csv.csv');
// Output CSV matching our importer schema (place in NearMateWeb/data)
const outputPath = path.resolve(__dirname, '../../../data/all_india_pincodes_offices.csv');

(async () => {
	if (!fs.existsSync(inputPath)) {
		console.error(`❌ Input CSV not found at ${inputPath}`);
		process.exit(1);
	}

	const readStream = fs.createReadStream(inputPath);
	const writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
	writeStream.write('pincode,city,district,state,area\n');

	let rowCount = 0;
	let keptCount = 0;

	const parser = parse({ columns: true, skip_empty_lines: true, relax_column_count: true });

	parser.on('data', (record) => {
		rowCount++;
		const rec = {};
		for (const k of Object.keys(record)) {
			if (!k) continue;
			rec[k.toLowerCase().trim()] = typeof record[k] === 'string' ? record[k].trim() : record[k];
		}

		const pin = String(rec['pincode'] || rec['pin code'] || rec['pin'] || '').replace(/[^0-9]/g, '');
		if (!pin || pin.length !== 6) return;

		const state = rec['statename'] || rec['state'] || '';
		const district = rec['districtname'] || rec['district'] || '';
		const taluk = rec['taluk'] || rec['sub-district'] || '';
		const officeName = rec['officename'] || rec['office name'] || rec['branch office'] || '';

		const city = taluk || district || '';
		const area = officeName || '';

		if (!state || !district) return;

		const csvLine = `${pin},${escapeCsv(city)},${escapeCsv(district)},${escapeCsv(state)},${escapeCsv(area)}\n`;
		writeStream.write(csvLine);
		keptCount++;
	});

	parser.on('end', () => {
		writeStream.end();
		console.log(`✅ Transformed ${keptCount} office rows (from ${rowCount} source rows)`);
		console.log(`📁 Output: ${outputPath}`);
	});

	parser.on('error', (err) => {
		console.error('❌ CSV parse error:', err.message);
		process.exit(1);
	});

	readStream.pipe(parser);
})();

function escapeCsv(value) {
	if (value == null) return '';
	const str = String(value).replace(/\r?\n|\r/g, ' ').trim();
	if (str.includes(',') || str.includes('"')) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}
