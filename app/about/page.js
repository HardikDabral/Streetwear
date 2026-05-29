import About from "../components/About/About";
import Footer from "../components/Footer/Footer";

export const metadata = {
  title: "About — Karmic",
  description:
    "Welcome to Karmic. We're dedicated to crafting premium streetwear that lets you embrace the warrior within.",
};

export default function AboutPage() {
  return (
    <>
      <div className="pt-16">
        <About />
      </div>
      <Footer />
    </>
  );
}
