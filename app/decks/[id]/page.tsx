import { Metadata } from "next";
import DeckClient, { Deck } from "./client";

// Placeholder deck data - in production this would be fetched from DB
const getMockDeck = (id: string): Deck => {
  // Empty deck for now - will be populated from database later
  return {
    id,
    name: "Sample Deck",
    author: "User",
    cards: [],
    description:
      "A sample deck. In production, this would be loaded from the database.",
  };
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const deck = getMockDeck(id);

  return {
    title: `${deck.name} by ${deck.author}`,
    description: deck.description,
    openGraph: {
      title: `${deck.name} | Pokemon TCG ID Deck`,
      description: deck.description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${deck.name} | Pokemon TCG ID Deck`,
      description: deck.description,
    },
  };
}

export default async function Page({ params }: Props) {
  const id = (await params).id;
  const deck = getMockDeck(id);

  return <DeckClient initialDeck={deck} />;
}
