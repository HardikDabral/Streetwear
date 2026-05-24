import About from "./components/About/About";
import Explore from "./components/Explore/Explore";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import Products from "./components/Products/Products";
import TrendingProducts from "./components/TrendingProducts/TrendingProducts";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <TrendingProducts />
      <Explore />
      <Products />
      <Footer />
    </>
  );
}
