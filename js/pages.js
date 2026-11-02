/* =====================================================================
   BusLife Kujawy — widoki: linie, mapa, moje, dodawanie/edycja, o aplikacji
   ===================================================================== */

(function () {
  'use strict';

  const App = window.BusApp;
  const D = App.D;
  const H = App.H;
  App.views = App.views || {};

  /* ================================ LINIE ================================ */

  App.views.lines = function () {
    const city = App.state.lineCity;
    const meta = D.CITIES[city];
    const lines = App.linesForCity(city);
    const stats = H.stats(city);
    const night = lines.filter((l) => l.night).length;
    const suburban = lines.filter((l) => l.type === 'podmiejska').length;

    const rows = lines.map((line) => {
      const next = App.nextDepartureIn(line);
      const typeCls = line.night ? 'night' : line.type === 'podmiejska' ? 'suburban' : '';
      return `
        <a class="line-row" href="#/linia/${city}/${encodeURIComponent(line.n)}">
          <span class="line-bullet ${typeCls}">${App.esc(line.n)}</span>
          <span class="line-main">
            <span class="line-title">${App.esc(line.from)} <span class="arrow">→</span> ${App.esc(line.to)}</span>
            <span class="line-meta">
              ${line.runtime ? `<span>⏱ ${line.runtime} min</span>` : ''}
              <span>${line.night ? 'linia nocna' : line.type === 'podmiejska' ? 'podmiejska' : 'miejska'}</span>
              <span>${App.esc((line.freq.weekday.first || '—') + '–' + (line.freq.weekday.last || '—'))}</span>
              ${line.incomplete ? '<span style="color:var(--amber)">dane do uzupełnienia</span>' : ''}
            </span>
          </span>
          <span class="line-next">
            <b>${next != null ? (next === 0 ? 'teraz' : next + ' min') : '—'}</b>
            <span>następny</span>
          </span>
        </a>`;
    }).join('');

    return `
      <section class="section" style="margin-top:4px">
        <div class="row-between wrap">
          <div>
            <span class="eyebrow"><span class="dot"></span> Rozkłady i trasy</span>
            <h1 style="margin-top:8px">Linie ${App.esc(meta.name)}</h1>
            <p class="muted small" style="margin-top:6px">${lines.length} linii · ${night} nocnych · ${suburban} podmiejskich · ${stats.active} autobusów w taborze</p>
          </div>
        </div>

        <div class="segmented" role="tablist" aria-label="Wybór miasta">
          ${Object.values(D.CITIES).map((c) => `<button role="tab" aria-selected="${c.id === city}" class="${c.id === city ? 'is-on' : ''}" data-city="${c.id}">${App.esc(c.name)}</button>`).join('')}
        </div>

        <div class="chips" id="line-type-chips">
          <button class="chip is-on" data-type="all">Wszystkie <span class="count">${lines.length}</span></button>
          <button class="chip" data-type="miejska">Dzienne</button>
          <button class="chip" data-type="nocna">Nocne <span class="count">${night}</span></button>
          <button class="chip" data-type="podmiejska">Podmiejskie <span class="count">${suburban}</span></button>
        </div>

        <div class="line-list" id="line-list" style="margin-top:12px">${rows}</div>

        <div class="disclaimer mt-14">
          ${App.icon('info', 17)}
          <div><b>Godziny orientacyjne.</b> „Następny odjazd” jest szacowany na podstawie częstotliwości kursowania (symulacja). Przed podróżą sprawdź oficjalny rozkład: <a href="${App.esc(meta.timetable)}" target="_blank" rel="noopener">${App.esc(meta.carrier)}</a>.</div>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('bus', 17)} Tabor w mieście</h3><span class="badge">${stats.active} wozów</span></div>
          <div class="stat-grid">
            ${App.statCard('Elektryczne', stats.electric, 'szt.', stats.electricPct, 'green')}
            ${App.statCard('Niskopodłogowe', stats.lowFloorPct, '%', stats.lowFloorPct)}
            ${App.statCard('Klimatyzacja', stats.acPct, '%', stats.acPct, 'sky')}
            ${App.statCard('WiFi', stats.wifiPct, '%', stats.wifiPct, 'sky')}
          </div>
          <a class="btn btn-block mt-10" href="#/tabor?city=${city}">${App.icon('grid', 16)} Zobacz cały tabor</a>
        </div>
      </section>`;
  };

  App.mountLines = function () {
    const view = document.getElementById('view');
    view.querySelectorAll('[data-city]').forEach((btn) => {
      btn.addEventListener('click', () => {
        App.state.lineCity = btn.dataset.city;
        history.replaceState(null, '', '#/linie?city=' + btn.dataset.city);
        App.render();
      });
    });
    const chips = view.querySelectorAll('#line-type-chips .chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('is-on'));
        chip.classList.add('is-on');
        const type = chip.dataset.type;
        view.querySelectorAll('#line-list .line-row').forEach((row) => {
          const isNight = !!row.querySelector('.line-bullet.night');
          const isSub = !!row.querySelector('.line-bullet.suburban');
          const show = type === 'all' || (type === 'nocna' && isNight) || (type === 'podmiejska' && isSub) || (type === 'miejska' && !isNight && !isSub);
          row.classList.toggle('hidden', !show);
        });
      });
    });
  };

  /* ============================== LINIA ============================== */

  App.views.lineDetail = function (city, n) {
    const meta = D.CITIES[city];
    const line = App.lineByNumber(city, n);
    if (!meta || !line) {
      return `<div class="empty" style="margin-top:20px"><div class="big">🛣️</div><h3>Nie znaleziono linii</h3><p>Wybierz linię z listy.</p><a class="btn btn-primary btn-sm" href="#/linie">Wróć do linii</a></div>`;
    }

    const next = App.nextDepartures(line, 4);
    const now = new Date();
    const nextIn = App.nextDepartureIn(line);
    const typeCls = line.night ? 'night' : line.type === 'podmiejska' ? 'suburban' : '';
    const freq = line.freq;
    const buses = H.busesForLine(city, line.n);
    const days = [
      ['Dni robocze', freq.weekday],
      ['Soboty', freq.saturday],
      ['Niedziele i święta', freq.sunday]
    ];

    return `
      <section class="section" style="margin-top:2px">
        <a class="btn btn-ghost btn-sm" href="#/linie" style="margin-bottom:12px">${App.icon('arrowLeft', 15)} Linie</a>

        <div class="panel" style="margin-top:0;background:linear-gradient(150deg,rgba(56,189,248,.12),rgba(17,26,43,.95) 62%)">
          <div class="row gap-10 wrap">
            <div class="line-bullet ${typeCls}" style="width:60px;height:60px;border-radius:16px;font-size:1.28rem">${App.esc(line.n)}</div>
            <div style="flex:1;min-width:180px">
              <div class="eyebrow">${line.night ? 'Linia nocna' : line.type === 'podmiejska' ? 'Linia podmiejska' : 'Linia miejska'} · ${App.esc(meta.carrier)}</div>
              <h1 style="font-size:1.42rem;margin-top:5px">${App.esc(line.from)} <span style="color:var(--muted)">→</span> ${App.esc(line.to)}</h1>
              <p class="small muted" style="margin-top:5px">${App.esc(line.via || '')}</p>
            </div>
          </div>

          <div class="row gap-6 wrap mt-14">
            <span class="badge">${line.runtime ? '⏱ ' + line.runtime + ' min' : '⏱ —'}</span>
            <span class="badge">${line.stops && line.stops.length ? line.stops.length + ' przystanków' : 'przystanki do uzupełnienia'}</span>
            ${line.lowFloor ? '<span class="badge electric">♿ niskopodłogowa</span>' : ''}
            ${line.incomplete ? '<span class="badge historic">dane częściowe</span>' : ''}
          </div>

          <div class="panel" style="margin-top:14px;background:rgba(6,10,18,.35)">
            <div class="panel-head" style="margin-bottom:6px">
              <h3>${App.icon('clock', 17)} Następne odjazdy</h3>
              <span class="tiny muted">szacunek · ${App.esc(now.toLocaleDateString('pl-PL', { weekday: 'long' }))}</span>
            </div>
            <div class="row" style="gap:14px;align-items:flex-end;flex-wrap:wrap">
              <div class="mono" style="font-size:1.9rem;font-weight:900;color:var(--amber);line-height:1">${nextIn != null && nextIn < 60 ? (nextIn === 0 ? 'teraz' : nextIn + ' min') : next.length ? next[0] != null ? App.minutesToTime(next[0]) : '—' : 'koniec kursów'}</div>
              <div class="row gap-6 wrap" style="padding-bottom:3px">
                ${next.slice(1).map((t) => `<span class="badge mono">${App.minutesToTime(t)}</span>`).join('')}
              </div>
            </div>
            <p class="tiny muted" style="margin-top:8px">Odjazdy z pętli „${App.esc(line.from)}”. Częstotliwość: ${App.esc(freq.weekday.peak)} w szczycie.</p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('calendar', 17)} Kiedy kursuje</h3></div>
          <div style="overflow-x:auto">
            <table class="schedule-table">
              <thead><tr><th>Dzień</th><th>Pierwszy</th><th>Ostatni</th><th>Szczyt</th><th>Poza szczytem</th><th>Wieczór</th></tr></thead>
              <tbody>
                ${days.map(([label, f]) => `<tr>
                  <td>${App.esc(label)}</td>
                  <td class="mono">${App.esc(f.first || '—')}</td>
                  <td class="mono">${App.esc(f.last || '—')}</td>
                  <td>${App.esc(f.peak || '—')}</td>
                  <td>${App.esc(f.offPeak || '—')}</td>
                  <td>${App.esc(f.evening || '—')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          ${line.note ? `<p class="small muted mt-10">ℹ️ ${App.esc(line.note)}</p>` : ''}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('route', 17)} Przebieg trasy</h3><span class="badge">${line.stops ? line.stops.length : 0}</span></div>
          ${line.stops && line.stops.length
            ? `<div class="route-strip">${line.stops.map((s, i) => `<span class="route-stop${i === 0 || i === line.stops.length - 1 ? ' end' : ''}">${App.esc(s)}</span>`).join('')}</div>`
            : `<p class="small muted">Trasa tej linii nie została jeszcze opisana w bazie. Możesz dodać ją w swojej notatce.</p>`}
        </div>

        <div class="section-head" style="margin-top:22px">
          <h2>Co tu jeździ</h2>
          <a class="link" href="#/tabor?city=${city}&line=${encodeURIComponent(line.n)}">Zobacz wszystkie →</a>
        </div>
        ${buses.length ? App.busGrid(buses.slice(0, 8)) : `<div class="empty"><div class="big">🚌</div><h3>Brak przypisanych wozów</h3><p>Przypisz autobusy do tej linii w karcie pojazdu.</p></div>`}

        <div class="disclaimer mt-14">
          ${App.icon('info', 17)}
          <div>Oficjalny rozkład: <a href="${App.esc(meta.timetable)}" target="_blank" rel="noopener">${App.esc(meta.carrier)} — rozkłady jazdy</a>. Godziny w aplikacji są orientacyjne.</div>
        </div>
      </section>`;
  };

  App.mountLineDetail = function () {
    // Widok statyczny — rozkłady są wyliczane przy renderowaniu.
  };

  /* ================================ MAPA ================================ */

  const MAP_NODES = {
    wloclawek: [
      { x: 165, y: 105, label: 'Grodzka' },
      { x: 250, y: 175, label: 'Pl. Kopernika' },
      { x: 330, y: 230, label: 'Pl. Wolności' },
      { x: 420, y: 250, label: 'Dworzec PKP' },
      { x: 600, y: 150, label: 'Anwil' },
      { x: 150, y: 210, label: 'Wiejska' },
      { x: 240, y: 300, label: 'Kaliska' },
      { x: 300, y: 420, label: 'Ostrowska' },
      { x: 180, y: 400, label: 'Promienna' },
      { x: 470, y: 430, label: 'Rybnicka' },
      { x: 120, y: 320, label: 'Dębowa' },
      { x: 70, y: 280, label: 'Świętosław' },
      { x: 390, y: 360, label: 'Stodólna' }
    ],
    torun: [
      { x: 170, y: 100, label: 'Wrzosy I' },
      { x: 90, y: 70, label: 'Barbarka' },
      { x: 250, y: 160, label: 'Uniwersytet' },
      { x: 400, y: 200, label: 'Pl. Rapackiego' },
      { x: 430, y: 160, label: 'Dworzec Główny' },
      { x: 300, y: 95, label: 'Bielany' },
      { x: 200, y: 250, label: 'Glinki' },
      { x: 150, y: 320, label: 'Koniuchy' },
      { x: 100, y: 360, label: 'Forteczna' },
      { x: 480, y: 300, label: 'Pl. Św. Katarzyny' },
      { x: 450, y: 330, label: 'Podgórz' },
      { x: 560, y: 380, label: 'Czerniewice' },
      { x: 600, y: 220, label: 'Rubinkowo' },
      { x: 650, y: 280, label: 'Dworzec Wschodni' },
      { x: 700, y: 180, label: 'Olimpijska P&R' },
      { x: 540, y: 420, label: 'Mazowiecka' },
      { x: 720, y: 380, label: 'Port Drzewny' }
    ]
  };

  const MAP_ROUTES = {
    wloclawek: [
      { d: 'M165,105 C200,130 220,150 250,175 S310,205 330,230 S300,265 240,300 S165,240 150,210', color: '#fbbf24', dur: 22, count: 3, label: '1' },
      { d: 'M150,210 C175,240 205,275 240,300 C300,320 380,290 420,250 C440,300 410,345 390,360 C360,390 330,405 300,420', color: '#38bdf8', dur: 26, count: 3, label: '5' },
      { d: 'M470,430 C510,410 545,405 540,390 C520,420 340,440 300,420 C330,395 360,375 390,360 C370,330 345,300 330,230 C290,260 240,275 190,255 C170,240 155,225 150,210', color: '#34d399', dur: 34, count: 4, label: '14' },
      { d: 'M150,210 C185,250 215,280 240,300 C255,320 250,360 230,385 C215,400 195,405 180,400', color: '#f472b6', dur: 19, count: 2, label: '21' },
      { d: 'M300,420 C310,395 320,380 330,370 C340,340 335,275 330,230 C370,215 420,195 470,180 C510,168 555,158 600,150', color: '#a78bfa', dur: 28, count: 2, label: '3' },
      { d: 'M70,280 C90,295 105,308 120,320 C150,330 195,315 240,300 C275,330 260,370 240,390 C220,405 195,408 180,400', color: '#fb923c', dur: 24, count: 2, label: '13' }
    ],
    torun: [
      { d: 'M180,180 C195,210 200,230 200,250 C215,240 240,230 260,225 C300,222 350,215 400,200 C360,180 320,150 300,95', color: '#fbbf24', dur: 21, count: 3, label: '10' },
      { d: 'M560,380 C520,360 480,345 450,330 C465,315 472,308 480,300 C470,270 440,230 400,200 C330,240 240,290 150,320', color: '#38bdf8', dur: 27, count: 3, label: '11' },
      { d: 'M600,470 C570,450 545,435 540,420 C510,400 470,360 450,330 C440,290 415,235 400,200 C410,180 423,170 430,160 C420,145 390,130 360,120', color: '#34d399', dur: 33, count: 4, label: '14' },
      { d: 'M600,220 C625,240 645,265 650,280 C620,265 580,250 540,240 C480,228 440,215 400,200 C360,170 320,140 300,95 C270,75 240,65 220,60', color: '#f472b6', dur: 25, count: 3, label: '15' },
      { d: 'M700,180 C650,195 600,215 540,240 C490,255 440,225 400,200 C415,180 423,170 430,160 C470,210 510,340 540,420', color: '#a78bfa', dur: 30, count: 3, label: '33' },
      { d: 'M520,360 C500,335 485,315 480,300 C465,270 440,230 400,200 C450,185 470,180 500,190 C560,205 640,200 700,180', color: '#fb923c', dur: 23, count: 3, label: 'N91' }
    ]
  };

  function riverPath(city) {
    return city === 'wloclawek'
      ? 'M640,-20 C610,80 590,160 560,250 C530,340 500,420 470,560'
      : 'M520,-20 C505,90 490,180 470,270 C452,360 436,450 420,560';
  }

  function buildMapSVG(city) {
    const nodes = MAP_NODES[city] || [];
    const routes = MAP_ROUTES[city] || [];
    const meta = D.CITIES[city];
    const dots = routes.map((route, ri) =>
      Array.from({ length: route.count }).map((_, i) => {
        const begin = -(i * (route.dur / route.count) + ri * 1.7);
        return `<g class="vehicle-dot">
          <circle r="9" fill="${route.color}" opacity="0.16">
            <animateMotion dur="${route.dur}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite" path="${route.d}" rotate="auto"/>
          </circle>
          <circle r="4.6" fill="${route.color}" stroke="#050a12" stroke-width="1.4">
            <animateMotion dur="${route.dur}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite" path="${route.d}" rotate="auto"/>
          </circle>
        </g>`;
      }).join('')
    ).join('');

    return `
      <svg class="map-canvas" viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schemat sieci ${App.esc(meta.name)}">
        <defs>
          <linearGradient id="map-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0b1626"/>
            <stop offset="100%" stop-color="#060c16"/>
          </linearGradient>
          <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0b3a5c"/>
            <stop offset="100%" stop-color="#08263d"/>
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(148,163,184,0.07)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="800" height="520" fill="url(#map-bg)"/>
        <rect width="800" height="520" fill="url(#grid)"/>
        <path d="${riverPath(city)}" stroke="url(#river)" stroke-width="54" fill="none" opacity="0.9" stroke-linecap="round"/>
        <path d="${riverPath(city)}" stroke="rgba(56,189,248,0.22)" stroke-width="2" fill="none"/>
        <text x="${city === 'wloclawek' ? 620 : 500}" y="470" fill="#1d4ed8" font-family="Inter, sans-serif" font-size="11" font-weight="700" transform="rotate(-72 ${city === 'wloclawek' ? 620 : 500} 470)" opacity="0.75">WISŁA</text>

        ${routes.map((r) => `<g>
          <path d="${r.d}" stroke="${r.color}" stroke-width="7" fill="none" opacity="0.1" stroke-linecap="round"/>
          <path d="${r.d}" stroke="${r.color}" stroke-width="2.2" fill="none" opacity="0.5" stroke-linecap="round" stroke-dasharray="1 0"/>
        </g>`).join('')}

        ${nodes.map((n) => `<g>
          <circle cx="${n.x}" cy="${n.y}" r="5.2" fill="#0a1220" stroke="#94a3b8" stroke-width="1.8"/>
          <circle cx="${n.x}" cy="${n.y}" r="1.8" fill="#cbd5e1"/>
          <text x="${n.x + 9}" y="${n.y + 4}" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#93a1bb">${App.esc(n.label)}</text>
        </g>`).join('')}

        ${dots}

        <g opacity="0.85">
          <rect x="16" y="470" width="150" height="34" rx="9" fill="rgba(6,10,18,0.75)" stroke="rgba(148,163,184,0.18)"/>
          <text x="28" y="492" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="${meta.color}">${App.esc(meta.carrier)}</text>
          <text x="112" y="492" font-family="Inter, sans-serif" font-size="9.5" fill="#8b9ab5">schemat</text>
        </g>
      </svg>`;
  }

  App.views.map = function () {
    const city = App.state.mapCity;
    const meta = D.CITIES[city];
    const snap = App.liveSnapshot();
    const activeCity = snap.active.filter((b) => b.city === city).slice(0, 10);
    const stats = H.stats(city);
    const now = new Date();

    return `
      <section class="section" style="margin-top:4px">
        <span class="eyebrow"><span class="dot"></span> Podgląd sieci</span>
        <h1 style="margin-top:8px">Mapa i ruch</h1>
        <p class="muted small" style="margin-top:6px">Schemat sieci połączeń z symulacją rozmieszczenia pojazdów.</p>

        <div class="segmented" role="tablist" aria-label="Wybór miasta">
          ${Object.values(D.CITIES).map((c) => `<button role="tab" aria-selected="${c.id === city}" class="${c.id === city ? 'is-on' : ''}" data-map-city="${c.id}">${App.esc(c.name)}</button>`).join('')}
        </div>

        <div class="map-shell mt-14">
          <div class="map-overlay">
            <span class="map-pill"><span class="live-dot" style="width:6px;height:6px"></span> SYMULACJA · ${now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
            <span class="map-pill">${App.esc(meta.carrier)} · ${activeCity.length} pojazdów w ruchu</span>
          </div>
          ${buildMapSVG(city)}
          <div class="map-legend">
            ${MAP_ROUTES[city].map((r) => `<span><i style="background:${r.color}"></i>${App.esc(r.label)}</span>`).join('')}
          </div>
        </div>

        <div class="disclaimer mt-14">
          ${App.icon('info', 17)}
          <div><b>To nie jest GPS.</b> Pozycje i prędkości są symulowane na podstawie rozkładów i przypisań taboru. Publiczne API przewoźników nie udostępnia strumienia pozycji pojazdów.</div>
        </div>

        <div class="section-head" style="margin-top:22px">
          <h2>Teraz na mieście</h2>
          <span class="badge live">${snap.byCity[city] || 0} wozów</span>
        </div>
        <div class="map-list">
          ${activeCity.length ? activeCity.map((bus, i) => {
            const line = App.liveLineText(bus, now);
            const speed = 22 + ((bus.seed + i * 13) % 34);
            return `<a class="map-item" href="#/bus/${encodeURIComponent(bus.id)}" style="text-decoration:none;color:inherit">
              <span class="line-tag">${App.esc(line)}</span>
              <span style="font-weight:700">#${App.esc(bus.fleetNumber)}</span>
              <span class="muted truncate">${App.esc(bus.brand)} ${App.esc(bus.model)}</span>
              <span class="speed">${speed} km/h</span>
            </a>`;
          }).join('') : `<div class="empty"><div class="big">🌙</div><h3>O tej porze ruch jest mały</h3><p>Zajrzyj tu w godzinach szczytu 6:00–9:00 lub 14:00–17:00.</p></div>`}
        </div>

        <div class="panel mt-14">
          <div class="panel-head"><h3>${App.icon('building', 17)} ${App.esc(meta.operatorFull)}</h3></div>
          <div class="spec-grid">
            <div class="spec"><dt>Zajezdnia</dt><dd>${App.esc(meta.depot)}</dd></div>
            <div class="spec"><dt>Linie</dt><dd>${stats.lines}</dd></div>
            <div class="spec"><dt>Tabor</dt><dd>${stats.active} wozów</dd></div>
            <div class="spec"><dt>Elektryczne</dt><dd>${stats.electricPct}<span class="unit">%</span></dd></div>
          </div>
          <div class="row gap-6 mt-10 wrap">
            <a class="btn btn-sm" href="${App.esc(meta.website)}" target="_blank" rel="noopener">${App.icon('info', 14)} Strona przewoźnika</a>
            <a class="btn btn-sm" href="${App.esc(meta.timetable)}" target="_blank" rel="noopener">${App.icon('calendar', 14)} Rozkłady jazdy</a>
          </div>
        </div>
      </section>`;
  };

  App.mountMap = function () {
    document.querySelectorAll('[data-map-city]').forEach((btn) => {
      btn.addEventListener('click', () => {
        App.state.mapCity = btn.dataset.mapCity;
        history.replaceState(null, '', '#/mapa?city=' + btn.dataset.mapCity);
        App.render();
      });
    });
  };

  /* ================================ MOJE ================================ */

  App.views.mine = function () {
    const tab = App.state.mineTab;
    const watched = App.state.watchlist.map((id) => App.busById(id)).filter(Boolean);
    const mineBuses = App.state.userBuses.slice().reverse();
    const sightings = App.state.sightings.slice().sort((a, b) => new Date(b.at) - new Date(a.at));

    let body = '';
    if (tab === 'watch') {
      body = watched.length
        ? App.busGrid(watched)
        : `<div class="empty"><div class="big">⭐</div><h3>Nie obserwujesz jeszcze żadnego autobusu</h3><p>Otwórz kartę pojazdu i kliknij „Obserwuj”, aby zbierać ulubione wozy.</p><a class="btn btn-primary btn-sm" href="#/tabor">Przeglądaj tabor</a></div>`;
    } else if (tab === 'mine') {
      body = mineBuses.length
        ? App.busGrid(mineBuses)
        : `<div class="empty"><div class="big">✍️</div><h3>Twoja baza jest pusta</h3><p>Dodaj własne autobusy: numer taborowy, model, zdjęcie i linie. Zapisują się lokalnie w telefonie.</p><a class="btn btn-primary btn-sm" href="#/dodaj">${App.icon('plus', 15)} Dodaj pierwszy autobus</a></div>`;
    } else {
      body = sightings.length
        ? `<div class="timeline">${sightings.map((s) => {
            const bus = App.busById(s.busId);
            return `<div class="tl-item">
              <div class="tl-time">${App.esc(App.fmtDateTime(s.at))}${s.line ? ' · linia ' + App.esc(s.line) : ''}</div>
              <div class="tl-title">${bus ? `<a href="#/bus/${encodeURIComponent(bus.id)}">#${App.esc(bus.fleetNumber)} ${App.esc(bus.brand)} ${App.esc(bus.model)}</a>` : 'Autobus usunięty z bazy'}</div>
              ${s.location ? `<div class="tl-note">📍 ${App.esc(s.location)}</div>` : ''}
              ${s.note ? `<div class="tl-note">${App.esc(s.note)}</div>` : ''}
              <button class="btn btn-ghost btn-sm mt-6" data-del-sighting="${App.esc(s.id)}">${App.icon('trash', 14)} Usuń</button>
            </div>`;
          }).join('')}</div>`
        : `<div class="empty"><div class="big">📝</div><h3>Brak obserwacji</h3><p>Zapisuj spotkania z autobusami: datę, linię, miejsce i notatkę.</p><a class="btn btn-primary btn-sm" href="#/tabor">Wybierz autobus</a></div>`;
    }

    return `
      <section class="section" style="margin-top:4px">
        <div class="row-between wrap">
          <div>
            <span class="eyebrow"><span class="dot"></span> Twoja kolekcja</span>
            <h1 style="margin-top:8px">Moje BusLife</h1>
            <p class="muted small" style="margin-top:6px">Wszystko zapisane lokalnie na tym urządzeniu.</p>
          </div>
          <a class="btn btn-primary btn-sm" href="#/dodaj">${App.icon('plus', 15)} Dodaj autobus</a>
        </div>

        <div class="segmented" role="tablist" aria-label="Sekcje">
          <button role="tab" aria-selected="${tab === 'watch'}" class="${tab === 'watch' ? 'is-on' : ''}" data-mine-tab="watch">Obserwowane (${watched.length})</button>
          <button role="tab" aria-selected="${tab === 'mine'}" class="${tab === 'mine' ? 'is-on' : ''}" data-mine-tab="mine">Moje (${mineBuses.length})</button>
          <button role="tab" aria-selected="${tab === 'sight'}" class="${tab === 'sight' ? 'is-on' : ''}" data-mine-tab="sight">Obserwacje (${sightings.length})</button>
        </div>

        <div class="mt-14">${body}</div>

        <div class="panel mt-20">
          <div class="panel-head"><h3>${App.icon('shield', 17)} Dane i kopia zapasowa</h3></div>
          <p class="small muted">Twoje dane nie opuszczają urządzenia. Zrób kopię, aby przenieść kolekcję na inny telefon.</p>
          <div class="row gap-6 wrap mt-10">
            <button class="btn btn-sm" id="btn-export">${App.icon('download', 15)} Eksport JSON</button>
            <button class="btn btn-sm" id="btn-import">${App.icon('upload', 15)} Import JSON</button>
            <input type="file" id="import-file" accept="application/json,.json" class="hidden">
            <a class="btn btn-sm" href="#/o-aplikacji">${App.icon('info', 15)} O aplikacji</a>
          </div>
          <button class="btn btn-sm btn-ghost mt-10" id="btn-reset" style="color:var(--red)">${App.icon('trash', 14)} Wyczyść dane lokalne</button>
        </div>

        <div class="panel" id="install-panel" style="display:none">
          <div class="panel-head"><h3>${App.icon('download', 17)} Zainstaluj jako aplikację</h3></div>
          <p class="small muted">Dodaj BusLife do ekranu głównego — działa offline i bez przeglądarki.</p>
          <button class="btn btn-primary btn-block mt-10" id="btn-install">Zainstaluj BusLife</button>
        </div>
      </section>`;
  };

  App.mountMine = function () {
    const view = document.getElementById('view');
    view.querySelectorAll('[data-mine-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        App.state.mineTab = btn.dataset.mineTab;
        App.render();
      });
    });
    view.querySelectorAll('[data-del-sighting]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.delSighting;
        App.state.sightings = App.state.sightings.filter((s) => s.id !== id);
        App.saveState('sightings');
        App.render();
        App.toast('Usunięto obserwację');
      });
    });
    const exportBtn = view.querySelector('#btn-export');
    if (exportBtn) exportBtn.addEventListener('click', App.exportData);
    const importBtn = view.querySelector('#btn-import');
    const importFile = view.querySelector('#import-file');
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', () => {
        if (importFile.files && importFile.files[0]) App.importData(importFile.files[0]);
      });
    }
    const resetBtn = view.querySelector('#btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', App.resetData);
    const installBtn = view.querySelector('#btn-install');
    if (installBtn) installBtn.addEventListener('click', () => App.promptInstall());
  };

  /* ============================ DODAJ / EDYTUJ ============================ */

  const BRAND_OPTIONS = ['Solaris', 'MAN', 'Ursus', 'Jelcz', 'Mercedes-Benz', 'Autosan', 'AMZ', 'Iveco', 'Volvo', 'Scania', 'Inny'];

  App.views.add = function (editId) {
    const isEdit = !!editId;
    const bus = isEdit ? App.busById(editId) : null;
    if (isEdit && !bus) {
      return `<div class="empty" style="margin-top:20px"><div class="big">🚫</div><h3>Nie znaleziono autobusu</h3><a class="btn btn-primary btn-sm" href="#/tabor">Wróć do taboru</a></div>`;
    }
    const b = bus || {};
    const city = b.city || App.state.prefs.city || 'wloclawek';
    const isBuiltIn = isEdit && !bus.isUser;

    const lineOptions = (D.LINES[city] || []).map((l) => l.n).join(', ');

    return `
      <section class="section" style="margin-top:2px">
        <a class="btn btn-ghost btn-sm" href="${isEdit ? '#/bus/' + encodeURIComponent(editId) : '#/tabor'}" style="margin-bottom:12px">${App.icon('arrowLeft', 15)} ${isEdit ? 'Karta pojazdu' : 'Tabor'}</a>
        <span class="eyebrow"><span class="dot"></span> ${isEdit ? 'Edycja danych' : 'Współtwórz bazę'}</span>
        <h1 style="margin-top:8px">${isEdit ? 'Edytuj autobus' : 'Dodaj autobus'}</h1>
        <p class="muted small" style="margin-top:6px">${isEdit ? (isBuiltIn ? 'Zmieniasz wbudowany rekord — korekta zapisze się lokalnie na tym urządzeniu.' : 'Zmieniasz własny wpis.') : 'Uzupełnij numer taborowy, model i zdjęcie. Wpis zapisze się w pamięci telefonu.'}</p>

        <form id="bus-form" class="panel mt-14" novalidate>
          <div class="form-grid two">
            <div class="field">
              <label for="f-city">Miasto <span class="req">*</span></label>
              <select id="f-city" name="city" class="input" required>
                ${Object.values(D.CITIES).map((c) => `<option value="${c.id}" ${c.id === city ? 'selected' : ''}>${App.esc(c.name)} — ${App.esc(c.carrier)}</option>`).join('')}
                <option value="other" ${city === 'other' ? 'selected' : ''}>Inne miasto</option>
              </select>
            </div>
            <div class="field">
              <label for="f-number">Numer taborowy <span class="req">*</span></label>
              <input class="input" id="f-number" name="fleetNumber" required maxlength="8" placeholder="np. 023" value="${App.esc(b.fleetNumber || '')}">
              <span class="hint">Numer boczny widoczny na autobusie.</span>
            </div>
            <div class="field">
              <label for="f-brand">Marka <span class="req">*</span></label>
              <input class="input" id="f-brand" name="brand" list="brand-list" required placeholder="np. Solaris" value="${App.esc(b.brand || '')}">
              <datalist id="brand-list">${BRAND_OPTIONS.map((x) => `<option value="${x}"></option>`).join('')}</datalist>
            </div>
            <div class="field">
              <label for="f-model">Model <span class="req">*</span></label>
              <input class="input" id="f-model" name="model" required placeholder="np. Urbino 12 electric" value="${App.esc(b.model || '')}">
            </div>
            <div class="field">
              <label for="f-year">Rok produkcji</label>
              <input class="input" id="f-year" name="year" type="number" min="1950" max="2030" placeholder="np. 2022" value="${b.year || ''}">
            </div>
            <div class="field">
              <label for="f-prop">Napęd</label>
              <select id="f-prop" name="propulsion" class="input">
                ${Object.entries(App.propsMap).map(([k, v]) => `<option value="${k}" ${b.propulsion === k ? 'selected' : ''}>${App.esc(v.label)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="f-length">Długość (m)</label>
              <input class="input" id="f-length" name="length" type="number" step="0.1" min="5" max="25" placeholder="np. 12.0" value="${b.length || ''}">
            </div>
            <div class="field">
              <label for="f-reg">Nr rejestracyjny</label>
              <input class="input" id="f-reg" name="registration" maxlength="12" placeholder="np. CW 7517F" value="${App.esc(b.registration || '')}">
            </div>
            <div class="field">
              <label for="f-seats">Miejsca siedzące</label>
              <input class="input" id="f-seats" name="seats" type="number" min="0" max="90" value="${b.seats || ''}">
            </div>
            <div class="field">
              <label for="f-standing">Miejsca stojące</label>
              <input class="input" id="f-standing" name="standing" type="number" min="0" max="200" value="${b.standing || ''}">
            </div>
            <div class="field" style="grid-column:1/-1">
              <label for="f-lines">Linie, na których jeździ</label>
              <input class="input" id="f-lines" name="lines" placeholder="np. 21, 23" value="${App.esc((b.lines || []).join(', '))}">
              <span class="hint">Dostępne w ${App.esc((D.CITIES[city] || {}).name || 'mieście')}: ${App.esc(lineOptions || '—')}</span>
            </div>
          </div>

          <div class="mt-14">
            <label class="field" style="margin-bottom:6px"><span style="font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Zdjęcie autobusu</span></label>
            <div id="photo-zone">
              ${b.photo
                ? `<div class="upload-preview"><img id="photo-preview-img" src="${App.esc(b.photo)}" alt="Podgląd zdjęcia"><button type="button" class="remove" id="photo-remove" aria-label="Usuń zdjęcie">${App.icon('x', 16)}</button></div>`
                : `<label class="upload-zone" id="upload-label" for="f-photo">
                    ${App.icon('camera', 26)}
                    <b>Zdjęcie z galerii lub aparatu</b>
                    <span>JPG/PNG · zostanie zmniejszone do 1000 px</span>
                    <input type="file" id="f-photo" accept="image/*" capture="environment" class="hidden">
                  </label>`}
            </div>
          </div>

          <div class="mt-14">
            <div style="font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">Wyposażenie</div>
            ${[
              ['lowFloor', 'Niskopodłogowy'],
              ['ac', 'Klimatyzacja'],
              ['wifi', 'WiFi'],
              ['usb', 'Ładowanie USB'],
              ['cctv', 'Monitoring'],
              ['ticketMachine', 'Automat biletowy']
            ].map(([key, label]) => `
              <div class="switch-row">
                <span class="small">${App.esc(label)}</span>
                <label class="switch"><input type="checkbox" name="${key}" ${(b[key] ? 'checked' : '')}><span class="slider"></span></label>
              </div>`).join('')}
          </div>

          <div class="field mt-14">
            <label for="f-notes">Notatki</label>
            <textarea class="textarea" id="f-notes" name="notes" maxlength="500" placeholder="Malowanie, ciekawostki, historia wozu…">${App.esc(b.notes || '')}</textarea>
          </div>

          <div class="sheet-actions" style="flex-wrap:wrap">
            <button class="btn btn-primary" type="submit" style="flex:1;min-width:160px">${App.icon('check', 16)} ${isEdit ? 'Zapisz zmiany' : 'Dodaj do bazy'}</button>
            ${isEdit && !isBuiltIn ? `<button class="btn" type="button" id="btn-delete-bus" style="color:var(--red)">${App.icon('trash', 15)} Usuń</button>` : ''}
            ${isEdit && isBuiltIn ? `<button class="btn" type="button" id="btn-restore-bus">Przywróć dane</button>` : ''}
          </div>
        </form>

        <div class="disclaimer mt-14">
          ${App.icon('info', 17)}
          <div>Wpis jest zapisywany wyłącznie lokalnie (localStorage). Nie wysyłamy danych na serwer. Możesz je wyeksportować w zakładce „Moje”.</div>
        </div>
      </section>`;
  };

  function compressImage(file, maxWidth) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('img'));
        img.onload = () => {
          const scale = Math.min(1, (maxWidth || 1000) / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  App.mountAdd = function (editId) {
    const view = document.getElementById('view');
    const form = view.querySelector('#bus-form');
    if (!form) return;
    let photoData = undefined; // undefined = bez zmian, null = usunięte

    const citySelect = form.querySelector('#f-city');
    const linesHint = citySelect ? citySelect.closest('.field') : null;

    function refreshHints() {
      const city = citySelect.value;
      const input = form.querySelector('#f-lines');
      const hint = input ? input.parentElement.querySelector('.hint') : null;
      if (!hint) return;
      const cityMeta = D.CITIES[city];
      const list = cityMeta ? (D.LINES[city] || []).map((l) => l.n).join(', ') : '—';
      hint.textContent = `Dostępne w ${cityMeta ? cityMeta.name : 'mieście'}: ${list}`;
    }
    if (citySelect) citySelect.addEventListener('change', refreshHints);

    const photoInput = form.querySelector('#f-photo');
    if (photoInput) {
      photoInput.addEventListener('change', async () => {
        const file = photoInput.files && photoInput.files[0];
        if (!file) return;
        if (!/^image\//.test(file.type)) {
          App.toast('Wybierz plik graficzny', 'err');
          return;
        }
        try {
          const dataUrl = await compressImage(file, 1000);
          photoData = dataUrl;
          const zone = view.querySelector('#photo-zone');
          zone.innerHTML = `<div class="upload-preview"><img id="photo-preview-img" src="${dataUrl}" alt="Podgląd zdjęcia"><button type="button" class="remove" id="photo-remove" aria-label="Usuń zdjęcie">${App.icon('x', 16)}</button></div>`;
          bindRemove();
        } catch (e) {
          App.toast('Nie udało się przetworzyć zdjęcia', 'err');
        }
      });
    }

    function bindRemove() {
      const removeBtn = view.querySelector('#photo-remove');
      if (!removeBtn) return;
      removeBtn.addEventListener('click', () => {
        photoData = null;
        const zone = view.querySelector('#photo-zone');
        zone.innerHTML = `<label class="upload-zone" id="upload-label" for="f-photo">
            ${App.icon('camera', 26)}
            <b>Zdjęcie z galerii lub aparatu</b>
            <span>JPG/PNG · zostanie zmniejszone do 1000 px</span>
            <input type="file" id="f-photo" accept="image/*" capture="environment" class="hidden">
          </label>`;
        const input = view.querySelector('#f-photo');
        input.addEventListener('change', async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const dataUrl = await compressImage(file, 1000);
          photoData = dataUrl;
          view.querySelector('#photo-zone').innerHTML = `<div class="upload-preview"><img src="${dataUrl}" alt="Podgląd zdjęcia"><button type="button" class="remove" id="photo-remove" aria-label="Usuń zdjęcie">${App.icon('x', 16)}</button></div>`;
          bindRemove();
        });
      });
    }
    bindRemove();

    const deleteBtn = form.querySelector('#btn-delete-bus');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        App.state.userBuses = App.state.userBuses.filter((x) => x.id !== editId);
        App.state.watchlist = App.state.watchlist.filter((x) => x !== editId);
        App.state.sightings = App.state.sightings.filter((x) => x.busId !== editId);
        App.saveState();
        App.rebuild();
        location.hash = '#/moje';
        App.toast('Autobus usunięty', 'ok');
      });
    }

    const restoreBtn = form.querySelector('#btn-restore-bus');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        delete App.state.edits[editId];
        App.saveState('edits');
        App.rebuild();
        App.toast('Przywrócono dane bazowe', 'ok');
        location.hash = '#/bus/' + encodeURIComponent(editId);
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const required = ['city', 'fleetNumber', 'brand', 'model'];
      let valid = true;
      required.forEach((name) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (!input) return;
        const ok = String(fd.get(name) || '').trim().length > 0;
        input.closest('.field').classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        App.toast('Uzupełnij wymagane pola', 'err');
        return;
      }

      const cityValue = String(fd.get('city') || 'other');
      const cityMeta = D.CITIES[cityValue];
      const numRaw = String(fd.get('fleetNumber')).trim();
      const fleetNumber = /^\d+$/.test(numRaw) && numRaw.length < 3 ? numRaw.padStart(3, '0') : numRaw;
      const lines = String(fd.get('lines') || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      const payload = {
        city: cityValue,
        cityName: cityMeta ? cityMeta.name : 'Inne',
        carrier: cityMeta ? cityMeta.carrier : 'Inny przewoźnik',
        carrierId: cityMeta ? cityMeta.carrierId : 'other',
        fleetNumber,
        fleetNum: parseInt(fleetNumber, 10) || 0,
        brand: String(fd.get('brand')).trim(),
        model: String(fd.get('model')).trim(),
        year: parseInt(fd.get('year'), 10) || null,
        yearLabel: String(fd.get('year') || ''),
        propulsion: String(fd.get('propulsion') || 'diesel'),
        length: parseFloat(fd.get('length')) || null,
        seats: parseInt(fd.get('seats'), 10) || 0,
        standing: parseInt(fd.get('standing'), 10) || 0,
        registration: String(fd.get('registration') || '').trim() || null,
        lines,
        notes: String(fd.get('notes') || '').trim(),
        lowFloor: fd.get('lowFloor') === 'on',
        ac: fd.get('ac') === 'on',
        wifi: fd.get('wifi') === 'on',
        usb: fd.get('usb') === 'on',
        cctv: fd.get('cctv') === 'on',
        ticketMachine: fd.get('ticketMachine') === 'on'
      };
      payload.fullName = `${payload.brand} ${payload.model}`;
      payload.capacity = (payload.seats || 0) + (payload.standing || 0);

      if (editId) {
        const existing = App.busById(editId);
        if (!existing) return;
        if (existing.isUser) {
          const idx = App.state.userBuses.findIndex((x) => x.id === editId);
          if (idx >= 0) {
            App.state.userBuses[idx] = Object.assign({}, App.state.userBuses[idx], payload, {
              photo: photoData !== undefined ? photoData : App.state.userBuses[idx].photo
            });
          }
          App.saveState('userBuses');
        } else {
          const patch = Object.assign({}, payload);
          if (photoData !== undefined) patch.photo = photoData;
          App.state.edits[editId] = Object.assign({}, App.state.edits[editId], patch);
          App.saveState('edits');
        }
        App.rebuild();
        App.toast('Zapisano zmiany', 'ok');
        location.hash = '#/bus/' + encodeURIComponent(editId);
      } else {
        const id = 'usr-' + Date.now().toString(36);
        const newBus = Object.assign({
          id,
          isUser: true,
          status: 'eksploatowany',
          pattern: 'całodzienna',
          shift: ['05:00', '22:00'],
          photo: photoData || null,
          notes: payload.notes,
          source: 'user',
          confidence: 'wpis użytkownika',
          seed: H.hash(id),
          depot: cityMeta ? cityMeta.depot : '—',
          photoBy: null,
          gen: '—'
        }, payload);
        if (!newBus.year) newBus.year = new Date().getFullYear();
        App.state.userBuses.push(newBus);
        App.saveState('userBuses');
        App.rebuild();
        App.toast('Dodano autobus do bazy', 'ok');
        location.hash = '#/bus/' + encodeURIComponent(id);
      }
    });
  };

  /* ============================== O APLIKACJI ============================== */

  App.views.about = function () {
    const info = App.appInfo();
    return `
      <section class="section" style="margin-top:2px">
        <span class="eyebrow"><span class="dot"></span> Informacje</span>
        <h1 style="margin-top:8px">O aplikacji BusLife</h1>
        <p class="muted small" style="margin-top:6px">Mobilny katalog taboru autobusowego Kujaw — wersja ${App.esc(info.version)} · dane: ${App.esc(App.fmtDate(info.updated))}</p>

        <div class="info-block mt-14">
          <div class="info-card">
            <h4>${App.icon('bus', 16)} Co to jest BusLife Kujawy?</h4>
            <p>Aplikacja PWA do przeglądania, śledzenia i współtworzenia bazy autobusów miejskich we Włocławku (MPK) i Toruniu (MZK). Zawiera ${info.buses} rekordów taboru i ${info.lines} linii. Każdy autobus ma numer taborowy, markę, model, rok, napęd, długość, pojemność, wyposażenie i przypisane linie.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('clock', 16)} Kiedy kursują autobusy?</h4>
            <p>Dla każdej linii publikujemy godziny pierwszego i ostatniego kursu, częstotliwość w szczycie i poza nim oraz w weekendy. Dla każdego pojazdu generujemy tygodniową mapę prawdopodobieństwa kursowania (heatmapa) na podstawie typu brygady: całodniowa, szczytowa, nocna lub okazjonalna.</p>
            <p style="margin-top:6px"><b>Ważne:</b> godziny są orientacyjne i opracowane na podstawie rozkładów publikowanych przez przewoźników. Przed podróżą sprawdź oficjalne rozkłady.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('map', 16)} Śledzenie pojazdów</h4>
            <p>Publiczne API MPK Włocławek i MZK Toruń nie udostępnia strumienia pozycji GPS. Widok mapy to <b>symulacja</b> rozmieszczenia pojazdów na schemacie sieci, oparta na rozkładach i przypisaniach taboru. Nie służy do planowania realnych przesiadek w czasie rzeczywistym.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('pen', 16)} Współtworzenie bazy</h4>
            <p>W zakładce „Dodaj” możesz dodać własny autobus ze zdjęciem. Wpisy zapisują się w pamięci urządzenia (localStorage) i są widoczne w Twojej kolekcji. Możesz też edytować wbudowane rekordy — korekty nadpisują dane tylko na Twoim telefonie. Eksport JSON pozwala zrobić kopię lub przenieść bazę.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('download', 16)} Instalacja na telefonie</h4>
            <ul>
              <li><b>Android / Chrome:</b> menu ⋮ → „Dodaj do ekranu głównego” lub „Zainstaluj aplikację”.</li>
              <li><b>iPhone / Safari:</b> przycisk Udostępnij → „Dodaj do ekranu początkowego”.</li>
              <li>Aplikacja działa offline dzięki Service Workerowi.</li>
            </ul>
            <button class="btn btn-primary btn-block mt-10" id="btn-install-about">${App.icon('download', 15)} Zainstaluj BusLife</button>
          </div>

          <div class="info-card">
            <h4>${App.icon('shield', 16)} Prywatność</h4>
            <p>Aplikacja nie zawiera kont, reklam ani analityki. Wszystkie wpisy, zdjęcia i obserwacje pozostają w pamięci Twojej przeglądarki. Wyczyszczenie danych strony usuwa kolekcję — zrób wcześniej eksport.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('info', 16)} Źródła danych</h4>
            <ul>
              ${D.SOURCES.map((s) => `<li><a href="${App.esc(s.url)}" target="_blank" rel="noopener">${App.esc(s.label)}</a></li>`).join('')}
            </ul>
            <p class="tiny muted" style="margin-top:8px">Stan wiedzy: listopad 2026. Numery taborowe w seriach mogą się różnić od stanu faktycznego — baza ma charakter społecznościowy i jest stale uzupełniana.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('camera', 16)} Zdjęcia</h4>
            <p>Zdjęcia pochodzą z materiałów prasowych przewoźników i serwisów transportowych. Wykorzystano je w celach informacyjnych z podaniem źródła. Jeśli jesteś autorem i chcesz zmianę atrybucji — daj znać w repozytorium projektu.</p>
          </div>

          <div class="info-card">
            <h4>${App.icon('creditcard', 16)} Bilety</h4>
            <ul>
              ${Object.values(D.CITIES).map((c) => `<li><b>${App.esc(c.name)}:</b> ${App.esc(c.ticketInfo)}</li>`).join('')}
            </ul>
            <p class="tiny muted" style="margin-top:6px">Ceny orientacyjne — sprawdź oficjalny cennik przewoźnika.</p>
          </div>
        </div>

        <div class="disclaimer mt-14">
          ${App.icon('info', 17)}
          <div>Projekt niezależny, niepowiązany oficjalnie z MPK Włocławek ani MZK Toruń. Nazwy i logotypy przewoźników należą do ich właścicieli.</div>
        </div>

        <p class="tiny muted" style="text-align:center;margin-top:22px">BusLife Kujawy · ${App.esc(info.version)} · zbudowane z myślą o miłośnikach komunikacji 🚌</p>
      </section>`;
  };

  App.mountAbout = function () {
    const btn = document.getElementById('btn-install-about');
    if (btn) btn.addEventListener('click', () => App.promptInstall());
  };
})();
