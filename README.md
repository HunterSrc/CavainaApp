# CavainaApp (Flutter)

Progetto base Flutter inizializzato per partire rapidamente con sviluppo locale, preview e build.

## Requisiti

- **Flutter SDK** (consigliato canale stable)
- **Dart SDK** (incluso in Flutter)
- Uno tra:
  - Android Studio + Android SDK (per Android)
  - Xcode (per iOS/macOS, solo su macOS)
  - Chrome (per Web)

## Setup locale

1. Clona la repository e entra nella cartella:

   ```bash
   git clone <url-repo>
   cd CavainaApp
   ```

2. Verifica l'ambiente Flutter:

   ```bash
   flutter doctor
   ```

3. Installa le dipendenze:

   ```bash
   flutter pub get
   ```

4. (Opzionale ma consigliato) Se vuoi rigenerare i file piattaforma standard (`android/`, `ios/`, `web/`, ecc.) direttamente da Flutter:

   ```bash
   flutter create .
   ```

## Logo e icona app

- La cartella `assets/brand/LOGO_Ca_Vaina/` contiene i loghi brand.
- L'icona installata dell'app è configurata per usare:
  `assets/brand/LOGO_Ca_Vaina/CAVAINA_LOGO_BADGE.png`
  (corrispondente al badge indicato anche in versione SVG `CAVAINA_LOGO_BADGE-01.svg`).

Per generare le icone launcher native (Android/iOS) dopo aver creato le piattaforme:

```bash
flutter pub get
dart run flutter_launcher_icons
```

## Avvio in locale (preview)

1. Lista dispositivi disponibili:

   ```bash
   flutter devices
   ```

2. Avvio app in debug su dispositivo/emulatore selezionato:

   ```bash
   flutter run
   ```

3. Avvio su web (Chrome):

   ```bash
   flutter run -d chrome
   ```

## Build

### Android APK

```bash
flutter build apk --release
```

Output tipico: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (Play Store)

```bash
flutter build appbundle --release
```

Output tipico: `build/app/outputs/bundle/release/app-release.aab`

### Web

```bash
flutter build web --release
```

Output tipico: `build/web/`

## Test e qualità

- Test widget:

  ```bash
  flutter test
  ```

- Analisi statica:

  ```bash
  flutter analyze
  ```

## Struttura iniziale

- `lib/main.dart` → entrypoint dell'app
- `test/widget_test.dart` → test widget iniziale
- `pubspec.yaml` → dipendenze e metadata progetto
- `analysis_options.yaml` → lint Flutter
- `assets/brand/` → asset identity/brand (logo, icone, immagini istituzionali)
