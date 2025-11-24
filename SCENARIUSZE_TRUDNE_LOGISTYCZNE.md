# 3 Bardzo Trudne i Skomplikowane Scenariusze Logistyczne

## Scenariusz 1: "Mieszanka Chaosu" - Produkty rozproszone wszędzie

### Opis
Zamówienie pickup z 5 produktami, każdy dostępny w różnych kombinacjach sklepów przed/za punktem odbioru, plus magazyny specjalne.

### Dane zamówienia
```javascript
const order = {
  order_id: 99991,
  delivery_id: 3,
  delivery_name: "MCZ - odbiór w sklepie",
  client_comment: "Punkt odbioru: Kabaty przy Bazarku - Wąwozowa 31"
};

const parsedProducts = [
  // Produkt 1: Bitburger (z Order #56911) - dostępny przed MCZ
  { 
    productId: 30055, 
    productName: "Bitburger Premium Pils 5L Beczka piwa", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO (za MCZ)
    ean: "4102430000806"
  },
  // Produkt 2: Diletto (z Order #56955) - dostępny tylko za MCZ
  { 
    productId: 26447, 
    productName: "Diletto Amaretto 21% 500ml", 
    quantity: 2, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "5901617015102"
  },
  // Produkt 3: Jagermeister (z Order #56947) - dostępny przed i w OBR
  { 
    productId: 74307, 
    productName: "Jagermeister Culture Orange Limited Edition 35% 700ml", 
    quantity: 1, 
    storeCode: "FRA", // Początkowo przypisany do FRA (za OBR)
    ean: "4067700033178"
  },
  // Produkt 4: Produkt z magazynu specjalnego
  { 
    productId: null, // Brak productId - magazyn specjalny
    productName: "Wino specjalne z dostawcy", 
    quantity: 3, 
    storeCode: "DOSTAWCY",
    ean: ""
  },
  // Produkt 5: Produkt dostępny w wielu sklepach przed MCZ
  { 
    productId: 99999, 
    productName: "Produkt testowy multi-store", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "1234567890123"
  }
];
```

### Mockowana dostępność produktów
```javascript
function fetchProductWarehouses(accessToken, productId) {
  // Produkt 1 (30055): Bitburger - dostępny w MAG, POW, MCZ, PLO
  if (productId === 30055) {
    return [
      { warehouse_id: 1, name: "MAG", quantity: 5 },      // Przed MCZ ✅
      { warehouse_id: 2, name: "POW", quantity: 3 },      // Przed MCZ ✅
      { warehouse_id: 4, name: "MCZ", quantity: 2 },      // W MCZ ✅
      { warehouse_id: 23, name: "PLO", quantity: 10 }      // Za MCZ ❌
    ];
  }
  
  // Produkt 2 (26447): Diletto - dostępny tylko za MCZ
  if (productId === 26447) {
    return [
      { warehouse_id: 23, name: "PLO", quantity: 5 },     // Za MCZ ❌
      { warehouse_id: 18, name: "FIL", quantity: 3 }       // Za MCZ ❌
    ];
  }
  
  // Produkt 3 (74307): Jagermeister - dostępny w MAG, MCZ, OBR, FRA
  // UWAGA: OBR jest za MCZ, ale FRA jest jeszcze dalej
  if (productId === 74307) {
    return [
      { warehouse_id: 1, name: "MAG", quantity: 2 },      // Przed MCZ ✅
      { warehouse_id: 4, name: "MCZ", quantity: 1 },      // W MCZ ✅
      { warehouse_id: 12, name: "OBR", quantity: 5 },      // Za MCZ ❌
      { warehouse_id: 16, name: "FRA", quantity: 3 }      // Za MCZ ❌
    ];
  }
  
  // Produkt 5 (99999): Multi-store - dostępny w wielu sklepach przed MCZ
  if (productId === 99999) {
    return [
      { warehouse_id: 1, name: "MAG", quantity: 10 },     // Przed MCZ ✅
      { warehouse_id: 2, name: "POW", quantity: 5 },       // Przed MCZ ✅
      { warehouse_id: 3, name: "RAY", quantity: 3 },       // Przed MCZ ✅
      { warehouse_id: 4, name: "MCZ", quantity: 2 }       // W MCZ ✅
    ];
  }
  
  return [];
}
```

### Oczekiwane zachowanie

**Po optymalizacji:**
- Produkt 1 (Bitburger): `PLO` → `MAG` lub `POW` (przed MCZ)
- Produkt 2 (Diletto): `PLO` → pozostaje `PLO` (brak dostępności przed MCZ)
- Produkt 3 (Jagermeister): `FRA` → `MAG` lub `MCZ` (przed/w MCZ)
- Produkt 4 (DOSTAWCY): pozostaje `DOSTAWCY` (brak productId, magazyn specjalny)
- Produkt 5 (Multi-store): `PLO` → `MAG` (algorytm greedy wybierze MAG bo pokrywa wszystkie)

**Emaile:**
1. Email do MAG: Produkty 1, 3, 5 (jeśli algorytm wybierze MAG)
2. Email do PLO: Produkt 2 (pozostaje w PLO)
3. Email do DOSTAWCY: Produkt 4 (magazyn specjalny)
4. **BRAK emaila do MCZ** (sklep docelowy)

**Pytania testowe:**
- Czy algorytm greedy wybierze MAG dla produktów 1, 3, 5?
- Czy produkt 2 pozostanie w PLO (brak dostępności przed MCZ)?
- Czy produkt 4 pozostanie w DOSTAWCY (magazyn specjalny)?
- Czy MCZ nie dostanie emaila?

---

## Scenariusz 2: "Pickup w OBR - Produkty rozproszone po całej trasie"

### Opis
Zamówienie pickup w OBR (indeks 13) z produktami dostępnymi w różnych miejscach na trasie - od początku (MAG) do końca (PLO), plus magazyny specjalne.

### Dane zamówienia
```javascript
const order = {
  order_id: 99992,
  delivery_id: 3,
  delivery_name: "OBR - odbiór w sklepie",
  client_comment: "Punkt odbioru: Służewiec - Obrzeżna 7a"
};

const parsedProducts = [
  // Produkt 1: Dostępny tylko na początku trasy (MAG)
  { 
    productId: 11111, 
    productName: "Produkt z początku trasy", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO (koniec trasy)
    ean: "1111111111111"
  },
  // Produkt 2: Dostępny w środku trasy (MCZ, KBT)
  { 
    productId: 22222, 
    productName: "Produkt ze środka trasy", 
    quantity: 2, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "2222222222222"
  },
  // Produkt 3: Dostępny w OBR (sklep docelowy) i za OBR
  { 
    productId: 33333, 
    productName: "Produkt w sklepie docelowym", 
    quantity: 1, 
    storeCode: "FRA", // Początkowo przypisany do FRA (za OBR)
    ean: "3333333333333"
  },
  // Produkt 4: Dostępny tylko za OBR (FRA, FIL, PLO)
  { 
    productId: 44444, 
    productName: "Produkt tylko za OBR", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "4444444444444"
  },
  // Produkt 5: Dostępny w wielu sklepach przed OBR
  { 
    productId: 55555, 
    productName: "Produkt multi-store przed OBR", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "5555555555555"
  },
  // Produkt 6: Z magazynu specjalnego ANKA
  { 
    productId: null, 
    productName: "Produkt z ANKA", 
    quantity: 2, 
    storeCode: "ANKA",
    ean: ""
  }
];
```

### Mockowana dostępność produktów
```javascript
function fetchProductWarehouses(accessToken, productId) {
  // Produkt 1: Tylko MAG (początek trasy, przed OBR)
  if (productId === 11111) {
    return [
      { warehouse_id: 1, name: "MAG", quantity: 5 }        // Przed OBR ✅
    ];
  }
  
  // Produkt 2: MCZ i KBT (środek trasy, przed OBR)
  if (productId === 22222) {
    return [
      { warehouse_id: 4, name: "MCZ", quantity: 3 },      // Przed OBR ✅
      { warehouse_id: 5, name: "KBT", quantity: 2 }        // Przed OBR ✅
    ];
  }
  
  // Produkt 3: OBR (sklep docelowy) i FRA (za OBR)
  if (productId === 33333) {
    return [
      { warehouse_id: 12, name: "OBR", quantity: 5 },     // W OBR ✅ (self-pack)
      { warehouse_id: 16, name: "FRA", quantity: 3 }      // Za OBR ❌
    ];
  }
  
  // Produkt 4: Tylko za OBR (FRA, FIL, PLO)
  if (productId === 44444) {
    return [
      { warehouse_id: 16, name: "FRA", quantity: 2 },     // Za OBR ❌
      { warehouse_id: 18, name: "FIL", quantity: 1 },     // Za OBR ❌
      { warehouse_id: 23, name: "PLO", quantity: 5 }       // Za OBR ❌
    ];
  }
  
  // Produkt 5: Wiele sklepów przed OBR (MAG, POW, MCZ, KBT, GU)
  if (productId === 55555) {
    return [
      { warehouse_id: 1, name: "MAG", quantity: 10 },     // Przed OBR ✅
      { warehouse_id: 2, name: "POW", quantity: 5 },       // Przed OBR ✅
      { warehouse_id: 4, name: "MCZ", quantity: 3 },       // Przed OBR ✅
      { warehouse_id: 5, name: "KBT", quantity: 2 },       // Przed OBR ✅
      { warehouse_id: 6, name: "GU", quantity: 1 }         // Przed OBR ✅
    ];
  }
  
  return [];
}
```

### Oczekiwane zachowanie

**Po optymalizacji:**
- Produkt 1: `PLO` → `MAG` (jedyny dostępny przed OBR)
- Produkt 2: `PLO` → `MCZ` lub `KBT` (algorytm greedy wybierze jeden)
- Produkt 3: `FRA` → `OBR` (sklep docelowy - self-pack, brak emaila)
- Produkt 4: `PLO` → pozostaje `PLO` (brak dostępności przed OBR)
- Produkt 5: `PLO` → `MAG` (algorytm greedy wybierze MAG bo pokrywa wszystkie)
- Produkt 6: pozostaje `ANKA` (magazyn specjalny, brak productId)

**Emaile:**
1. Email do MAG: Produkty 1, 5 (jeśli algorytm wybierze MAG)
2. Email do MCZ lub KBT: Produkt 2 (jeśli algorytm wybierze MCZ/KBT)
3. Email do PLO: Produkt 4 (pozostaje w PLO)
4. Email do ANKA: Produkt 6 (magazyn specjalny)
5. **BRAK emaila do OBR** (sklep docelowy - produkt 3 jest self-pack)

**Pytania testowe:**
- Czy algorytm greedy wybierze optymalne sklepy (minimalizacja liczby sklepów)?
- Czy produkt 3 zostanie zmieniony na OBR (self-pack)?
- Czy produkt 4 pozostanie w PLO (brak dostępności przed OBR)?
- Czy OBR nie dostanie emaila (sklep docelowy)?

---

## Scenariusz 3: "Ekstremalny przypadek - Wszystko w magazynach specjalnych i za punktem odbioru"

### Opis
Zamówienie pickup w MCZ z produktami dostępnymi TYLKO w magazynach specjalnych (DOSTAWCY, ANKA, BIURO) i sklepach za punktem odbioru. Brak dostępności przed punktem odbioru.

### Dane zamówienia
```javascript
const order = {
  order_id: 99993,
  delivery_id: 3,
  delivery_name: "MCZ - odbiór w sklepie",
  client_comment: "Punkt odbioru: Kabaty przy Bazarku - Wąwozowa 31"
};

const parsedProducts = [
  // Produkt 1: Z DOSTAWCY (magazyn specjalny, bez productId)
  { 
    productId: null, 
    productName: "Wino specjalne z dostawcy", 
    quantity: 3, 
    storeCode: "DOSTAWCY",
    ean: ""
  },
  // Produkt 2: Z ANKA (magazyn specjalny, bez productId)
  { 
    productId: null, 
    productName: "Produkt z ANKA", 
    quantity: 2, 
    storeCode: "ANKA",
    ean: ""
  },
  // Produkt 3: Z BIURO (magazyn specjalny, bez productId)
  { 
    productId: null, 
    productName: "Produkt z biura", 
    quantity: 1, 
    storeCode: "BIURO",
    ean: ""
  },
  // Produkt 4: Dostępny tylko za MCZ (OBR, FRA, PLO)
  { 
    productId: 44444, 
    productName: "Produkt tylko za MCZ", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "4444444444444"
  },
  // Produkt 5: Dostępny tylko za MCZ (RAC, EKO, RKW)
  { 
    productId: 55555, 
    productName: "Produkt tylko za MCZ v2", 
    quantity: 2, 
    storeCode: "FRA", // Początkowo przypisany do FRA
    ean: "5555555555555"
  },
  // Produkt 6: Dostępny tylko za MCZ (FIL, WDK, PLO)
  { 
    productId: 66666, 
    productName: "Produkt tylko za MCZ v3", 
    quantity: 1, 
    storeCode: "PLO", // Początkowo przypisany do PLO
    ean: "6666666666666"
  }
];
```

### Mockowana dostępność produktów
```javascript
function fetchProductWarehouses(accessToken, productId) {
  // Produkt 4: Tylko za MCZ (OBR, FRA, PLO)
  if (productId === 44444) {
    return [
      { warehouse_id: 12, name: "OBR", quantity: 2 },      // Za MCZ ❌
      { warehouse_id: 16, name: "FRA", quantity: 1 },      // Za MCZ ❌
      { warehouse_id: 23, name: "PLO", quantity: 5 }       // Za MCZ ❌
    ];
  }
  
  // Produkt 5: Tylko za MCZ (RAC, EKO, RKW)
  if (productId === 55555) {
    return [
      { warehouse_id: 13, name: "RAC", quantity: 3 },      // Za MCZ ❌
      { warehouse_id: 14, name: "EKO", quantity: 2 },      // Za MCZ ❌
      { warehouse_id: 15, name: "RKW", quantity: 1 }       // Za MCZ ❌
    ];
  }
  
  // Produkt 6: Tylko za MCZ (FIL, WDK, PLO)
  if (productId === 66666) {
    return [
      { warehouse_id: 18, name: "FIL", quantity: 2 },      // Za MCZ ❌
      { warehouse_id: 19, name: "WDK", quantity: 1 },      // Za MCZ ❌
      { warehouse_id: 23, name: "PLO", quantity: 4 }       // Za MCZ ❌
    ];
  }
  
  return [];
}
```

### Oczekiwane zachowanie

**Po optymalizacji:**
- Produkt 1: pozostaje `DOSTAWCY` (brak productId, magazyn specjalny)
- Produkt 2: pozostaje `ANKA` (brak productId, magazyn specjalny)
- Produkt 3: pozostaje `BIURO` (brak productId, magazyn specjalny)
- Produkt 4: `PLO` → pozostaje `PLO` (brak dostępności przed MCZ)
- Produkt 5: `FRA` → pozostaje `FRA` (brak dostępności przed MCZ)
- Produkt 6: `PLO` → pozostaje `PLO` (brak dostępności przed MCZ)

**Emaile:**
1. Email do DOSTAWCY: Produkt 1 (magazyn specjalny)
   - Odbiorcy: `paradowskimj@gmail.com`, `dostawydarwinapl@gmail.com`
2. Email do ANKA: Produkt 2 (magazyn specjalny)
   - Odbiorcy: `dostawydarwinapl@gmail.com`
3. Email do BIURO: Produkt 3 (magazyn specjalny)
   - Odbiorcy: `zbigniewkawalec@gmail.com`, `kamilaogniewska@gmail.com`
4. Email do PLO: Produkty 4, 6 (pozostają w PLO)
5. Email do FRA: Produkt 5 (pozostaje w FRA)
6. **BRAK emaila do MCZ** (sklep docelowy)

**Pytania testowe:**
- Czy wszystkie produkty bez productId pozostaną w magazynach specjalnych?
- Czy produkty dostępne tylko za MCZ pozostaną w oryginalnych źródłach?
- Czy wszystkie emaile do magazynów specjalnych wyjdą poprawnie?
- Czy MCZ nie dostanie emaila (sklep docelowy)?
- Czy system nie rzuci błędów przy braku dostępności przed punktem odbioru?

---

## Podsumowanie testów

### Wspólne pytania dla wszystkich scenariuszy:

1. **Czy optymalizacja działa poprawnie?**
   - Czy produkty przed punktem odbioru są optymalizowane?
   - Czy produkty za punktem odbioru pozostają bez zmian?
   - Czy magazyny specjalne są pomijane w optymalizacji?

2. **Czy algorytm greedy minimalizuje liczbę sklepów?**
   - Czy wybiera sklepy które pokrywają najwięcej produktów?
   - Czy działa poprawnie dla wielu produktów?

3. **Czy emaile są wysyłane poprawnie?**
   - Czy sklep docelowy nie dostaje emaila?
   - Czy magazyny specjalne dostają emaile do właściwych odbiorców?
   - Czy zwykłe sklepy dostają emaile z poprawną treścią?

4. **Czy edge cases są obsługiwane?**
   - Produkty bez productId
   - Brak dostępności przed punktem odbioru
   - Wszystkie produkty w magazynach specjalnych
   - Produkty w sklepie docelowym (self-pack)

---

## Pliki testowe

Każdy scenariusz powinien być przetestowany przez:
1. Utworzenie testu jednostkowego z mockowanymi danymi
2. Weryfikację wyników optymalizacji
3. Weryfikację wysłanych emaili
4. Weryfikację logów

**Status:** ✅ **GOTOWE DO TESTOWANIA**

