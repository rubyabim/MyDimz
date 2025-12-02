# UI Improvements and Theme

What I changed:

- Added a nicer color palette and Tailwind theme extension in `tailwind.config.js` (primary, accent, gradient).
- Imported Poppins font and added global styles in `app/globals.css`.
- Added `btn` and `card` utility classes and improved animations.
- Modernized `Header`, `ProductCard`, `page`, `login`, and `products` pages with responsive UI updates and brand colors.

How to test locally:

1. In PowerShell:

```powershell
cd "d:\Kuliah Informatika\Tugas Akhir\MyDimz\web"
npm install
npm run dev
```

2. Open http://localhost:3000 in your browser.

Notes:

- Tailwind directives are used (`@tailwind base/components/utilities`) so make sure Tailwind is installed and PostCSS is configured in the project (it already is in `package.json`).
- Some compiled `green-xxx` references remain in `.next` (auto-generated build outputs); these will be replaced on the next dev build.
- If you want custom colors or fonts, update `tailwind.config.js` accordingly.

If you want more specific visual changes (e.g., dark mode toggle, product hero image, icons, or real brand colors), tell me and I’ll implement them.