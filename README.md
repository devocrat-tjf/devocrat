# DEVOCRAT — The Joint Family

One family, twelve worlds. A galaxy intro, a 3D solar system of 12 planets, and a themed website for each world.

## Folder structure

```
index.html              The page itself (small — just the frame).
css/style.css           All styling. Each world has its own block, e.g. "theme-kids".
js/content.js           ★ ALL TEXT: headlines, About, Services, prototypes, names, phone, email.
js/languages.js         Bilingual button labels (desktop hover feature).
js/app.js               How the worlds work (pages, lab, form, scroll scenes, photo frames).
js/effects.js           Cursor and floating theme icons.
js/universe.js          Galaxy, intro text, solar system and planets (3D).
js/universe-fallback.js Simple world buttons if 3D can't start.
images/logo.png         DEVOCRAT logo (transparent background).
images/planets/*.webp   Planet surfaces, one per world (2:1 images).
images/team/*.webp      Designer (-des) and developer (-dev) photos per world.
apps/*.html             The four prototypes shown in the virtual lab.
```

World ids used in file names: `modern elegant hospital salon illus mandala interior arch funny kids auto future`
(elegant = Luxury, illus = Illustrative, arch = Architect, auto = Automotive, future = Futuristic).

## Common changes

| I want to change… | Edit |
|---|---|
| Hero headline / line under it / section headings | `js/content.js` → `WORLD_COPY` |
| About text and the three cards | `js/content.js` → `ABOUT` |
| Services cards | `js/content.js` → `SERVICES` |
| Names, roles, phone numbers | `js/content.js` → `TEAM_ROLES` |
| WhatsApp number or email for the form | `js/content.js` → `ENQUIRY_WHATSAPP`, `ENQUIRY_EMAIL` |
| A planet's picture | Replace `images/planets/<world>.webp` (keep 2:1, same name) |
| A team photo | Replace `images/team/<world>-des.webp` or `-dev.webp` (keep 2:3 portrait, same name) |
| The logo | Replace `images/logo.png` (transparent PNG) |
| Add / replace a prototype | Put the file in `apps/<id>.html` and add it to `appMeta` + `APP_BLURB` in `js/content.js` |
| Colours or fonts of one world | `css/style.css` → search for `theme-<world>` |

Rules when editing `content.js`: keep every quote `"`, comma `,` and bracket `[ ] { }`. If the page goes blank after
an edit, a comma or quote is usually missing — undo the last change.

Images: `.webp` keeps them small. If you use a `.jpg` or `.png` instead, update the path in `js/content.js`
(`PLANET_IMAGES` or `TEAM_PHOTOS`).

## Preview on your computer

Double-clicking `index.html` will **not** run the 3D universe (browsers block it for local files). Use a tiny local server:

- **VS Code:** install the "Live Server" extension → right-click `index.html` → *Open with Live Server*.
- **Or Python:** open a terminal in this folder and run `python -m http.server 8000`, then visit http://localhost:8000

## After hosting

- Clear the browser cache (or open a private window) to see changes right away.
- The intro plays once per browser session; open a new private window to watch it again.
