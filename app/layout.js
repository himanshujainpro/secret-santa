import "./globals.css";

export const metadata = {
  title: "Scans.ai · Virtual Secret Santa 🎁",
  description: "Fun Friday live gifting, zero prep, 90-second pitches, and awards.",
  icons: {
    icon: "/scans-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/scans-logo.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
