/**
 * Test dymny BusLife Kujawy — renderuje wszystkie widoki w jsdom
 * i sprawdza, czy nie ma błędów JavaScriptu oraz czy dane są spójne.
 * Uruchomienie: npm install --no-save jsdom && node scripts/smoke.mjs
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => {
  const m = (e && e.message) || '';
  if (!/Not implemented/.test(m)) errors.push(m);
});
vc.on('error', (...a) => errors.push(a.map(String).join(' ')));

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window;
w.scrollTo = () => {};
w.matchMedia = w.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));

for (const f of ['js/data.js', 'js/logos.js', 'js/core.js', 'js/pages.js', 'js/app.js']) {
  try {
    w.eval(fs.readFileSync(path.join(root, f), 'utf8'));
  } catch (e) {
    errors.push(`EVAL ${f}: ${e.message}`);
  }
}

const L = w.BUSLIFE;
if (!L) {
  console.error('BŁĄD: brak globalnego obiektu BUSLIFE');
  process.exit(1);
}

let checks = 0;
const assert = (cond, msg) => {
  checks += 1;
  if (!cond) errors.push('ASSERT: ' + msg);
};

assert(L.BUSES.length > 200, 'baza taboru powinna mieć >200 rekordów');
assert((L.LINES.wloclawek || []).length >= 10, 'Włocławek: min. 10 linii');
assert((L.LINES.torun || []).length >= 20, 'Toruń: min. 20 linii');

L.BUSES.forEach((b) => {
  assert(!!b.fleetNumber, `pojazd ${b.id} bez numeru taborowego`);
  assert(!!b.brand && !!b.model, `pojazd ${b.id} bez marki/modelu`);
  assert(['wloclawek', 'torun'].includes(b.city), `pojazd ${b.id} — nieznane miasto`);
  if (b.photo) assert(fs.existsSync(path.join(root, b.photo)), `brak pliku zdjęcia ${b.photo}`);
  if (Number(b.seats) && Number(b.standing)) {
    assert(Number(b.capacity) === Number(b.seats) + Number(b.standing), `pojemność ${b.id} niezgodna`);
  }
  (b.lines || []).forEach((ln) => {
    assert(!!(L.LINES[b.city] || []).find((x) => String(x.n) === String(ln)), `pojazd ${b.id} — linia ${ln} nie istnieje w ${b.city}`);
  });
});

Object.entries(L.LINES).forEach(([city, lines]) => {
  lines.forEach((line) => {
    assert(!!line.freq && !!line.freq.weekday, `linia ${city}/${line.n} bez rozkładu`);
    ['weekday', 'saturday', 'sunday'].forEach((d) => {
      const f = line.freq[d];
      assert(!!f && ('first' in f) && ('last' in f), `linia ${city}/${line.n} — brak ${d}`);
    });
  });
});

const routes = ['#/', '#/tabor', '#/tabor?city=torun&prop=elektryczny', '#/bus/wlo-007', '#/bus/tor-685',
  '#/bus/wlo-360', '#/bus/tor-413', '#/bus/wlo-601', '#/linie', '#/linia/wloclawek/3',
  '#/linia/torun/N91', '#/linia/torun/10', '#/mapa?city=torun', '#/dodaj', '#/edytuj/wlo-007',
  '#/moje', '#/o-aplikacji'];

for (const r of routes) {
  w.location.hash = r;
  try {
    w.BusApp.render();
  } catch (e) {
    errors.push(`RENDER ${r}: ${e.message}`);
  }
  const view = w.document.getElementById('view');
  assert(view && view.innerHTML.length > 200, `widok ${r} jest pusty`);
}

const A = w.BusApp;
const line21 = A.lineByNumber('wloclawek', '21');
assert(!!line21, 'brak linii 21 we Włocławku');
assert(A.nextDepartures(line21, 4, new Date('2026-11-03T14:05:00')).length > 0, 'brak odjazdów linii 21');
assert(A.searchBuses('023', {})[0] && A.searchBuses('023', {})[0].fleetNumber === '023', 'wyszukiwanie numeru 023');
assert(A.searchBuses('solaris', {}).length > 50, 'wyszukiwanie marki Solaris');

if (errors.length) {
  console.error('❌ Test dymny nie powiódł się:\n' + errors.map((e) => ' — ' + e).join('\n'));
  process.exit(1);
}
console.log(`✅ Test dymny OK — ${checks} asercji, ${L.BUSES.length} pojazdów, ${routes.length} widoków.`);
process.exit(0);
