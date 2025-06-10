# System Modułowej Bramy - Dokumentacja

## Przegląd

System modułowej bramy pozwala na tworzenie złożonych konstrukcji bramowych składających się z wielu sekcji, które można dowolnie konfigurować i przemieszczać. Każda sekcja może być typu: brama, furtka lub przęsło.

## Architektura

### Klasy główne

1. **GateSection** - reprezentuje pojedynczą sekcję bramy
2. **ModularGateModel** - zarządza całą modułową bramą
3. **ModularUIManager** - zarządza interfejsem użytkownika

### Struktura danych

```javascript
{
  sections: [
    {
      id: "section_0",
      type: "gate", // "gate", "wicket", "span"
      width: 4,
      height: 2,
      depth: 0.1,
      fillType: "nowoczesne-poziome",
      fillProfile: "nowoczesne-poziome",
      frameProfile: "15x15"
    }
  ],
  globalParameters: {
    height: 2,
    depth: 0.1,
    frameProfile: "15x15"
  }
}
```

## Funkcjonalności

### 1. Zarządzanie sekcjami

- **Dodawanie sekcji**: Można dodać nową sekcję typu brama, furtka lub przęsło
- **Usuwanie sekcji**: Każdą sekcję można usunąć (z wyjątkiem ostatniej)
- **Przemieszczanie**: Sekcje można przesuwać w górę i w dół listy
- **Konfiguracja**: Każda sekcja ma własne parametry (szerokość, wypełnienie)

### 2. Parametry globalne

- **Wysokość**: Wspólna wysokość wszystkich sekcji
- **Głębokość**: Wspólna głębokość wszystkich sekcji  
- **Profil ramy**: Wspólny profil ramy dla wszystkich sekcji

### 3. Wizualizacja 3D

- **Automatyczne pozycjonowanie**: Sekcje są automatycznie ustawiane obok siebie
- **Słupki łączące**: Między sekcjami automatycznie dodawane są słupki łączące
- **Wyśrodkowanie**: Cała brama jest automatycznie wyśrodkowana w scenie

### 4. Typy sekcji

#### Brama (gate)
- Standardowa sekcja bramy
- Pełna funkcjonalność wypełnienia
- Możliwość konfiguracji wszystkich parametrów

#### Furtka (wicket)
- Sekcja z wbudowaną furtką
- Furtka zajmuje 30% szerokości sekcji
- Wysokość furtki to 90% wysokości sekcji
- Automatyczne pozycjonowanie furtki

#### Przęsło (span)
- Sekcja przęsła (na razie identyczna z bramą)
- Przygotowana na przyszłe rozszerzenia

### 5. Wypełnienia

Każda sekcja może mieć różne typy wypełnienia:
- **Puste**: Bez wypełnienia
- **Nowoczesne poziome**: Poziome pręty
- **Siatka**: Siatka metalowa
- **Profile**: Pionowe profile
- **Panel**: Pełny panel

### 6. Kalkulacja kosztów

System automatycznie oblicza koszty dla całej modułowej bramy:
- **Stal**: Objętość wszystkich elementów
- **Ocynk**: Koszt ocynkowania
- **Robocizna**: Koszt wykonania
- **Montaż**: Koszt montażu
- **Śruby**: Koszt elementów złącznych
- **Wypełnienie**: Koszt materiałów wypełniających

## Interfejs użytkownika

### Sekcja globalnych parametrów
- Zwijalny panel z parametrami wspólnymi
- Slidery dla wysokości i głębokości
- Dropdown dla profilu ramy

### Sekcje bramy
- Każda sekcja ma własny zwijalny panel
- Kontrolki do przemieszczania (↑↓) i usuwania (×)
- Indywidualne parametry każdej sekcji

### Przycisk dodawania
- Menu rozwijane z wyborem typu sekcji
- Automatyczne dodawanie nowej sekcji

## Import/Export

### Format pliku
```json
{
  "modularParameters": {
    "sections": [...],
    "globalParameters": {...}
  },
  "costs": {...}
}
```

### Kompatybilność wsteczna
System może importować stare pliki JSON i automatycznie konwertować je do nowego formatu modułowego.

## Techniczne szczegóły

### Renderowanie 3D
- Każda sekcja ma własną grupę THREE.js
- Słupki łączące są renderowane jako osobne obiekty
- Automatyczne pozycjonowanie i wyśrodkowanie

### Obliczenia kosztów
- Objętość stali dla ram i wypełnień
- Koszty słupków łączących
- Współczynniki złożoności dla różnych typów wypełnienia

### Wydajność
- Dynamiczne tworzenie/usuwanie obiektów 3D
- Optymalizacja renderowania
- Minimalne przeładowania UI

## Przyszłe rozszerzenia

1. **Dodatkowe typy sekcji**: Ogrodzenia, bariery
2. **Zaawansowane wypełnienia**: Wzory, kolory
3. **Animacje**: Otwieranie/zamykanie sekcji
4. **Konfiguracja słupków**: Różne profile i rozmiary
5. **Szablony**: Predefiniowane układy sekcji 