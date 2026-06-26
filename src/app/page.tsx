'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/cars/Navbar';
import Hero from '@/components/cars/Hero';
import BrandMarquee from '@/components/cars/BrandMarquee';
import CarCategories from '@/components/cars/CarCategories';
import FeaturedCars from '@/components/cars/FeaturedCars';
import FinanceSection from '@/components/cars/FinanceSection';
import HowItWorks from '@/components/cars/HowItWorks';
import ServicesSection from '@/components/cars/ServicesSection';
import TrustSection from '@/components/cars/TrustSection';
import AboutSection from '@/components/cars/AboutSection';
import Testimonials from '@/components/cars/Testimonials';
import CustomerReviews from '@/components/cars/CustomerReviews';
import BlogSection from '@/components/cars/BlogSection';
import FAQSection from '@/components/cars/FAQSection';
import CTA from '@/components/cars/CTA';
import Footer from '@/components/cars/Footer';
import SellCarModal from '@/components/cars/SellCarModal';
import SellValuationModal from '@/components/cars/SellValuationModal';
import AdminLoginModal from '@/components/cars/AdminLoginModal';
import AdminPanel from '@/components/cars/AdminPanel';
import WishlistDrawer from '@/components/cars/WishlistDrawer';
import LiveChatWidget from '@/components/cars/LiveChatWidget';
import SeoBreadcrumbs from '@/components/cars/SeoBreadcrumbs';

export default function Home() {
  const { hydrate } = useStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="site-premium min-h-screen flex flex-col overflow-x-hidden bg-[#0A0A0A] text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <BrandMarquee />
        <CarCategories />
        <FeaturedCars />
        <FinanceSection />
        <HowItWorks />
        <ServicesSection />
        <TrustSection />
        <AboutSection />
        <Testimonials />
        <CustomerReviews />
        <BlogSection />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
      <SellCarModal />
      <SellValuationModal />
      <AdminLoginModal />
      <AdminPanel />
      <WishlistDrawer />
      <LiveChatWidget />
      <SeoBreadcrumbs />
    </div>
  );
}
