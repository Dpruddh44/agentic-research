import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Assistant — 3D Spatial Knowledge Graph",
  description:
    "An AI-powered research assistant that visualizes knowledge as an interactive 3D spatial graph. " +
    "Powered by Gemini 2.0 Flash, PydanticAI, and Tavily for live web research.",
  keywords: ["research", "AI", "knowledge graph", "3D", "Gemini", "spatial"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
