# Mall Shop

A shopping website you walk through like a real shopping mall, built with React, TypeScript and [React Three Fiber](https://r3f.docs.pmnd.rs/) (three.js).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Controls

- **Computer:** click "Enter the mall", then WASD or arrow keys to walk, mouse to look, Shift to run, Esc to pause.
- **Phone or tablet:** joystick at the bottom left to walk, drag anywhere else to look around.

## Project layout

| Path | What it holds |
| --- | --- |
| `src/data/stores.ts` | The stores (name, category, colours, position) and mall dimensions |
| `src/scene/` | 3D scene: the mall building, storefronts, and the first-person player |
| `src/lib/walkable.ts` | Where you can walk (collision with walls, fountain and planters) |
| `src/ui/` | 2D overlay: intro card, location label, minimap, touch joystick |

## Roadmap

1. Walkable mall with storefronts (done)
2. Products on shelves, product panel and cart
3. Supabase backend, sign-in, Stripe Checkout in test mode, admin page
4. Performance, loading screen, 2D catalog fallback, launch

## Deploying

Pushing to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`.
One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
