import type { Metadata } from "next";

import ClientPage from "../page";

// "/" server-renders only the intro animation, so the chatbot indexer reads the
// home page sections from here. Not linked anywhere and kept out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function HomeContentPage() {
  return <ClientPage />;
}
