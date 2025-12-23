export interface Ability {
  name: string;
  text: string;
  type: string;
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface Legalities {
  unlimited: string;
  standard: string;
  expanded: string;
}

export interface Card {
  id: string;
  name: string;
  supertype: "Pokémon" | "Trainer" | "Energy";
  subtypes?: string[];
  types?: string[];
  hp?: string;
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreatCost?: string[];
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Legalities;
  regulationMark?: string;
  rules?: string[];
  set: {
    id: string;
    name: string;
    ptcgoCode: string;
  };
  number: string;
  images: {
    small: string;
    large: string;
  };
}

export const mockCards: Card[] = [
  // Pokémon
  {
    id: "meg-28",
    name: "Cinderace",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    types: ["Fire"],
    hp: "170",
    attacks: [
      {
        name: "Pyro Ball",
        cost: ["Fire"],
        convertedEnergyCost: 1,
        damage: "50",
        text: "Your opponent's Active Pokémon is now Burned.",
      },
      {
        name: "Burning Shot",
        cost: ["Fire", "Fire", "Colorless"],
        convertedEnergyCost: 3,
        damage: "",
        text: "Discard 2 Energy from this Pokémon. This attack does 170 damage to 1 of your opponent's Pokémon.",
      },
    ],
    weaknesses: [{ type: "Water", value: "×2" }],
    retreatCost: ["Colorless"],
    artist: "5ban Graphics",
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
    regulationMark: "E",
    set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
    number: "28",
    rarity: "Rare",
    images: {
      small: "https://images.pokemontcg.io/swsh8/44.png",
      large: "https://images.pokemontcg.io/swsh8/44_hires.png",
    },
  },
  {
    id: "ssp-119",
    name: "Hydreigon ex",
    supertype: "Pokémon",
    subtypes: ["Stage 2", "ex"],
    types: ["Darkness"],
    hp: "330",
    attacks: [
      {
        name: "Obsidian Fins",
        cost: ["Darkness", "Colorless"],
        convertedEnergyCost: 2,
        damage: "130",
        text: "This attack also does 130 damage to 1 of your opponent's Benched Pokémon.",
      },
    ],
    weaknesses: [{ type: "Grass", value: "x2" }],
    retreatCost: ["Colorless", "Colorless", "Colorless"],
    artist: "5ban Graphics",
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
    regulationMark: "H",
    set: { id: "ssp", name: "Super Spark", ptcgoCode: "SSP" },
    number: "119",
    rarity: "Double Rare",
    images: {
      small: "https://images.pokemontcg.io/sv3pt5/119.png",
      large: "https://images.pokemontcg.io/sv3pt5/119_hires.png",
    },
  },
  {
    id: "pfl-56",
    name: "Mega Gengar ex",
    supertype: "Pokémon",
    subtypes: ["Mega", "ex"],
    types: ["Psychic"],
    hp: "220",
    abilities: [],
    attacks: [
      {
        name: "Phantom Gate",
        cost: ["Psychic", "Colorless", "Colorless"],
        convertedEnergyCost: 3,
        damage: "",
        text: "Choose 1 of your opponent's Active Pokémon's attacks and use it as this attack.",
      },
    ],
    weaknesses: [{ type: "Darkness", value: "x2" }],
    resistances: [{ type: "Fighting", value: "-20" }],
    retreatCost: [], // Free retreat
    artist: "5ban Graphics",
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
    regulationMark: "F",
    set: { id: "pfl", name: "Phantom Forces", ptcgoCode: "PFL" },
    number: "56",
    rarity: "Rare",
    images: {
      small: "https://images.pokemontcg.io/xy4/34.png",
      large: "https://images.pokemontcg.io/xy4/34_hires.png",
    },
  },
  {
    id: "jtg-95",
    name: "Tyranitar",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    types: ["Darkness"],
    hp: "180",
    attacks: [
      {
        name: "Dread Mountain",
        cost: ["Darkness", "Colorless"],
        convertedEnergyCost: 2,
        damage: "60+",
        text: "If your opponent's Active Pokémon is a Pokémon V, this attack does 60 more damage.",
      },
    ],
    weaknesses: [{ type: "Grass", value: "x2" }],
    retreatCost: ["Colorless", "Colorless", "Colorless", "Colorless"],
    artist: "KEIICHIRO ITO",
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
    regulationMark: "G",
    set: { id: "jtg", name: "Johto Guardians", ptcgoCode: "JTG" },
    number: "95",
    images: {
      small: "https://images.pokemontcg.io/pal2/222.png",
      large: "https://images.pokemontcg.io/pal2/222_hires.png",
    },
  },
  {
    id: "meg-105",
    name: "Tatsugiri",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    types: ["Dragon"],
    hp: "70",
    abilities: [
      {
        name: "Attract Customers",
        text: "Once during your turn, if this Pokémon is in the Active Spot, you may look at the top 6 cards of your deck, reveal a Supporter card you find there, and put it into your hand. Shuffle the other cards back into your deck.",
        type: "Ability",
      },
    ],
    attacks: [
      {
        name: "Surf",
        cost: ["Fire", "Water"],
        convertedEnergyCost: 2,
        damage: "50",
        text: "",
      },
    ],
    retreatCost: ["Colorless"],
    artist: "Jerky",
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
    regulationMark: "H",
    set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
    number: "105",
    images: {
      small: "https://images.pokemontcg.io/pal2/46.png",
      large: "https://images.pokemontcg.io/pal2/46_hires.png",
    },
  },

  // Trainers
  {
    id: "pfl-90",
    name: "Grimsley's Move",
    supertype: "Trainer",
    subtypes: ["Supporter"],
    rules: [
      "Choose 1 card from your hand and put it on the bottom of your deck. Then, draw 4 cards.",
    ],
    artist: "Ken Sugimori",
    regulationMark: "F",
    set: { id: "pfl", name: "Phantom Forces", ptcgoCode: "PFL" },
    number: "90",
    images: {
      small: "https://images.pokemontcg.io/xy4/99.png",
      large: "https://images.pokemontcg.io/xy4/99_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "meg-119",
    name: "Lillie's Determination",
    supertype: "Trainer",
    subtypes: ["Supporter"],
    rules: ["Draw cards until you have 6 cards in your hand."],
    artist: "Ken Sugimori",
    regulationMark: "D",
    set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
    number: "119",
    images: {
      small: "https://images.pokemontcg.io/sm1/122.png",
      large: "https://images.pokemontcg.io/sm1/122_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "scr-133",
    name: "Crispin",
    supertype: "Trainer",
    subtypes: ["Supporter"],
    rules: [
      "Search your deck for up to 2 Basic Energy cards of different types and attach them to your Pokémon in any way you like. Then, shuffle your deck.",
    ],
    artist: "Naoki Saito",
    regulationMark: "G",
    set: { id: "scr", name: "Scarlet", ptcgoCode: "SCR" },
    number: "133",
    images: {
      small: "https://images.pokemontcg.io/sv1/169.png",
      large: "https://images.pokemontcg.io/sv1/169_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "meg-114",
    name: "Boss's Orders",
    supertype: "Trainer",
    subtypes: ["Supporter"],
    rules: [
      "Switch 1 of your opponent's Benched Pokémon with their Active Pokémon.",
    ],
    artist: "NC Empire",
    regulationMark: "I",
    set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
    number: "114",
    images: {
      small: "https://images.pokemontcg.io/rcl/154.png",
      large: "https://images.pokemontcg.io/rcl/154_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "blk-84",
    name: "Pokégear 3.0",
    supertype: "Trainer",
    subtypes: ["Item"],
    rules: [
      "Look at the top 7 cards of your deck. You may reveal a Supporter card you find there and put it into your hand. Shuffle the other cards back into your deck.",
    ],
    artist: "Toyste Beach",
    regulationMark: "I",
    set: { id: "blk", name: "Black & White", ptcgoCode: "BLK" },
    number: "84",
    images: {
      small: "https://images.pokemontcg.io/sm10/182.png",
      large: "https://images.pokemontcg.io/sm10/182_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "meg-131",
    name: "Ultra Ball",
    supertype: "Trainer",
    subtypes: ["Item"],
    rules: [
      "Discard 2 cards from your hand. If you do, search your deck for a Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.",
    ],
    artist: "5ban Graphics",
    regulationMark: "E",
    set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
    number: "131",
    images: {
      small: "https://images.pokemontcg.io/sm1/135.png",
      large: "https://images.pokemontcg.io/sm1/135_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "ssp-189",
    name: "Tera Orb",
    supertype: "Trainer",
    subtypes: ["Item"],
    rules: [
      "Search your deck for a Pokémon ex, reveal it, and put it into your hand. Then, shuffle your deck.",
    ],
    artist: "Studio Bora Inc.",
    regulationMark: "G",
    set: { id: "ssp", name: "Super Spark", ptcgoCode: "SSP" },
    number: "189",
    images: {
      small: "https://images.pokemontcg.io/sv3/189.png",
      large: "https://images.pokemontcg.io/sv3/189_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "sfa-61",
    name: "Night Stretcher",
    supertype: "Trainer",
    subtypes: ["Item"],
    rules: ["Put up to 3 Pokémon from your discard pile into your hand."],
    artist: "Oswaldo KATO",
    regulationMark: "H",
    set: { id: "sfa", name: "Shrouded Fable", ptcgoCode: "SFA" },
    number: "61",
    images: {
      small: "https://images.pokemontcg.io/sv6/61.png",
      large: "https://images.pokemontcg.io/sv6/61_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },

  // Energy
  {
    id: "sve-5",
    name: "Psychic Energy",
    supertype: "Energy",
    subtypes: ["Basic"],
    types: ["Psychic"],
    regulationMark: "H",
    set: { id: "sve", name: "Scarlet & Violet Energy", ptcgoCode: "SVE" },
    number: "5",
    images: {
      small: "https://images.pokemontcg.io/sve/5.png",
      large: "https://images.pokemontcg.io/sve/5_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "sve-7",
    name: "Darkness Energy",
    supertype: "Energy",
    subtypes: ["Basic"],
    types: ["Darkness"],
    regulationMark: "H",
    set: { id: "sve", name: "Scarlet & Violet Energy", ptcgoCode: "SVE" },
    number: "7",
    images: {
      small: "https://images.pokemontcg.io/sve/7.png",
      large: "https://images.pokemontcg.io/sve/7_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
  {
    id: "sve-8",
    name: "Metal Energy",
    supertype: "Energy",
    subtypes: ["Basic"],
    types: ["Metal"],
    regulationMark: "H",
    set: { id: "sve", name: "Scarlet & Violet Energy", ptcgoCode: "SVE" },
    number: "8",
    images: {
      small: "https://images.pokemontcg.io/sve/8.png",
      large: "https://images.pokemontcg.io/sve/8_hires.png",
    },
    legalities: { unlimited: "Legal", standard: "Legal", expanded: "Legal" },
  },
];
