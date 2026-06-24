import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export const metadata: Metadata = {
  title: { default: "Saatvik Cars — Certified Pre-Owned Cars by Tarang Marketing", template: "%s | Saatvik Cars" },
  description: "Saatvik Cars (A unit of Tarang Marketing) — certified pre-owned cars with transparent pricing. Browse BMW, Mercedes, Honda, Toyota, Maruti & more. GSTIN: 22AAWPL4412H1ZQ.",
  keywords: ["Saatvik Cars", "Tarang Marketing", "used cars", "pre-owned cars", "car dealer", "second hand cars", "certified pre-owned", "buy used cars", "car marketplace"],
  authors: [{ name: "Saatvik Cars" }],
  creator: "Saatvik Cars",
  publisher: "Saatvik Cars",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Saatvik Cars — Certified Pre-Owned Cars by Tarang Marketing",
    description: "Saatvik Cars (A unit of Tarang Marketing) — certified pre-owned cars with transparent pricing.",
    url: "https://saatvikcars.in",
    siteName: "Saatvik Cars",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saatvik Cars — Certified Pre-Owned Cars by Tarang Marketing",
    description: "Saatvik Cars (A unit of Tarang Marketing) — certified pre-owned cars with transparent pricing.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://saatvikcars.in",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('saatvik_darkMode');if(d==='false'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* JSON-LD Structured Data — AutoDealer + Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoDealer",
              name: "Saatvik Cars",
              parentOrganization: { "@type": "Organization", name: "Tarang Marketing" },
              description: "Certified pre-owned cars with transparent pricing. Browse BMW, Mercedes, Honda, Toyota, Maruti & more.",
              url: "https://saatvikcars.in",
              email: "saatvikcars@tarangmarketing.in",
              telephone: "+91-96449-24777",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Plot 14, Industrial Area",
                addressLocality: "Bilaspur",
                addressRegion: "Chhattisgarh",
                postalCode: "495001",
                addressCountry: "IN"
              },
              vatID: "22AAWPL4412H1ZQ",
              openingHours: "Mo-Sa 09:00-20:00",
              priceRange: "₹3,00,000 - ₹50,00,000",
              areaServed: "India",
              sameAs: [
                "https://instagram.com/saatvikcars",
                "https://youtube.com/@saatvikcars",
                "https://twitter.com/saatvikcars"
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} antialiased bg-[#0A0A0A] text-foreground`} suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        {children}
        <SonnerToaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#15171C',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 32px -12px rgba(0,0,0,0.6)',
            },
          }}
        />
      </body>
    </html>
  );
}
