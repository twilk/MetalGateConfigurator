# MetalGateConfigurator - Dokumentacja Projektu

## Przegląd Projektu

**MetalGateConfigurator** to interaktywny konfigurator bram metalowych stworzony dla pracowników i twórców w branży metalowej. Aplikacja umożliwia wizualizację 3D bram, kalkulację kosztów i generowanie profesjonalnych ofert.

## Aktualny Stan Projektu

### ✅ Zaimplementowane Funkcje

#### 1. Wizualizacja 3D
- **Three.js** - renderowanie 3D bram w czasie rzeczywistym
- **Trzy typy bram:**
  - Bramy przesuwne (sliding)
  - Bramy dwuskrzydłowe (double-wing)
  - Furtki (wicket)
- **Trzy typy wypełnień:**
  - Siatka (mesh)
  - Profile (profiles)
  - Panel (panel)
- **Interaktywne parametry:**
  - Szerokość (2-8m)
  - Wysokość (1.5-4m)
  - Głębokość (0.05-0.2m)
- **Kontrola kamery** - OrbitControls z ograniczeniami
- **Oświetlenie** - ambient, directional i fill lighting
- **Cienie** - PCFSoftShadowMap

#### 2. Kalkulacja Kosztów
- **Automatyczne obliczenia** w czasie rzeczywistym
- **Składniki kosztów:**
  - Materiały (stal, ocynk)
  - Robocizna
  - Montaż
  - Śruby
  - Wypełnienie
- **Wyświetlanie szczegółowego kosztorysu**

#### 3. Generowanie Dokumentacji
- **PDF** - profesjonalne oferty z wizualizacją 3D
- **Specyfikacja** - tabelaryczna specyfikacja bramy
- **Rysunki techniczne** - widoki z przodu i z boku

#### 4. Import/Export
- **Zapisywanie konfiguracji** do pliku JSON
- **Wczytywanie konfiguracji** z pliku JSON

#### 5. Testy
- **Testy jednostkowe** dla wszystkich komponentów
- **Testy renderowania** - weryfikacja typów bram i wypełnień
- **Testy UI** - sprawdzanie kontrolek i wyświetlania
- **Testy kalkulacji** - weryfikacja obliczeń kosztów

### 🚧 W Trakcie Rozwoju

#### 1. Optymalizacja Wydajności
- Problemy z ładowaniem tekstur
- Optymalizacja pamięci dla dużych scen
- Kompresja tekstur

#### 2. Ulepszenia Wizualne
- PBR materiały dla wszystkich typów bram
- Mapowanie środowiska
- Realistyczne cienie i ambient occlusion
- Animacje interakcji z bramami

#### 3. Rozszerzenia Funkcjonalności
- Dodatkowe typy bram (składane, wspornikowe)
- Więcej typów wypełnień (wzory dekoracyjne)
- Wybór kolorów bramy
- Biblioteka tekstur/materiałów

### 📋 Planowane Funkcje (Roadmap V2)

#### Faza 1: Podstawowa Kalkulacja Kosztów
- [ ] Rozszerzenie systemu kalkulacji kosztów
- [ ] Dodanie więcej typów materiałów
- [ ] Kalkulator kosztów transportu
- [ ] Kalkulator kosztów montażu
- [ ] Dodanie VAT i innych podatków

#### Faza 2: Generowanie Ofert
- [ ] Profesjonalne szablony PDF
- [ ] Opcje brandingowe firmy
- [ ] Warunki i zasady
- [ ] Terminy płatności
- [ ] Szacunki czasu dostawy

#### Faza 3: Zarządzanie Projektami
- [ ] Baza danych klientów
- [ ] Śledzenie statusu projektów
- [ ] Historia ofert
- [ ] Śledzenie zamówień

## Architektura Techniczna

### Frontend
- **HTML5** - struktura aplikacji
- **CSS3** - stylowanie z responsywnym designem
- **JavaScript (ES6+)** - logika aplikacji
- **Three.js** - renderowanie 3D
- **jsPDF** - generowanie dokumentów PDF

### Struktura Kodu
```
├── index.html          # Główny plik HTML
├── style.css           # Style CSS
├── bundle.js           # Główna logika aplikacji (zbundlowana)
├── tests.js            # Testy jednostkowe
├── assets/             # Zasoby (logo, tekstury)
└── docs/               # Dokumentacja
```

### Klasy Główne
1. **SceneManager** - zarządzanie sceną 3D
2. **GateModel** - model bramy i jej renderowanie
3. **UIManager** - zarządzanie interfejsem użytkownika
4. **CostCalculator** - kalkulacja kosztów
5. **ExportPDF** - generowanie dokumentów PDF
6. **GateConfiguratorTests** - testy aplikacji

## Problemy i Ograniczenia

### Wydajność
- Problemy z ładowaniem tekstur z zewnętrznych źródeł
- Brak optymalizacji pamięci dla dużych scen
- Brak kompresji tekstur

### Funkcjonalność
- Ograniczona liczba typów bram
- Podstawowe materiały (brak PBR)
- Brak animacji ruchu bram
- Brak systemu pomiarów

### UI/UX
- Brak tooltipów dla kontrolek
- Ograniczona responsywność
- Brak skrótów klawiszowych
- Brak funkcji undo/redo

## Następne Kroki

1. **Optymalizacja wydajności** - naprawa problemów z teksturami
2. **Rozszerzenie funkcjonalności** - dodanie nowych typów bram
3. **Ulepszenia UI/UX** - dodanie tooltipów i skrótów
4. **Testy** - rozszerzenie pokrycia testami
5. **Dokumentacja** - kompletna dokumentacja API

## Metryki Sukcesu

- Czas generowania oferty
- Dokładność kalkulacji kosztów
- Liczba wygenerowanych ofert
- Satysfakcja użytkowników
- Redukcja błędów w obliczeniach
- Oszczędność czasu na zarządzanie projektami 