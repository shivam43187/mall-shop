import type { StoreId } from './stores'

export interface Keeper {
  name: string
  skin: string
  hair: string
  /** What they say when you walk in. */
  greeting: string
  /** Today's offer, shown after the greeting. */
  deal: string
}

export const KEEPERS: Record<StoreId, Keeper> = {
  fashion: { name: 'Priya', skin: '#c68e6a', hair: '#2b1b14', greeting: 'Welcome to Thread & Co!', deal: 'New summer dresses just arrived — try the coral one.' },
  electronics: { name: 'Arjun', skin: '#a8754f', hair: '#1a1a1a', greeting: 'Hi! Welcome to Volt.', deal: 'The wireless headphones are our best seller this week.' },
  home: { name: 'Meera', skin: '#d9a47e', hair: '#4a2c1d', greeting: 'Welcome to Nest Home.', deal: 'Our stoneware mugs come in three new glazes.' },
  books: { name: 'Kabir', skin: '#b98260', hair: '#3b3b3b', greeting: 'Welcome to Paper Lane!', deal: '"The Quiet River" is this month’s book club pick.' },
  sports: { name: 'Rohan', skin: '#9c6a48', hair: '#141414', greeting: 'Hey! Welcome to Peak Sports.', deal: 'Grab a steel bottle with any pair of running shoes.' },
  beauty: { name: 'Ananya', skin: '#e0b08f', hair: '#3a1f1a', greeting: 'Hello, welcome to Glow.', deal: 'Try the Bloom perfume — there’s a tester on the table.' },
  toys: { name: 'Vikram', skin: '#b07a55', hair: '#26180f', greeting: 'Welcome to Playbox!', deal: 'The pull-back race cars are a hit with kids.' },
  grocery: { name: 'Lakshmi', skin: '#a36f4c', hair: '#101010', greeting: 'Namaste! Welcome to Fresh Market.', deal: 'Shimla apples came in fresh this morning.' },
}
