/* =====================================================================
   BusLife Kujawy — widoki główne i router
   ===================================================================== */

(function () {
  'use strict';

  const App = window.BusApp;
  const D = App.D;
  const H = App.H;
  const state = App.state;

  App.views = App.views || {};
  App._after = [];
  App.defer = function (fn) { App._after.push(fn); };

  /* ================================ START ================================ */

  const PATTERN_LABEL = {
    całodzienna: 'Całodniowa — dwie zmiany',
    szczytowa: 'Szczytowa — rano i po południu',
    nocna: 'Nocna',
    okazjonalna: 'Okazjonalna / specjalna',
    wycofany: 'Wycofany z ruchu'
  };
  App.PATTERN_LABEL = PATTERN_LABEL;

  App.views.home = function () {
    const snap = App.liveSnapshot();
    const allStats = H.stats();
    const newest = App.allBuses()
      .filter((b) => b.status === 'eksploatowany' && b.year)
      .sort((a, b) => (b.year || 0) - (a.year || 0) || b.fleetNum - a.fleetNum)
      .slice(0, 6);
    const propCounts = { elektryczny: 0, hybrydowy: 0, diesel: 0, cng: 0, wodorowy: 0 };
    App.allBuses().forEach((b) => {
      if (b.status !== 'eksploatowany') return;
      if (b.propulsion === 'mild-hybrid') propCounts.hybrydowy += 1;
      else if (propCounts[b.propulsion] != null) propCounts[b.propulsion] += 1;
    });

    const ticker = snap.top.map((bus) => {
      const line = App.liveLineText(bus, snap.at);
      return `<span class="ticker-item"><b>#${App.esc(bus.fleetNumber)}</b> ${App.esc(bus.brand + ' ' + bus.model)} · linia ${App.esc(line)}</span>`;
    }).join('');

    const quick = [
      { label: '⚡ Elektryczne', href: '#/tabor?prop=elektryczny', count: allStats.electric },
      { label: '🔋 Hybrydowe', href: '#/tabor?prop=hybrydowy', count: propCounts.hybrydowy },
      { label: '🚌 Przegubowe 18 m', href: '#/tabor?len=long', count: App.allBuses().filter((b) => Number(b.length) >= 17.5).length },
      { label: '🌙 Linie nocne', href: '#/linie', count: (D.LINES.torun || []).filter((l) => l.night).length },
      { label: '👶 Niskopodłogowe', href: '#/tabor', count: allStats.lowFloorPct + '%' }
    ];

    return `
      <section class="hero">
        <div class="hero-top">
          <span class="eyebrow"><span class="dot"></span> Baza taboru · ${App.esc(App.fmtDate(App.appInfo().updated))}</span>
          <span class="badge">PWA · offline</span>
        </div>
        <h1>Wszystkie autobusy <em>Włocławka</em> i <em>Torunia</em> w jednym miejscu.</h1>
        <p class="lead">Numery taborowe, modele, zdjęcia, loga przewoźników, linie i godziny kursowania. Przeglądaj, obserwuj i dodawaj własne wozy.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/tabor">${App.icon('bus', 17)} Przeglądaj tabor</a>
          <a class="btn" href="#/dodaj">${App.icon('plus', 17)} Dodaj autobus</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b>${allStats.total}</b><span>autobusów w bazie</span></div>
          <div class="hero-stat"><b>${allStats.electricPct}%</b><span>floty elektrycznej</span></div>
          <div class="hero-stat"><b>${allStats.lines}</b><span>linii w 2 miastach</span></div>
        </div>
        <div class="live-bar">
          <span class="live-dot"></span>
          <span style="font-weight:800;color:var(--green);white-space:nowrap">TERAZ W RUCHU</span>
          <span class="ticker" id="live-ticker"><span class="ticker-track">${ticker}${ticker}</span></span>
          <span class="mono" id="live-count" style="font-weight:800;white-space:nowrap">${snap.total}</span>
        </div>
      </section>

      <div class="search-wrap">
        <button class="search-box" id="home-search" type="button" style="width:100%;text-align:left;cursor:pointer">
          ${App.icon('search', 18)}
          <span class="muted" style="flex:1">Szukaj numeru, modelu, marki lub linii…</span>
          <span class="kbd">/</span>
        </button>
      </div>

      <section class="section">
        <div class="section-head">
          <h2>Wybierz miasto</h2>
          <span class="tiny muted">2 przewoźników</span>
        </div>
        <div class="city-grid">
          ${Object.values(D.CITIES).map((c) => {
            const st = H.stats(c.id);
            return `<a class="city-card" href="#/tabor?city=${c.id}">
              <div class="city-card-media">
                <img src="${App.esc(c.heroPhoto)}" alt="Autobusy ${App.esc(c.name)}" loading="lazy" decoding="async">
                <span class="city-card-badge">${App.Logo.getCarrierLogoSVG(c.carrierId, 20)} ${App.esc(c.carrier)}</span>
              </div>
              <div class="city-card-body">
                <div class="city-card-title">
                  <h3>${App.esc(c.name)}</h3>
                  <span class="flag">${App.esc(c.region)}</span>
                </div>
                <p>${App.esc(c.tagline)}</p>
                <div class="city-card-metrics">
                  <span class="metric-pill amber"><b>${st.active}</b> wozów</span>
                  <span class="metric-pill green"><b>${st.electricPct}%</b> EV</span>
                  <span class="metric-pill sky"><b>${st.lines}</b> linii</span>
                </div>
              </div>
            </a>`;
          }).join('')}
        </div>
      </section>

      <section class="section">
        <div class="chips">
          ${quick.map((q) => `<a class="chip" href="${q.href}">${App.esc(q.label)} <span class="count">${q.count}</span></a>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Najnowsze w taborze</h2>
          <a class="link" href="#/tabor?sort=newest">Wszystkie →</a>
        </div>
        ${App.busGrid(newest)}
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Struktura napędów</h2>
          <span class="tiny muted">wozy w eksploatacji</span>
        </div>
        <div class="panel" style="margin-top:0">
          ${App.donut([
            { label: 'Elektryczny', value: propCounts.elektryczny, color: '#34d399' },
            { label: 'Hybrydowy', value: propCounts.hybrydowy, color: '#a78bfa' },
            { label: 'Diesel', value: propCounts.diesel, color: '#94a3b8' },
            { label: 'CNG', value: propCounts.cng, color: '#38bdf8' },
            { label: 'Wodorowy', value: propCounts.wodorowy, color: '#7dd3fc' }
          ], 'zeroemisyjne', allStats.electricPct + '%')}
          <p class="tiny muted mt-10">Elektryczne i wodorowe = napęd zeroemisyjny. Hybrydy obniżają zużycie paliwa, ale mają silnik spalinowy.</p>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Linie i rozkłady</h2>
          <a class="link" href="#/linie">Wszystkie linie →</a>
        </div>
        <div class="line-list">
          ${(D.LINES.wloclawek || []).slice(0, 3).map((line) => App.lineRow(line, 'wloclawek')).join('')}
          ${(D.LINES.torun || []).filter((l) => !l.night).slice(0, 3).map((line) => App.lineRow(line, 'torun')).join('')}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Jak to działa</h2></div>
        <div class="info-block">
          <div class="info-card">
            <h4>${App.icon('search', 16)} 1. Szukaj i przeglądaj</h4>
            <p>Filtruj po mieście, marce, napędzie i numerze taborowym. Każdy wpis ma zdjęcie lub wygenerowany schemat autobusu w barwach przewoźnika.</p>
          </div>
          <div class="info-card">
            <h4>${App.icon('clock', 16)} 2. Sprawdź, kiedy kursuje</h4>
            <p>Heatmapa tygodniowa pokazuje prawdopodobieństwo wyjazdu o każdej godzinie. Rozkłady linii zawierają pierwszy i ostatni kurs oraz częstotliwość.</p>
          </div>
          <div class="info-card">
            <h4>${App.icon('plus', 16)} 3. Dodaj swój wpis</h4>
            <p>Dodaj autobus ze zdjęciem, zapisuj obserwacje i buduj własną kolekcję. Wszystko działa offline — dane zostają na Twoim urządzeniu.</p>
          </div>
        </div>
      </section>

      <div class="disclaimer mt-20">
        ${App.icon('info', 17)}
        <div>Dane opracowane na podstawie publicznych źródeł (Wikipedia, Phototrans, TransInfo, rozkłady MPK i MZK) — stan: listopad 2026. To projekt społecznościowy, nieoficjalny. <a href="#/o-aplikacji">Więcej o danych →</a></div>
      </div>
    `;
  };

  App.lineRow = function (line, city) {
    const next = App.nextDepartureIn(line);
    const typeCls = line.night ? 'night' : line.type === 'podmiejska' ? 'suburban' : '';
    return `<a class="line-row" href="#/linia/${city}/${encodeURIComponent(line.n)}">
      <span class="line-bullet ${typeCls}">${App.esc(line.n)}</span>
      <span class="line-main">
        <span class="line-title">${App.esc(line.from)} <span class="arrow">→</span> ${App.esc(line.to)}</span>
        <span class="line-meta"><span>${App.esc((D.CITIES[city] || {}).name)}</span><span>⏱ ${line.runtime || '—'} min</span><span>${App.esc(line.freq.weekday.peak)} w szczycie</span></span>
      </span>
      <span class="line-next"><b>${next != null ? (next === 0 ? 'teraz' : next + ' min') : '—'}</b><span>następny</span></span>
    </a>`;
  };

  App.mountHome = function () {
    const searchBtn = document.getElementById('home-search');
    if (searchBtn) searchBtn.addEventListener('click', App.openSearch);
  };

  /* ================================ TABOR ================================ */

  App.views.fleet = function () {
    const f = state.filters;
    const list = App.searchBuses(f.q, f);
    const perPage = 24;
    const visible = list.slice(0, f.page * perPage);
    const counts = {
      all: App.allBuses().length,
      wloclawek: App.allBuses().filter((b) => b.city === 'wloclawek').length,
      torun: App.allBuses().filter((b) => b.city === 'torun').length
    };
    const lineInfo = f.line ? App.lineByNumber(f.city !== 'all' ? f.city : 'wloclawek', f.line) : null;

    return `
      <section class="section" style="margin-top:4px">
        <div class="row-between wrap">
          <div>
            <span class="eyebrow"><span class="dot"></span> Katalog pojazdów</span>
            <h1 style="margin-top:8px">Tabor autobusowy</h1>
            <p class="muted small" style="margin-top:6px">${counts.all} rekordów · ${counts.wloclawek} Włocławek · ${counts.torun} Toruń</p>
          </div>
          <a class="btn btn-primary btn-sm" href="#/dodaj">${App.icon('plus', 15)} Dodaj</a>
        </div>

        <div class="search-wrap" style="margin-top:14px">
          <div class="search-box">
            ${App.icon('search', 18)}
            <input id="fleet-q" type="search" placeholder="Numer taborowy, model, marka, linia…" value="${App.esc(f.q)}" autocomplete="off" aria-label="Szukaj w taborze">
            ${f.q ? `<button class="search-clear" id="fleet-clear" aria-label="Wyczyść">${App.icon('x', 16)}</button>` : ''}
          </div>
        </div>

        <div class="chips" id="fleet-city-chips">
          <button class="chip ${f.city === 'all' ? 'is-on' : ''}" data-city="all">Wszystkie <span class="count">${counts.all}</span></button>
          <button class="chip ${f.city === 'wloclawek' ? 'is-on' : ''}" data-city="wloclawek">Włocławek <span class="count">${counts.wloclawek}</span></button>
          <button class="chip ${f.city === 'torun' ? 'is-on' : ''}" data-city="torun">Toruń <span class="count">${counts.torun}</span></button>
        </div>

        <div class="chips" id="fleet-prop-chips">
          ${[
            ['all', 'Każdy napęd'],
            ['elektryczny', '⚡ Elektryczny'],
            ['hybrydowy', '🔋 Hybrydowy'],
            ['diesel', '⛽ Diesel'],
            ['cng', '💨 CNG'],
            ['wodorowy', '💧 Wodorowy']
          ].map(([value, label]) => `<button class="chip ${f.prop === value ? 'is-on' : ''}" data-prop="${value}">${label}</button>`).join('')}
        </div>

        ${(f.line || f.len) ? `<div class="filter-row">
          ${f.line ? `<span class="badge" style="gap:8px">Filtr: linia ${App.esc(f.line)} <button id="clear-line" style="background:none;border:0;color:inherit;padding:0;display:grid" aria-label="Usuń filtr linii">${App.icon('x', 13)}</button></span>` : ''}
          ${f.len ? `<span class="badge" style="gap:8px">Filtr: ${f.len === 'long' ? 'przegubowe 18 m' : f.len === 'midi' ? 'krótkie do 10,5 m' : 'standard 12 m'} <button id="clear-len" style="background:none;border:0;color:inherit;padding:0;display:grid" aria-label="Usuń filtr długości">${App.icon('x', 13)}</button></span>` : ''}
          ${lineInfo ? `<span class="tiny muted">${App.esc(lineInfo.from)} → ${App.esc(lineInfo.to)}</span>` : ''}
        </div>` : ''}

        <div class="filter-row">
          <select class="select" id="fleet-brand" aria-label="Marka">
            <option value="all">Wszystkie marki</option>
            ${App.brands().map((b) => `<option value="${App.esc(b)}" ${f.brand === b ? 'selected' : ''}>${App.esc(b)}</option>`).join('')}
          </select>
          <select class="select" id="fleet-sort" aria-label="Sortowanie">
            <option value="number" ${f.sort === 'number' ? 'selected' : ''}>Sortuj: numer</option>
            <option value="newest" ${f.sort === 'newest' ? 'selected' : ''}>Sortuj: najnowsze</option>
            <option value="oldest" ${f.sort === 'oldest' ? 'selected' : ''}>Sortuj: najstarsze</option>
            <option value="brand" ${f.sort === 'brand' ? 'selected' : ''}>Sortuj: marka</option>
            <option value="capacity" ${f.sort === 'capacity' ? 'selected' : ''}>Sortuj: pojemność</option>
            <option value="active" ${f.sort === 'active' ? 'selected' : ''}>Sortuj: w ruchu</option>
          </select>
          <span class="sort-desc">${App.icon('filter', 14)} ${f.brand !== 'all' ? App.esc(f.brand) : 'wszystkie marki'}</span>
        </div>

        <div class="result-count" id="fleet-count"><b>${list.length}</b> ${list.length === 1 ? 'pojazd' : 'pojazdów'} spełnia kryteria</div>
        <div id="fleet-results">${App.busGrid(visible)}</div>
        <div id="fleet-more" style="margin-top:14px">
          ${list.length > visible.length ? `<button class="btn btn-block" id="load-more">Pokaż więcej (${list.length - visible.length})</button>` : ''}
        </div>
      </section>`;
  };

  function renderFleetResults() {
    const f = state.filters;
    const list = App.searchBuses(f.q, f);
    const perPage = 24;
    const visible = list.slice(0, f.page * perPage);
    const results = document.getElementById('fleet-results');
    const count = document.getElementById('fleet-count');
    const more = document.getElementById('fleet-more');
    if (!results) return;
    results.innerHTML = App.busGrid(visible);
    if (count) count.innerHTML = `<b>${list.length}</b> ${list.length === 1 ? 'pojazd' : 'pojazdów'} spełnia kryteria`;
    if (more) {
      more.innerHTML = list.length > visible.length
        ? `<button class="btn btn-block" id="load-more">Pokaż więcej (${list.length - visible.length})</button>`
        : '';
      const btn = more.querySelector('#load-more');
      if (btn) btn.addEventListener('click', () => { state.filters.page += 1; renderFleetResults(); });
    }
    syncFleetChips();
  }

  function syncFleetChips() {
    document.querySelectorAll('#fleet-city-chips .chip').forEach((c) => c.classList.toggle('is-on', c.dataset.city === state.filters.city));
    document.querySelectorAll('#fleet-prop-chips .chip').forEach((c) => c.classList.toggle('is-on', c.dataset.prop === state.filters.prop));
  }

  App.mountFleet = function () {
    const q = document.getElementById('fleet-q');
    if (q) {
      let timer = null;
      q.addEventListener('input', () => {
        state.filters.q = q.value;
        state.filters.page = 1;
        clearTimeout(timer);
        timer = setTimeout(renderFleetResults, 120);
      });
    }
    const clear = document.getElementById('fleet-clear');
    if (clear) clear.addEventListener('click', () => {
      state.filters.q = '';
      state.filters.page = 1;
      App.render();
    });
    document.querySelectorAll('#fleet-city-chips .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        state.filters.city = chip.dataset.city;
        state.filters.page = 1;
        renderFleetResults();
      });
    });
    document.querySelectorAll('#fleet-prop-chips .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        state.filters.prop = chip.dataset.prop;
        state.filters.page = 1;
        renderFleetResults();
      });
    });
    const brand = document.getElementById('fleet-brand');
    if (brand) brand.addEventListener('change', () => {
      state.filters.brand = brand.value;
      state.filters.page = 1;
      renderFleetResults();
    });
    const sort = document.getElementById('fleet-sort');
    if (sort) sort.addEventListener('change', () => {
      state.filters.sort = sort.value;
      state.filters.page = 1;
      renderFleetResults();
    });
    const clearLine = document.getElementById('clear-line');
    if (clearLine) clearLine.addEventListener('click', () => {
      state.filters.line = null;
      App.render();
    });
    const clearLen = document.getElementById('clear-len');
    if (clearLen) clearLen.addEventListener('click', () => {
      state.filters.len = null;
      App.render();
    });
    const loadMore = document.getElementById('load-more');
    if (loadMore) loadMore.addEventListener('click', () => {
      state.filters.page += 1;
      renderFleetResults();
    });
  };

  /* ============================ KARTA AUTOBUSU ============================ */

  function heatmapHTML(bus) {
    const rows = H.weeklyHeat(bus);
    const lvl = (p) => (p >= 0.85 ? 5 : p >= 0.68 ? 4 : p >= 0.5 ? 3 : p >= 0.3 ? 2 : p >= 0.12 ? 1 : 0);
    const html = rows.map((row) => `
      <div class="heat-row">
        <span class="heat-day">${App.esc(row.day)}</span>
        ${row.cells.map((p, i) => `<span class="heat-cell l${lvl(p)}" title="${String(i + 4).padStart(2, '0')}:00 — ${Math.round(p * 100)}% szansy na kurs"></span>`).join('')}
      </div>`).join('');
    const axis = `<div class="heat-axis"><span></span>${Array.from({ length: 20 }, (_, i) => `<span>${i % 2 === 0 ? String(i + 4).padStart(2, '0') : ''}</span>`).join('')}</div>`;
    return `
      <div class="heatmap">${html}${axis}</div>
      <div class="heat-legend">
        <span>mniej</span>
        <span class="swatch" style="background:rgba(148,163,184,.12)"></span>
        <span class="swatch" style="background:rgba(251,191,36,.3)"></span>
        <span class="swatch" style="background:rgba(251,191,36,.6)"></span>
        <span class="swatch" style="background:#fbbf24"></span>
        <span>więcej</span>
        <span style="margin-left:auto" class="mono">${Math.round(H.serviceProbability(bus) * 100)}% teraz</span>
      </div>`;
  }

  function specHTML(bus) {
    const dt = (label, value) => `<div class="spec"><dt>${App.esc(label)}</dt><dd>${value}</dd></div>`;
    const carrier = D.CITIES[bus.city] || {};
    return `<div class="spec-grid">
      ${dt('Marka', App.esc(bus.brand))}
      ${dt('Model', App.esc(bus.model) + (bus.gen && bus.gen !== '—' ? ' <span class="unit">' + App.esc(bus.gen) + '</span>' : ''))}
      ${dt('Rok produkcji', App.esc(bus.yearLabel || bus.year || '—'))}
      ${dt('Napęd', App.esc(App.propInfo(bus.propulsion).label))}
      ${dt('Długość', bus.length ? App.esc(String(bus.length).replace('.', ',')) + ' <span class="unit">m</span>' : '—')}
      ${dt('Miejsca siedzące', bus.seats != null ? App.esc(bus.seats) : '—')}
      ${dt('Miejsca stojące', bus.standing != null ? App.esc(bus.standing) : '—')}
      ${dt('Pojemność', bus.capacity ? App.esc(bus.capacity) + ' <span class="unit">os.</span>' : '—')}
      ${dt('Nr rejestracyjny', bus.registration ? `<span class="mono">${App.esc(bus.registration)}</span>` : '<span class="muted">nieznany</span>')}
      ${dt('Zajezdnia', App.esc(bus.depot || carrier.depot || '—'))}
      ${dt('Przewoźnik', App.esc(carrier.carrier || bus.carrier || '—'))}
      ${dt('Status', App.esc(App.statusInfo(bus.status).label))}
    </div>`;
  }

  function featureHTML(bus) {
    const feats = [
      ['lowFloor', 'Niskopodłogowy', 'wheelchair'],
      ['ac', 'Klimatyzacja', 'snow'],
      ['wifi', 'WiFi', 'wifi'],
      ['usb', 'USB', 'usb'],
      ['cctv', 'Monitoring', 'videocam'],
      ['ticketMachine', 'Automat biletowy', 'creditcard']
    ];
    return `<div class="feature-grid">${feats.map(([key, label, icon]) =>
      `<div class="feature ${bus[key] ? 'on' : ''}"><span class="ico">${App.icon(icon, 16)}</span>${App.esc(label)}${bus[key] ? '' : '<span style="margin-left:auto;opacity:.5">—</span>'}</div>`
    ).join('')}</div>`;
  }

  App.views.bus = function (id) {
    const bus = App.busById(id);
    if (!bus) {
      return `<div class="empty" style="margin-top:24px"><div class="big">🔍</div><h3>Nie znaleziono autobusu</h3><p>Ten wpis mógł zostać usunięty z pamięci urządzenia.</p><a class="btn btn-primary btn-sm" href="#/tabor">Wróć do taboru</a></div>`;
    }
    const city = D.CITIES[bus.city] || { name: bus.cityName || 'Inne', carrier: bus.carrier, color: '#fbbf24' };
    const info = App.propInfo(bus.propulsion);
    const status = App.statusInfo(bus.status);
    const watched = App.isWatched(bus.id);
    const sightings = App.sightingsFor(bus.id);
    const similar = App.allBuses().filter((b) => b.seriesKey === bus.seriesKey && b.id !== bus.id).slice(0, 4);
    const source = D.SOURCES.find((s) => s.id === bus.source);
    const credit = D.PHOTO_CREDITS.find((c) => c.id === bus.photoBy);
    const prob = Math.round(H.serviceProbability(bus) * 100);
    const lineList = bus.lines || [];

    return `
      <section class="section" style="margin-top:2px">
        <div class="row-between wrap" style="margin-bottom:10px">
          <a class="btn btn-ghost btn-sm" href="#/tabor?city=${bus.city}">${App.icon('arrowLeft', 15)} Tabor</a>
          <div class="row gap-6">
            <a class="btn btn-sm" href="#/edytuj/${encodeURIComponent(bus.id)}">${App.icon('pen', 15)} Edytuj</a>
            <button class="btn btn-sm" id="btn-share">${App.icon('share', 15)} Udostępnij</button>
          </div>
        </div>

        <div class="detail-hero">
          <div class="detail-media">
            ${bus.photo
              ? `<img src="${App.esc(bus.photo)}" alt="${App.esc(bus.brand + ' ' + bus.model + ' nr ' + bus.fleetNumber)}">`
              : `<div style="width:100%;height:100%;display:grid;place-items:center;padding:18px">${App.Logo.renderBusIllustrationSVG(bus)}</div>`}
            <span class="media-caption">${bus.photo ? (credit ? App.esc(credit.label) : 'zdjęcie poglądowe') : 'schemat wygenerowany'}</span>
          </div>
          <div class="detail-head">
            <div class="detail-title-row">
              <div class="detail-number">#${App.esc(bus.fleetNumber)}<small>${App.esc(city.carrier)}</small></div>
              <div style="flex:1;min-width:180px">
                <h1 class="detail-model">${App.esc(bus.brand)} ${App.esc(bus.model)}</h1>
                <div class="detail-sub">${App.esc(city.name)} · ${App.esc(bus.yearLabel || bus.year || 'rok nieznany')} · ${App.esc(App.propInfo(bus.propulsion).label)}</div>
              </div>
            </div>
            <div class="row gap-6 wrap mt-10">
              <span class="logo-inline" title="${App.esc(city.carrier)}">${App.Logo.getCarrierLogoSVG(bus.carrierId || bus.city, 30)}</span>
              <span class="logo-inline" title="${App.esc(bus.brand)}">${App.Logo.getBrandLogoSVG(bus.brand, 30)}</span>
              <span class="badge ${info.cls}">${App.esc(info.label)}</span>
              <span class="badge ${status.cls}">${App.esc(status.label)}</span>
              ${prob >= 50 ? '<span class="badge live">● prawdopodobnie w ruchu</span>' : `<span class="badge">${prob}% szansy na kurs</span>`}
              ${bus.isUser ? '<span class="badge mine">Mój wpis</span>' : ''}
              ${watched ? '<span class="badge" style="color:var(--amber);border-color:rgba(251,191,36,.4)">★ obserwowany</span>' : ''}
            </div>
            <div class="detail-actions">
              <button class="btn ${watched ? 'is-on' : ''}" id="btn-watch">${App.icon('star', 16)} ${watched ? 'Obserwujesz' : 'Obserwuj'}</button>
              <button class="btn" id="btn-sighting">${App.icon('camera', 16)} Dodaj obserwację</button>
              ${lineList.length ? `<a class="btn" href="#/linia/${bus.city}/${encodeURIComponent(lineList[0])}">${App.icon('route', 16)} Linia ${App.esc(lineList[0])}</a>` : ''}
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h3>${App.icon('clock', 17)} Kiedy kursuje</h3>
            <span class="badge">${App.esc(PATTERN_LABEL[bus.pattern] || 'brygada')}</span>
          </div>
          ${bus.status === 'wycofany'
            ? '<p class="small muted">Pojazd wycofany z eksploatacji — wpis ma charakter archiwalny.</p>'
            : heatmapHTML(bus)}
          <div style="overflow-x:auto;margin-top:12px">
            <table class="schedule-table">
              <tbody>
                <tr><td>Typ brygady</td><td>${App.esc(PATTERN_LABEL[bus.pattern] || '—')}</td></tr>
                <tr><td>Godziny wyjazdów</td><td class="mono">${App.esc((bus.shift && bus.shift[0]) || '—')} – ${App.esc((bus.shift && bus.shift[1]) || '—')}</td></tr>
                <tr><td>Dni kursowania</td><td>${bus.pattern === 'nocna' ? 'codziennie (noc)' : bus.status === 'zabytkowy' ? 'kursy okazjonalne' : 'poniedziałek – niedziela'}</td></tr>
                <tr><td>Typowe linie</td><td>${lineList.length ? lineList.map((l) => App.lineTag(l, bus.city)).join(' ') : '<span class="muted">brak przypisania</span>'}</td></tr>
              </tbody>
            </table>
          </div>
          <p class="tiny muted mt-10">Heatmapa to szacunek na podstawie typu brygady i rozkładów. Rzeczywiste przypisania wozów zmieniają się codziennie.</p>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('bus', 17)} Dane techniczne</h3><span class="badge">${App.esc(bus.confidence || '—')}</span></div>
          ${specHTML(bus)}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('check', 17)} Wyposażenie</h3></div>
          ${featureHTML(bus)}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('route', 17)} Linie</h3></div>
          ${lineList.length ? `<div class="route-strip">${lineList.map((l) => `<a class="route-stop end" href="#/linia/${bus.city}/${encodeURIComponent(l)}">Linia ${App.esc(l)}</a>`).join('')}</div>` : '<p class="small muted">Ten pojazd nie ma jeszcze przypisanych linii. <a href="#/edytuj/' + encodeURIComponent(bus.id) + '">Uzupełnij dane</a>.</p>'}
          ${lineList[0] ? (() => {
            const line = App.lineByNumber(bus.city, lineList[0]);
            if (!line) return '';
            const next = App.nextDepartures(line, 4);
            return `<div class="mt-14">
              <div class="tiny muted" style="text-transform:uppercase;letter-spacing:.08em;font-weight:800">Następne odjazdy · linia ${App.esc(line.n)} (${App.esc(line.from)} → ${App.esc(line.to)})</div>
              <div class="row gap-6 wrap mt-6">${next.length ? next.map((t) => `<span class="badge mono">${App.minutesToTime(t)}</span>`).join('') : '<span class="badge">koniec kursów dziś</span>'}</div>
            </div>`;
          })() : ''}
        </div>

        ${bus.notes ? `<div class="panel">
          <div class="panel-head"><h3>${App.icon('info', 17)} Notatki</h3></div>
          <p class="small" style="color:var(--text-2)">${App.esc(bus.notes)}</p>
        </div>` : ''}

        <div class="panel">
          <div class="panel-head">
            <h3>${App.icon('camera', 17)} Obserwacje</h3>
            <button class="btn btn-sm" id="btn-sighting-2">${App.icon('plus', 14)} Dodaj</button>
          </div>
          ${sightings.length
            ? `<div class="timeline">${sightings.slice(0, 12).map((s) => `<div class="tl-item">
                <div class="tl-time">${App.esc(App.fmtDateTime(s.at))}${s.line ? ' · linia ' + App.esc(s.line) : ''}</div>
                ${s.location ? `<div class="tl-title">📍 ${App.esc(s.location)}</div>` : ''}
                ${s.note ? `<div class="tl-note">${App.esc(s.note)}</div>` : ''}
              </div>`).join('')}</div>`
            : '<p class="small muted">Brak obserwacji. Dodaj pierwszą — data, linia i miejsce spotkania.</p>'}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${App.icon('shield', 17)} Źródło danych</h3></div>
          <p class="small muted">${source ? `<a href="${App.esc(source.url)}" target="_blank" rel="noopener">${App.esc(source.label)}</a>` : 'Wpis użytkownika'}</p>
          ${credit ? `<p class="tiny muted mt-6">Zdjęcie: ${App.esc(credit.label)}</p>` : ''}
          <div class="row gap-6 wrap mt-10">
            <a class="btn btn-sm" href="#/edytuj/${encodeURIComponent(bus.id)}">${App.icon('pen', 14)} Zgłoś korektę</a>
            <a class="btn btn-sm" href="#/mapa" id="btn-map">${App.icon('map', 14)} Pokaż na mapie</a>
          </div>
        </div>

        ${similar.length ? `
        <section class="section">
          <div class="section-head"><h2>Podobne wozy</h2><span class="tiny muted">ta sama seria</span></div>
          ${App.busGrid(similar)}
        </section>` : ''}
      </section>`;
  };

  App.mountBus = function (id) {
    const watch = document.getElementById('btn-watch');
    if (watch) watch.addEventListener('click', () => {
      App.toggleWatch(id);
      App.render();
    });
    const s1 = document.getElementById('btn-sighting');
    const s2 = document.getElementById('btn-sighting-2');
    if (s1) s1.addEventListener('click', () => App.openSightingSheet(id));
    if (s2) s2.addEventListener('click', () => App.openSightingSheet(id));
    const share = document.getElementById('btn-share');
    if (share) share.addEventListener('click', () => {
      const bus = App.busById(id);
      if (bus) App.shareBus(bus);
    });
    const mapBtn = document.getElementById('btn-map');
    if (mapBtn) {
      const bus = App.busById(id);
      if (bus && D.CITIES[bus.city]) {
        state.mapCity = bus.city;
      }
    }
  };

  /* ============================== SZUKANIE ============================== */

  App.openSearch = function () {
    const sheet = App.openSheet('Szukaj w BusLife', `
      <div class="search-box">
        ${App.icon('search', 18)}
        <input id="global-q" type="search" placeholder="Numer, model, marka, linia…" autocomplete="off" autofocus>
      </div>
      <div id="global-results" style="margin-top:12px"></div>
    `, {
      onMount(el) {
        const input = el.querySelector('#global-q');
        const box = el.querySelector('#global-results');
        const renderResults = () => {
          const q = input.value.trim().toLowerCase();
          if (!q) {
            box.innerHTML = `
              <div class="tiny muted" style="text-transform:uppercase;letter-spacing:.08em;font-weight:800;margin-bottom:8px">Skróty</div>
              <div class="row gap-6 wrap">
                <a class="chip" href="#/tabor?city=wloclawek">Włocławek</a>
                <a class="chip" href="#/tabor?city=torun">Toruń</a>
                <a class="chip" href="#/tabor?prop=elektryczny">Elektryczne</a>
                <a class="chip" href="#/tabor?q=MAN">MAN</a>
                <a class="chip" href="#/tabor?q=Solaris">Solaris</a>
                <a class="chip" href="#/linie">Linie</a>
              </div>
              <div class="tiny muted" style="margin-top:14px">Wpisz numer taborowy (np. 023), model (np. Urbino), markę lub numer linii.</div>`;
            return;
          }
          const buses = App.searchBuses(q, { sort: 'number' }).slice(0, 8);
          const lines = [];
          Object.keys(D.LINES).forEach((city) => {
            D.LINES[city].forEach((line) => {
              if (String(line.n).toLowerCase().includes(q) || line.from.toLowerCase().includes(q) || line.to.toLowerCase().includes(q)) {
                lines.push({ line, city });
              }
            });
          });
          let html = '';
          if (buses.length) {
            html += `<div class="tiny muted" style="text-transform:uppercase;letter-spacing:.08em;font-weight:800;margin-bottom:6px">Autobusy (${buses.length})</div>`;
            html += `<div class="line-list">${buses.map((b) => `
              <a class="line-row" href="#/bus/${encodeURIComponent(b.id)}">
                <span class="line-bullet" style="font-size:.78rem">#${App.esc(b.fleetNumber)}</span>
                <span class="line-main">
                  <span class="line-title">${App.esc(b.brand)} ${App.esc(b.model)}</span>
                  <span class="line-meta"><span>${App.esc(b.cityName)}</span><span>${App.esc(b.yearLabel || b.year)}</span><span>${App.esc(App.propInfo(b.propulsion).label)}</span></span>
                </span>
                ${App.icon('arrowRight', 16)}
              </a>`).join('')}</div>`;
          }
          if (lines.length) {
            html += `<div class="tiny muted" style="text-transform:uppercase;letter-spacing:.08em;font-weight:800;margin:14px 0 6px">Linie (${Math.min(lines.length, 5)})</div>`;
            html += `<div class="line-list">${lines.slice(0, 5).map(({ line, city }) => `
              <a class="line-row" href="#/linia/${city}/${encodeURIComponent(line.n)}">
                <span class="line-bullet ${line.night ? 'night' : line.type === 'podmiejska' ? 'suburban' : ''}">${App.esc(line.n)}</span>
                <span class="line-main">
                  <span class="line-title">${App.esc(line.from)} → ${App.esc(line.to)}</span>
                  <span class="line-meta"><span>${App.esc(D.CITIES[city].name)}</span><span>${App.esc(line.freq.weekday.peak)} w szczycie</span></span>
                </span>
                ${App.icon('arrowRight', 16)}
              </a>`).join('')}</div>`;
          }
          if (!html) {
            html = `<div class="empty"><div class="big">🤷</div><h3>Nic nie znaleziono</h3><p>Spróbuj krótszej frazy lub numeru taborowego.</p></div>`;
          }
          box.innerHTML = html;
        };
        input.addEventListener('input', renderResults);
        renderResults();
        setTimeout(() => input.focus(), 60);
        box.addEventListener('click', (e) => {
          if (e.target.closest('a')) App.closeSheet();
        });
      }
    });
    return sheet;
  };

  /* =============================== ROUTER =============================== */

  function parseHash() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const [pathPart, queryPart] = raw.split('?');
    const segs = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
    let params;
    try {
      params = new URLSearchParams(queryPart || '');
    } catch (e) {
      params = new URLSearchParams('');
    }
    return { segs, params };
  }

  function applyParams(params) {
    if (params.has('city')) {
      const c = params.get('city');
      if (c === 'all' || D.CITIES[c]) state.filters.city = c;
    }
    if (params.has('q')) state.filters.q = params.get('q');
    if (params.has('prop')) state.filters.prop = params.get('prop');
    if (params.has('brand')) state.filters.brand = params.get('brand');
    if (params.has('sort')) state.filters.sort = params.get('sort');
    state.filters.line = params.has('line') ? params.get('line') : null;
    state.filters.len = params.has('len') ? params.get('len') : null;
    state.filters.page = 1;
  }

  function setActiveTab(segs) {
    const root = segs[0] || '';
    let tab = 'home';
    if (['tabor', 'bus', 'dodaj', 'edytuj'].includes(root)) tab = 'fleet';
    else if (['linie', 'linia'].includes(root)) tab = 'lines';
    else if (root === 'mapa') tab = 'map';
    else if (['moje', 'o-aplikacji'].includes(root)) tab = 'mine';
    document.querySelectorAll('.tab').forEach((el) => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
  }

  App.render = function () {
    const view = document.getElementById('view');
    if (!view) return;
    const { segs, params } = parseHash();
    const root = segs[0] || '';
    let html = '';
    let mount = null;

    App._after = [];

    switch (root) {
      case '':
        html = App.views.home();
        mount = App.mountHome;
        break;
      case 'tabor':
        applyParams(params);
        html = App.views.fleet();
        mount = App.mountFleet;
        break;
      case 'bus':
        html = App.views.bus(segs[1]);
        mount = () => App.mountBus(segs[1]);
        break;
      case 'linie':
        if (params.has('city') && D.CITIES[params.get('city')]) state.lineCity = params.get('city');
        html = App.views.lines();
        mount = App.mountLines;
        break;
      case 'linia':
        html = App.views.lineDetail(segs[1], segs[2]);
        mount = App.mountLineDetail;
        break;
      case 'mapa':
        if (params.has('city') && D.CITIES[params.get('city')]) state.mapCity = params.get('city');
        html = App.views.map();
        mount = App.mountMap;
        break;
      case 'dodaj':
        html = App.views.add(null);
        mount = () => App.mountAdd(null);
        break;
      case 'edytuj':
        html = App.views.add(segs[1]);
        mount = () => App.mountAdd(segs[1]);
        break;
      case 'moje':
        html = App.views.mine();
        mount = App.mountMine;
        break;
      case 'o-aplikacji':
        html = App.views.about();
        mount = App.mountAbout;
        break;
      default:
        html = App.views.home();
        mount = App.mountHome;
    }

    view.innerHTML = html;
    setActiveTab(segs);
    if (typeof mount === 'function') {
      try { mount(); } catch (e) { console.error(e); }
    }
    App._after.forEach((fn) => {
      try { fn(); } catch (e) { console.error(e); }
    });
    App._after = [];
    if (!App._skipScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    App._skipScroll = false;
  };

  /* =========================== START APLIKACJI =========================== */

  function updateLive() {
    const el = document.getElementById('live-count');
    const ticker = document.getElementById('live-ticker');
    if (!el && !ticker) return;
    const snap = App.liveSnapshot();
    if (el) el.textContent = snap.total;
    if (ticker) {
      const items = snap.top.map((bus) => {
        const line = App.liveLineText(bus, snap.at);
        return `<span class="ticker-item"><b>#${App.esc(bus.fleetNumber)}</b> ${App.esc(bus.brand + ' ' + bus.model)} · linia ${App.esc(line)}</span>`;
      }).join('');
      ticker.innerHTML = `<span class="ticker-track">${items}${items}</span>`;
    }
  }

  App.promptInstall = async function () {
    if (window.__deferredPrompt) {
      window.__deferredPrompt.prompt();
      const choice = await window.__deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        App.toast('Instalowanie aplikacji…', 'ok');
      }
      window.__deferredPrompt = null;
    } else {
      App.openSheet('Jak zainstalować', `
        <div class="info-block">
          <div class="info-card">
            <h4>${App.icon('download', 16)} Android / Chrome</h4>
            <p>Otwórz menu przeglądarki (⋮) i wybierz <b>„Dodaj do ekranu głównego”</b> lub <b>„Zainstaluj aplikację”</b>.</p>
          </div>
          <div class="info-card">
            <h4>${App.icon('download', 16)} iPhone / Safari</h4>
            <p>Stuknij przycisk <b>Udostępnij</b> (kwadrat ze strzałką) i wybierz <b>„Dodaj do ekranu początkowego”</b>.</p>
          </div>
          <div class="info-card">
            <h4>${App.icon('info', 16)} Komputer</h4>
            <p>W Chrome lub Edge kliknij ikonę instalacji w pasku adresu (monitor ze strzałką).</p>
          </div>
        </div>
        <div class="sheet-actions"><button class="btn btn-primary btn-block" data-ok>Rozumiem</button></div>
      `, {
        onMount(sheet) {
          sheet.querySelector('[data-ok]').addEventListener('click', App.closeSheet);
        }
      });
    }
  };

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        /* offline mode niedostępny — aplikacja działa dalej */
      });
    });
  }

  function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      const panel = document.getElementById('install-panel');
      if (panel) panel.style.display = '';
    });
    window.addEventListener('appinstalled', () => {
      window.__deferredPrompt = null;
      App.toast('BusLife zainstalowany 🎉', 'ok');
    });
  }

  function initKeys() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      const typing = /INPUT|TEXTAREA|SELECT/.test(tag);
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        App.openSearch();
      }
    });
  }

  function init() {
    App.applyTheme();
    App.rebuild();
    App.render();

    window.addEventListener('hashchange', () => App.render());

    const themeBtn = document.getElementById('btn-theme');
    if (themeBtn) themeBtn.addEventListener('click', () => {
      App.toggleTheme();
      App.toast(App.state.prefs.theme === 'light' ? 'Motyw jasny' : 'Motyw ciemny');
    });

    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.addEventListener('click', App.openSearch);

    registerServiceWorker();
    initInstallPrompt();
    initKeys();

    setInterval(() => {
      updateLive();
    }, 60000);

    // Odświeżenie statusu „w ruchu” po powrocie do aplikacji
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        updateLive();
        if ((location.hash || '#/') === '#/' || (location.hash || '').startsWith('#/tabor')) App.render();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
