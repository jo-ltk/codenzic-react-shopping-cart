import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Grain } from "@/components/Grain";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HomePage } from "@/pages/HomePage";
import { CataloguePage } from "@/pages/CataloguePage";
import { ProductPage } from "@/pages/ProductPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
          <Route path="/catalogue" element={<CataloguePage />}>
            <Route path=":productId" element={<ProductPage />} />
          </Route>
          <Route path="/objects" element={<Navigate to="/catalogue" replace />} />
          <Route path="/objects/:productId" element={<ObjectsRedirect />} />
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  );
}
