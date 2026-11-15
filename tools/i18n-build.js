// Merges i18n/ru/*.json into src/i18n/ru.json and reports English strings still without a Russian version.
const fs = require('fs'); const path = require('path');
const dir = 'i18n/ru'; const ru = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) Object.assign(ru, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
fs.writeFileSync('src/i18n/ru.json', JSON.stringify(ru));
const en = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'));
const M = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/;
const keep = new Set(JSON.parse(fs.readFileSync('i18n/keep.json', 'utf8'))); // names, emails, addresses: same in Russian
const missing = en.filter(x => !(x.en in ru) && !keep.has(x.en) && !/^Vol /.test(x.en) && !(M.test(x.en) && !/[a-z]{2}/.test(x.en.replace(new RegExp(M, 'g'), ''))));
console.log('dictionary', Object.keys(ru).length, 'missing', missing.length);
if (missing.length) console.log(missing.slice(0, 40).map(x => x.at + '  ' + JSON.stringify(x.en)).join('\n'));
