import type { StoreId } from './stores'

export type ModelKind =
  | 'tshirt' | 'jeans' | 'dress' | 'shoe'
  | 'phone' | 'tablet' | 'laptop' | 'headphones' | 'watch' | 'speaker'
  | 'lamp' | 'mug' | 'cushion' | 'vase' | 'candle' | 'clock'
  | 'book'
  | 'ball' | 'dumbbell' | 'bottle' | 'racket'
  | 'perfume' | 'lipstick' | 'jar'
  | 'teddy' | 'car' | 'blocks'
  | 'apple' | 'carton' | 'bread'

export interface Colour {
  name: string
  hex: string
}

export interface Product {
  id: string
  storeId: StoreId
  name: string
  /** Price in Indian rupees. */
  price: number
  description: string
  kind: ModelKind
  /** Colour options; the first is the default and the one shown on the shelf. */
  colours: Colour[]
  sizes?: string[]
}

const C = (name: string, hex: string): Colour => ({ name, hex })
const CLOTHES = ['XS', 'S', 'M', 'L', 'XL']
const SHOES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10']

export const PRODUCTS: Product[] = [
  // Thread & Co — Fashion
  { id: 'tee-classic', storeId: 'fashion', name: 'Classic Cotton Tee', price: 799, kind: 'tshirt', description: 'Soft 100% cotton crew-neck tee with a relaxed fit.', colours: [C('White', '#f5f5f5'), C('Black', '#212121'), C('Navy', '#283593')], sizes: CLOTHES },
  { id: 'jeans-slim', storeId: 'fashion', name: 'Slim Fit Jeans', price: 1999, kind: 'jeans', description: 'Stretch denim with a slim, tapered leg.', colours: [C('Indigo', '#3949ab'), C('Black', '#263238')], sizes: ['28', '30', '32', '34', '36'] },
  { id: 'dress-summer', storeId: 'fashion', name: 'Summer Midi Dress', price: 2499, kind: 'dress', description: 'Light, flowing midi dress for warm days.', colours: [C('Coral', '#ff7043'), C('Sky', '#4fc3f7'), C('Sage', '#9ccc65')], sizes: CLOTHES },
  { id: 'hoodie', storeId: 'fashion', name: 'Everyday Hoodie', price: 1599, kind: 'tshirt', description: 'Brushed fleece hoodie with a kangaroo pocket.', colours: [C('Grey', '#9e9e9e'), C('Maroon', '#880e4f')], sizes: CLOTHES },
  { id: 'sneaker-canvas', storeId: 'fashion', name: 'Canvas Sneakers', price: 1799, kind: 'shoe', description: 'Low-top canvas sneakers with a cushioned sole.', colours: [C('White', '#fafafa'), C('Red', '#e53935')], sizes: SHOES },
  { id: 'tee-graphic', storeId: 'fashion', name: 'Graphic Print Tee', price: 899, kind: 'tshirt', description: 'Cotton tee with a bold front print.', colours: [C('Mustard', '#fbc02d'), C('Teal', '#00897b')], sizes: CLOTHES },

  // Volt — Electronics
  { id: 'phone-x', storeId: 'electronics', name: 'Volt X Smartphone', price: 24999, kind: 'phone', description: '6.5" AMOLED display, 128 GB storage, all-day battery.', colours: [C('Graphite', '#37474f'), C('Silver', '#cfd8dc'), C('Blue', '#1e88e5')] },
  { id: 'laptop-air', storeId: 'electronics', name: 'Volt Air 14 Laptop', price: 54999, kind: 'laptop', description: '14" thin and light laptop, 16 GB RAM, 512 GB SSD.', colours: [C('Space Grey', '#546e7a'), C('Silver', '#b0bec5')] },
  { id: 'headphones', storeId: 'electronics', name: 'Wireless Headphones', price: 3499, kind: 'headphones', description: 'Over-ear Bluetooth headphones with noise cancelling.', colours: [C('Black', '#212121'), C('White', '#eeeeee')] },
  { id: 'watch', storeId: 'electronics', name: 'Fit Smartwatch', price: 4999, kind: 'watch', description: 'Heart rate, sleep and step tracking with a 7-day battery.', colours: [C('Black', '#263238'), C('Rose', '#f48fb1')] },
  { id: 'speaker', storeId: 'electronics', name: 'Mini Bluetooth Speaker', price: 1999, kind: 'speaker', description: 'Pocket-sized, water-resistant speaker with deep bass.', colours: [C('Teal', '#26a69a'), C('Orange', '#ff7043')] },
  { id: 'tablet', storeId: 'electronics', name: 'Volt Tab 11', price: 18999, kind: 'tablet', description: '11" tablet for streaming, reading and notes.', colours: [C('Grey', '#607d8b')] },

  // Nest Home — Home & Living
  { id: 'lamp', storeId: 'home', name: 'Arc Table Lamp', price: 1499, kind: 'lamp', description: 'Warm LED table lamp with a fabric shade.', colours: [C('Cream', '#fff3e0'), C('Charcoal', '#424242')] },
  { id: 'mug', storeId: 'home', name: 'Stoneware Mug', price: 349, kind: 'mug', description: 'Hand-glazed 350 ml stoneware mug.', colours: [C('Terracotta', '#d84315'), C('Ocean', '#0277bd'), C('Sand', '#d7ccc8')] },
  { id: 'cushion', storeId: 'home', name: 'Velvet Cushion', price: 699, kind: 'cushion', description: '45 × 45 cm velvet cushion with a soft filler.', colours: [C('Emerald', '#2e7d32'), C('Blush', '#f8bbd0'), C('Mustard', '#f9a825')] },
  { id: 'vase', storeId: 'home', name: 'Ceramic Vase', price: 899, kind: 'vase', description: 'Matte ceramic vase, 25 cm tall.', colours: [C('White', '#fafafa'), C('Olive', '#827717')] },
  { id: 'candle', storeId: 'home', name: 'Scented Candle', price: 499, kind: 'candle', description: 'Sandalwood soy candle, 40-hour burn.', colours: [C('Ivory', '#fffde7')] },
  { id: 'clock', storeId: 'home', name: 'Minimal Wall Clock', price: 1199, kind: 'clock', description: 'Silent-sweep 30 cm wall clock.', colours: [C('Oak', '#a1887f'), C('Black', '#212121')] },

  // Paper Lane — Books
  { id: 'book-novel', storeId: 'books', name: 'The Quiet River (Novel)', price: 399, kind: 'book', description: 'A bestselling story of family and second chances.', colours: [C('Paperback', '#1565c0')] },
  { id: 'book-cook', storeId: 'books', name: 'Everyday Indian Cooking', price: 599, kind: 'book', description: '120 simple, home-style recipes.', colours: [C('Hardcover', '#e65100')] },
  { id: 'book-code', storeId: 'books', name: 'Learn to Code in 30 Days', price: 699, kind: 'book', description: 'A friendly beginner guide to programming.', colours: [C('Paperback', '#2e7d32')] },
  { id: 'book-kids', storeId: 'books', name: 'Stories for Bedtime', price: 299, kind: 'book', description: 'Illustrated short stories for ages 4–8.', colours: [C('Hardcover', '#f9a825')] },
  { id: 'book-history', storeId: 'books', name: 'A Short History of Everything', price: 499, kind: 'book', description: 'The big story of the world in 300 pages.', colours: [C('Paperback', '#6a1b9a')] },
  { id: 'book-journal', storeId: 'books', name: 'Dotted Journal', price: 249, kind: 'book', description: 'A5 dotted notebook, 160 pages.', colours: [C('Black', '#212121'), C('Sage', '#a5d6a7')] },

  // Peak Sports — Sports
  { id: 'football', storeId: 'sports', name: 'Match Football', price: 999, kind: 'ball', description: 'Size 5 machine-stitched football.', colours: [C('White', '#fafafa')] },
  { id: 'basketball', storeId: 'sports', name: 'Street Basketball', price: 1199, kind: 'ball', description: 'Size 7 rubber basketball for outdoor courts.', colours: [C('Orange', '#ef6c00')] },
  { id: 'dumbbells', storeId: 'sports', name: 'Hex Dumbbell 5 kg', price: 1299, kind: 'dumbbell', description: 'Rubber-coated hex dumbbell, sold singly.', colours: [C('Black', '#263238')] },
  { id: 'running-shoe', storeId: 'sports', name: 'Running Shoes', price: 3499, kind: 'shoe', description: 'Lightweight mesh runners with responsive foam.', colours: [C('Blue', '#1e88e5'), C('Lime', '#c0ca33')], sizes: SHOES },
  { id: 'bottle', storeId: 'sports', name: 'Steel Water Bottle', price: 599, kind: 'bottle', description: 'Insulated 750 ml bottle, keeps cold for 24 h.', colours: [C('Teal', '#00897b'), C('Black', '#212121'), C('Pink', '#ec407a')] },
  { id: 'racket', storeId: 'sports', name: 'Badminton Racket', price: 1499, kind: 'racket', description: 'Graphite frame racket, pre-strung.', colours: [C('Red', '#e53935'), C('Blue', '#1e88e5')] },

  // Glow — Beauty
  { id: 'perfume', storeId: 'beauty', name: 'Bloom Eau de Parfum', price: 2299, kind: 'perfume', description: 'Floral fragrance with jasmine and musk, 50 ml.', colours: [C('Rose', '#f48fb1')] },
  { id: 'lipstick', storeId: 'beauty', name: 'Matte Lipstick', price: 549, kind: 'lipstick', description: 'Long-wear matte lipstick.', colours: [C('Ruby', '#c62828'), C('Nude', '#bc8f8f'), C('Berry', '#880e4f')] },
  { id: 'cream', storeId: 'beauty', name: 'Daily Moisturiser', price: 449, kind: 'jar', description: 'Lightweight face cream with SPF 30, 50 g.', colours: [C('White', '#fafafa')] },
  { id: 'shampoo', storeId: 'beauty', name: 'Herbal Shampoo', price: 349, kind: 'bottle', description: 'Gentle shampoo with aloe and amla, 300 ml.', colours: [C('Green', '#66bb6a')] },
  { id: 'cologne', storeId: 'beauty', name: 'Cedar Cologne', price: 1899, kind: 'perfume', description: 'Woody fragrance with cedar and citrus, 50 ml.', colours: [C('Amber', '#ffb300')] },
  { id: 'face-mask', storeId: 'beauty', name: 'Clay Face Mask', price: 399, kind: 'jar', description: 'Purifying kaolin clay mask, 100 g.', colours: [C('Mint', '#80cbc4')] },

  // Playbox — Toys
  { id: 'teddy', storeId: 'toys', name: 'Cuddly Teddy Bear', price: 899, kind: 'teddy', description: 'Extra-soft 30 cm teddy bear.', colours: [C('Brown', '#8d6e63'), C('Cream', '#ffe0b2')] },
  { id: 'race-car', storeId: 'toys', name: 'Pull-Back Race Car', price: 499, kind: 'car', description: 'Die-cast pull-back car that zooms forward.', colours: [C('Red', '#e53935'), C('Yellow', '#fdd835'), C('Blue', '#1e88e5')] },
  { id: 'blocks', storeId: 'toys', name: 'Building Blocks (60 pcs)', price: 1199, kind: 'blocks', description: 'Colourful stacking blocks for ages 3+.', colours: [C('Rainbow', '#e53935')] },
  { id: 'bouncy-ball', storeId: 'toys', name: 'Super Bouncy Ball', price: 149, kind: 'ball', description: 'High-bounce rubber ball.', colours: [C('Purple', '#8e24aa'), C('Green', '#43a047')] },
  { id: 'bunny', storeId: 'toys', name: 'Plush Bunny', price: 749, kind: 'teddy', description: 'Floppy-eared 25 cm plush bunny.', colours: [C('Pink', '#f8bbd0'), C('Grey', '#bdbdbd')] },
  { id: 'truck', storeId: 'toys', name: 'Toy Dump Truck', price: 999, kind: 'car', description: 'Chunky dump truck with a tipping bed.', colours: [C('Orange', '#fb8c00')] },

  // Fresh Market — Grocery
  { id: 'apples', storeId: 'grocery', name: 'Shimla Apples (1 kg)', price: 220, kind: 'apple', description: 'Crisp, sweet apples picked this week.', colours: [C('Red', '#d32f2f')] },
  { id: 'oranges', storeId: 'grocery', name: 'Nagpur Oranges (1 kg)', price: 160, kind: 'apple', description: 'Juicy, easy-peel oranges.', colours: [C('Orange', '#fb8c00')] },
  { id: 'milk', storeId: 'grocery', name: 'Toned Milk (1 L)', price: 68, kind: 'carton', description: 'Fresh toned milk.', colours: [C('Blue', '#42a5f5')] },
  { id: 'juice', storeId: 'grocery', name: 'Mango Juice (1 L)', price: 120, kind: 'carton', description: 'No added sugar Alphonso mango juice.', colours: [C('Yellow', '#ffb300')] },
  { id: 'bread', storeId: 'grocery', name: 'Whole Wheat Bread', price: 55, kind: 'bread', description: 'Soft whole wheat sandwich loaf, 400 g.', colours: [C('Golden', '#d7a35f')] },
  { id: 'honey', storeId: 'grocery', name: 'Wild Forest Honey', price: 349, kind: 'jar', description: 'Raw, unprocessed honey, 500 g.', colours: [C('Honey', '#ffa000')] },
]

export const productById = new Map(PRODUCTS.map((p) => [p.id, p]))

export const formatPrice = (rupees: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rupees)
