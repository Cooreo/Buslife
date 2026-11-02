/* =====================================================================
   BusLife Kujawy — rdzeń aplikacji: stan, magazyn lokalny, komponenty,
   silnik rozkładów i symulacja ruchu.
   ===================================================================== */

(function () {
  'use strict';

  const D = window.BUSLIFE;
  const H = D.helpers;
  const Logo = window.BusLogos;
  const App = (window.BusApp = window.BusApp || {});

  App.D = D;
  App.H = H;
  App.Logo = Logo;

  /* ----------------------------- IKONY ----------------------------- */

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    star: '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8Z"/>',
    map: '<path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4Z"/><path d="M9 4v13M15 7v13"/>',
    pen: '<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14.5 5.5 4 4"/>',
    share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 10.8 7.2-4.2M8.4 13.2l7.2 4.2"/>',
    camera: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.6"/>',
    bus: '<path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10"/><path d="M4 17h16v2H4z"/><path d="M7 9h4M14 9h3"/><circle cx="7.5" cy="19.5" r="1.3"/><circle cx="16.5" cy="19.5" r="1.3"/>',
    bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.2 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    route: '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.3 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 4h5.8"/>',
    sparkles: '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.8L12 18l-1.7-5.5L4.8 10.7 10.3 9 12 3.5Z"/><path d="M18.5 16.5 19.3 19l2.2.8-2.2.8-.8 2.4-.8-2.4-2.2-.8 2.2-.8Z"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
    upload: '<path d="M12 20V9M7.5 13.5 12 9l4.5 4.5"/><path d="M4.5 4.5h15"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 13h9l1-13"/>',
    wifi: '<path d="M4 9.5a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0M10 16.5a4 4 0 0 1 4 0"/><circle cx="12" cy="19.5" r="1.1"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5 4.2 16.5"/>',
    wheelchair: '<circle cx="11" cy="4.6" r="2"/><path d="M11 8v5h4.5l3 6"/><path d="M11 13a5 5 0 1 0 4.4 7.4"/><path d="M9 9.5h4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 5.4a3 3 0 0 1 0 5.6M17.5 14.4c2 .6 3.3 2.3 3.3 4.6"/>',
    creditcard: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M6.5 15h3"/>',
    videocam: '<rect x="3" y="6.5" width="12" height="11" rx="2.5"/><path d="m15 11 6-3.5v9L15 13"/>',
    usb: '<path d="M12 20V7"/><path d="m9 10 3-3 3 3"/><rect x="10.3" y="3" width="3.4" height="3.4" rx="1"/><circle cx="12" cy="20.4" r="1.4"/><path d="M12 15.5 9 13M12 13.5l3-2.5"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    building: '<path d="M4 20V6l8-3 8 3v14"/><path d="M9 20v-5h6v5M8 9h2M14 9h2M8 12.5h2M14 12.5h2"/>',
    shield: '<path d="M12 3 5 5.5v6C5 16 8 19.5 12 21c4-1.5 7-5 7-9.5v-6L12 3Z"/><path d="m9 11.8 2 2 4-4"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.2C19 15.6 12 20 12 20Z"/>'
  };

  App.icon = function (name, size) {
    const path = ICONS[name] || ICONS.info;
    const s = size || 18;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  };

  /* ----------------------------- MAGAZYN ----------------------------- */

  const KEY = 'buslife.v1.';

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(KEY + key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(KEY + key, JSON.stringify(value));
        return true;
      } catch (e) {
        if (e && /quota/i.test(String(e.name) + String(e.message))) {
          App.toast('Brak miejsca w pamięci urządzenia — usuń zdjęcia lub obserwacje.', 'err');
        }
        return false;
      }
    },
    remove(key) {
      try { localStorage.removeItem(KEY + key); } catch (e) { /* noop */ }
    }
  };
  App.store = store;

  const state = {
    userBuses: store.get('userBuses', []),
    edits: store.get('edits', {}),
    watchlist: store.get('watchlist', []),
    sightings: store.get('sightings', []),
    prefs: store.get('prefs', { theme: null, city: 'all', seenIntro: false }),
    filters: { q: '', city: 'all', brand: 'all', prop: 'all', line: null, len: null, sort: 'number', page: 1 },
    lineCity: 'wloclawek',
    mapCity: 'wloclawek',
    mineTab: 'watch'
  };
  App.state = state;

  App.saveState = function (which) {
    if (!which || which === 'userBuses') store.set('userBuses', state.userBuses);
    if (!which || which === 'edits') store.set('edits', state.edits);
    if (!which || which === 'watchlist') store.set('watchlist', state.watchlist);
    if (!which || which === 'sightings') store.set('sightings', state.sightings);
    if (!which || which === 'prefs') store.set('prefs', state.prefs);
  };

  /* ----------------------------- DANE ----------------------------- */

  const data = { version: 0, list: [], map: new Map() };
  App.data = data;

  const propsMap = {
    elektryczny: { label: 'Elektryczny', short: 'EV', cls: 'electric', icon: 'bolt' },
    hybrydowy: { label: 'Hybrydowy', short: 'HEV', cls: 'hybrid', icon: 'sparkles' },
    'mild-hybrid': { label: 'Mild hybrid', short: 'MHEV', cls: 'hybrid', icon: 'sparkles' },
    diesel: { label: 'Diesel', short: 'D', cls: 'diesel', icon: 'bus' },
    cng: { label: 'CNG', short: 'CNG', cls: 'cng', icon: 'bus' },
    wodorowy: { label: 'Wodorowy', short: 'H₂', cls: 'hydrogen', icon: 'bolt' }
  };
  App.propsMap = propsMap;

  App.propInfo = (prop) => propsMap[prop] || { label: prop || 'Inny', short: '?', cls: 'diesel', icon: 'bus' };

  App.statusInfo = function (status) {
    switch (status) {
      case 'zabytkowy': return { label: 'Zabytkowy', cls: 'historic' };
      case 'testowy': return { label: 'Testowy', cls: 'hydrogen' };
      case 'wycofany': return { label: 'Wycofany', cls: 'diesel' };
      default: return { label: 'W eksploatacji', cls: 'live' };
    }
  };

  App.rebuild = function () {
    const out = [];
    D.BUSES.forEach((base) => {
      const edit = state.edits[base.id];
      out.push(edit ? Object.assign({}, base, edit) : base);
    });
    state.userBuses.forEach((b) => {
      out.push(Object.assign({}, b, { isUser: true, cityName: (D.CITIES[b.city] || {}).name || b.cityName || '' }));
    });
    data.list = out;
    data.map = new Map(out.map((b) => [b.id, b]));
    data.version += 1;
    return out;
  };
  App.rebuild();

  App.allBuses = () => data.list;
  App.busById = (id) => data.map.get(id) || null;

  App.busesForCity = function (city) {
    return city && city !== 'all' ? data.list.filter((b) => b.city === city) : data.list.slice();
  };

  App.searchBuses = function (query, filters) {
    const f = Object.assign({ city: 'all', brand: 'all', prop: 'all', len: null, sort: 'number' }, filters || {});
    const q = String(query || '').trim().toLowerCase();
    let list = data.list.filter((b) => {
      if (f.city !== 'all' && b.city !== f.city) return false;
      if (f.brand !== 'all' && b.brand !== f.brand) return false;
      if (f.prop !== 'all') {
        if (f.prop === 'hybrydowy') {
          if (b.propulsion !== 'hybrydowy' && b.propulsion !== 'mild-hybrid') return false;
        } else if (b.propulsion !== f.prop) return false;
      }
      if (f.line && !(b.lines || []).map(String).includes(String(f.line))) return false;
      if (f.len === 'long' && !(Number(b.length) >= 17.5)) return false;
      if (f.len === 'midi' && !(Number(b.length) <= 10.5)) return false;
      if (f.len === 'maxi' && !(Number(b.length) > 10.5 && Number(b.length) < 17.5)) return false;
      if (!q) return true;
      const hay = [b.fleetNumber, b.brand, b.model, b.fullName, b.cityName, b.carrier, b.gen, b.year, b.propulsion, (b.lines || []).join(' '), b.registration]
        .join(' ')
        .toLowerCase();
      return q.split(/\s+/).every((part) => hay.includes(part));
    });

    if (/^\d{1,3}$/.test(q)) {
      list.sort((a, b) => {
        const score = (x) => (String(x.fleetNumber).replace(/^0+/, '') === q.replace(/^0+/, '') ? 0 : String(x.fleetNumber).includes(q) ? 1 : 2);
        return score(a) - score(b) || a.fleetNum - b.fleetNum;
      });
      return list;
    }

    switch (f.sort) {
      case 'newest': list.sort((a, b) => (b.year || 0) - (a.year || 0) || b.fleetNum - a.fleetNum); break;
      case 'oldest': list.sort((a, b) => (a.year || 0) - (b.year || 0) || a.fleetNum - b.fleetNum); break;
      case 'brand': list.sort((a, b) => a.brand.localeCompare(b.brand) || a.fleetNum - b.fleetNum); break;
      case 'capacity': list.sort((a, b) => (b.capacity || 0) - (a.capacity || 0)); break;
      case 'active': list.sort((a, b) => (H.isActiveNow(b) ? 1 : 0) - (H.isActiveNow(a) ? 1 : 0) || a.fleetNum - b.fleetNum); break;
      default: list.sort((a, b) => (a.city === b.city ? a.fleetNum - b.fleetNum : a.city.localeCompare(b.city)));
    }
    return list;
  };

  App.brands = function () {
    return Array.from(new Set(data.list.map((b) => b.brand))).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pl'));
  };

  /* ----------------------------- FORMATOWANIE ----------------------------- */

  App.esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  App.fmtDate = function (iso) {
    const d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  App.fmtDateTime = function (iso) {
    const d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  App.minutesToTime = function (mins) {
    if (mins == null || isNaN(mins)) return '—';
    const m = ((mins % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  };

  App.headwayMinutes = function (label) {
    if (!label) return null;
    const raw = String(label).replace(/[^\d–\-]/g, ' ');
    const nums = (raw.match(/\d+/g) || []).map(Number);
    if (!nums.length) return null;
    if (nums.length >= 2) return Math.round((nums[0] + nums[1]) / 2);
    return nums[0];
  };

  /* ----------------------------- ROZKŁADY ----------------------------- */

  App.lineByNumber = function (city, n) {
    const arr = D.LINES[city] || [];
    return arr.find((l) => String(l.n) === String(n)) || null;
  };

  App.linesForCity = function (city) {
    return (D.LINES[city] || []).slice();
  };

  App.headwayForHour = function (line, minutes) {
    const type = H.dayType(new Date());
    const f = line.freq[type] || line.freq.weekday;
    if (!f) return null;
    const isEvening = minutes < 300 || minutes >= 1260;
    const isPeak = (minutes >= 360 && minutes <= 540) || (minutes >= 840 && minutes <= 1020);
    const label = isEvening ? f.evening : isPeak ? f.peak : f.offPeak;
    return App.headwayMinutes(label);
  };

  App.nextDepartures = function (line, count = 4, date = new Date()) {
    if (!line || !line.freq) return [];
    const type = H.dayType(date);
    const f = line.freq[type] || line.freq.weekday;
    if (!f) return [];
    const first = H.toMinutes(f.first);
    const last = H.toMinutes(f.last);
    if (first == null || last == null || last < first) return [];
    const now = date.getHours() * 60 + date.getMinutes();
    const head = App.headwayForHour(line, Math.max(now, first)) || 30;
    const out = [];
    let t = first;
    if (now > first) t = first + Math.ceil((now - first) / head) * head;
    if (t > last) {
      // ostatni kurs dnia — pokaż go jako informację
      return [];
    }
    while (t <= last && out.length < count) {
      out.push(t);
      t += head;
    }
    return out;
  };

  App.nextDepartureIn = function (line, date = new Date()) {
    const next = App.nextDepartures(line, 1, date);
    if (!next.length) return null;
    const now = date.getHours() * 60 + date.getMinutes();
    return Math.max(0, next[0] - now);
  };

  App.nextDeparturesForStop = function (line, count) {
    return App.nextDepartures(line, count, new Date());
  };

  /* ----------------------------- SYMULACJA RUCHU ----------------------------- */

  App.liveSnapshot = function (date = new Date()) {
    const d = date || new Date();
    const active = data.list
      .filter((b) => b.status === 'eksploatowany')
      .map((b) => ({ bus: b, p: H.serviceProbability(b, d) }))
      .filter((x) => x.p >= 0.5)
      .sort((a, b) => b.p - a.p);
    const byCity = { wloclawek: 0, torun: 0 };
    active.forEach((x) => { byCity[x.bus.city] = (byCity[x.bus.city] || 0) + 1; });
    return {
      at: d,
      total: active.length,
      byCity,
      active: active.map((x) => x.bus),
      top: active.slice(0, 8).map((x) => x.bus)
    };
  };

  App.liveLineText = function (bus, date) {
    const lines = bus.lines && bus.lines.length ? bus.lines : ['—'];
    const idx = (bus.seed + (date || new Date()).getMinutes()) % lines.length;
    return lines[idx];
  };

  /* ----------------------------- KOMPONENTY ----------------------------- */

  App.propBadge = function (bus, withShort) {
    const info = App.propInfo(bus.propulsion);
    return `<span class="badge ${info.cls}">${App.esc(withShort ? info.short : info.label)}</span>`;
  };

  App.busImageHTML = function (bus, opts) {
    const o = opts || {};
    if (bus.photo) {
      return `<img src="${App.esc(bus.photo)}" alt="${App.esc(bus.brand + ' ' + bus.model + ' nr ' + bus.fleetNumber)}" loading="lazy" decoding="async" ${o.className ? `class="${o.className}"` : ''}>`;
    }
    return `<div class="schematic" role="img" aria-label="Schemat ${App.esc(bus.brand + ' ' + bus.model + ' #' + bus.fleetNumber)}">${Logo.renderBusIllustrationSVG(bus)}</div>`;
  };

  App.lineTag = function (n, city) {
    const line = city ? App.lineByNumber(city, n) : null;
    const night = line && line.night;
    return `<span class="line-tag${night ? ' night' : ''}">${App.esc(n)}</span>`;
  };

  App.busCard = function (bus, index) {
    const active = H.isActiveNow(bus);
    const info = App.propInfo(bus.propulsion);
    const status = App.statusInfo(bus.status);
    const watched = state.watchlist.includes(bus.id);
    const lines = (bus.lines || []).slice(0, 3);
    const more = (bus.lines || []).length - lines.length;
    return `
      <a class="bus-card${bus.isUser ? ' is-user' : ''}${active ? ' is-active' : ''}" href="#/bus/${encodeURIComponent(bus.id)}"
         style="animation-delay:${Math.min(index || 0, 12) * 22}ms" data-bus-id="${App.esc(bus.id)}">
        <div class="bus-card-media">
          ${App.busImageHTML(bus)}
          <span class="photo-tag">${bus.photo ? 'fotografia' : 'schemat SVG'}</span>
        </div>
        <div class="bus-card-body">
          <div class="bus-card-head">
            <div>
              <div class="bus-number">#${App.esc(bus.fleetNumber)}<small>${App.esc((D.CITIES[bus.city] || {}).carrier || bus.carrier || '')}</small></div>
              <div class="bus-model">${App.esc(bus.brand)} ${App.esc(bus.model)}</div>
            </div>
            ${watched ? `<span title="Obserwowany" style="color:var(--amber)">${App.icon('star', 17)}</span>` : ''}
          </div>
          <div class="bus-brandline">
            <span>${App.esc(bus.yearLabel || bus.year)}</span>
            <span class="sep">•</span>
            <span>${App.esc(String(bus.length).replace('.', ',') + ' m')}</span>
            <span class="sep">•</span>
            <span>${App.esc(String(bus.seats || '—'))} miejsc</span>
          </div>
          <div class="bus-card-foot">
            <span class="badge ${info.cls}">${App.esc(info.label)}</span>
            ${bus.status !== 'eksploatowany' ? `<span class="badge ${status.cls}">${App.esc(status.label)}</span>` : ''}
            ${bus.isUser ? '<span class="badge mine">Moje</span>' : ''}
            ${lines.map((l) => App.lineTag(l, bus.city)).join('')}
            ${more > 0 ? `<span class="badge">+${more}</span>` : ''}
          </div>
        </div>
      </a>`;
  };

  App.busGrid = function (list) {
    if (!list.length) {
      return `<div class="empty">
        <div class="big">🚌</div>
        <h3>Brak wyników</h3>
        <p>Spróbuj zmienić filtry lub dodaj brakujący autobus do bazy.</p>
        <a class="btn btn-primary btn-sm" href="#/dodaj">${App.icon('plus', 15)} Dodaj autobus</a>
      </div>`;
    }
    return `<div class="bus-grid">${list.map((b, i) => App.busCard(b, i)).join('')}</div>`;
  };

  App.statCard = function (label, value, suffix, pct, tone) {
    return `<div class="stat-card ${tone || ''}">
      <div class="label">${App.esc(label)}</div>
      <div class="value">${value}${suffix ? `<small>${App.esc(suffix)}</small>` : ''}</div>
      ${pct != null ? `<div class="bar"><i style="width:${Math.max(2, Math.min(100, pct))}%"></i></div>` : ''}
    </div>`;
  };

  App.donut = function (segments, centerLabel, centerValue) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const radius = 44;
    const circ = 2 * Math.PI * radius;
    let offset = 0;
    const arcs = segments.map((seg) => {
      const len = (seg.value / total) * circ;
      const el = `<circle cx="60" cy="60" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="13"
        stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-offset}" />`;
      offset += len;
      return el;
    }).join('');
    return `<div class="donut-wrap">
      <div class="donut">
        <svg viewBox="0 0 120 120" width="116" height="116">
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(148,163,184,0.14)" stroke-width="13"/>
          ${arcs}
        </svg>
        <div class="center"><div><b>${centerValue}</b><span>${App.esc(centerLabel)}</span></div></div>
      </div>
      <div class="legend-list">
        ${segments.map((s) => `<div class="legend-item"><i style="background:${s.color}"></i>${App.esc(s.label)}<b>${s.value}</b></div>`).join('')}
      </div>
    </div>`;
  };

  /* ----------------------------- TOAST / SHEET ----------------------------- */

  App.toast = function (message, type) {
    const stack = document.getElementById('toasts');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'err' ? 'err' : type === 'ok' ? 'ok' : '');
    el.innerHTML = `<span class="ico">${type === 'err' ? '⚠️' : type === 'ok' ? '✅' : '💬'}</span><span>${App.esc(message)}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .28s ease, transform .28s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  };

  App.closeSheet = function () {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.body.style.overflow = '';
  };

  App.openSheet = function (title, bodyHTML, options) {
    const opts = options || {};
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="sheet-backdrop" data-close="1">
        <div class="sheet" role="dialog" aria-modal="true" aria-label="${App.esc(title)}">
          <div class="sheet-grip"></div>
          <h3>${App.esc(title)}</h3>
          <div class="sheet-body" style="margin-top:12px">${bodyHTML}</div>
        </div>
      </div>`;
    const backdrop = root.firstElementChild;
    const sheet = backdrop.querySelector('.sheet');
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) App.closeSheet();
    });
    const esc = (e) => {
      if (e.key === 'Escape') {
        App.closeSheet();
        document.removeEventListener('keydown', esc);
      }
    };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    if (typeof opts.onMount === 'function') opts.onMount(sheet);
    return sheet;
  };

  /* ----------------------------- OBSERWACJE ----------------------------- */

  App.sightingsFor = function (busId) {
    return state.sightings.filter((s) => s.busId === busId).sort((a, b) => new Date(b.at) - new Date(a.at));
  };

  App.addSighting = function (busId, data) {
    const bus = App.busById(busId);
    if (!bus) return;
    state.sightings.push({
      id: 's-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      busId,
      at: data.at || new Date().toISOString(),
      line: data.line || '',
      location: data.location || '',
      note: data.note || '',
      photo: data.photo || null
    });
    App.saveState('sightings');
  };

  App.openSightingSheet = function (busId) {
    const bus = App.busById(busId);
    if (!bus) return;
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    App.openSheet(`Obserwacja — #${bus.fleetNumber}`, `
      <form id="sighting-form">
        <div class="form-grid">
          <div class="field">
            <label for="sf-at">Data i godzina</label>
            <input class="input" type="datetime-local" id="sf-at" name="at" value="${local}" required>
          </div>
          <div class="field">
            <label for="sf-line">Linia</label>
            <input class="input" id="sf-line" name="line" list="sf-lines" placeholder="np. 21" value="${App.esc(bus.lines && bus.lines[0] ? bus.lines[0] : '')}">
            <datalist id="sf-lines">${(bus.lines || []).map((l) => `<option value="${App.esc(l)}"></option>`).join('')}</datalist>
          </div>
          <div class="field">
            <label for="sf-loc">Miejsce</label>
            <input class="input" id="sf-loc" name="location" placeholder="np. Centrum Przesiadkowe" maxlength="80">
          </div>
          <div class="field">
            <label for="sf-note">Notatka</label>
            <textarea class="textarea" id="sf-note" name="note" placeholder="Malowanie, tablice, ciekawostka…" maxlength="300"></textarea>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="btn btn-primary btn-block" type="submit">${App.icon('check', 16)} Zapisz obserwację</button>
        </div>
      </form>
    `, {
      onMount(sheet) {
        sheet.querySelector('#sighting-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const at = fd.get('at');
          App.addSighting(busId, {
            at: at ? new Date(at).toISOString() : new Date().toISOString(),
            line: fd.get('line'),
            location: fd.get('location'),
            note: fd.get('note')
          });
          App.closeSheet();
          App.toast('Dodano obserwację autobusu', 'ok');
          App.render();
        });
      }
    });
  };

  App.toggleWatch = function (busId) {
    const idx = state.watchlist.indexOf(busId);
    if (idx >= 0) {
      state.watchlist.splice(idx, 1);
      App.toast('Usunięto z obserwowanych');
    } else {
      state.watchlist.push(busId);
      App.toast('Dodano do obserwowanych', 'ok');
    }
    App.saveState('watchlist');
    return state.watchlist.includes(busId);
  };

  App.isWatched = (busId) => state.watchlist.includes(busId);

  /* ----------------------------- UDOSTĘPNIANIE ----------------------------- */

  App.shareBus = async function (bus) {
    const url = location.origin + location.pathname + '#/bus/' + encodeURIComponent(bus.id);
    const text = `#${bus.fleetNumber} ${bus.brand} ${bus.model} — ${(D.CITIES[bus.city] || {}).carrier || bus.carrier}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BusLife Kujawy', text, url });
        return;
      }
      await navigator.clipboard.writeText(text + ' ' + url);
      App.toast('Link skopiowany do schowka', 'ok');
    } catch (e) {
      App.toast('Nie udało się udostępnić', 'err');
    }
  };

  /* ----------------------------- MOTYW ----------------------------- */

  App.applyTheme = function (theme) {
    const root = document.documentElement;
    const chosen = theme || state.prefs.theme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (chosen === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', chosen === 'light' ? '#f1f5fb' : '#060a12');
    state.prefs.theme = chosen;
    App.saveState('prefs');
  };

  App.toggleTheme = function () {
    App.applyTheme(state.prefs.theme === 'light' ? 'dark' : 'light');
  };

  /* ----------------------------- EKSPORT / IMPORT ----------------------------- */

  App.exportData = function () {
    const payload = {
      app: 'BusLife Kujawy',
      version: D.version,
      exportedAt: new Date().toISOString(),
      userBuses: state.userBuses,
      edits: state.edits,
      watchlist: state.watchlist,
      sightings: state.sightings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `buslife-kujawy-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    App.toast('Wyeksportowano dane do pliku JSON', 'ok');
  };

  App.importData = function (file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== 'object') throw new Error('bad');
        if (Array.isArray(parsed.userBuses)) state.userBuses = parsed.userBuses;
        if (parsed.edits && typeof parsed.edits === 'object') state.edits = parsed.edits;
        if (Array.isArray(parsed.watchlist)) state.watchlist = parsed.watchlist;
        if (Array.isArray(parsed.sightings)) state.sightings = parsed.sightings;
        App.saveState();
        App.rebuild();
        App.render();
        App.toast('Zaimportowano dane', 'ok');
      } catch (e) {
        App.toast('Nieprawidłowy plik JSON', 'err');
      }
    };
    reader.readAsText(file);
  };

  App.resetData = function () {
    App.openSheet('Wyczyścić dane lokalne?', `
      <p class="small muted">Usunięte zostaną: dodane autobusy, obserwacje, lista obserwowanych oraz korekty. Baza wbudowana pozostanie bez zmian.</p>
      <div class="sheet-actions">
        <button class="btn btn-block btn-ghost" data-cancel>Anuluj</button>
        <button class="btn btn-block" id="confirm-reset" style="background:rgba(248,113,113,.16);border-color:rgba(248,113,113,.4);color:#fca5a5">Wyczyść</button>
      </div>
    `, {
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', App.closeSheet);
        sheet.querySelector('#confirm-reset').addEventListener('click', () => {
          state.userBuses = [];
          state.edits = {};
          state.watchlist = [];
          state.sightings = [];
          App.saveState();
          App.rebuild();
          App.closeSheet();
          App.render();
          App.toast('Dane lokalne wyczyszczone');
        });
      }
    });
  };

  App.appInfo = function () {
    return {
      name: 'BusLife Kujawy',
      version: D.version,
      updated: D.updated,
      buses: data.list.length,
      lines: Object.keys(D.LINES).reduce((sum, c) => sum + D.LINES[c].length, 0)
    };
  };
})();
