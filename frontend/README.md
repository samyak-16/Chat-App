# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Tailwind Sucks

## "tailwindcss": "^4.1.12", setUp in lastest "vite": "^7.1.2"

# 1️⃣ Install dependencies

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- tailwindcss → core Tailwind library

- @tailwindcss/vite → official Vite plugin to process Tailwind

# 2️⃣ Create your main CSS file

## Create src/styles/index.css and add:

```bash
@import "tailwindcss";
```

- ✅ No need for @tailwind base, @tailwind components, or @tailwind utilities anymore.

# 3️⃣ Configure Vite

## In vite.config.js:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // processes Tailwind CSS automatically
  ],
});
```

- The plugin scans all your files for Tailwind classes and generates the final CSS.

# 4️⃣ Import CSS in main.jsx

```js
import './styles/index.css';
```

- This ensures Tailwind is applied globally to your app.
