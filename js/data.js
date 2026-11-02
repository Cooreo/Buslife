/* =====================================================================
   BusLife Kujawy — baza danych taboru i linii
   Włocławek (MPK) + Toruń (MZK)
   Opracowano na podstawie źródeł publicznych (stan: listopad 2026).
   Numery w seriach mogą się różnić — aplikacja pozwala edytować i dodawać.
   ===================================================================== */

(function () {
  'use strict';

  const SOURCES = [
    { id: 'wp-wlo', label: 'Wikipedia — MPK Włocławek', url: 'https://pl.wikipedia.org/wiki/Miejskie_Przedsiębiorstwo_Komunikacyjne_we_W%C5%82oc%C5%82awku' },
    { id: 'wp-tor', label: 'Wikipedia — Autobusy miejskie w Toruniu', url: 'https://pl.wikipedia.org/wiki/Autobusy_w_Toruniu' },
    { id: 'phototrans-tor', label: 'Phototrans.pl — MZK Toruń, wykaz taboru', url: 'https://phototrans.pl/24,82,0,Miejski_Zak__ad_Komunikacji_w_Toruniu_sp__z_o_o_.html' },
    { id: 'transinfo-wlo', label: 'TransInfo — dostawy taboru MPK Włocławek', url: 'https://transinfo.pl/infobus/mpk-wloclawek-z-14-nowymi-lions-city-12-e-elektryczna-flota-rosnie-do-38-autobusow/' },
    { id: 'rozklad-wlo', label: 'MPK Włocławek — rozkłady jazdy', url: 'https://rozklad.mpk.com.pl/' },
    { id: 'mzk-tor', label: 'MZK Toruń — strona przewoźnika', url: 'https://mzk-torun.pl/' },
    { id: 'twoje-tor', label: 'Twoje Miasto — rozkłady MZK Toruń', url: 'https://torun.twoje-miasto.pl/rozklady' },
    { id: 'twoje-wlo', label: 'Twoje Miasto — rozkłady MPK Włocławek', url: 'https://wloclawek.twoje-miasto.pl/rozklady' },
    { id: 'nwlo', label: 'nwloclawek.pl — wykaz tras MPK Włocławek', url: 'https://nwloclawek.pl/artykul/rozklad-jazdy-mpk-wloclawek/897860' }
  ];

  const PHOTO_CREDITS = [
    { id: 'transinfo', label: 'TransInfo.pl (zdjęcie redakcyjne / przewoźnika)', url: 'https://transinfo.pl/' },
    { id: 'nowosci', label: 'Nowości / Express Bydgoski', url: 'https://nowosci.com.pl/' },
    { id: 'flog', label: 'flog.pl — fot. tomi2', url: 'https://flog.pl/tag/mzk-torun' }
  ];

  const CITIES = {
    wloclawek: {
      id: 'wloclawek',
      name: 'Włocławek',
      carrierId: 'mpk-wloclawek',
      carrier: 'MPK Włocławek',
      operatorFull: 'Miejskie Przedsiębiorstwo Komunikacyjne we Włocławku sp. z o.o.',
      region: 'Kujawsko-Pomorskie',
      population: 104000,
      lat: 52.6483,
      lng: 19.0678,
      color: '#fbbf24',
      accent: '#f59e0b',
      tagline: 'Żółte Solarisy i elektryczne lwy MAN',
      description: 'Ponad 70 autobusów, w większości zeroemisyjnych. Charakterystyczne żółte malowanie z tęczową strzałką MPK i motywem jamnika Solarisa.',
      depot: 'Zajezdnia MPK, ul. Rysia',
      website: 'https://www.mpk.com.pl/',
      timetable: 'https://rozklad.mpk.com.pl/',
      ticketInfo: 'Bilet jednorazowy miejski 4,60 zł / ulgowy 2,30 zł. Bilety okresowe w aplikacji i u kierowcy.',
      fare: { single: 4.6, reduced: 2.3, currency: 'zł' },
      heroPhoto: 'assets/photos/wloclawek-solaris-u18e-023.jpg',
      facts: [
        'Pierwsze autobusy elektryczne: Solaris Urbino 12 electric (2019)',
        'Od 2026 roku dwa przegubowe Solarisy Urbino 18 electric',
        'Elektryczna flota przekroczyła 50% taboru w 2026 r.'
      ]
    },
    torun: {
      id: 'torun',
      name: 'Toruń',
      carrierId: 'mzk-torun',
      carrier: 'MZK Toruń',
      operatorFull: 'Miejski Zakład Komunikacji w Toruniu sp. z o.o.',
      region: 'Kujawsko-Pomorskie',
      population: 195000,
      lat: 53.0138,
      lng: 18.5981,
      color: '#38bdf8',
      accent: '#0ea5e9',
      tagline: 'Eko-Toruń: białe Urbino i hybrydowe Lwy',
      description: 'Największy przewoźnik w regionie: ponad 250 autobusów, 40 elektrycznych Solarisów Urbino 12 electric i 14 hybrydowych MAN-ów. Białe malowanie z herbem Torunia i zielonym jamnikiem.',
      depot: 'Zajezdnia MZK, ul. Legionów 220',
      website: 'https://mzk-torun.pl/',
      timetable: 'https://mzk-torun.pl/rozklady-jazdy/',
      ticketInfo: 'Bilet jednorazowy 4,80 zł / ulgowy 2,40 zł. W pojazdach automaty biletowe i płatność zbliżeniowa.',
      fare: { single: 4.8, reduced: 2.4, currency: 'zł' },
      heroPhoto: 'assets/photos/torun-solaris-u12e-671.jpg',
      facts: [
        '40 elektrobusów Solaris Urbino 12 electric zamówionych w 2025 r.',
        '14 hybrydowych MAN-ów Lion\'s City Hybrid z 2018 r.',
        'Zabytkowy Jelcz 120MM/1 #413 z 1994 r. wciąż wyjeżdża na miasto'
      ]
    }
  };

  const CARRIERS = [
    {
      id: 'mpk-wloclawek', city: 'wloclawek', name: 'MPK Włocławek',
      fullName: 'Miejskie Przedsiębiorstwo Komunikacyjne we Włocławku sp. z o.o.',
      address: 'ul. Rysia 1, 87-800 Włocławek', phone: '+48 54 234 11 11',
      email: 'sekretariat@mpk.com.pl', website: 'https://www.mpk.com.pl/',
      fleetSize: 75, lines: 19, founded: 1951
    },
    {
      id: 'mzk-torun', city: 'torun', name: 'MZK Toruń',
      fullName: 'Miejski Zakład Komunikacji w Toruniu sp. z o.o.',
      address: 'ul. Legionów 220, 87-100 Toruń', phone: '+48 56 622 85 65',
      email: 'mzk@mzk-torun.pl', website: 'https://mzk-torun.pl/',
      fleetSize: 258, lines: 40, founded: 1950
    }
  ];

  /* ----------------------------- LINIE ----------------------------- */

  const LINES = {
    wloclawek: [
      {
        n: '1', type: 'miejska', from: 'Grodzka (pętla)', to: 'Wiejska (pętla)', runtime: 23,
        via: 'Grodzka – Plac Kopernika – Plac Wolności – Kapitulna – Gajowa',
        stops: ['Grodzka (pętla)', 'Grodzka (Malwowa)', 'Grodzka (Storczykowa)', 'Grodzka (Figowa)', 'Grodzka (Bursztynowa)', 'Grodzka (Wrzos-działk) n/ż', 'Grodzka (Plażowa)', 'Grodzka (Mostowa)', 'Plac Kopernika', 'Plac Wolności (SDH)', 'Okrzei (PKO BP)', 'Kapitulna (Wysoka)', 'Kapitulna (Borowska)', 'Kapitulna-Jastrzębia', 'Gajowa', 'Wiejska (pętla)'],
        freq: {
          weekday: { first: '05:00', last: '22:40', peak: '30 min', offPeak: '30 min', evening: '60 min' },
          saturday: { first: '05:10', last: '22:59', peak: '30 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '05:10', last: '22:59', peak: '30 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Linia obsługuje plażę nad Wisłą i osiedle Grodzka.'
      },
      {
        n: '3', type: 'miejska', from: 'Ostrowska (pętla)', to: 'Anwil (pętla)', runtime: 44,
        via: 'Ostrowska – Cmentarna – Plac Wolności – Toruńska – Anwil',
        stops: ['Ostrowska (pętla)', 'Wojskowa', 'Ptasia', 'Kolanowszczyzna', 'Stadion OSiR', 'Cmentarna', 'Basen Delfin', 'Nowomiejska', 'Św. Antoniego', 'Kościuszki', 'Centrum Przesiadkowe Dworzec PKP', 'Toruńska (WCK)', 'Toruńska (ZSE)', 'Toruńska (pawilon)', 'Anwil (I)', 'Anwil (pętla)'],
        freq: {
          weekday: { first: '05:18', last: '23:10', peak: '20–30 min', offPeak: '45 min', evening: '60–90 min' },
          saturday: { first: '06:05', last: '23:10', peak: '60 min', offPeak: '90 min', evening: '120 min' },
          sunday: { first: '06:05', last: '23:10', peak: '60 min', offPeak: '90 min', evening: '120 min' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Dojazd do zakładów Anwil; warianty 3A / 3S (szkolny).'
      },
      {
        n: '4', type: 'miejska', from: 'Płocka (Łęg)', to: 'Promienna (pętla)', runtime: 27,
        via: 'Łęgska – Plac Wolności – Kapitulna – Wysoka – Budowlanych',
        stops: ['Łęg', 'Graniczna n/ż', 'Port Rzeczny n/ż', 'Zakład Ubezpieczeń Społecznych', 'Duninowska', 'Geberit', 'WORD', 'Teligi', 'Celulozowa', 'Okrężna', 'Łęgska', 'Młynarska', 'Plac Wolności (Kościuszki)', 'Okrzei (PKO BP)', 'Urząd Pracy', 'Wysoka (Szpitalna)', 'Budowlanych (Hutnicza)', 'Promienna (pętla)'],
        freq: {
          weekday: { first: '05:45', last: '22:20', peak: '30 min', offPeak: '45 min', evening: '60 min' },
          saturday: { first: '06:00', last: '22:10', peak: '60 min', offPeak: '60 min', evening: '90 min' },
          sunday: { first: '06:00', last: '22:10', peak: '60 min', offPeak: '90 min', evening: '90 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '5', type: 'miejska', from: 'Wiejska (pętla)', to: 'Ostrowska (pętla)', runtime: 31,
        via: 'Kryniczna – Kaliska – Dworzec PKP – Centrum Onkologii – Browar B',
        stops: ['Wiejska (pętla)', 'Kryniczna n/ż', 'Fredry', 'Falbanka', 'Zbiegniewskiej', 'Dziewińska', 'Kaliska-Targowisko', 'Węglowa', 'Chłodna', 'Centrum Przesiadkowe Dworzec PKP', 'Polskiej Organizacji Wojskowej', 'Warszawska', 'Centrum Fajansu', 'Centrum Onkologii', 'Zespół Szkół Chemicznych', 'Bednarska', 'Centrum Kultury Browar B', 'Stodólna', 'Zagajewskiego', 'Polna', 'Barska', 'Drumet', 'Żytnia', 'Ostrowska (pętla)'],
        freq: {
          weekday: { first: '05:10', last: '22:45', peak: '20 min', offPeak: '30 min', evening: '60 min' },
          saturday: { first: '05:30', last: '22:30', peak: '40 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '05:30', last: '22:30', peak: '40 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: false,
        note: 'Najważniejsza linia przesiadkowa przez Centrum Przesiadkowe.'
      },
      {
        n: '8', type: 'podmiejska', from: 'Modzerowo (pętla)', to: '— (uzupełnij)', runtime: 30,
        via: 'gmina Włocławek: Modzerowo', stops: ['Modzerowo-st.pętla', 'Modzerowo', 'Modzerowo (biblioteka)', 'Modzerowo n/ż', 'Modzerowo-n.pętla'],
        freq: {
          weekday: { first: '05:40', last: '21:10', peak: '60 min', offPeak: '120 min', evening: '—' },
          saturday: { first: '07:00', last: '19:00', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true,
        note: 'Linia podmiejska do gminy Włocławek — trasa miejska do uzupełnienia.'
      },
      {
        n: '11', type: 'podmiejska', from: 'Wieniec Zdrój (Brzozowa)', to: 'Dębowa (pętla)', runtime: 38,
        via: 'Wieniecka – Kapitulna – Plac Wolności – Kaliska – Al. Jana Pawła II',
        stops: ['Wieniec Zdrój (Brzozowa)', 'Wieniecka (pętla)', 'Obwodowa (Wieniecka)', 'Kapitulna (Długa)', 'Okrzei (dworzec PKP PKS)', 'Wronia (Wolność)', 'Planty (Mazowiecka)', 'Kaliska (Fredry)', 'Al. Jana Pawła II (Smocza)', 'Letnia', 'Mielęcińska (Łabędzia)', 'Al. Jana Pawła II (Wiązowa)', 'Dębowa (pętla)'],
        freq: {
          weekday: { first: '05:20', last: '22:10', peak: '40 min', offPeak: '60 min', evening: '90 min' },
          saturday: { first: '06:20', last: '21:10', peak: '60 min', offPeak: '90 min', evening: '—' },
          sunday: { first: '07:20', last: '21:10', peak: '120 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false,
        note: 'Dojazd do uzdrowiska Wieniec-Zdrój (gmina Brześć Kujawski).'
      },
      {
        n: '12', type: 'miejska', from: 'Wieniecka (pętla)', to: 'Ostrowska (pętla)', runtime: 26,
        via: 'Wieniecka – Plac Kopernika – Plac Wolności – Cmentarna – Ostrowska',
        stops: ['Wieniecka (pętla)', 'Wyszyńskiego', 'Plac Kopernika', 'Plac Wolności (SDH)', 'Al. Chopina (Witosa)', 'Cmentarna', 'Al. Chopina (cmentarz)', 'Al. K. Wielkiego (rondo)', 'Ostrowska (pętla)'],
        freq: {
          weekday: { first: '05:30', last: '22:30', peak: '30 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '06:30', last: '22:00', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '07:30', last: '22:00', peak: '60 min', offPeak: '90 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '13', type: 'podmiejska', from: 'Świętosław (pętla)', to: 'Promienna (pętla)', runtime: 42,
        via: 'Kruszyn – Nowa Wieś – Dębowa – Kaliska – Kapitulna – Budowlanych',
        stops: ['Świętosław (pętla)', 'Kruszynek', 'Kruszyn', 'Murzynowo', 'Nowa Wieś (Diamentowa)', 'Nowa Wieś (PRD)', 'Nowa Wieś (lotnisko) n/ż', 'Dębowa (pętla)', 'Al. Jana Pawła II', 'Kaliska', 'Planty', 'Wronia', 'Al. Chopina (Chmielna)', 'Okrzei', 'Wieniecka', 'Budowlanych', 'Promienna (pętla)'],
        freq: {
          weekday: { first: '05:20', last: '21:46', peak: '60 min', offPeak: '60 min', evening: '90 min' },
          saturday: { first: '06:40', last: '20:40', peak: '90 min', offPeak: '120 min', evening: '—' },
          sunday: { first: '07:40', last: '20:40', peak: '120 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Warianty 13K (do Świętosławia) i W (Nowa Wieś – Instal Projekt).'
      },
      {
        n: '14', type: 'miejska', from: 'Rybnicka (pętla)', to: 'Wiejska (pętla)', runtime: 38,
        via: 'Przemysłowa – Ostrowska – Stodólna – Browar B – Centrum',
        stops: ['Rybnicka (pętla)', 'Kotlarska', 'Radyszyńska', 'Przemysłowa (pętla)', 'Pchli Targ', 'DGS', 'Łanowa', 'Ostrowska (pętla)', 'Żytnia', 'Drumet', 'Barska', 'Polna', 'Stodólna', 'Centrum Kultury Browar B', 'Zespół Szkół Chemicznych', 'Św. Antoniego', 'Polskiej Organizacji Wojskowej', 'Wronia-Wiadukt', 'Kruszyńska', 'Broniewskiego', 'Nowcy', 'Żurawia', 'Wyspiańskiego', 'Skłodowskiej-Curie', 'Wiejska (pętla)'],
        freq: {
          weekday: { first: '05:32', last: '23:01', peak: '30 min', offPeak: '30 min', evening: '60 min' },
          saturday: { first: '05:55', last: '22:23', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '05:55', last: '22:23', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Wariant 14S w okresie szkolnym przez Ogniowa / Bechiego.'
      },
      {
        n: '15', type: 'miejska', from: 'Ostrowska (pętla)', to: 'Wiejska (pętla)', runtime: 33,
        via: 'Cmentarna – Plac Wolności – Długa – Zbiegniewskiej – Gajowa',
        stops: ['Ostrowska (pętla)', 'Al. K. Wielkiego (Leśna)', 'Cmentarna', 'Al. Chopina (Chmielna)', 'Plac Wolności (Kościuszki)', 'Okrzei (PKO BP)', 'Długa', 'Wiejska (Planty)', 'Zbiegniewskiej (Wiejska)', 'Gajowa', 'Zgodna', 'Fredry (Kaliska)', 'Wiejska (pętla)'],
        freq: {
          weekday: { first: '05:57', last: '22:35', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '06:17', last: '22:32', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '06:17', last: '22:32', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Kursy oznaczone Z jadą przez Kryniczną i Fredry.'
      },
      {
        n: '16', type: 'miejska', from: 'Anwil (pętla)', to: 'Fredry (Kaliska)', runtime: 35,
        via: 'Toruńska – Dworzec PKP – Planty – Kaliska – Zbiegniewskiej',
        stops: ['Anwil (pętla)', 'Toruńska (MPWiK)', 'Toruńska (WCK)', 'Toruńska (ZSE)', 'Toruńska (pawilon)', 'Okrzei (Wieniecka)', 'Okrzei (dworzec PKP PKS)', 'Wronia (Wolność)', 'Planty (Mazowiecka)', 'Kaliska (Zbiegniewskiej)', 'Zbiegniewskiej (Wiejska)', 'Kapitulna (Jastrzębia)', 'Gajowa', 'Zgodna', 'Fredry (Kaliska)'],
        freq: {
          weekday: { first: '05:25', last: '22:15', peak: '30 min', offPeak: '45 min', evening: '60 min' },
          saturday: { first: '06:20', last: '21:15', peak: '60 min', offPeak: '90 min', evening: '—' },
          sunday: { first: '07:20', last: '21:15', peak: '90 min', offPeak: '120 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '17', type: 'miejska', from: 'Dębowa (pętla)', to: 'Promienna (pętla)', runtime: 34,
        via: 'Brzezinowa – Al. Jana Pawła II – Kaliska – Centrum – Budowlanych',
        stops: ['Dębowa (pętla)', 'Brzezinowa (Żbikowa)', 'Szkolna (szkoła)', 'Al. Jana Pawła II (Szkolna)', 'Mielęcińska (Skrajna)', 'Letnia (bloki)', 'Al. Jana Pawła II (Skrajna)', 'Kaliska (pętla)', 'Planty', 'Wronia (Rakutowska)', 'Al. Chopina (Chmielna)', 'Okrzei (Wyszyńskiego)', 'Wieniecka (Chemików)', 'Budowlanych (Hutnicza)', 'Promienna (pętla)'],
        freq: {
          weekday: { first: '05:19', last: '22:29', peak: '30 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '05:21', last: '22:29', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '05:21', last: '22:29', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: true
      },
      {
        n: '19', type: 'miejska', from: 'Rybnicka (pętla)', to: 'Promienna (pętla)', runtime: 34,
        via: 'Spokojna – Płocka – Stodólna – Centrum Przesiadkowe – Budowlanych',
        stops: ['Rybnicka (pętla)', 'Kotlarska', 'Radyszyńska', 'Spokojna', 'Zakład Ubezpieczeń Społecznych', 'Duninowska', 'Geberit', 'Papieżka', 'Myśliwska', 'Drumet', 'Barska', 'Polna', 'Stodólna', 'Zespół Szkół Chemicznych', 'Centrum Kultury Browar B', 'Młynarska', 'Bukowa', 'Kościuszki', 'Centrum Przesiadkowe Dworzec PKP', 'Urząd Pracy', 'KESEM', 'Budowlanych', 'Dworzec "Zazamcze"', 'Promienna (pętla)'],
        freq: {
          weekday: { first: '05:20', last: '22:30', peak: '40 min', offPeak: '60 min', evening: '90 min' },
          saturday: { first: '06:30', last: '21:30', peak: '90 min', offPeak: '120 min', evening: '—' },
          sunday: { first: '07:30', last: '21:30', peak: '120 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '20', type: 'podmiejska', from: 'Ostrowska (pętla)', to: 'Gąbinek (pętla)', runtime: 35,
        via: 'Łanowa – Polna – gmina Lubanie: Gąbinek',
        stops: ['Ostrowska (pętla)', 'Łanowa', 'Polna (Drumet)', 'Ogniowa (Z.S.Ch.)', 'Gąbinek (szkoła)', 'Gąbinek (sklep)', 'Gąbinek (pętla)'],
        freq: {
          weekday: { first: '05:45', last: '20:30', peak: '60 min', offPeak: '120 min', evening: '—' },
          saturday: { first: '07:30', last: '18:30', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false,
        note: 'Linia podmiejska do gminy Lubanie.'
      },
      {
        n: '21', type: 'miejska', from: 'Wiejska (pętla)', to: 'Promienna (pętla)', runtime: 20,
        via: 'Gajowa – Zbiegniewskiej – Kaliska – Węglowa – Budowlanych',
        stops: ['Wiejska (pętla)', 'Gajowa (Skłodowskiej)', 'Kapitulna (Wyspiańskiego)', 'Zbiegniewskiej (Żurawia)', 'Zbiegniewskiej (pawilon)', 'Kaliska (Zbiegniewskiej)', 'Kaliska (Dziewińska)', 'Kaliska (Dojazdowa)', 'Węglowa', 'Chłodna (Kapitulna)', 'Wysoka (Szpitalna)', 'Budowlanych (Hutnicza)', 'Promienna (Dworzec Zazamcze)', 'Promienna (pętla)'],
        freq: {
          weekday: { first: '05:00', last: '21:35', peak: '20 min', offPeak: '30 min', evening: '60 min' },
          saturday: { first: '05:30', last: '21:32', peak: '40 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '05:30', last: '21:32', peak: '40 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Linia w pełni elektryczna — tu debiutowały MAN-y Lion\'s City 12 E.'
      },
      {
        n: '23', type: 'miejska', from: '— (uzupełnij)', to: '— (uzupełnij)', runtime: null,
        via: 'Trasa do uzupełnienia przez społeczność',
        stops: [],
        freq: {
          weekday: { first: '05:00', last: '22:30', peak: '30 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '06:00', last: '22:00', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:00', last: '22:00', peak: '60 min', offPeak: '90 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true,
        note: 'Na tej linii testowano wodorowego Solarisa Urbino 18 hydrogen (2024).'
      }
    ],
    torun: [
      {
        n: '10', type: 'miejska', from: 'Forteczna', to: 'Szubińska', runtime: 38,
        via: 'Poznańska – Plac Armii Krajowej – Plac Rapackiego – Aleja Solidarności – Koniuchy',
        stops: ['Forteczna', 'Forteczna II n/ż', 'Strobranda', 'Grasera', 'Hubego', 'Freytaga', 'Wiśniowieckiego', 'Koniuchy', 'Osiedle Tysiąclecia', 'Lelewela', 'Dekerta', 'Legionów', 'Aleja Solidarności', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Hallera', 'Parkowa', 'Poznańska (komisariat)', 'Kluczyki', 'Kluczyki Cmentarz', 'Polmozbyt', 'Kręta', 'Stepowa', 'Gniewkowska', 'Bliska', 'Szubińska'],
        freq: {
          weekday: { first: '04:50', last: '23:05', peak: '12 min', offPeak: '20 min', evening: '30 min' },
          saturday: { first: '05:10', last: '22:50', peak: '20 min', offPeak: '30 min', evening: '40 min' },
          sunday: { first: '05:20', last: '22:40', peak: '30 min', offPeak: '40 min', evening: '40 min' }
        },
        lowFloor: true, night: false, verified: false,
        note: 'Jedna z najczęściej kursujących linii — obsługuje Bielany i Szubińską.'
      },
      {
        n: '11', type: 'miejska', from: 'Spacerowa', to: 'Koniuchy', runtime: 42,
        via: 'Czerniewice – Podgórz – Plac Św. Katarzyny – Plac Rapackiego – Koniuchy',
        stops: ['Spacerowa', 'Czerniewice', 'Czerniewice-Cmentarz', 'Podgórz', 'Plac Św. Katarzyny', 'Plac Rapackiego', 'Aleja Solidarności', 'Legionów', 'Koniuchy'],
        freq: {
          weekday: { first: '04:45', last: '23:10', peak: '10 min', offPeak: '20 min', evening: '30 min' },
          saturday: { first: '05:00', last: '23:00', peak: '20 min', offPeak: '20 min', evening: '40 min' },
          sunday: { first: '05:15', last: '22:50', peak: '20 min', offPeak: '30 min', evening: '40 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '12', type: 'miejska', from: 'Wrzosy I', to: 'Rudak', runtime: 40,
        via: 'Szosa Chełmińska – Plac Rapackiego – Plac Św. Katarzyny – Rudak',
        stops: ['Wrzosy I', 'Wrzosy II', 'Szosa Chełmińska', 'Plac Rapackiego', 'Plac Św. Katarzyny', 'Poznańska', 'Rudak'],
        freq: {
          weekday: { first: '04:50', last: '23:00', peak: '12 min', offPeak: '20 min', evening: '30 min' },
          saturday: { first: '05:10', last: '22:50', peak: '20 min', offPeak: '30 min', evening: '40 min' },
          sunday: { first: '05:20', last: '22:40', peak: '30 min', offPeak: '40 min', evening: '40 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '13', type: 'miejska', from: 'Gliniecka', to: 'Plac Św. Katarzyny', runtime: 26,
        via: 'Glinki – Szubińska – Plac Armii Krajowej – Dworzec Główny',
        stops: ['Gliniecka', 'Glinki', 'Szubińska', 'Poznańska', 'Plac Armii Krajowej', 'Plac Rapackiego', 'Dworzec Główny', 'Plac Św. Katarzyny'],
        freq: {
          weekday: { first: '05:00', last: '22:50', peak: '15 min', offPeak: '25 min', evening: '40 min' },
          saturday: { first: '05:20', last: '22:30', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          sunday: { first: '05:30', last: '22:20', peak: '30 min', offPeak: '40 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '14', type: 'miejska', from: 'Cmentarz Centralny', to: 'Okólna', runtime: 38,
        via: 'Mazowiecka – Dębowa Góra – Kozacka – Plac Rapackiego – Dworzec Główny – Kniaziewicza',
        stops: ['Cmentarz Centralny', 'Mazowiecka (pętla)', 'Mazowiecka', 'Fort IV n/ż', 'Kociewska', 'Kanałowa', 'Dębowa Góra', 'Batorego', 'Polna', 'Wielki Rów', 'Kozacka', 'Sczanieckiego', 'Kościuszki', 'Warneńczyka', 'Aleja Solidarności', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Dworzec Główny', 'Strzałowa', 'Plebiscytowa', 'Kniaziewicza', 'Brązowa', 'Okólna'],
        freq: {
          weekday: { first: '04:40', last: '23:00', peak: '12 min', offPeak: '20 min', evening: '30 min' },
          saturday: { first: '05:00', last: '22:40', peak: '20 min', offPeak: '30 min', evening: '40 min' },
          sunday: { first: '05:20', last: '22:30', peak: '30 min', offPeak: '40 min', evening: '40 min' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'Kursy oznaczone K wykonują wjazd przez Kociewską; z — zjazd do zajezdni.'
      },
      {
        n: '15', type: 'miejska', from: 'Rubinkowo II', to: 'Przy Lesie', runtime: 34,
        via: 'Rubinkowo – Dworzec Wschodni – Plac Rapackiego – Bielany',
        stops: ['Rubinkowo II', 'Rubinkowo', 'Dworzec Wschodni', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Przy Lesie'],
        freq: {
          weekday: { first: '04:50', last: '23:00', peak: '12 min', offPeak: '20 min', evening: '30 min' },
          saturday: { first: '05:10', last: '22:50', peak: '20 min', offPeak: '30 min', evening: '40 min' },
          sunday: { first: '05:20', last: '22:40', peak: '30 min', offPeak: '40 min', evening: '40 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '16', type: 'miejska', from: 'Olimpijska P&R', to: 'Wrzosy I', runtime: 32,
        via: 'Olimpijska – Plac Rapackiego – Szosa Chełmińska – Wrzosy',
        stops: ['Olimpijska P&R', 'Olimpijska', 'Plac Rapackiego', 'Szosa Chełmińska', 'Wrzosy I'],
        freq: {
          weekday: { first: '04:55', last: '22:50', peak: '15 min', offPeak: '25 min', evening: '30 min' },
          saturday: { first: '05:15', last: '22:30', peak: '20 min', offPeak: '30 min', evening: '40 min' },
          sunday: { first: '05:30', last: '22:20', peak: '30 min', offPeak: '40 min', evening: '40 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '17', type: 'miejska', from: 'Uniwersytet', to: 'Cmentarz Centralny', runtime: 22,
        via: 'Szosa Okrężna – Aula UMK – Plac Rapackiego – Dworzec Główny',
        stops: ['Uniwersytet', 'Szosa Okrężna', 'Aula UMK', 'Reja', 'Sztuki Piękne', 'Kraszewskiego', 'Dworzec Autobusowy', 'Sąd Rejonowy', 'Kościuszki', 'Warneńczyka', 'Plac Rapackiego', 'Dworzec Główny', 'Cmentarz Centralny'],
        freq: {
          weekday: { first: '05:00', last: '22:40', peak: '15 min', offPeak: '25 min', evening: '40 min' },
          saturday: { first: '05:30', last: '22:00', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          sunday: { first: '05:40', last: '21:50', peak: '30 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '18', type: 'miejska', from: 'Kolankowskiego', to: 'Uniwersytet', runtime: 28,
        via: 'Bielany – Plac Armii Krajowej – Szosa Okrężna',
        stops: ['Kolankowskiego', 'Bielany', 'Plac Armii Krajowej', 'Szosa Okrężna', 'Uniwersytet'],
        freq: {
          weekday: { first: '05:00', last: '22:40', peak: '15 min', offPeak: '25 min', evening: '40 min' },
          saturday: { first: '05:30', last: '22:10', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          sunday: { first: '05:40', last: '22:00', peak: '30 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '19', type: 'miejska', from: 'Czerniewice', to: 'Plac Św. Katarzyny', runtime: 30,
        via: 'Podgórz – Poznańska – Plac Rapackiego',
        stops: ['Czerniewice', 'Czerniewice-Cmentarz', 'Podgórz', 'Poznańska', 'Plac Św. Katarzyny'],
        freq: {
          weekday: { first: '05:10', last: '22:30', peak: '20 min', offPeak: '30 min', evening: '60 min' },
          saturday: { first: '05:40', last: '22:00', peak: '40 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:00', last: '21:40', peak: '60 min', offPeak: '60 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '20', type: 'miejska', from: 'Poznańska', to: 'Forteczna', runtime: 30,
        via: 'Glinki – Szubińska – Koniuchy – Strobanda',
        stops: ['Glinki', 'Poznańska', 'Poznańska-osiedle', 'Poznańska n/ż', 'Baza Transportu n/ż', 'Osiedle Leśny Zakątek n/ż', 'Szubińska', 'Bliska n/ż', 'Gniewkowska n/ż', 'Stepowa n/ż', 'Kręta', 'Polmozbyt n/ż', 'Kluczyki Cmentarz', 'Kluczyki n/ż', 'Poznańska (komisariat) n/ż', 'Parkowa', 'Hallera', 'Plac Armii Krajowej', 'Plac Rapackiego', 'Aleja Solidarności', 'Legionów', 'Dekerta', 'Lelewela', 'Osiedle Tysiąclecia', 'Koniuchy', 'Wiśniowieckiego', 'Freytaga', 'Hubego', 'Grasera', 'Strobanda', 'Forteczna II n/ż', 'Forteczna'],
        freq: {
          weekday: { first: '05:06', last: '22:51', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          saturday: { first: '06:00', last: '22:00', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:00', last: '22:00', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: true,
        note: 'F — kurs wydłużony do pętli Forteczna; K — kurs do Koniuch.'
      },
      {
        n: '21', type: 'miejska', from: 'Odrodzenia', to: 'Poznańska', runtime: 34,
        via: 'Rubinkowo – Plac Rapackiego – Plac Armii Krajowej – Glinki',
        stops: ['Odrodzenia', 'Rubinkowo', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Szubińska', 'Poznańska'],
        freq: {
          weekday: { first: '05:10', last: '22:20', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          saturday: { first: '06:00', last: '21:40', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:20', last: '21:20', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '22', type: 'miejska', from: 'Kolankowskiego', to: 'Dworzec Główny', runtime: 24,
        via: 'Bielany – Plac Armii Krajowej – Plac Rapackiego',
        stops: ['Kolankowskiego', 'Bielany', 'Plac Armii Krajowej', 'Plac Rapackiego', 'Dworzec Główny'],
        freq: {
          weekday: { first: '05:20', last: '22:00', peak: '30 min', offPeak: '45 min', evening: '60 min' },
          saturday: { first: '06:20', last: '21:20', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '07:00', last: '21:00', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '24', type: 'miejska', from: 'Dworzec Wschodni', to: 'Forteczna', runtime: 40,
        via: 'Rubinkowo – Plac Rapackiego – Koniuchy – Strobanda',
        stops: ['Dworzec Wschodni', 'Rubinkowo', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Koniuchy', 'Strobanda', 'Forteczna'],
        freq: {
          weekday: { first: '04:55', last: '22:50', peak: '15 min', offPeak: '25 min', evening: '40 min' },
          saturday: { first: '05:20', last: '22:20', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          sunday: { first: '05:30', last: '22:10', peak: '30 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '25', type: 'miejska', from: 'Uniwersytet', to: 'Kolankowskiego', runtime: 26,
        via: 'Szosa Okrężna – Plac Armii Krajowej – Bielany',
        stops: ['Uniwersytet', 'Szosa Okrężna', 'Aula UMK', 'Plac Armii Krajowej', 'Bielany', 'Kolankowskiego'],
        freq: {
          weekday: { first: '05:10', last: '22:20', peak: '20 min', offPeak: '30 min', evening: '50 min' },
          saturday: { first: '05:50', last: '21:50', peak: '40 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:10', last: '21:30', peak: '60 min', offPeak: '60 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '26', type: 'miejska', from: 'Rubinkowo P&R', to: 'Uniwersytet', runtime: 24,
        via: 'Dworzec Wschodni – Szosa Okrężna',
        stops: ['Rubinkowo P&R', 'Rubinkowo', 'Dworzec Wschodni', 'Szosa Okrężna', 'Uniwersytet'],
        freq: {
          weekday: { first: '05:00', last: '22:30', peak: '15 min', offPeak: '25 min', evening: '40 min' },
          saturday: { first: '05:40', last: '22:00', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          sunday: { first: '06:00', last: '21:40', peak: '40 min', offPeak: '60 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '27', type: 'miejska', from: 'Dworzec Główny', to: 'Osiedle Leśne – Polana', runtime: 28,
        via: 'Plac Rapackiego – Bielany – Osiedle Leśne',
        stops: ['Dworzec Główny', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Bielany', 'Osiedle Leśne', 'Polana'],
        freq: {
          weekday: { first: '05:10', last: '22:10', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          saturday: { first: '06:00', last: '21:30', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:30', last: '21:00', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '28', type: 'miejska', from: 'Mazowiecka (pętla)', to: 'Uniwersytet', runtime: 30,
        via: 'Dębowa Góra – Dworzec Autobusowy – Szosa Okrężna',
        stops: ['Mazowiecka (pętla)', 'Mazowiecka', 'Fort IV n/ż', 'Kociewska', 'Kanałowa', 'Dębowa Góra', 'Batorego n/ż', 'Polna', 'Wielki Rów', 'Kozacka', 'Sczanieckiego', 'Kościuszki', 'Sąd Rejonowy', 'Dworzec Autobusowy', 'Kraszewskiego', 'Sztuki Piękne', 'Reja', 'Aula UMK', 'Szosa Okrężna', 'Uniwersytet'],
        freq: {
          weekday: { first: '05:00', last: '22:30', peak: '20 min', offPeak: '30 min', evening: '50 min' },
          saturday: { first: '05:40', last: '22:00', peak: '40 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:00', last: '21:40', peak: '60 min', offPeak: '60 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '29', type: 'miejska', from: 'Kolankowskiego', to: 'Szubińska', runtime: 26,
        via: 'Bielany – Plac Armii Krajowej – Glinki',
        stops: ['Kolankowskiego', 'Bielany', 'Plac Armii Krajowej', 'Szubińska'],
        freq: {
          weekday: { first: '05:20', last: '22:00', peak: '30 min', offPeak: '45 min', evening: '60 min' },
          saturday: { first: '06:20', last: '21:20', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '07:00', last: '21:00', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '30', type: 'miejska', from: 'Nad Strugą', to: 'Plac Św. Katarzyny', runtime: 26,
        via: 'Podgórz – Poznańska – Plac Rapackiego',
        stops: ['Nad Strugą', 'Podgórz', 'Poznańska', 'Plac Św. Katarzyny'],
        freq: {
          weekday: { first: '05:20', last: '22:10', peak: '30 min', offPeak: '45 min', evening: '60 min' },
          saturday: { first: '06:00', last: '21:30', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:30', last: '21:00', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '31', type: 'miejska', from: 'Kolankowskiego', to: 'Barbarka', runtime: 32,
        via: 'Bielany – Szosa Chełmińska – Wrzosy – Barbarka',
        stops: ['Kolankowskiego', 'Bielany', 'Szosa Chełmińska', 'Wrzosy I', 'Barbarka'],
        freq: {
          weekday: { first: '05:20', last: '21:50', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          saturday: { first: '06:30', last: '21:00', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '07:00', last: '20:40', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false,
        note: 'W sezonie letnim dodatkowe kursy do Barbarki (las, plaża).'
      },
      {
        n: '32', type: 'miejska', from: 'Wrzosy I', to: 'Letnia', runtime: 24,
        via: 'Szosa Chełmińska – Plac Rapackiego – Jakubskie Przedmieście',
        stops: ['Wrzosy I', 'Szosa Chełmińska', 'Plac Rapackiego', 'Jakubskie Przedmieście', 'Letnia'],
        freq: {
          weekday: { first: '05:30', last: '21:40', peak: '40 min', offPeak: '60 min', evening: '—' },
          saturday: { first: '06:30', last: '20:40', peak: '60 min', offPeak: '—', evening: '—' },
          sunday: { first: '07:00', last: '20:40', peak: '90 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '33', type: 'miejska', from: 'Olimpijska P&R', to: 'Mazowiecka (pętla)', runtime: 34,
        via: 'Olimpijska – Plac Rapackiego – Dworzec Główny – Dębowa Góra',
        stops: ['Olimpijska P&R', 'Olimpijska', 'Plac Rapackiego', 'Dworzec Główny', 'Kozacka', 'Dębowa Góra', 'Mazowiecka (pętla)'],
        freq: {
          weekday: { first: '05:00', last: '22:20', peak: '20 min', offPeak: '30 min', evening: '50 min' },
          saturday: { first: '05:40', last: '21:50', peak: '40 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:10', last: '21:30', peak: '60 min', offPeak: '60 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '34', type: 'miejska', from: 'Olimpijska P&R', to: 'Plac Skalskiego', runtime: 32,
        via: 'Bielany – Szpital Bielany – Aula UMK – Plac Skalskiego',
        stops: ['Olimpijska P&R', 'Olimpijska', 'Żwirki i Wigury', 'Szpital Bielany', 'św. Józefa', 'Od Nowa', 'Akademiki', 'Aula UMK', 'Szosa Okrężna', 'Łukasiewicza', 'Plac Skalskiego'],
        freq: {
          weekday: { first: '05:00', last: '22:30', peak: '15 min', offPeak: '25 min', evening: '40 min' },
          saturday: { first: '05:40', last: '22:00', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          sunday: { first: '06:00', last: '21:40', peak: '40 min', offPeak: '60 min', evening: '—' }
        },
        lowFloor: true, night: false, verified: true
      },
      {
        n: '38', type: 'miejska', from: 'Plac Św. Katarzyny', to: 'Św. Antoniego', runtime: 18,
        via: 'Plac Rapackiego – Dworzec Główny – Jakubskie Przedmieście',
        stops: ['Plac Św. Katarzyny', 'Plac Rapackiego', 'Dworzec Główny', 'św. Antoniego'],
        freq: {
          weekday: { first: '06:00', last: '20:30', peak: '60 min', offPeak: '60 min', evening: '—' },
          saturday: { first: '07:00', last: '19:30', peak: '90 min', offPeak: '—', evening: '—' },
          sunday: { first: '08:00', last: '19:00', peak: '120 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '39', type: 'miejska', from: 'Nad Strugą', to: 'Dziewulskiego', runtime: 22,
        via: 'Podgórz – Plac Św. Katarzyny – Plac Rapackiego',
        stops: ['Nad Strugą', 'Podgórz', 'Plac Św. Katarzyny', 'Plac Rapackiego', 'Dziewulskiego'],
        freq: {
          weekday: { first: '05:40', last: '21:30', peak: '40 min', offPeak: '60 min', evening: '—' },
          saturday: { first: '06:40', last: '20:30', peak: '90 min', offPeak: '—', evening: '—' },
          sunday: { first: '07:30', last: '20:00', peak: '120 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '40', type: 'miejska', from: 'Bielawy', to: 'Port Drzewny', runtime: 36,
        via: 'Żwirki i Wigury – Szpital Bielany – Aula UMK – Plac Skalskiego',
        stops: ['Bielawy', 'Żwirki i Wigury', 'Szpital Bielany', 'św. Józefa', 'Od Nowa', 'Akademiki', 'Aula UMK', 'Szosa Okrężna', 'Łukasiewicza', 'Plac Skalskiego', 'Port Drzewny'],
        freq: {
          weekday: { first: '05:20', last: '22:00', peak: '30 min', offPeak: '40 min', evening: '60 min' },
          saturday: { first: '06:00', last: '21:20', peak: '60 min', offPeak: '60 min', evening: '—' },
          sunday: { first: '06:30', last: '20:50', peak: '60 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '41', type: 'miejska', from: 'Kołowa', to: 'Dworzec Wschodni', runtime: 28,
        via: 'Podgórz – Plac Św. Katarzyny – Plac Rapackiego',
        stops: ['Kołowa', 'Podgórz', 'Plac Św. Katarzyny', 'Plac Rapackiego', 'Dworzec Wschodni'],
        freq: {
          weekday: { first: '05:30', last: '21:50', peak: '40 min', offPeak: '60 min', evening: '—' },
          saturday: { first: '06:30', last: '20:40', peak: '60 min', offPeak: '—', evening: '—' },
          sunday: { first: '07:00', last: '20:20', peak: '90 min', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false
      },
      {
        n: '42', type: 'podmiejska', from: 'Toruń', to: 'gmina Obrowo', runtime: 45,
        via: 'Trasa podmiejska — kierunek Obrowo',
        stops: ['Dworzec Wschodni', 'Lubicz', 'Obrowo'],
        freq: {
          weekday: { first: '05:30', last: '20:30', peak: '60 min', offPeak: '90 min', evening: '—' },
          saturday: { first: '07:00', last: '19:00', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true
      },
      {
        n: '44', type: 'podmiejska', from: 'Toruń', to: 'gmina Łysomice', runtime: 40,
        via: 'Trasa podmiejska — kierunek Łysomice',
        stops: ['Dworzec Wschodni', 'Łysomice'],
        freq: {
          weekday: { first: '05:40', last: '20:00', peak: '60 min', offPeak: '120 min', evening: '—' },
          saturday: { first: '07:00', last: '18:00', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true
      },
      {
        n: '111', type: 'podmiejska', from: 'Toruń (Dworzec Wschodni)', to: 'gmina — do uzupełnienia', runtime: null,
        via: 'Linia podmiejska MZK — trasa do uzupełnienia przez społeczność',
        stops: ['Dworzec Wschodni'],
        freq: {
          weekday: { first: '05:30', last: '20:30', peak: '60 min', offPeak: '90 min', evening: '—' },
          saturday: { first: '07:00', last: '19:00', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true,
        note: 'Numer linii podmiejskiej MZK Toruń. Przebieg i przystanki do uzupełnienia.'
      },
      {
        n: '112', type: 'podmiejska', from: 'Toruń (Dworzec Wschodni)', to: 'gmina — do uzupełnienia', runtime: null,
        via: 'Linia podmiejska MZK — trasa do uzupełnienia przez społeczność',
        stops: ['Dworzec Wschodni'],
        freq: {
          weekday: { first: '05:40', last: '20:00', peak: '60 min', offPeak: '120 min', evening: '—' },
          saturday: { first: '07:30', last: '18:30', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true,
        note: 'Numer linii podmiejskiej MZK Toruń. Przebieg i przystanki do uzupełnienia.'
      },
      {
        n: '115', type: 'podmiejska', from: 'Toruń (Dworzec Wschodni)', to: 'gmina — do uzupełnienia', runtime: null,
        via: 'Linia podmiejska MZK — trasa do uzupełnienia przez społeczność',
        stops: ['Dworzec Wschodni'],
        freq: {
          weekday: { first: '05:50', last: '19:30', peak: '60 min', offPeak: '120 min', evening: '—' },
          saturday: { first: '08:00', last: '18:00', peak: '120 min', offPeak: '—', evening: '—' },
          sunday: { first: '—', last: '—', peak: '—', offPeak: '—', evening: '—' }
        },
        lowFloor: true, night: false, verified: false, incomplete: true,
        note: 'Numer linii podmiejskiej MZK Toruń. Przebieg i przystanki do uzupełnienia.'
      },
      {
        n: 'N91', type: 'nocna', from: 'Nad Strugą', to: 'Poznańska', runtime: 40,
        via: 'Plac Rapackiego – Plac Św. Katarzyny – Podgórz',
        stops: ['Nad Strugą', 'Plac Św. Katarzyny', 'Plac Rapackiego', 'Poznańska'],
        freq: {
          weekday: { first: '23:20', last: '04:30', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '23:20', last: '05:00', peak: '45 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '23:20', last: '04:30', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: true, verified: false
      },
      {
        n: 'N93', type: 'nocna', from: 'Spacerowa', to: 'Wrzosy I', runtime: 42,
        via: 'Czerniewice – Plac Rapackiego – Szosa Chełmińska',
        stops: ['Spacerowa', 'Czerniewice', 'Plac Św. Katarzyny', 'Plac Rapackiego', 'Szosa Chełmińska', 'Wrzosy I'],
        freq: {
          weekday: { first: '23:30', last: '04:40', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '23:30', last: '05:10', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '23:30', last: '04:40', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: true, verified: false
      },
      {
        n: 'N94', type: 'nocna', from: 'Rubinkowo II', to: 'Aleja Solidarności', runtime: 38,
        via: 'Dworzec Wschodni – Plac Rapackiego – Bielany',
        stops: ['Rubinkowo II', 'Dworzec Wschodni', 'Plac Rapackiego', 'Plac Armii Krajowej', 'Aleja Solidarności'],
        freq: {
          weekday: { first: '23:25', last: '04:35', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '23:25', last: '05:05', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '23:25', last: '04:35', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: true, verified: false
      },
      {
        n: 'N95', type: 'nocna', from: 'Nad Strugą', to: 'Motoarena', runtime: 44,
        via: 'Plac Św. Katarzyny – Plac Rapackiego – Olimpijska',
        stops: ['Nad Strugą', 'Plac Św. Katarzyny', 'Plac Rapackiego', 'Olimpijska', 'Motoarena'],
        freq: {
          weekday: { first: '23:35', last: '04:45', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          saturday: { first: '23:35', last: '05:15', peak: '60 min', offPeak: '60 min', evening: '60 min' },
          sunday: { first: '23:35', last: '04:45', peak: '60 min', offPeak: '60 min', evening: '60 min' }
        },
        lowFloor: true, night: true, verified: false
      }
    ]
  };

  /* ----------------------------- SERIE TABORU ----------------------------- */

  const SERIES = [
    /* ---------------- WŁOCŁAWEK ---------------- */
    {
      key: 'wlo-solaris-u10', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 10', gen: 'III',
      year: 2012, yearLabel: '2009–2016', prop: 'diesel', len: 10.0, seats: 26, standing: 54,
      numbers: '210,213-223', lowFloor: true, ac: true, wifi: false, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:50'], lines: ['1', '5', '12', '15', '19'],
      status: 'eksploatowany', source: 'wp-wlo', confidence: 'średnia',
      notes: 'Krótkie 10-metrowe Urbino — najliczniejsza grupa wozów na wąskich osiedlówkach.'
    },
    {
      key: 'wlo-solaris-u12-old', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 12', gen: 'II',
      year: 2005, yearLabel: '2004–2007', prop: 'diesel', len: 12.0, seats: 32, standing: 66,
      numbers: '517-520,530', lowFloor: true, ac: false, wifi: false, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:40'], lines: ['5', '14', '15', '16'],
      status: 'eksploatowany', source: 'wp-wlo', confidence: 'średnia',
      notes: 'Najstarsze wozy w taborze (20 lat). Miłośnicy komunikacji zabiegają o zachowanie #518.'
    },
    {
      key: 'wlo-solaris-u12-new', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 12', gen: 'IV',
      year: 2018, yearLabel: '2016–2020', prop: 'diesel', len: 12.0, seats: 34, standing: 66,
      numbers: '541-552', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:50', '23:00'], lines: ['3', '4', '5', '14', '17', '21'],
      status: 'eksploatowany', source: 'wp-wlo', confidence: 'średnia'
    },
    {
      key: 'wlo-solaris-u12h', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 12 Hybrid', gen: 'III',
      year: 2015, yearLabel: '2015', prop: 'hybrydowy', len: 12.0, seats: 33, standing: 65,
      numbers: '538-540', lowFloor: true, ac: true, wifi: false, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:30'], lines: ['4', '5', '15', '19'],
      status: 'eksploatowany', source: 'wp-wlo', confidence: 'wysoka',
      notes: 'Pierwsze hybrydy w MPK — napęd spalinowo-elektryczny z rekuperacją.'
    },
    {
      key: 'wlo-man-lions-city', city: 'wloclawek', brand: 'MAN', model: "Lion's City 12", gen: 'A37',
      year: 2018, yearLabel: '2018', prop: 'diesel', len: 12.0, seats: 35, standing: 65,
      numbers: '701-704', lowFloor: true, ac: true, wifi: false, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:30'], lines: ['3', '11', '14', '16'],
      status: 'eksploatowany', source: 'wp-wlo', confidence: 'wysoka',
      notes: 'Pierwsze MAN-y od 15 lat; wyparły ostatnie Jelcze.'
    },
    {
      key: 'wlo-solaris-u12e', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 12 electric', gen: 'IV',
      year: 2019, yearLabel: '2019, 2025–2026', prop: 'elektryczny', len: 12.0, seats: 32, standing: 60,
      numbers: '001-005,017-022', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:50'], lines: ['21', '5', '1', '23'],
      status: 'eksploatowany', source: 'wp-wlo', confidence: 'wysoka',
      seriesPhoto: 'assets/photos/wloclawek-solaris-u12e-001.jpg', photoBy: 'transinfo',
      notes: 'Pierwsze elektrobusy Włocławka (2019). Ładowanie pantografem na pętli.'
    },
    {
      key: 'wlo-man-lions-city-e', city: 'wloclawek', brand: 'MAN', model: "Lion's City 12 E", gen: 'A37',
      year: 2022, yearLabel: '2022–2023, 2026', prop: 'elektryczny', len: 12.0, seats: 33, standing: 62,
      numbers: '006-016,023-036', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:50', '23:10'], lines: ['21', '23', '3', '5', '17'],
      status: 'eksploatowany', source: 'transinfo-wlo', confidence: 'wysoka',
      photoBy: 'transinfo',
      photos: { '007': 'assets/photos/wloclawek-man-12e-007.jpg', '032': 'assets/photos/wloclawek-man-12e-032.jpg' },
      plates: { '007': 'CW 7517F' },
      notes: '25 elektrycznych Lwów. Dostawa 14 sztuk (023–036) w 2026 r. — największa w historii MPK.'
    },
    {
      key: 'wlo-solaris-u18e', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 18 electric', gen: 'IV',
      year: 2026, yearLabel: '2026', prop: 'elektryczny', len: 18.0, seats: 45, standing: 105,
      numbers: '601-602', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '23:00'], lines: ['3', '5', '14', '21'],
      status: 'eksploatowany', source: 'transinfo-wlo', confidence: 'wysoka',
      photoBy: 'transinfo',
      notes: 'Powrót przegubowców po 25 latach. Numery 601–602 nawiązują do historycznych oznaczeń.'
    },
    {
      key: 'wlo-hydrogen-test', city: 'wloclawek', brand: 'Solaris', model: 'Urbino 18 hydrogen', gen: 'IV',
      year: 2024, yearLabel: '2024 (test)', prop: 'wodorowy', len: 18.0, seats: 43, standing: 100,
      numbers: '360', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'okazjonalna', shift: ['13:00', '18:30'], lines: ['23'],
      status: 'testowy', source: 'wp-wlo', confidence: 'wysoka',
      seriesPhoto: 'assets/photos/wloclawek-solaris-h2-004.jpg', photoBy: 'transinfo',
      plates: { '360': 'PZ 4R665' },
      notes: 'Autobus wodorowy testowany na linii 23 we wrześniu 2024. Zasięg do 600 km.'
    },

    /* ---------------- TORUŃ ---------------- */
    {
      key: 'tor-solaris-u12-iii-2010', city: 'torun', brand: 'Solaris', model: 'Urbino 12', gen: 'III',
      year: 2010, yearLabel: '2010', prop: 'diesel', len: 12.0, seats: 32, standing: 66,
      numbers: '561-584', lowFloor: true, ac: false, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:40', '23:00'], lines: ['10', '11', '12', '13', '14', '20', '24'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'średnia',
      notes: 'Podstawowa flota MZK sprzed ery „Eko-Toruń”.'
    },
    {
      key: 'tor-solaris-u12-iii-2014', city: 'torun', brand: 'Solaris', model: 'Urbino 12', gen: 'III',
      year: 2014, yearLabel: '2014', prop: 'diesel', len: 12.0, seats: 32, standing: 66,
      numbers: '590-604', lowFloor: true, ac: true, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:40', '23:00'], lines: ['10', '11', '14', '15', '24', '26'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'średnia'
    },
    {
      key: 'tor-solaris-u12-iv-2018', city: 'torun', brand: 'Solaris', model: 'Urbino 12', gen: 'IV',
      year: 2018, yearLabel: '2018', prop: 'diesel', len: 12.0, seats: 33, standing: 67,
      numbers: '610-630', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:40', '23:10'], lines: ['10', '12', '15', '18', '24', '33'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Duża dostawa 35 autobusów (Solaris + MAN) z końca 2018 r.'
    },
    {
      key: 'tor-solaris-u12-w24', city: 'torun', brand: 'Solaris', model: 'Urbino 12 W24', gen: 'III',
      year: 2018, yearLabel: '2018 (używane)', prop: 'diesel', len: 12.0, seats: 33, standing: 65,
      numbers: '645-652', lowFloor: true, ac: true, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:40'], lines: ['13', '19', '25', '30', '39'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'średnia',
      notes: 'Sprowadzone używane wozy (ex-Niemcy), malowanie miejskie Torunia.'
    },
    {
      key: 'tor-solaris-u12-iv-2021', city: 'torun', brand: 'Solaris', model: 'Urbino 12', gen: 'IV',
      year: 2021, yearLabel: '2021', prop: 'diesel', len: 12.0, seats: 33, standing: 67,
      numbers: '653-670', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:40', '23:10'], lines: ['11', '14', '16', '24', '34', '40'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'średnia'
    },
    {
      key: 'tor-solaris-u12-2025', city: 'torun', brand: 'Solaris', model: 'Urbino 12', gen: 'IV',
      year: 2025, yearLabel: '2024–2025', prop: 'diesel', len: 12.0, seats: 33, standing: 67,
      numbers: '675-684,689-700', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:40', '23:10'], lines: ['10', '11', '12', '14', '15', '26'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'średnia',
      notes: 'Najnowsze diesle Solarisa w Toruniu (silnik Cummins ISB6.7E6 / DAF MX-11).'
    },
    {
      key: 'tor-solaris-u12-mh', city: 'torun', brand: 'Solaris', model: 'Urbino 12 mild hybrid', gen: 'IV',
      year: 2025, yearLabel: '2025', prop: 'mild-hybrid', len: 12.0, seats: 33, standing: 67,
      numbers: '685-688', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:50', '23:00'], lines: ['10', '14', '20', '24', '34', 'N91', 'N93'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      photoBy: 'transinfo',
      photos: {
        '685': 'assets/photos/torun-solaris-u12mh-685.webp',
        '686': 'assets/photos/torun-solaris-u12mh-685-686.jpg',
        '687': 'assets/photos/torun-solaris-u12mh-687-688.jpg'
      },
      notes: 'Miękkie hybrydy z 2025 r. — oszczędność paliwa ok. 10%, bez ładowania z gniazdka.'
    },
    {
      key: 'tor-solaris-u12-cng', city: 'torun', brand: 'Solaris', model: 'Urbino 12 CNG', gen: 'III',
      year: 2010, yearLabel: '2010', prop: 'cng', len: 12.0, seats: 31, standing: 64,
      numbers: '558-560', lowFloor: true, ac: false, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:30'], lines: ['12', '13', '20', '29'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Trzy wozy zasilane gazem ziemnym CNG, zbiorniki na dachu.'
    },
    {
      key: 'tor-solaris-u12h', city: 'torun', brand: 'Solaris', model: 'Urbino 12 Hybrid', gen: 'III',
      year: 2015, yearLabel: '2015', prop: 'hybrydowy', len: 12.0, seats: 32, standing: 64,
      numbers: '596', lowFloor: true, ac: true, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:30'], lines: ['16', '18', '25', '30'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka'
    },
    {
      key: 'tor-solaris-u18', city: 'torun', brand: 'Solaris', model: 'Urbino 18', gen: 'III',
      year: 2010, yearLabel: '2010', prop: 'diesel', len: 18.0, seats: 45, standing: 105,
      numbers: '557', lowFloor: true, ac: false, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'szczytowa', shift: ['06:00', '18:30'], lines: ['10', '11', '15', '24'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Jedyny przegubowiec Solarisa w Toruniu — wyjeżdża w szczytach.'
    },
    {
      key: 'tor-solaris-u86', city: 'torun', brand: 'Solaris', model: 'Urbino 8,6', gen: 'III',
      year: 2011, yearLabel: '2011', prop: 'diesel', len: 8.6, seats: 20, standing: 40,
      numbers: '572-576', lowFloor: true, ac: false, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:20', '21:40'], lines: ['31', '32', '38', '39', '41'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Krótkie Urbino do obsługi osiedli i linii o mniejszym popycie.'
    },
    {
      key: 'tor-interurbino', city: 'torun', brand: 'Solaris', model: 'InterUrbino 12', gen: 'III',
      year: 2020, yearLabel: '2020', prop: 'diesel', len: 12.0, seats: 45, standing: 40,
      numbers: '400', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:00'], lines: ['42', '44', '111', '112', '115'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Autobus podmiejski — układ siedzeń turystyczny, duży bagażnik.'
    },
    {
      key: 'tor-solaris-u12e-2022', city: 'torun', brand: 'Solaris', model: 'Urbino 12 electric', gen: 'IV',
      year: 2022, yearLabel: '2022', prop: 'elektryczny', len: 12.0, seats: 32, standing: 62,
      numbers: '661-674', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:50', '23:00'], lines: ['10', '12', '15', '24', '26', '34'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      photoBy: 'transinfo',
      photos: { '671': 'assets/photos/torun-solaris-u12e-671.jpg' },
      notes: 'Elektrobusy „Eko-Toruń” ładowane na pętlach. Ciche, z WiFi i USB.'
    },
    {
      key: 'tor-solaris-u12e-2025', city: 'torun', brand: 'Solaris', model: 'Urbino 12 electric', gen: 'IV',
      year: 2025, yearLabel: '2025–2026', prop: 'elektryczny', len: 12.0, seats: 32, standing: 62,
      numbers: '701-740', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:40', '23:15'], lines: ['11', '14', '16', '20', '33', '40', 'N91', 'N93', 'N94', 'N95'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      photoBy: 'flog',
      photos: { '712': 'assets/photos/torun-solaris-u12e-712.jpg' },
      notes: 'Zamówienie na 40 elektrobusów z 2025 r. — największa elektryczna dostawa w historii MZK.'
    },
    {
      key: 'tor-man-nl253h', city: 'torun', brand: 'MAN', model: "Lion's City NL253 Hybrid", gen: 'A37',
      year: 2018, yearLabel: '2018', prop: 'hybrydowy', len: 12.0, seats: 33, standing: 65,
      numbers: '631-644', lowFloor: true, ac: true, wifi: true, usb: true, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['04:50', '23:00'], lines: ['10', '14', '20', '24', '34'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      photoBy: 'flog',
      photos: { '643': 'assets/photos/torun-man-hybrid-643.jpg' },
      notes: '14 hybrydowych Lwów z 2018 r. — pierwsza duża dostawa MAN-a dla MZK.'
    },
    {
      key: 'tor-man-nl283', city: 'torun', brand: 'MAN', model: "Lion's City NL283", gen: 'A37',
      year: 2004, yearLabel: '2003–2004', prop: 'diesel', len: 12.0, seats: 32, standing: 66,
      numbers: '521-534', lowFloor: true, ac: false, wifi: false, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:30'], lines: ['13', '19', '25', '29', '30', '39'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'niska',
      notes: 'Starsze MAN-y — numery w serii mogą się różnić, uzupełnij dane.'
    },
    {
      key: 'tor-man-nl273', city: 'torun', brand: 'MAN', model: "Lion's City NL273", gen: 'A37',
      year: 2007, yearLabel: '2007', prop: 'diesel', len: 12.0, seats: 32, standing: 66,
      numbers: '546-554', lowFloor: true, ac: false, wifi: false, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:30'], lines: ['11', '13', '21', '27', '31'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'niska',
      notes: 'Seria przybliżona — potwierdź numery taborowe w terenie.'
    },
    {
      key: 'tor-man-ng313', city: 'torun', brand: 'MAN', model: "Lion's City NG313 G", gen: 'A23',
      year: 2008, yearLabel: '2008', prop: 'diesel', len: 18.0, seats: 45, standing: 100,
      numbers: '555-556', lowFloor: true, ac: false, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'szczytowa', shift: ['06:00', '18:00'], lines: ['10', '11', '15', '24'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Dwa przegubowe MAN-y — pierwsze niskopodłogowe przegubowce w Toruniu (2008).'
    },
    {
      key: 'tor-ursus-cs12', city: 'torun', brand: 'Ursus', model: 'City Smile CS12LF', gen: 'AMZ',
      year: 2016, yearLabel: '2016', prop: 'diesel', len: 12.0, seats: 30, standing: 60,
      numbers: '605-607', lowFloor: true, ac: true, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '22:00'], lines: ['18', '22', '25', '32', '38'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka',
      notes: 'Trzy 12-metrowe Ursusy z 2017 r.'
    },
    {
      key: 'tor-ursus-cs10', city: 'torun', brand: 'Ursus', model: 'City Smile CS10LF', gen: 'AMZ',
      year: 2016, yearLabel: '2016', prop: 'diesel', len: 10.0, seats: 25, standing: 50,
      numbers: '608-609', lowFloor: true, ac: true, wifi: true, usb: false, cctv: true, ticket: true,
      pattern: 'całodzienna', shift: ['05:00', '21:30'], lines: ['31', '32', '38', '39', '41'],
      status: 'eksploatowany', source: 'phototrans-tor', confidence: 'wysoka'
    },
    {
      key: 'tor-jelcz-413', city: 'torun', brand: 'Jelcz', model: '120MM/1', gen: '—',
      year: 1994, yearLabel: '1994', prop: 'diesel', len: 12.0, seats: 30, standing: 70,
      numbers: '413', lowFloor: false, ac: false, wifi: false, usb: false, cctv: false, ticket: true,
      pattern: 'okazjonalna', shift: ['10:00', '18:00'], lines: ['11'],
      status: 'zabytkowy', source: 'wp-tor', confidence: 'wysoka',
      notes: 'Najstarszy autobus w taborze — zabytkowy Jelcz z silnikiem MAN. Okazjonalne kursy liniowe.'
    },
    {
      key: 'tor-jelcz-120m', city: 'torun', brand: 'Jelcz', model: '120M/3', gen: '—',
      year: 1999, yearLabel: '1999–2002', prop: 'diesel', len: 12.0, seats: 30, standing: 70,
      numbers: '485-515', lowFloor: false, ac: false, wifi: false, usb: false, cctv: false, ticket: true,
      pattern: 'wycofany', shift: ['—', '—'], lines: [],
      status: 'wycofany', source: 'wp-tor', confidence: 'średnia',
      notes: 'Historyczna seria Jelczy 120M — większość wycofana z ruchu. Wpisy archiwalne.'
    }
  ];

  /* --------------------- PRZETWARZANIE DANYCH --------------------- */

  const pad3 = (num) => {
    const s = String(num).trim();
    return /^\d+$/.test(s) && s.length < 3 ? s.padStart(3, '0') : s;
  };

  function expandNumbers(str) {
    const out = [];
    String(str || '').split(',').forEach((partRaw) => {
      const part = partRaw.trim();
      if (!part) return;
      const m = part.match(/^(\d+)\s*[-–]\s*(\d+)$/);
      if (m) {
        const a = parseInt(m[1], 10);
        const b = parseInt(m[2], 10);
        if (b >= a) for (let i = a; i <= b; i++) out.push(pad3(i));
      } else {
        out.push(pad3(part));
      }
    });
    return out.filter((v, i, arr) => arr.indexOf(v) === i);
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }

  const BUSSES = [];
  SERIES.forEach((s) => {
    const cityMeta = CITIES[s.city];
    const nums = expandNumbers(s.numbers);
    nums.forEach((num, idx) => {
      const id = s.city.slice(0, 3) + '-' + num;
      const seed = hash(id + s.key);
      const photo = (s.photos && s.photos[num]) || (idx === 0 ? s.seriesPhoto : null);
      const plate = (s.plates && s.plates[num]) || null;
      const variedYear = s.yearLabel.includes('–')
        ? s.year + Math.min(4, Math.floor((idx / Math.max(1, nums.length - 1)) * 4))
        : s.year;
      const bus = {
        id,
        city: s.city,
        cityName: cityMeta.name,
        carrierId: cityMeta.carrierId,
        carrier: cityMeta.carrier,
        seriesKey: s.key,
        fleetNumber: num,
        fleetNum: parseInt(num, 10) || 0,
        brand: s.brand,
        model: s.model,
        gen: s.gen,
        fullName: `${s.brand} ${s.model}`,
        year: s.status === 'zabytkowy' ? s.year : variedYear,
        yearLabel: s.yearLabel,
        propulsion: s.prop,
        length: s.len,
        seats: s.seats,
        standing: s.standing,
        capacity: (s.seats || 0) + (s.standing || 0),
        lowFloor: !!s.lowFloor,
        ac: !!s.ac,
        wifi: !!s.wifi,
        usb: !!s.usb,
        cctv: !!s.cctv,
        ticketMachine: !!s.ticket,
        registration: plate,
        depot: cityMeta.depot,
        lines: (s.lines || []).slice(),
        pattern: s.pattern,
        shift: s.shift ? s.shift.slice() : ['05:00', '22:00'],
        status: s.status || 'eksploatowany',
        photo,
        photoBy: s.photoBy || null,
        notes: s.notes || '',
        source: s.source,
        confidence: s.confidence || 'średnia',
        seed,
        isUser: false
      };
      BUSSES.push(bus);
    });
  });

  // Seria MAN NL263 (pojedynczy wóz) — uzupełnienie
  BUSSES.push({
    id: 'tor-545', city: 'torun', cityName: 'Toruń', carrierId: 'mzk-torun', carrier: 'MZK Toruń',
    seriesKey: 'tor-man-nl263', fleetNumber: '545', fleetNum: 545, brand: 'MAN',
    model: "Lion's City NL263", gen: 'A37', fullName: "MAN Lion's City NL263", year: 2006,
    yearLabel: '2006', propulsion: 'diesel', length: 12.0, seats: 32, standing: 66, capacity: 98,
    lowFloor: true, ac: false, wifi: false, usb: false, cctv: true, ticketMachine: true,
    registration: null, depot: 'Zajezdnia MZK, ul. Legionów 220', lines: ['13', '27', '31'],
    pattern: 'całodzienna', shift: ['05:10', '22:10'], status: 'eksploatowany',
    photo: null, photoBy: null, notes: 'Pojedynczy MAN NL263 w taborze MZK.', source: 'phototrans-tor',
    confidence: 'niska', seed: hash('tor-545'), isUser: false
  });

  /* --------------------- DOPASOWANIE LINII --------------------- */

  // Dla każdej linii wyznacz wozy, które mogą ją obsługiwać (na podstawie serii + statusu)
  const LINES_BY_CITY = LINES;

  function busesForLine(city, n) {
    return BUSSES.filter(
      (b) => b.city === city && b.status !== 'wycofany' && b.lines.includes(String(n))
    );
  }

  function lineMeta(city, n) {
    const arr = LINES_BY_CITY[city] || [];
    return arr.find((l) => String(l.n) === String(n)) || null;
  }

  /* --------------------- SZACOWANIE AKTYWNOŚCI --------------------- */

  const DAY_NAMES = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const DAY_SHORT = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];

  function dayType(date) {
    const d = date.getDay();
    if (d === 0) return 'sunday';
    if (d === 6) return 'saturday';
    return 'weekday';
  }

  function toMinutes(hhmm) {
    if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  // Prawdopodobieństwo, że dany wóz jest w ruchu o danej godzinie danego dnia
  function serviceProbability(bus, date = new Date()) {
    if (bus.status === 'wycofany') return 0;
    if (bus.status === 'testowy') return 0.02;
    const type = dayType(date);
    const minutes = date.getHours() * 60 + date.getMinutes();
    const isNight = bus.pattern === 'nocna';
    const isPeak = (minutes >= 360 && minutes <= 540) || (minutes >= 840 && minutes <= 1020);
    const isDay = minutes >= 300 && minutes < 1380;
    const isLate = minutes >= 1320 || minutes < 300;

    let base = 0;
    switch (bus.pattern) {
      case 'nocna': base = 0.92; break;
      case 'szczytowa': base = isPeak ? 0.86 : 0.16; break;
      case 'okazjonalna': base = 0.08; break;
      case 'wycofany': base = 0; break;
      default: base = isPeak ? 0.72 : isDay ? 0.5 : isLate ? 0.2 : 0.04;
    }
    if (type !== 'weekday') base *= 0.85;
    if (isNight && !isLate) base *= 0.02;
    if (!isNight && isLate && minutes < 300) base = 0.02;

    const wobble = ((bus.seed + date.getDate() * 37 + date.getMonth() * 11) % 100) / 100;
    const prob = Math.max(0, Math.min(0.99, base * (0.35 + wobble * 1.1)));
    return prob;
  }

  function isActiveNow(bus, date = new Date()) {
    return serviceProbability(bus, date) >= 0.5;
  }

  // Rozkład tygodniowy dla wizualizacji heatmapy: 7 dni x 20 godzin (4:00–24:00)
  function weeklyHeat(bus) {
    const rows = [];
    for (let d = 1; d <= 7; d++) {
      const dayIdx = d === 7 ? 0 : d; // pn..nd
      const cells = [];
      for (let h = 4; h <= 23; h++) {
        const date = new Date();
        const diff = (dayIdx - date.getDay() + 7) % 7;
        date.setDate(date.getDate() + diff);
        date.setHours(h, 30, 0, 0);
        cells.push(serviceProbability(bus, date));
      }
      rows.push({ day: DAY_SHORT[dayIdx], cells });
    }
    return rows;
  }

  /* --------------------- STATYSTYKI --------------------- */

  function stats(city) {
    const list = city ? BUSSES.filter((b) => b.city === city) : BUSSES;
    const active = list.filter((b) => b.status === 'eksploatowany');
    const electric = active.filter((b) => b.propulsion === 'elektryczny');
    const lowFloor = active.filter((b) => b.lowFloor);
    const ac = active.filter((b) => b.ac);
    const wifi = active.filter((b) => b.wifi);
    return {
      total: list.length,
      active: active.length,
      electric: electric.length,
      electricPct: active.length ? Math.round((electric.length / active.length) * 100) : 0,
      lowFloorPct: active.length ? Math.round((lowFloor.length / active.length) * 100) : 0,
      acPct: active.length ? Math.round((ac.length / active.length) * 100) : 0,
      wifiPct: active.length ? Math.round((wifi.length / active.length) * 100) : 0,
      brands: Array.from(new Set(active.map((b) => b.brand))),
      lines: (LINES_BY_CITY[city] || []).length
    };
  }

  window.BUSLIFE = {
    version: '1.0.0',
    updated: '2026-11-02',
    SOURCES,
    PHOTO_CREDITS,
    CITIES,
    CARRIERS,
    LINES: LINES_BY_CITY,
    SERIES,
    BUSES: BUSSES,
    helpers: {
      expandNumbers,
      hash,
      busesForLine,
      lineMeta,
      serviceProbability,
      isActiveNow,
      weeklyHeat,
      stats,
      dayType,
      dayNames: DAY_NAMES,
      dayShort: DAY_SHORT,
      toMinutes
    }
  };
})();
