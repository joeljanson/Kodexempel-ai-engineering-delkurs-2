# Kursmaterial för AI Engineering - Delkurs 2

Välkommen till kursens kodrepo! Här hittar du allt material för de olika veckorna, med kodmaterial vi har gått igenom.

## Struktur

- Varje vecka har en egen mapp med namnet **Vecka X**, där `X` representerar veckonumret.
- Inom varje veckomapp hittar du (oftast):
  - **Förinspelat föreläsningsmaterial** i en undermapp kallad `prerecorded`.
  - **Klassrumsmaterial** i en undermapp kallad `classroom`.

Exempel:

```
Vecka 1/
├── classroom/
│   └── exempel.js
├── prerecorded/
│   └── exempel.js
```

## Hur du använder materialet

1. **Installera Node.js:**
   Många kodexempel använder sig av Node.js och npm. Om du inte redan har det installerat, följ guiden [här](https://nodejs.org/en/download).

2. **Navigera till rätt mapp:**
   För att köra ett kodexempel, öppna terminalen och navigera till den specifika veckomappen och undermappen (`prerecorded` eller `classroom`) där koden finns.

   ```bash
   cd Vecka X/Förinspelad föreläsning
   ```

3. **Installera beroenden:**
   Om mappen innehåller en `package.json`-fil, kör följande kommando för att installera nödvändiga npm-paket:

   ```bash
   npm install
   ```

4. **Kör koden:**
   Följ instruktionerna i koden för att köra den. Exempelvis:
   ```bash
   node exempel.js
   ```
   eller ex.
   ```bash
   npm run dev
   ```

## Uppdateringar

- När nya veckor läggs till i detta repo kommer de automatiskt att synkas till din lokala kopia om du har klonat repot och kör:
  ```bash
  git pull
  ```

## Frågor och support

Om du har problem med att använda materialet, tveka inte att höra av dig via myFei eller maila mig!
