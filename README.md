# GovBuilt‑Mobile‑Platform

**Description:**  
An Expo-based React Native app for both plateforms android and ios that works seamlessly in both **online** and **offline** modes.

---

## Features

- **Online + Offline Sync**: Smooth functionality whether you're connected or not
- **Secure Login Screen**: Robust authentication flow
- **Code Quality**: Auto-formatting with Prettier and linting with ESLint
- **Environment Variables**: Easy configuration using `.env` files for different environments

---

## Tech Stack

- React Native (via Expo CLI)
- TypeScript
- Prettier & ESLint for formatting and linting
- Offline storage: MMKV, SQLite
- State management: Zustand
- Env config with `.env` files

---

## Getting Started

### Prerequisites

Make sure you have:

- **Node.js** (v16 or above)
- \*\*Java 17
- **Expo CLI**
- **Yarn** or **npm**

### Clone & Install

```bash
git clone https://github.com/GovBuilt/GovBuilt-Mobile-Platform.git
cd GovBuilt-Mobile-Platform
npm install    # or yarn install


### Available Scripts

npm start            # Launch Expo dev server
npm run android      # Run on Android emulator/device
npm run ios          # Run on iOS simulator (macOS only)
npm run prepare      # Install Husky pre-commit hooks
npm run lint         # Run ESLint across .ts, .tsx, .js, .jsx
npm run format       # Auto-format code with Prettier
npm run format:check # Check formatting without writing changes


## Project Structure

GovBuilt-Mobile-Platform/
├── App.tsx              — Main entry point of the React Native app
├── index.js             — Bootstrap file that registers App with Expo/React Native
├── README.md            — Project documentation
├── package.json         — NPM scripts and dependencies
├── tsconfig.json        — TypeScript configuration
├── metro.config.js      — Metro bundler configuration
├── .eslintrc.js         — ESLint configuration
├── .prettierrc.js       — Prettier configuration
├── .prettierignore      — Files/folders ignored by Prettier
├── .gitignore           — Files/folders ignored by Git
├── .npmrc               — NPM registry and package config
├── .java-version        — Java version for native builds
├── declarations.d.ts    — Custom TypeScript types and globals
├── package-lock.json    — Dependency lockfile (for NPM)
├── .husky/              — Git hooks for pre-commit (e.g., lint, format)
├── android/             — Native Android code (Gradle, manifests, Java/Kotlin)
├── ios/                 — Native iOS code (Xcode project, Info.plist, etc.)
├── node_modules/        — Auto-generated NPM dependencies
└── src/                 — Main application source code
    ├── assets/          — Static media (images, fonts, icons)
    ├── components/      — Reusable UI components
    ├── constants/       — Application constants (strings, colors, etc.)
    ├── database/        — Offline/local DB (SQLite, MMKV)
    ├── navigation/      — App navigation config and logic
    ├── screens/         — App screens (Login, Home, etc.)
    ├── services/        — API logic, offline sync, data fetchers
    ├── session/         — Authentication and session flow
    ├── store/           — Global state management (Zustand)
    ├── theme/           — Theming system (fonts, colors, sizes)
    └── utils/           — Helper and utility functions


# Detailed Folder Structure Breakdown

Core Development Area (src/)

The src/ folder is structured into clearly defined sections, each serving a dedicated purpose to ensure scalability and maintainability:

screens/: Contains all screen-level UI components such as Home, Dashboard, and feature-specific views for an intuitive user experience.
services/: Handles backend logic like API calls, location tracking, and account management—critical for smooth business operations.
components/: Reusable UI components like buttons, inputs, headers—ensures design consistency and speeds up development.
utils/: Helper utilities like file pickers or data formatters to make code modular and efficient.
myCase/: Modules for domain-specific features like daily inspections or case handling, enabling modular and scalable growth.
store/: Manages global state using Zustand or Redux—personalizes and persists user interactions.
navigation/: Manages screen-to-screen navigation with structured flow using React Navigation.
dialogs/: Modal dialogs (e.g., filters, confirmations) for user prompts and interactions.
biometrics/: Implements security via fingerprint or facial recognition features.

Supporting Elements
assets/
fonts/: Custom fonts for consistent typography.
images/: Image assets for UI and content.
svgImages/: Scalable vector graphics for resolution-independent visuals.

node_modules/
Automatically managed by the package manager. Holds third-party libraries and dependencies.

Configuration Files
babel.config.js, tsconfig.json: Setup for transpilation and typing.
.eslintrc.js, .prettierrc.js: Enforce code standards and formatting.
.gitignore, .prettierignore: Define files/folders to ignore in Git/Prettier.
.npmrc: Custom NPM settings if applicable.
.java-version: Specifies required Java version.
metro.config.js: Customizes Metro bundler behavior.
declarations.d.ts: Global types and custom definitions.
.husky/: Git hooks for enforcing pre-commit rules.


## Naming Conventions

| Type                       | Naming Style     | Example                 |
|----------------------------|------------------|-------------------------|
| **General folders**        | kebab-case       | `home`, `my-case`       |
| **Utility & hook files**   | camelCase        | `fetchData.ts`, `useForm.ts` |
| **Component files**        | PascalCase       | `CaseItem.tsx`          |
| **CSS Module files**       | PascalCase       | `myCaseStyles.ts`  |
| **Config/static files**    | snake_case       | `theme_config.ts`, `site_data.json` |


```
