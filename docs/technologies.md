# Technologie Używane w MetalGateConfigurator

## Frontend Technologies

### 1. HTML5
- **Wersja:** HTML5
- **Cel:** Struktura aplikacji webowej
- **Użycie:** Główny plik `index.html` z elementami canvas i UI
- **Dokumentacja:** [MDN HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)

### 2. CSS3
- **Wersja:** CSS3
- **Cel:** Stylowanie i responsywny design
- **Użycie:** Plik `style.css` z custom properties, flexbox, grid
- **Funkcje:** Responsive design, dark mode support, animations
- **Dokumentacja:** [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)

### 3. JavaScript (ES6+)
- **Wersja:** ES6+ (ES2015+)
- **Cel:** Logika aplikacji, interaktywność
- **Użycie:** Pliki `bundle.js` i `tests.js`
- **Funkcje:** Classes, async/await, modules, arrow functions
- **Dokumentacja:** [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 3D Graphics & Visualization

### 4. Three.js
- **Wersja:** 0.142.0
- **Cel:** Renderowanie 3D bram w czasie rzeczywistym
- **Użycie:** SceneManager, GateModel, 3D visualization
- **Funkcje:**
  - WebGL renderer
  - OrbitControls
  - RGBELoader
  - PCFSoftShadowMap
  - PBR materials
- **Dokumentacja:** [Three.js Documentation](https://threejs.org/docs/)

### 5. WebGL
- **Cel:** Hardware-accelerated 3D graphics
- **Użycie:** Podstawowa technologia dla Three.js
- **Dokumentacja:** [MDN WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

## PDF Generation

### 6. jsPDF
- **Wersja:** 2.5.1
- **Cel:** Generowanie dokumentów PDF
- **Użycie:** Klasa ExportPDF, generowanie ofert
- **Funkcje:** Text, images, tables, styling
- **Dokumentacja:** [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/)

## Development & Testing

### 7. Custom Test Framework
- **Cel:** Testy jednostkowe aplikacji
- **Użycie:** Plik `tests.js`, klasa GateConfiguratorTests
- **Funkcje:**
  - Testy renderowania 3D
  - Testy UI
  - Testy kalkulacji kosztów
  - Testy funkcjonalności

## External Dependencies

### 8. Google Fonts
- **Font:** Roboto (400, 500, 700 weights)
- **Cel:** Typografia aplikacji
- **Dokumentacja:** [Google Fonts](https://fonts.google.com/)

### 9. CDN Services
- **jsDelivr:** Three.js library
- **Cloudflare:** jsPDF library
- **Google:** Fonts

## Build & Deployment

### 10. Bundling
- **Cel:** Optymalizacja kodu JavaScript
- **Użycie:** Plik `bundle.js` (zbundlowany kod)
- **Funkcje:** Minification, optimization

## Browser APIs

### 11. Canvas API
- **Cel:** Renderowanie 3D przez Three.js
- **Dokumentacja:** [MDN Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 12. File API
- **Cel:** Import/Export konfiguracji JSON
- **Funkcje:** FileReader, Blob, download
- **Dokumentacja:** [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)

### 13. Performance API
- **Cel:** Monitoring wydajności (FPS)
- **Użycie:** Stats.js integration
- **Dokumentacja:** [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)

## Version Information

### Aktualne Wersje
- **Three.js:** 0.142.0
- **jsPDF:** 2.5.1
- **HTML5:** Latest
- **CSS3:** Latest
- **JavaScript:** ES6+ (ES2015+)

### Kompatybilność
- **Przeglądarki:** Chrome, Firefox, Safari, Edge (nowsze wersje)
- **Platformy:** Desktop, Tablet (ograniczona)
- **Wymagania:** WebGL support, ES6+ support

## Planowane Aktualizacje

### Three.js
- **Aktualna:** 0.142.0
- **Planowana:** Najnowsza stabilna wersja
- **Korzyści:** Lepsze PBR materials, performance improvements

### jsPDF
- **Aktualna:** 2.5.1
- **Planowana:** Najnowsza stabilna wersja
- **Korzyści:** Lepsze wsparcie dla stylów, nowe funkcje

## Security Considerations

### CDN Security
- **SRI (Subresource Integrity):** Brak - należy dodać
- **HTTPS:** Wymagane dla wszystkich zasobów
- **CSP (Content Security Policy):** Brak - należy zaimplementować

### File Handling
- **JSON Validation:** Podstawowa walidacja
- **File Size Limits:** Brak ograniczeń
- **MIME Type Checking:** Brak - należy dodać 