// BusLife Kujawy — Logotypy przewoźników, producentów oraz generator sylwetek autobusów SVG

window.BusLogos = {
  // Logotypy przewoźników (MPK Włocławek, MZK Toruń, KPTS, Relobus)
  getCarrierLogoSVG(carrierId, size = 36) {
    const id = (carrierId || '').toLowerCase();
    if (id.includes('wloclawek') || id.includes('mpk')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="carrier-logo-svg" aria-label="Logo MPK Włocławek">
          <rect width="64" height="64" rx="14" fill="#111827" stroke="#fbbf24" stroke-width="2.5"/>
          <rect x="4" y="4" width="56" height="24" rx="8" fill="#fbbf24"/>
          <text x="32" y="21" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="15" fill="#0f172a" text-anchor="middle" letter-spacing="0.5">MPK</text>
          <!-- Strzałka MPK Włocławek RGB -->
          <path d="M8 40 L16 33 L16 37 L38 37 L33 43 L16 43 L16 47 Z" fill="#ef4444"/>
          <path d="M35 43 L41 35 L47 35 L41 43 Z" fill="#10b981"/>
          <path d="M43 43 L49 35 L55 35 L49 43 Z" fill="#3b82f6"/>
          <text x="32" y="56" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="7.5" fill="#f8fafc" text-anchor="middle" letter-spacing="0.8">WŁOCŁAWEK</text>
        </svg>
      `;
    }
    if (id.includes('torun') || id.includes('mzk')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="carrier-logo-svg" aria-label="Logo MZK Toruń">
          <rect width="64" height="64" rx="14" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
          <rect x="4" y="4" width="56" height="24" rx="8" fill="#f8fafc"/>
          <text x="32" y="21" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="15" fill="#0284c7" text-anchor="middle" letter-spacing="0.5">MZK</text>
          <!-- Motyw gotyckich murów Torunia i Eko-Toruń -->
          <path d="M14 44 V34 H19 V38 H24 V32 H30 V44 Z" fill="#ef4444"/>
          <path d="M33 44 V35 C38 32 46 32 50 37 C46 42 39 44 33 44 Z" fill="#10b981"/>
          <text x="32" y="56" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="8.5" fill="#38bdf8" text-anchor="middle" letter-spacing="1.2">TORUŃ</text>
        </svg>
      `;
    }
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="carrier-logo-svg">
        <rect width="64" height="64" rx="14" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
        <text x="32" y="36" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="13" fill="#f8fafc" text-anchor="middle">BUS</text>
        <text x="32" y="52" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="7.5" fill="#94a3b8" text-anchor="middle">KUJAWY</text>
      </svg>
    `;
  },

  // Logotypy producentów autobusów (Solaris, MAN, Ursus, Jelcz, Mercedes, Autosan)
  getBrandLogoSVG(brand, size = 34) {
    const b = (brand || '').toLowerCase();
    if (b.includes('solaris')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" title="Solaris Bus & Coach">
          <rect width="64" height="64" rx="12" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
          <ellipse cx="32" cy="24" rx="20" ry="11" stroke="#cbd5e1" stroke-width="3" fill="#1e293b"/>
          <path d="M18 28 C24 17, 36 17, 45 21 C36 24, 26 24, 19 29 Z" fill="#22c55e"/>
          <path d="M46 20 C40 31, 28 31, 19 27 C28 24, 38 24, 45 19 Z" fill="#e2e8f0"/>
          <text x="32" y="51" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="9.5" fill="#f8fafc" text-anchor="middle" letter-spacing="1.2">SOLARIS</text>
        </svg>
      `;
    }
    if (b.includes('man')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" title="MAN Truck & Bus">
          <rect width="64" height="64" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
          <path d="M12 28 C20 14, 44 14, 52 28" stroke="#94a3b8" stroke-width="2.5" fill="none"/>
          <text x="32" y="36" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="16" fill="#e2e8f0" text-anchor="middle" letter-spacing="1.5">MAN</text>
          <path d="M18 46 H46" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
          <text x="32" y="56" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="6.8" fill="#38bdf8" text-anchor="middle" letter-spacing="0.8">LION'S CITY</text>
        </svg>
      `;
    }
    if (b.includes('ursus') || b.includes('amz')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" title="Ursus Bus / AMZ City Smile">
          <rect width="64" height="64" rx="12" fill="#0f172a" stroke="#f97316" stroke-width="2"/>
          <path d="M16 18 H48 V32 C48 42 32 48 32 48 C32 48 16 42 16 32 Z" fill="#ea580c" fill-opacity="0.25" stroke="#f97316" stroke-width="2"/>
          <text x="32" y="34" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="11" fill="#fdba74" text-anchor="middle" letter-spacing="0.8">URSUS</text>
          <text x="32" y="56" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="7" fill="#fb923c" text-anchor="middle">CITY SMILE</text>
        </svg>
      `;
    }
    if (b.includes('jelcz')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" title="Jelcz">
          <rect width="64" height="64" rx="12" fill="#1f1216" stroke="#ef4444" stroke-width="2"/>
          <rect x="10" y="18" width="44" height="22" rx="4" fill="#dc2626" stroke="#fef2f2" stroke-width="1.5"/>
          <text x="32" y="33" font-family="Georgia, serif" font-style="italic" font-weight="900" font-size="10.5" fill="#ffffff" text-anchor="middle" letter-spacing=".6">JELCZ</text>
          <text x="32" y="54" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="7" fill="#fca5a5" text-anchor="middle" letter-spacing="0.8">KLASYK PL</text>
        </svg>
      `;
    }
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
        <text x="32" y="36" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="10" fill="#e2e8f0" text-anchor="middle">${(brand || 'BUS').slice(0, 6).toUpperCase()}</text>
      </svg>
    `;
  },

  // Generator szczegółowego schematu i malowania autobusu (SVG) z wyświetlaczem LED Pixel
  renderBusIllustrationSVG(bus, opts = {}) {
    const isWloclawek = bus.city === 'wloclawek';
    const isHistorical = bus.status === 'historyczny' || (bus.brand || '').toLowerCase().includes('jelcz');
    const isArticulated = Number(bus.length) >= 17.5 || (bus.model || '').includes('18') || (bus.model || '').includes('NG313');
    const isMidi = Number(bus.length) <= 10.5;
    const isElectric = bus.propulsion === 'elektryczny';
    const isHybrid = bus.propulsion === 'hybrydowy' || bus.propulsion === 'mild-hybrid';
    const isHydrogen = bus.propulsion === 'wodorowy';
    const isCNG = bus.propulsion === 'cng';

    const lineNum = opts.lineOverride || (bus.currentLine ? String(bus.currentLine) : (bus.lines && bus.lines[0] ? String(bus.lines[0]) : 'Zajezdnia'));
    const destText = (opts.destOverride || bus.currentDirection || (isWloclawek ? 'OSTROWSKA PĘTLA' : 'UNIWERSYTET')).toUpperCase();

    // Kolorystyka malowania miejskiego
    let bodyMain = isWloclawek ? '#facc15' : '#f8fafc';
    let bodyUpper = '#111827';
    let skirtColor = isWloclawek ? '#eab308' : '#e2e8f0';
    let accentOne = '#ef4444';
    let accentTwo = '#10b981';
    let accentThree = '#3b82f6';

    if (!isWloclawek && bus.year < 2017 && !isHistorical) {
      // Klasyczne malowanie toruńskie żółto-czerwono-niebieskie dla starszych wozów
      bodyMain = '#facc15';
      skirtColor = '#dc2626';
    }
    if (isHistorical) {
      bodyMain = '#f8fafc';
      skirtColor = '#dc2626';
      bodyUpper = '#991b1b';
    }

    const plateBg = (isElectric || isHydrogen) ? '#bbf7d0' : '#ffffff';
    const plateText = (isElectric || isHydrogen) ? '#065f46' : '#0f172a';
    const busWidth = isArticulated ? 376 : (isMidi ? 286 : 330);
    const startX = Math.round((400 - busWidth) / 2);
    const endX = startX + busWidth;

    // Zabudowa dachowa (baterie, CNG, hybryda, wodór)
    let roofPods = '';
    if (isElectric) {
      roofPods = `
        <rect x="${startX + 24}" y="44" width="${Math.round(busWidth * 0.4)}" height="10" rx="5" fill="#dbe3ee" stroke="#64748b" stroke-width="1.2"/>
        <!-- Pantograf -->
        <path d="M${startX + 66} 44 L${startX + 78} 37 L${startX + 90} 44" stroke="#7dd3fc" stroke-width="2" fill="none" stroke-linejoin="round"/>
        <line x1="${startX + 71}" y1="37" x2="${startX + 85}" y2="37" stroke="#fbbf24" stroke-width="2.6" stroke-linecap="round"/>
      `;
    } else if (isHybrid) {
      roofPods = `
        <rect x="${startX + 34}" y="44" width="${Math.round(busWidth * 0.34)}" height="10" rx="5" fill="#475569" stroke="#64748b" stroke-width="1.2"/>
        <text x="${startX + 34 + Math.round(busWidth * 0.17)}" y="52" font-family="Inter, sans-serif" font-weight="800" font-size="6.5" fill="#cbd5e1" text-anchor="middle">HYBRYDA</text>
      `;
    } else if (isCNG || isHydrogen) {
      roofPods = `
        <rect x="${startX + 34}" y="42" width="${Math.round(busWidth * 0.52)}" height="12" rx="6" fill="#cbd5e1" stroke="#475569" stroke-width="1.4"/>
        <text x="${startX + 34 + Math.round(busWidth * 0.26)}" y="51" font-family="Inter, sans-serif" font-weight="800" font-size="6.5" fill="#0f172a" text-anchor="middle">${isHydrogen ? 'H₂' : 'CNG'}</text>
      `;
    }

    // Przegub dla 18-metrowców
    const bellowsX = startX + Math.round(busWidth * 0.53);
    const bellowsSVG = isArticulated ? `
      <rect x="${bellowsX}" y="55" width="22" height="84" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <line x1="${bellowsX + 5}" y1="56" x2="${bellowsX + 5}" y2="138" stroke="#475569" stroke-width="1.5"/>
      <line x1="${bellowsX + 11}" y1="56" x2="${bellowsX + 11}" y2="138" stroke="#475569" stroke-width="1.5"/>
      <line x1="${bellowsX + 17}" y1="56" x2="${bellowsX + 17}" y2="138" stroke="#475569" stroke-width="1.5"/>
    ` : '';

    // Koła
    const wheel1X = startX + 54;
    const wheel2X = isArticulated ? (bellowsX - 28) : (endX - 58);
    const wheel3X = isArticulated ? (endX - 52) : null;

    // Pasy malowania
    const liveryOverlay = isWloclawek ? `
      <!-- Strzałka MPK Włocławek -->
      <path d="M${startX + 12} 118 L${startX + 26} 110 L${startX + 26} 114 L${endX - 90} 114 L${endX - 102} 122 L${startX + 26} 122 L${startX + 26} 126 Z" fill="${accentOne}"/>
      <path d="M${endX - 98} 122 L${endX - 84} 108 L${endX - 68} 108 L${endX - 82} 122 Z" fill="${accentTwo}"/>
      <path d="M${endX - 80} 122 L${endX - 66} 108 L${endX - 50} 108 L${endX - 64} 122 Z" fill="${accentThree}"/>
    ` : (isHistorical ? `
      <rect x="${startX + 4}" y="106" width="${busWidth - 8}" height="32" rx="4" fill="#dc2626"/>
    ` : `
      <!-- Pasy MZK Toruń -->
      <rect x="${startX + 8}" y="128" width="${busWidth - 16}" height="5" fill="#0284c7" opacity="0.85"/>
      ${isElectric ? `<text x="${startX + 82}" y="68" font-family="Inter, sans-serif" font-weight="800" font-size="8.5" fill="#4ade80">Eko-Toruń • Jestem Elektryczny</text>` : ''}
    `);

    // Jamnik Solarisa lub Lew MAN-a
    const mascotBadge = (bus.brand || '').toLowerCase().includes('solaris') ? `
      <g transform="translate(${endX - 52}, 106)" opacity="0.95">
        <path d="M2 9 Q2 5 6 5 H16 Q20 5 21 8 L27 8 L27 11 L22 11 Q21 14 16 14 H6 Q2 14 2 9 Z" fill="#16a34a"/>
        <path d="M21 8 L26 5 L27 11 Z" fill="#15803d"/>
        <circle cx="25" cy="7.6" r="0.7" fill="#ffffff"/>
        <rect x="6" y="13" width="2" height="4" rx="1" fill="#15803d"/>
        <rect x="15" y="13" width="2" height="4" rx="1" fill="#15803d"/>
      </g>
    ` : ((bus.brand || '').toLowerCase().includes('man') ? `
      <g transform="translate(${endX - 46}, 104)">
        <rect x="0" y="0" width="27" height="13" rx="3" fill="${isWloclawek ? '#0f172a' : 'none'}" stroke="${isWloclawek ? 'none' : '#334155'}" stroke-width="1.1"/>
        <text x="13.5" y="9.6" font-family="Inter, sans-serif" font-weight="900" font-size="7.5" fill="${isWloclawek ? '#e2e8f0' : '#0f172a'}" text-anchor="middle" letter-spacing=".4">MAN</text>
      </g>
    ` : '');

    return `
      <svg viewBox="0 0 400 185" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="bus-schematic-svg" role="img" aria-label="${bus.brand} ${bus.model} #${bus.fleetNumber}">
        <defs>
          <linearGradient id="skyGrad-${bus.id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#090f1d"/>
            <stop offset="100%" stop-color="#131f38"/>
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#090d16"/>
          </linearGradient>
        </defs>

        <!-- Tło z tablicą LED u góry -->
        <rect width="400" height="185" rx="14" fill="url(#skyGrad-${bus.id})"/>

        <!-- Górny wyświetlacz kierunkowy LED PIXEL -->
        <rect x="14" y="8" width="256" height="24" rx="6" fill="#050811" stroke="#334155" stroke-width="1.5"/>
        <rect x="18" y="11" width="42" height="18" rx="3" fill="#f59e0b" fill-opacity="0.18" stroke="#f59e0b" stroke-width="1"/>
        <text x="39" y="24" font-family="JetBrains Mono, monospace" font-weight="900" font-size="12.5" fill="#fbbf24" text-anchor="middle">${lineNum}</text>
        <text x="68" y="23.5" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10.5" fill="#fbbf24" letter-spacing="0.6">${destText.slice(0, 22)}</text>

        <!-- Tablica rejestracyjna + nr taborowy w rogu -->
        <rect x="280" y="9" width="106" height="22" rx="4" fill="${plateBg}" stroke="#475569" stroke-width="1.5"/>
        <rect x="280" y="9" width="14" height="22" rx="2" fill="#1d4ed8"/>
        <text x="287" y="24" font-family="Inter, sans-serif" font-weight="800" font-size="7" fill="#ffffff" text-anchor="middle">PL</text>
        <text x="339" y="24" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10.5" fill="${plateText}" text-anchor="middle" letter-spacing="0.5">${bus.registration || (isWloclawek ? 'CW ' : 'CT ') + bus.fleetNumber}</text>

        <!-- Jezdnia -->
        <line x1="10" y1="158" x2="390" y2="158" stroke="#334155" stroke-width="2"/>
        <line x1="20" y1="168" x2="380" y2="168" stroke="#475569" stroke-width="1.5" stroke-dasharray="14 10"/>

        ${roofPods}

        <!-- Nadwozie główne -->
        <rect x="${startX}" y="54" width="${busWidth}" height="88" rx="14" fill="${bodyMain}" stroke="#0f172a" stroke-width="2"/>
        <!-- Pas nadokienny i linia okien -->
        <path d="M${startX + 2} 66 Q${startX + 2} 55 ${startX + 16} 55 H${endX - 16} Q${endX - 2} 55 ${endX - 2} 66 V103 H${startX + 2} Z" fill="${bodyUpper}"/>

        <!-- Okna pasażerskie i drzwi -->
        <rect x="${startX + 10}" y="68" width="${busWidth - 22}" height="32" rx="5" fill="url(#glassGrad)" stroke="#334155" stroke-width="1"/>
        <!-- Słupki okienne i drzwi -->
        <line x1="${startX + 48}" y1="68" x2="${startX + 48}" y2="136" stroke="#0f172a" stroke-width="3"/>
        <line x1="${startX + Math.round(busWidth * 0.42)}" y1="68" x2="${startX + Math.round(busWidth * 0.42)}" y2="136" stroke="#0f172a" stroke-width="3"/>
        <line x1="${startX + Math.round(busWidth * 0.48)}" y1="68" x2="${startX + Math.round(busWidth * 0.48)}" y2="136" stroke="#0f172a" stroke-width="3"/>
        <line x1="${endX - 38}" y1="68" x2="${endX - 38}" y2="136" stroke="#0f172a" stroke-width="3"/>

        ${liveryOverlay}
        ${bellowsSVG}

        <!-- Numer taborowy na burcie i przodzie -->
        <rect x="${startX + 14}" y="105" width="38" height="16" rx="4" fill="#0f172a" fill-opacity="0.88"/>
        <text x="${startX + 33}" y="117" font-family="JetBrains Mono, monospace" font-weight="900" font-size="11.5" fill="#fbbf24" text-anchor="middle">#${bus.fleetNumber}</text>

        <!-- Piktogramy dostępności (wózek, wózek dziecięcy, WiFi/USB) -->
        <circle cx="${startX + 62}" cy="113" r="5" fill="#1d4ed8"/>
        <circle cx="${startX + 74}" cy="113" r="5" fill="#1d4ed8"/>
        ${bus.airConditioning ? `<circle cx="${startX + 86}" cy="113" r="5" fill="#0284c7"/>` : ''}

        ${mascotBadge}

        <!-- Reflektory przednie i tylne -->
        <rect x="${endX - 6}" y="122" width="6" height="12" rx="2" fill="#fef08a"/>
        <rect x="${startX}" y="118" width="5" height="14" rx="2" fill="#ef4444"/>

        <!-- Koła -->
        <g>
          <circle cx="${wheel1X}" cy="144" r="15" fill="#0f172a" stroke="#475569" stroke-width="2"/>
          <circle cx="${wheel1X}" cy="144" r="7.5" fill="#cbd5e1"/>
          <circle cx="${wheel1X}" cy="144" r="3" fill="#334155"/>
        </g>
        <g>
          <circle cx="${wheel2X}" cy="144" r="15" fill="#0f172a" stroke="#475569" stroke-width="2"/>
          <circle cx="${wheel2X}" cy="144" r="7.5" fill="#cbd5e1"/>
          <circle cx="${wheel2X}" cy="144" r="3" fill="#334155"/>
        </g>
        ${wheel3X ? `
        <g>
          <circle cx="${wheel3X}" cy="144" r="15" fill="#0f172a" stroke="#475569" stroke-width="2"/>
          <circle cx="${wheel3X}" cy="144" r="7.5" fill="#cbd5e1"/>
          <circle cx="${wheel3X}" cy="144" r="3" fill="#334155"/>
        </g>` : ''}

        <!-- Dolny pasek informacyjny na schemacie -->
        <text x="14" y="179" font-family="Inter, sans-serif" font-weight="700" font-size="9.5" fill="#94a3b8">${bus.brand} ${bus.model} (${bus.year}) • ${bus.length}m</text>
        <text x="386" y="179" font-family="Inter, sans-serif" font-weight="800" font-size="9.5" fill="${isWloclawek ? '#fbbf24' : '#38bdf8'}" text-anchor="end">${isWloclawek ? 'MPK Włocławek' : 'MZK Toruń'}</text>
      </svg>
    `;
  }
};
