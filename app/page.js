import About from "./components/About/About";
import Hero from "./components/Hero/Hero";
import TrendingProducts from "./components/TrendingProducts/TrendingProducts";

export default function Home() {
  return (
  <div>
        <Hero />
        <About />
        <TrendingProducts />
    </div>
  );
}
