import "./globals.css";

export const metadata = { title: "Fun Friday · Virtual Secret Santa" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
