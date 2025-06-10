# Konfigurator Bram DBT Metal

## Cel Projektu

Ten projekt to interaktywny konfigurator bram, stworzony z myślą o pracownikach i twórcach w branży metalowej. Głównym celem narzędzia jest znaczące ułatwienie i przyspieszenie procesu kalkulacji kosztów bram oraz generowania profesjonalnych ofert dla klientów. Zamiast skomplikowanych obliczeń manualnych, aplikacja pozwala na szybkie wizualizowanie bramy, szacowanie kosztów i generowanie dokumentacji.

## Jak Działa Narzędzie?

Konfigurator działa na zasadzie interaktywnej aplikacji webowej, która pozwala na:

1.  **Modelowanie 3D Bramy:** Użytkownik może dostosować parametry bramy takie jak szerokość, wysokość i głębokość, a także wybrać różne typy bram (przesuwna, dwuskrzydłowa, furtka) oraz rodzaje wypełnień (siatka, profile, panel). Zmiany są wizualizowane w czasie rzeczywistym w środowisku 3D (Three.js).

2.  **Kalkulacja Kosztów:** W miarę dostosowywania parametrów, narzędzie automatycznie oblicza szacunkowy koszt produkcji bramy, uwzględniając takie elementy jak stal, ocynk, robocizna, montaż, śruby i wypełnienie. Kosztorys jest na bieżąco aktualizowany i wyświetlany w panelu bocznym.

3.  **Generowanie Dokumentacji:**
    *   **Generuj PDF:** Tworzy profesjonalną ofertę w formacie PDF, zawierającą szczegółowe parametry bramy, kosztorys oraz wizualizację 3D.
    *   **Specyfikacja:** Otwiera nowe okno z tabelaryczną specyfikacją bramy, podsumowującą wybrane materiały i wymiary.
    *   **Rysunki Techniczne:** Generuje proste rysunki techniczne bramy (widok z przodu i z boku) z podstawowymi wymiarami, co jest pomocne w procesie produkcyjnym.

4.  **Import/Export Projektów:**
    *   **Import projektu:** Umożliwia wczytanie wcześniej zapisanych konfiguracji bram z plików JSON.
    *   **Export projektu:** Pozwala na zapisanie bieżącej konfiguracji bramy i kosztorysu do pliku JSON, co ułatwia późniejsze modyfikacje lub archiwizację.

5.  **Testy (dla Deweloperów):** Przycisk "Uruchom testy" pozwala na uruchomienie zaimplementowanych testów jednostkowych, które weryfikują poprawność działania logiki aplikacji, interfejsu użytkownika i kalkulacji.

## Kluczowe Cechy:

*   Interaktywna wizualizacja 3D bramy.
*   Automatyczna i szczegółowa kalkulacja kosztów.
*   Generowanie profesjonalnych ofert PDF.
*   Tworzenie specyfikacji i uproszczonych rysunków technicznych.
*   Możliwość importu i eksportu konfiguracji.
*   Łatwy w użyciu interfejs użytkownika, zaprojektowany z myślą o efektywności pracy.

## Quickstart

Follow these steps to get the app running immediately after downloading/cloning the repository:

### 1. Install dependencies

```
npm install
```

### 2. Start the static server

```
npm run serve
```
- The app will be available at: [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
- **Do not open `index.html` directly!** Always use the server address above.

### 3. (Optional) Run tests and update test results

```
npm run test:json
```
- This generates `jest-results.json` for the in-app test panel.
- After code changes, re-run this command to update test results.

### 4. Open the app

- Go to [http://127.0.0.1:8080/](http://127.0.0.1:8080/) in your browser.
- Use all features, including the test panel ("Testy").

---

## Notes
- You can access the app from other devices on your network using the IP shown by `npm run serve` (e.g., `http://192.168.1.103:8080/`).
- For live test updates, consider using a file watcher (e.g., `nodemon`) to auto-run tests.
- If you encounter issues, make sure you are not opening `index.html` directly from disk.