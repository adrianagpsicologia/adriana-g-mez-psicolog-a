import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import ConsentBanner from "@/components/ConsentBanner";
import { loadGoogleAds } from "@/lib/google-ads";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Portal from "./pages/Portal";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdsBootstrap = () => {
  useEffect(() => {
    void loadGoogleAds();
  }, []);
  return <ConsentBanner />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/reservar" element={<Booking />} />
            <Route path="/reserva-confirmada" element={<BookingSuccess />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AdsBootstrap />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
