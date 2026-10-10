// Item registry: every item has colour + icon + letter so colour is never the only cue.
export const ITEMS = {
  red: { singular: "red counter", plural: "red counters", short: "Red", icon: "Circle", letter: "R", tone: "red" },
  blue: { singular: "blue counter", plural: "blue counters", short: "Blue", icon: "Square", letter: "B", tone: "blue" },
  yellow: { singular: "yellow counter", plural: "yellow counters", short: "Yellow", icon: "Triangle", letter: "Y", tone: "yellow" },
  green: { singular: "green counter", plural: "green counters", short: "Green", icon: "Diamond", letter: "G", tone: "green" },
  redBall: { singular: "red ball", plural: "red balls", short: "Red", icon: "Circle", letter: "R", tone: "red" },
  blueBall: { singular: "blue ball", plural: "blue balls", short: "Blue", icon: "Square", letter: "B", tone: "blue" },
  greenStar: { singular: "green star", plural: "green stars", short: "Green", icon: "Star", letter: "G", tone: "green" },
  yellowStar: { singular: "yellow star", plural: "yellow stars", short: "Yellow", icon: "Star", letter: "Y", tone: "yellow" },
  apple: { singular: "apple", plural: "apples", short: "Apples", icon: "Apple", letter: "A", tone: "red" },
  banana: { singular: "banana", plural: "bananas", short: "Bananas", icon: "Banana", letter: "B", tone: "yellow" },
  pencil: { singular: "pencil", plural: "pencils", short: "Pencils", icon: "Pencil", letter: "P", tone: "blue" },
  eraser: { singular: "eraser", plural: "erasers", short: "Erasers", icon: "Eraser", letter: "E", tone: "pink" },
  gem: { singular: "gem", plural: "gems", short: "Gems", icon: "Gem", letter: "G", tone: "purple" },
  coin: { singular: "coin", plural: "coins", short: "Coins", icon: "Coins", letter: "C", tone: "yellow" },
  flower: { singular: "flower", plural: "flowers", short: "Flowers", icon: "Flower", letter: "F", tone: "pink" },
  leaf: { singular: "leaf", plural: "leaves", short: "Leaves", icon: "Leaf", letter: "L", tone: "green" },
  cookie: { singular: "cookie", plural: "cookies", short: "Cookies", icon: "Cookie", letter: "C", tone: "orange" },
  sweet: { singular: "sweet", plural: "sweets", short: "Sweets", icon: "Candy", letter: "S", tone: "pink" },
  car: { singular: "toy car", plural: "toy cars", short: "Cars", icon: "Car", letter: "C", tone: "blue" },
  bike: { singular: "toy bike", plural: "toy bikes", short: "Bikes", icon: "Bike", letter: "B", tone: "green" },
  fish: { singular: "fish", plural: "fish", short: "Fish", icon: "Fish", letter: "F", tone: "orange" },
  shell: { singular: "shell", plural: "shells", short: "Shells", icon: "Shell", letter: "S", tone: "purple" },
  cherry: { singular: "cherry", plural: "cherries", short: "Cherries", icon: "Cherry", letter: "C", tone: "red" },
  grape: { singular: "grape", plural: "grapes", short: "Grapes", icon: "Grape", letter: "G", tone: "purple" },
  redApple: { singular: "red apple", plural: "red apples", short: "Red", icon: "Apple", letter: "R", tone: "red" },
  greenApple: { singular: "green apple", plural: "green apples", short: "Green", icon: "Apple", letter: "G", tone: "green" },
};

// Contexts pair two items with a place and a word for "the whole".
export const CONTEXTS = {
  balls: { place: "a box", items: ["redBall", "blueBall"], whole: "balls" },
  counters: { place: "a bag", items: ["red", "blue"], whole: "counters" },
  stars: { place: "a sticker sheet", items: ["greenStar", "yellowStar"], whole: "stars" },
  fruit: { place: "a fruit basket", items: ["apple", "banana"], whole: "fruits" },
  stationery: { place: "a pencil case", items: ["pencil", "eraser"], whole: "items" },
  treasure: { place: "a treasure chest", items: ["gem", "coin"], whole: "treasures" },
  garden: { place: "a garden bed", items: ["flower", "leaf"], whole: "plants" },
  party: { place: "a party plate", items: ["cookie", "sweet"], whole: "treats" },
  toys: { place: "a toy box", items: ["car", "bike"], whole: "toys" },
  pool: { place: "a rock pool", items: ["fish", "shell"], whole: "things" },
  bowl: { place: "a bowl", items: ["cherry", "grape"], whole: "fruits" },
  apples: { place: "a basket", items: ["redApple", "greenApple"], whole: "apples" },
};

export const makeGroups = (ctxKey, aCount, bCount) => {
  const ctx = CONTEXTS[ctxKey];
  if (!ctx) throw new Error(`Unknown context ${ctxKey}`);
  return [
    { key: ctx.items[0], count: aCount, ...ITEMS[ctx.items[0]] },
    { key: ctx.items[1], count: bCount, ...ITEMS[ctx.items[1]] },
  ];
};

export const labelFor = (groups, slot, wholeWord) =>
  slot === "whole" ? `all the ${wholeWord}` : groups.find((g) => g.key === slot).plural;

export const shortLabelFor = (groups, slot, wholeWord) =>
  slot === "whole" ? `All ${wholeWord}` : groups.find((g) => g.key === slot).plural.replace(/^./, (c) => c.toUpperCase());
