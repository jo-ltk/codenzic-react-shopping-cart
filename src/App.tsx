import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Grain } from "@/components/Grain";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { CataloguePage } from "@/pages/CataloguePage";
import { ProductPage } from "@/pages/ProductPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    const scrollToHash = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scrollToHash()) return;

    // Target may not be mounted yet (e.g. navigating from /about → /#collection).
    const raf = requestAnimationFrame(() => {
      if (scrollToHash()) return;
      window.setTimeout(scrollToHash, 120);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

function ObjectsRedirect() {
  const { productId } = useParams();
  return <Navigate to={`/catalogue/${productId}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SmoothScroll>
        <Grain />
        <Cursor />
        <Nav />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalogue" element={<CataloguePage />}>
            <Route path=":productId" element={<ProductPage />} />
          </Route>
          <Route path="/objects" element={<Navigate to="/catalogue" replace />} />
          <Route path="/objects/:productId" element={<ObjectsRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  );
}
