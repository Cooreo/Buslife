# 🚌 BusLife Kujawy

**Mobilna aplikacja (PWA) do śledzenia, katalogowania i dodawania autobusów miejskich we Włocławku (MPK) i Toruniu (MZK).**

Numery taborowe · modele · zdjęcia · loga przewoźników i producentów · linie · godziny kursowania · mapa · kolekcja własnych wpisów.

🔗 **Aplikacja na żywo:** <https://cooreo.github.io/Buslife/>

---

## Co potrafi aplikacja

| Funkcja | Opis |
| --- | --- |
| **Katalog taboru** | 329 rekordów pojazdów (Włocławek: 75, Toruń: 254) z numerem taborowym, marką, modelem, generacją, rokiem, napędem, długością, liczbą miejsc i wyposażeniem. |
| **Zdjęcia i loga** | Fotografie pojazdów (z podaniem źródła) + logo przewoźnika (MPK Włocławek, MZK Toruń) i producenta (Solaris, MAN, Ursus, Jelcz). Dla wozów bez zdjęcia generowany jest **schemat SVG** w barwach miasta z tablicą LED, numerem bocznym i przegubem. |
| **Wyszukiwarka i filtry** | Szukaj po numerze (np. `023`), modelu (`Urbino`), marce, linii. Filtry: miasto, napęd, długość, marka; sortowanie po numerze, roku, pojemności, „w ruchu”. |
| **Kiedy kursuje** | Dla każdej linii: pierwszy/ostatni kurs, częstotliwość w szczycie, poza szczytem i wieczorem (dni robocze / soboty / niedziele). Dla każdego pojazdu: **heatmapa tygodniowa** 7 dni × 20 godzin. |
| **Następne odjazdy** | Silnik rozkładów szacuje najbliższe odjazdy z pętli na podstawie częstotliwości. |
| **Mapa** | Schemat sieci obu miast z animowanymi pojazdami i legendą linii (symulacja, nie GPS). |
| **Dodawanie autobusów** | Formularz z foto-uploadem (kompresja do 1000 px), wyposażeniem i liniami. Wpisy zapisują się lokalnie. |
| **Edycja i korekty** | Można poprawiać wbudowane rekordy — nadpisanie działa tylko na Twoim urządzeniu. |
| **Obserwacje** | Dziennik spotkań: data, linia, miejsce, notatka. |
| **Moja kolekcja** | Obserwowane wozy, własne wpisy, eksport/import JSON, czyszczenie danych. |
| **PWA / offline** | Manifest, Service Worker, instalacja na ekranie głównym, praca bez internetu, motyw jasny/ciemny. |

## Miasta i przewoźnicy

### Włocławek — MPK Włocławek
- **Tabor:** Solaris Urbino 10/12 (w tym hybrydy), Solaris Urbino 12 electric, Solaris Urbino 18 electric, MAN Lion's City 12, MAN Lion's City 12 E
- **Numery taborowe:** m.in. `001–005`, `017–022` (Solarisy elektryczne), `006–016`, `023–036` (MAN elektryczny), `210`, `213–223` (Urbino 10), `538–540` (hybrydy), `541–552`, `601–602` (przegubowe), `701–704`
- **Linie:** 1, 3, 4, 5, 8, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 23
- **Ciekawostki:** powrót przegubowców po 25 latach (2026), test wodorowego Solarisa Urbino 18 hydrogen na linii 23 (2024)

### Toruń — MZK Toruń
- **Tabor:** Solaris Urbino 8,6 / 12 (generacje III i IV, w tym mild hybrid i CNG), Solaris Urbino 18, Solaris Urbino 12 electric, MAN Lion's City NL263/NL273/NL283/NG313, MAN Lion's City NL253 Hybrid, Ursus City Smile CS10/CS12, zabytkowy Jelcz 120MM/1 #413
- **Numery taborowe:** m.in. `561–584`, `590–604`, `610–630`, `631–644` (MAN hybrydowy), `645–652`, `653–670`, `661–674`, `675–700`, `701–740` (elektryczne), `555–557` (przegubowe)
- **Linie:** 10–44 (dzienne), 42/44 (podmiejskie), N91/N93/N94/N95 (nocne)

## Uruchomienie lokalne

Aplikacja jest w 100% statyczna — wystarczy dowolny serwer HTTP:

```bash
git clone https://github.com/Cooreo/Buslife.git
cd Buslife
python3 -m http.server 8000
# otwórz http://localhost:8000
```

Service Worker wymaga `http://` lub `https://` (nie działa z `file://`).

## Publikacja na GitHub Pages

Repozytorium ma gotowy workflow `.github/workflows/pages.yml`:

1. Wejdź w **Settings → Pages** i ustaw **Source: GitHub Actions**.
2. Wypchnij zmiany do gałęzi `main` (lub uruchom workflow ręcznie: **Actions → Deploy BusLife → Run workflow**).
3. Aplikacja będzie dostępna pod `https://<user>.github.io/Buslife/`.

## Struktura projektu

```
index.html               # szkielet PWA, nawigacja dolna
manifest.webmanifest     # manifest instalacji
sw.js                    # Service Worker (cache offline)
css/styles.css           # design system (ciemny/jasny motyw, mobile-first)
js/data.js               # baza: miasta, przewoźnicy, linie, serie taboru, rozkłady
js/logos.js              # logotypy SVG + generator schematów autobusów
js/core.js               # stan, localStorage, komponenty, silnik rozkładów, symulacja
js/pages.js              # widoki: linie, mapa, moje, dodawanie/edycja, o aplikacji
js/app.js                # widoki główne (start, tabor, karta pojazdu) + router
assets/                  # ikony PWA i zdjęcia pojazdów
.github/workflows/       # automatyczny deploy na GitHub Pages
```

## Dane i ich dokładność

Baza opracowana na podstawie publicznych źródeł:

- [Wikipedia — MPK Włocławek](https://pl.wikipedia.org/wiki/Miejskie_Przedsi%C4%99biorstwo_Komunikacyjne_we_W%C5%82oc%C5%82awku)
- [Wikipedia — Autobusy miejskie w Toruniu](https://pl.wikipedia.org/wiki/Autobusy_w_Toruniu)
- [Phototrans.pl — wykaz taboru MZK Toruń](https://phototrans.pl/24,82,0,Miejski_Zak__ad_Komunikacji_w_Toruniu_sp__z_o_o_.html)
- [TransInfo — dostawy taboru MPK Włocławek](https://transinfo.pl/)
- [MPK Włocławek — rozkłady jazdy](https://rozklad.mpk.com.pl/)
- [MZK Toruń — strona przewoźnika](https://mzk-torun.pl/)
- [Twoje Miasto — rozkłady jazdy](https://torun.twoje-miasto.pl/rozklady)

> ⚠️ **Zastrzeżenie:** aplikacja jest projektem niezależnym i społecznościowym. Nie jest oficjalnym produktem MPK Włocławek ani MZK Toruń. Numery taborowe w seriach, godziny kursowania i przypisania do linii mogą różnić się od stanu faktycznego — interfejs pozwala je korygować. Pozycje na mapie są **symulacją**, ponieważ przewoźnicy nie udostępniają publicznego strumienia GPS.

## Licencja i atrybucja

- Kod: do dowolnego wykorzystania w celach edukacyjnych i społecznościowych.
- Zdjęcia pojazdów: materiały prasowe przewoźników / serwisów transportowych (TransInfo, Nowości, flog.pl) — wykorzystane informacyjnie z podaniem źródła w karcie pojazdu.
- Nazwy i logotypy MPK Włocławek, MZK Toruń, Solaris, MAN, Ursus, Jelcz należą do ich właścicieli; logotypy w aplikacji są uproszczonymi interpretacjami graficznymi (SVG) tworzonymi na potrzeby identyfikacji przewoźnika/producenta.

---

Zbudowane z myślą o miłośnikach komunikacji miejskiej 🚍
