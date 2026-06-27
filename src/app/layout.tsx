import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { BUSINESS } from "@/lib/business";

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
  description: `Saatvik Cars (A unit of Tarang Marketing) — certified pre-owned cars with transparent pricing. Browse BMW, Mercedes, Honda, Toyota, Maruti & more. GSTIN: ${BUSINESS.gstin}.`,
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
      <head suppressHydrationWarning>
        <meta name="darkreader-lock" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        {/* JSON-LD Structured Data — AutoDealer + Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoDealer",
              name: BUSINESS.dealerName,
              parentOrganization: { "@type": "Organization", name: BUSINESS.parentCompany },
              description: "Certified pre-owned cars with transparent pricing. Browse BMW, Mercedes, Honda, Toyota, Maruti & more.",
              url: "https://saatvikcars.in",
              email: BUSINESS.email,
              telephone: BUSINESS.primaryPhone,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Plot 14, Industrial Area",
                addressLocality: "Bilaspur",
                addressRegion: "Chhattisgarh",
                postalCode: "495001",
                addressCountry: "IN"
              },
              vatID: BUSINESS.gstin,
              openingHours: "Mo-Sa 09:00-20:00",
              priceRange: "₹3,00,000 - ₹50,00,000",
              areaServed: "India",
              sameAs: [
                BUSINESS.social.instagram,
                BUSINESS.social.youtube,
                BUSINESS.social.twitter
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} antialiased bg-[#0A0A0A] text-foreground`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var clean=function(root){if(!root||!root.querySelectorAll)return;root.querySelectorAll('[data-darkreader-inline-stroke],[data-darkreader-inline-fill],[data-darkreader-inline-color],[data-darkreader-inline-bgcolor],[data-darkreader-inline-border]').forEach(function(el){Array.prototype.slice.call(el.attributes).forEach(function(attr){if(attr.name.indexOf('data-darkreader-')===0)el.removeAttribute(attr.name)});var style=el.getAttribute('style');if(style&&style.indexOf('--darkreader-')!==-1){var next=style.split(';').filter(function(part){return part.indexOf('--darkreader-')===-1}).join(';').trim();if(next)el.setAttribute('style',next);else el.removeAttribute('style')}})};clean(document);var until=Date.now()+2500;var observer=new MutationObserver(function(){clean(document);if(Date.now()>until)observer.disconnect()});observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','data-darkreader-inline-stroke','data-darkreader-inline-fill','data-darkreader-inline-color','data-darkreader-inline-bgcolor','data-darkreader-inline-border']})}catch(e){}})();`,
          }}
        />
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
