# DrishtiPath

Navigate Kumbh using what you can see. This MERN prototype combines English/Hindi visual scanning with an interactive Nashik–Trimbakeshwar landmark map.

## Run locally

Use Node.js 22 or newer. Copy `.env.example` to `.env` and provide `MONGODB_URI` and `GEMINI_API_KEY` if those services are available. Keep `.env` private.

```sh
npm install
npm run seed:landmarks
npm run dev
```

Open http://127.0.0.1:5173. `npm run dev` starts Vite and Express together. To run separately, use `npm run dev:backend` (Express on port 3001) and `npm run dev:frontend` (Vite on port 5173). `npm run build` then `npm start` serves the production bundle from Express. Run `npm test` for API and matching checks.

The server seeds the 15 Nashik records on first connection if missing. `npm run seed:landmarks` is safe to repeat: it inserts missing records, migrates overlapping legacy sample records, and preserves edits to already-migrated records. If MongoDB is unavailable, the API stays online with the bundled 15-point prototype directory, logs the failure, and reports `bundled-prototype` from `/api/health`. Database edits made in this fallback mode are temporary.

## Map and API

The Nashik map supports OpenStreetMap street tiles, Esri World Imagery satellite tiles, 15 typed markers, a coming-soon event selector, geolocation, selected-landmark mode, and sorted nearby places. Map tiles need a network connection; bundled landmark records and markers remain usable if tile loading fails. Distances are Haversine straight-line estimates, with eight-point compass bearings. They are not walking routes and do not account for crowds, closures, or barriers.

- `GET /api/landmarks` — active event directory
- `GET /api/landmarks/:id` — one Nashik landmark
- `GET /api/landmarks/event/:eventId` — event directory; unsupported events return an empty list
- `GET /api/landmarks/nearby?lat=20.00726&lng=73.79249&radius=1000` — sorted nearby points with metres and compass direction
- `POST /api/analyze-location` — Gemini online or Gemma through local Ollama
- `POST /api/landmarks`, `PATCH /api/landmarks/:id` — prototype admin editing

The MongoDB `Landmark` model uses GeoJSON `Point` coordinates in **[longitude, latitude]** order and a `2dsphere` index. Nearby searches use MongoDB `$near`; the memory-only prototype uses the same distance and bearing calculations locally.

After analysis, the model supplies visual clues and, for distinctive permanent sites, a clearly labelled visual landmark hypothesis. A deterministic matcher scores visible name, sector, gate, type, optional GPS evidence, and a visual hypothesis against the landmark directory. Generic or ambiguous scenes return no location. The result page can open a probable match on `/map?selected=<id>`; it never accepts model-generated coordinates. A photo of Trimbakeshwar Temple without readable signage was manually tested with Gemini and matched at 65% confidence, so the UI still asks visitors to verify it on-site.

## Data provenance and limits

Four permanent-place markers use mapped representative coordinates: Ramkund Ghat (20.00726, 73.79249), Tapovan (20.00063, 73.81264), Kalaram Mandir Area (20.00695, 73.79522), and Trimbakeshwar Temple Area (19.93213, 73.53075). They are reference points, not surveyed entrances or safe routes. Sources: [Ramkund locality mapping](https://travelindia-guide.com/cities/nashik/), [Tapovan park](https://www.mypacer.com/parks/214020/tapovan-nashik), [Kalaram Mandir mapped feature](https://mapcarta.com/W361247890), and [Trimbakeshwar Temple mapped feature](https://mapcarta.com/W431774966).

The other 11 points are **prototype placements**: Panchavati Entry Gate, Police Help Booth 01, Medical Camps 01 and 02, Sector 1 Gates A and B, Sadhugram Entry, Main Parking Area, Water Point 01, Trimbakeshwar Ghat, and Information Centre. They are not official event facilities or verified open locations. The generated editorial illustrations are decorative interpretations, not reference photos for recognition. Prayagraj, Haridwar, and Ujjain are shown as coming soon without location data.

Gemini sends the selected photo to its online API. Ollama keeps image inference on the configured local runtime but still needs the browser, Express server, and model running on the device. A machine with insufficient available RAM or GPU memory may not load the configured Gemma vision model. Uploaded photos are held in memory and not saved by this app. Map tiles and fonts require network access; the service worker only caches visited app assets.

The admin workspace has no authentication. Add access control, verified event data, service availability checks, and a genuine pedestrian routing source before any public operational use.
