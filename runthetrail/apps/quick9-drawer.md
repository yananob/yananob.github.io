# Quick9 Drawer

A fast, keyboard-driven Android app drawer inspired by App Swap. Use the T9 keypad interface to search and launch apps at lightning speed.

## Core Features

- **T9 Incremental Search**: Quickly narrow down apps using a 3x4 T9 keypad. Supports English and normalized characters (removal of accents).
- **Auto-Launch (Zero-Tap)**: Automatically launches the app if the search query is 2 or more characters long and there is exactly one candidate.
- **Frequency-Based Sorting**: Prioritizes apps with higher launch counts. Ties are broken by ascending name order.
- **Biometric App Lock**: Protect specific apps using Android's biometric authentication (Fingerprint, Face, PIN). (Requires Pro upgrade).
- **Transparent UI**: A modern dialog-style interface with a transparent background.
- **Guide Display**: Long-press any button on the T9 keypad to see a hover description of its function.
- **Persistent Cache & Auto-Update**: Achieves fast startup by caching app metadata in JSON format. Automatically updates the cache when app configuration changes (install/uninstall) are detected at startup.
- **Manual Cache Refresh**: Rebuild the cache manually from the settings screen if the app list is not up-to-date.
- **Debug Error Display**: In debug builds, displays a detailed stack trace if data export/import fails, allowing it to be copied to the clipboard.

## External Specifications

### Search and Filtering
- **Algorithm**: Supports prefix matching for the entire app name or each word (delimited by spaces, hyphens, underscores, dots).
- **T9 Mapping**: Standard mapping (2: ABC, 3: DEF, 4: GHI, 5: JKL, 6: MNO, 7: PQRS, 8: TUV, 9: WXYZ).
- **Normalization**: Search is case-insensitive and ignores diacritical marks (e.g., "á" matches "a").

### Auto-Launch Conditions
The app will automatically launch if all the following conditions are met:
1. The numeric query length is **2 or more characters**.
2. There is **exactly one** app candidate after filtering.

### Pro Upgrade (Paid Option)
The "App Lock" feature is provided as a paid option (Pro upgrade).
- **Price**: $1
- **Upgrade Method**: Select "Upgrade to Pro ($1)" from the settings dialog (`#` key) and purchase via the Google Play Store.
- **Functionality**: Pro upgrade enables locking and unlocking of apps.

### UI and Operations
- **T9 Keypad**:
    - **Long-press** each key to display its functional description.
    - `1` (backspace): Backspace (delete one character)
    - `*` (clear): Clear query
    - `0` (hide): Hide keypad (expand app list)
    - `#` (config): Show settings dialog
- **App Icons**:
    - **Single Tap**: Launch app (shows biometric authentication if locked).
    - **Long Press**: Toggle app lock on/off.
- **Auto-Reset**: Automatically shows the keypad and resets the scroll position to the top when the query changes or the app returns to the foreground.

## Project Structure

The project follows a simplified Clean Architecture using manual Dependency Injection (DI).

```
app/src/main/java/io/github/yananob/quick9drawer/
├── data/           # Specific implementation of the data layer
│   └── AppRepositoryImpl.kt  # Handling PackageManager and SharedPreferences
├── domain/         # Business logic layer (Pure Kotlin/Android Interface)
│   ├── AppInfo.kt            # App data model
│   ├── AppRepository.kt      # Repository interface
│   ├── SearchAppUseCase.kt   # Search algorithm and auto-launch logic
│   └── SearchResult.kt       # Search result including highlight range
└── presentation/   # UI layer (Jetpack Compose)
    ├── MainActivity.kt       # Entry point and manual DI implementation
    ├── MainViewModel.kt      # State management and search orchestration
    ├── MainScreen.kt         # Main UI layout
    └── T9Keypad.kt           # Custom T9 keypad component
```

## Implementation Policies

- **Error Handling**: When an error occurs, implement detailed logs that can be copied to the clipboard to help users identify the cause. Especially in debug builds, display an error dialog including the stack trace.

## Technical Details

### Persistence
Data is saved in the following four `SharedPreferences` files:
- `app_usage`: Stores launch counts and last-used timestamps.
- `app_cache`: Caches app metadata in JSON format to speed up initial startup.
- `app_lock`: Stores the lock status (boolean) for each app.
- `app_premium`: Stores the Pro upgrade purchase status.

### Dependency Injection (DI)
Manual DI is performed within `MainActivity` using `ViewModelProvider.Factory`. Hilt and KSP were removed for build simplification and environment compatibility.

### Key Libraries
- **Jetpack Compose**: Modern UI toolkit.
- **Material 3**: Latest design components.
- **Biometric**: AndroidX Biometric library for secure app locking.
- **Coroutines & Flow**: Reactive and asynchronous data processing.

## Build and Development

### Requirements
- **JDK**: 17
- **Android SDK**: Compile SDK 36, Target SDK 36, Min SDK 28

### Key Commands
- **Build Debug APK**: `./gradlew assembleDebug`
- **Run Unit Tests**: `./gradlew test`
- **Clean Project**: `./gradlew clean`

### Switching Pro Mode in Debug Builds
In debug builds, you can easily toggle Pro mode (purchased state).
1. Open the settings screen (`#` key).
2. Tap the word "access" in the description **6 times**.
3. Wait for **1 second** (tapping 7 or more times will reset the count).
4. The Pro mode state will flip. You can check the current state by the "Pro Status" in the settings screen or the display of the purchase button.

## License
MIT License
