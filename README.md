# Prayer Planner

React + TypeScript + Tailwind CSS (Vite). Responsive planner inspired by the supplied reference.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## GitHub Pages

This project is configured for the repository `hsina027/Planner-Prayer` with Vite base `/Planner-Prayer/`.
Upload the source files at the repository root, including `.github/workflows/deploy.yml` and `package-lock.json`.
In Settings → Pages → Build and deployment, choose **GitHub Actions**.
The workflow installs dependencies, builds `dist`, and publishes it on pushes to `main`.
After a successful deployment, the expected address is https://hsina027.github.io/Planner-Prayer/.
Do not upload `node_modules`, `dist`, `.git`, or `.openai`; GitHub builds the published files itself.
If the repository name changes, update `base` in `vite.config.ts`.

Features: five prayer-to-prayer periods; live AlAdhan city/date timings using fixed verified city coordinates (Morocco method 21); CRUD and date-specific activity completion; daily/weekday recurrence; daily/weekly calendars; completion and planned/completed time statistics; French, Arabic RTL and English; light/dark appearance.

Data is stored only in this browser's localStorage. Sample activities are provided on first use and are editable. Recurring completion is independent for every date. Recurrences begin on their start date. Deleting or editing a recurring activity affects its entire series. Planned minutes and completed minutes represent activity estimates, not a live stopwatch. Isha-to-Fajr capacity uses the following day's Fajr. Unavailable prayer times show an error rather than sample timings. Cached successful timings can be used offline. The selected city determines prayer times; the initial calendar date follows your device's local date. AlAdhan times can differ from local mosque adjustments.

## City and location selection

39 cities are available. Use the crosshair button beside the city selector or the location button in Settings to request browser geolocation. The app chooses the nearest supported city within 75 km, using an on-device distance calculation. Coordinates are not saved or sent to a reverse-geocoding service; prayer requests use the selected city’s fixed coordinates. Outside this area, or if permission is denied or location is unavailable, choose a city manually. Location requires HTTPS or localhost and browser permission. No automatic request is made on startup. Choosing a city manually cancels a pending location result.

## التشغيل بالعربية

من مجلد التطبيق شغّل `npm install` عند التشغيل لأول مرة، ثم `npm run dev`، وافتح الرابط الذي يظهر في Terminal. تبقى نافذة Terminal مفتوحة أثناء الاستخدام.

لتحديد المدينة، اضغط زر تحديد الموقع بجوار قائمة المدن، أو زر «تحديد أقرب مدينة» في الإعدادات، ثم اسمح بالوصول إلى الموقع. يمكنك اختيار المدينة يدوياً في أي وقت.

## Reserved prayer time

Each daily period starts with a separate prayer reservation, 30 minutes by default. Settings lets you choose 5–120 minutes in 5-minute increments. Available activity capacity is the period duration minus the reservation, with a minimum of zero. Prayer windows follow city/date timings, including midnight rollover. They are separate from activity completion statistics. Existing tasks and completions are retained; stored settings without this field default to 30 minutes. Weekly cards summarize five daily prayer reservations.

## Header appearance

Night mode uses a navy sky, a discrete city silhouette, stars and a crescent. The sun/moon button next to Settings toggles the saved appearance in every view and stays available on mobile. Its label describes the destination mode. Decorative elements are hidden from accessibility APIs and do not intercept clicks.

## Dropdown controls

Custom dropdowns have inset chevrons and menus aligned to the field width. Menus flip above the field when needed and stay inside the viewport. Supported keys: arrows, Home/End, Enter/Space, Escape, Tab and typing an option prefix. Click outside closes the menu. Menus match the light/dark theme and support Arabic RTL.
