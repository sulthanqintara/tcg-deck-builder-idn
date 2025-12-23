export interface Card {
  id: string;
  name: string;
  supertype: "Pokémon" | "Trainer" | "Energy";
  subtypes?: string[];
  types?: string[];
  set: {
    id: string;
    name: string;
    ptcgoCode: string; // Used for export
  };
  number: string;
  rarity?: string;
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
    set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
    number: "28",
    rarity: "Rare",
    images: {
      small: "https://images.pokemontcg.io/swsh8/44.png", // Placeholder image (Cinderace VMAX alt)
      large: "https://images.pokemontcg.io/swsh8/44_hires.png",
    },
  },
  {
    id: "ssp-119",
    name: "Hydreigon ex",
    supertype: "Pokémon",
    subtypes: ["Stage 2", "ex"],
    types: ["Darkness"],
    set: { id: "ssp", name: "Super Spark", ptcgoCode: "SSP" },
    number: "119",
    rarity: "Double Rare",
    images: {
      small: "https://images.pokemontcg.io/sv3pt5/119.png", // Placeholder
      large: "https://images.pokemontcg.io/sv3pt5/119_hires.png",
    },
  },
  {
    id: "pfl-56",
    name: "Mega Gengar ex",
    supertype: "Pokémon",
    subtypes: ["Mega", "ex"],
    types: ["Psychic"],
    set: { id: "pfl", name: "Phantom Forces", ptcgoCode: "PFL" },
    number: "56",
    rarity: "Rare",
    images: {
        small: "https://images.pokemontcg.io/xy4/34.png",
        large: "https://images.pokemontcg.io/xy4/34_hires.png"
    }
  },
  {
      id: "jtg-95",
      name: "Tyranitar",
      supertype: "Pokémon",
      subtypes: ["Stage 2"],
      types: ["Darkness"],
      set: { id: "jtg", name: "Johto Guardians", ptcgoCode: "JTG" },
      number: "95",
      images: {
          small: "https://images.pokemontcg.io/pal2/222.png",
          large: "https://images.pokemontcg.io/pal2/222_hires.png"
      }
  },
  {
      id: "meg-105",
      name: "Delibird",
      supertype: "Pokémon",
      subtypes: ["Basic"],
      types: ["Water"],
      set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
      number: "105",
      images: {
          small: "https://images.pokemontcg.io/pal2/46.png",
          large: "https://images.pokemontcg.io/pal2/46_hires.png"
      }
  },

  // Trainers
  {
    id: "pfl-90",
    name: "Grimsley's Move",
    supertype: "Trainer",
    subtypes: ["Supporter"],
    set: { id: "pfl", name: "Phantom Forces", ptcgoCode: "PFL" },
    number: "90",
    images: {
      small: "https://images.pokemontcg.io/xy4/99.png",
      large: "https://images.pokemontcg.io/xy4/99_hires.png",
    },
  },
  {
      id: "meg-119",
      name: "Lillie's Determination",
      supertype: "Trainer",
      subtypes: ["Supporter"],
      set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
      number: "119",
      images: {
          small: "https://images.pokemontcg.io/sm1/122.png",
          large: "https://images.pokemontcg.io/sm1/122_hires.png"
      }
  },
  {
    id: "scr-133",
    name: "Crispin",
    supertype: "Trainer",
    subtypes: ["Supporter"],
    set: { id: "scr", name: "Scarlet", ptcgoCode: "SCR" },
    number: "133",
    images: {
       small: "https://images.pokemontcg.io/sv1/169.png",
       large: "https://images.pokemontcg.io/sv1/169_hires.png"
    }
  },
  {
      id: "meg-114",
      name: "Boss's Orders",
      supertype: "Trainer",
      subtypes: ["Supporter"],
      set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
      number: "114",
      images: {
          small: "https://images.pokemontcg.io/rcl/154.png",
          large: "https://images.pokemontcg.io/rcl/154_hires.png"
      }
  },
  {
      id: "blk-84",
      name: "Pokégear 3.0",
      supertype: "Trainer",
      subtypes: ["Item"],
      set: { id: "blk", name: "Black & White", ptcgoCode: "BLK" },
      number: "84",
      images: {
          small: "https://images.pokemontcg.io/sm10/182.png",
          large: "https://images.pokemontcg.io/sm10/182_hires.png"
      }
  },
  {
      id: "meg-131",
      name: "Ultra Ball",
      supertype: "Trainer",
      subtypes: ["Item"],
      set: { id: "meg", name: "Mega Sets", ptcgoCode: "MEG" },
      number: "131",
      images: {
          small: "https://images.pokemontcg.io/sm1/135.png",
          large: "https://images.pokemontcg.io/sm1/135_hires.png"
      }
  },
  {
      id: "ssp-189",
      name: "Tera Orb",
      supertype: "Trainer",
      subtypes: ["Item"],
      set: { id: "ssp", name: "Super Spark", ptcgoCode: "SSP" },
      number: "189",
      images: {
          small: "https://images.pokemontcg.io/sv3/189.png", // Corrected place holder
          large: "https://images.pokemontcg.io/sv3/189_hires.png"
      }
  },
  {
      id: "sfa-61",
      name: "Night Stretcher",
      supertype: "Trainer",
      subtypes: ["Item"],
      set: { id: "sfa", name: "Shrouded Fable", ptcgoCode: "SFA" },
      number: "61",
      images: {
          small: "https://images.pokemontcg.io/sv6/61.png", // Corrected place holder
          large: "https://images.pokemontcg.io/sv6/61_hires.png"
      }
  },

  // Energy
  {
    id: "sve-5",
    name: "Psychic Energy",
    supertype: "Energy",
    subtypes: ["Basic"],
    types: ["Psychic"],
    set: { id: "sve", name: "Scarlet & Violet Energy", ptcgoCode: "SVE" },
    number: "5",
    images: {
      small: "https://images.pokemontcg.io/sve/5.png",
      large: "https://images.pokemontcg.io/sve/5_hires.png",
    },
  },
  {
    id: "sve-7",
    name: "Darkness Energy",
    supertype: "Energy",
    subtypes: ["Basic"],
    types: ["Darkness"],
    set: { id: "sve", name: "Scarlet & Violet Energy", ptcgoCode: "SVE" },
    number: "7",
    images: {
      small: "https://images.pokemontcg.io/sve/7.png",
      large: "https://images.pokemontcg.io/sve/7_hires.png",
    },
  },
  {
    id: "sve-8",
    name: "Metal Energy",
    supertype: "Energy",
    subtypes: ["Basic"],
    types: ["Metal"],
    set: { id: "sve", name: "Scarlet & Violet Energy", ptcgoCode: "SVE" },
    number: "8",
    images: {
      small: "https://images.pokemontcg.io/sve/8.png",
      large: "https://images.pokemontcg.io/sve/8_hires.png",
    },
  },
];
