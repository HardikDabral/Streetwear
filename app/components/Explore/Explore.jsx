"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import exploreImage1 from "@/public/images/explore1.png";
import exploreImage2 from "@/public/images/explore2.png";
import AOS from "aos";
import "aos/dist/aos.css";

const Explore = () => {
    const [hoveredImage, setHoveredImage] = useState(null);

    useEffect(() => {
        AOS.init({
            duration: 1000, // Set duration for animations
            once: true, // Ensure animations only happen once
        });
    }, []);

    return (
        <div className="bg-black text-white py-20 px-4 overflow-x-hidden">
            {/* ExploreUs Section */}
            <div className="hidden md:block">
                <h1
                    className="text-5xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent mb-8"
                    data-aos="fade-up"
                >
                    ExploreUs
                </h1>
                <p
                    className="text-lg md:text-xl text-center mb-12 max-w-3xl mx-auto opacity-80"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    Welcome to our company! We are dedicated to providing the best products and services to our customers.
                    Our mission is to innovate and inspire through our unique offerings.
                </p>
            </div>

            {/* Image section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Image 1 */}
                <div
                    className="relative w-full h-[200px] md:h-[500px] overflow-hidden rounded-lg shadow-xl group"
                    onMouseEnter={() => setHoveredImage("image1")}
                    onMouseLeave={() => setHoveredImage(null)}
                    data-aos="fade-right"
                    data-aos-delay="300"
                >
                    <Image
                        src={exploreImage1}
                        alt="ExploreImage 1"
                        layout="responsive"
                        width={500}
                        height={300}
                        objectFit="cover"
                        objectPosition="center"
                        className="transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-3"
                    />
                    {/* Hover Popup */}
                    {hoveredImage === "image1" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-4 opacity-100 transition-opacity duration-300 z-10">
                            <p className="text-2xl font-semibold text-center">“Fashion is the armor to survive the reality of everyday life.”</p>
                        </div>
                    )}
                </div>


                {/* Image 2 */}
                <div
                    className="relative w-full h-[200px] md:h-[500px] overflow-hidden rounded-lg shadow-xl group"
                    onMouseEnter={() => setHoveredImage("image2")}  
                    onMouseLeave={() => setHoveredImage(null)}
                    data-aos="fade-left"
                    data-aos-delay="300"
                >
                    <Image
                        src={exploreImage2}
                        alt="ExploreImage 2"
                        layout="responsive"
                        width={500}
                        height={300}
                        objectFit="cover"
                        objectPosition="50% 50%" /* Center the image */
                        className="transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-3"
                    />
                    {/* Hover Popup */}
                    {hoveredImage === "image2" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-4 opacity-100 transition-opacity duration-300 z-10">
                            <p className="text-2xl font-semibold text-center">“Clothes aren’t going to change the world, the women who wear them will.”</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Mission statement */}
            <p
                className="text-lg md:text-xl text-center mt-12 max-w-3xl mx-auto text-gray-300"
                data-aos="fade-up"
                data-aos-delay="500"
            >
                Join us on our journey to excellence, where innovation meets passion.
            </p>

            {/* Call to action */}
            <div
                className="text-center mt-12"
                data-aos="zoom-in"
                data-aos-delay="700"
            >
                <a
                    href="#"
                    className="inline-block px-8 py-3 text-lg font-semibold text-black bg-white rounded-full shadow-md transition-transform duration-300 hover:scale-105"
                >
                    Get Started
                </a>
            </div>
        </div>
    );
};

export default Explore;
