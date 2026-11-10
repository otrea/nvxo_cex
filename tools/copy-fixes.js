// Copy fixes made in Figma on 10 Nov 2026 (both pages), mirrored into src/design/screens.json without a re-export.
const fs = require('fs'); const P = 'src/design/screens.json';
const MAP = {
  'The regulated exchange of the NVXO ecosystem': 'Crypto exchange of the NVXO ecosystem',
  'The regulated exchange of the NVXO ecosystem.': 'Crypto exchange of the NVXO ecosystem.',
  'Material Icons': 'Material Symbols',
  'Available 56.000 ETH': 'Available 56.0000 ETH',
  'Buying up to 30.000 ETH': 'Buying up to 30.0000 ETH',
  '1. Use a backup code': '1. Use your backup key',
  'If you saved backup codes when you set up 2FA, enter one on the login screen instead of the 6-digit code.': 'If you saved your backup key when you set up 2FA, add it to a new authenticator app to get your codes back.',
  'No backup codes? Tap “Lost your device?” on the login screen and confirm the link we send to your email.': 'No backup key? Tap “Can’t use your authenticator?” on the login screen and confirm the code we send to your email.',
  'Once you’re back in, add a new authenticator app in Security and save the new backup codes.': 'Once you’re back in, set up 2FA again in Security and save the new backup key.',
  'Est. daily rewards': 'Est. daily reward',
  'Anytime': 'Any time',
  'Redeem anytime': 'Redeem any time',
};
const s = JSON.parse(fs.readFileSync(P, 'utf8')); let n = 0;
const walk = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk);
  if (Array.isArray(o.sg)) for (const g of o.sg) if (Array.isArray(g) && typeof g[0] === 'string' && MAP[g[0]]) { g[0] = MAP[g[0]]; n++; }
  for (const k in o) if (typeof o[k] === 'object') walk(o[k]); };
for (const x of Object.values(s)) walk(x.tree || x.patch);
fs.writeFileSync(P, JSON.stringify(s)); console.log('replaced', n);
