# Mall Shop

A shopping website you walk through like a real shopping mall, built with React, TypeScript and [React Three Fiber](https://r3f.docs.pmnd.rs/) (three.js).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Controls

- **Computer:** click "Enter the mall", then WASD or arrow keys to walk, mouse to look, Shift to run, Esc to pause. Point the crosshair at a product and click to open it. Press C for your cart.
- **Phone or tablet:** joystick at the bottom left to walk, drag anywhere else to look around, tap a product to open it, tap the cart button at the top left.

## Project layout

| Path | What it holds |
| --- | --- |
| `src/data/stores.ts` | The stores (name, category, colours, position) and mall dimensions |
| `src/data/products.ts` | The product catalog: 6 products per store, prices in ₹, colours and sizes |
| `src/scene/` | 3D scene: the mall building, storefronts, and the first-person player |
| `src/lib/walkable.ts` | Where you can walk (collision with walls, fountain and planters) |
| `src/lib/state.ts` | UI state and the cart (saved in the browser's localStorage) |
| `src/ui/` | 2D overlay: intro card, location label, minimap, touch joystick, product panel, cart, account, admin |
| `api/`, `server/` | Server routes: Stripe checkout, order lookup, Stripe webhook. Run by Vite locally and as Vercel functions |
| `supabase/schema.sql` | Database tables and row-level security rules |

## Setup for checkout and accounts

1. Copy `.env.example` to `.env.local` and fill in the Stripe test key and Supabase values.
2. In Supabase → SQL Editor, run `supabase/schema.sql` once.
3. In Supabase → Authentication → URL Configuration, set **Site URL** to `http://localhost:5173`.
4. Sign up on the site, then make yourself an admin in the SQL Editor:
   `update public.profiles set is_admin = true where email = 'you@example.com';`
5. Restart `npm run dev`. The Account button now shows "Open admin" for you.

Test payments: card `4242 4242 4242 4242`, any future date, any CVC.

## Roadmap

1. Walkable mall with storefronts (done)
2. Products on shelves, product panel and cart (done)
3. Supabase backend, sign-in, Stripe Checkout in test mode, admin page (done)
4. Performance, loading screen, 2D catalog fallback, launch

## Deploying

There is no automatic deploy yet. The plan is to deploy to Vercel once the build is ready (`npm run build` outputs a static site in `dist/`).
