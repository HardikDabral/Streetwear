"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import heroImage from "@/public/images/hero3.jpg";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import { motion } from "framer-motion"; // Import framer-motion

const Hero = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Set duration for animations
      once: true, // Ensure animations only happen once
    });
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Image and overlay text container */}
      <div className="relative pt-20 h-[570px] md:h-[660px]"> {/* Reduced height for mobile */}
        <div className="absolute inset-0 zoom-effect">
          <Image
            src={heroImage}
            alt="Female ninja warrior"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            className="z-0"
            priority
          />
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center h-full px-4 text-center space-y-6 md:space-y-8 text-white">
          {/* Flash Sale Text */}
          <p
            className="bg-gradient-to-r from-green-700 to-green-600 text-xs sm:text-sm md:text-md lg:text-md font-extrabold px-4 md:px-6 py-2 rounded-full shadow-xl tracking-wider transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
            data-aos="fade-up"
          >
            FLASH SALE! - 30% OFF ALL ITEMS
          </p>

          {/* Main Headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg text-gradient"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Embrace the Warrior <br /> Within this Winter
          </h1>

          {/* Subheadline */}
          <h3
            className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-semibold drop-shadow-md"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            Discover the Exclusive Winter Collection
          </h3>

          {/* CTA Button with ripple effect */}
          <motion.a
            href="#trending-products"
            className="inline-block mt-6 bg-white text-black font-bold px-8 py-4 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-aos="zoom-in"
            data-aos-delay="700"
          >
            <span className="relative z-10">View Now</span>
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 opacity-20 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeOut",
              }}
            />
          </motion.a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
