"use client";

import React, { useEffect, useRef, useState } from "react";
import whatsapp from "../../../public/images/whatsapp.png"
import Image from "next/image";

const TrendingProducts = () => {
    const products = [
        { id: 1, name: "Product 1", price: "$50", image: "https://via.placeholder.com/300x400" },
        { id: 2, name: "Product 2", price: "$60", image: "https://via.placeholder.com/300x400" },
        { id: 3, name: "Product 3", price: "$70", image: "https://via.placeholder.com/300x400" },
        { id: 4, name: "Product 4", price: "$80", image: "https://via.placeholder.com/300x400" },
        { id: 5, name: "Product 5", price: "$90", image: "https://via.placeholder.com/300x400" },
        { id: 6, name: "Product 6", price: "$100", image: "https://via.placeholder.com/300x400" },
        { id: 7, name: "Product 7", price: "$90", image: "https://via.placeholder.com/300x400" },
        { id: 8, name: "Product 8", price: "$100", image: "https://via.placeholder.com/300x400" },
    ];

    const [visible, setVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div className="bg-black text-white py-10" ref={sectionRef}>
            <h2 className="text-3xl font-bold text-center mb-8">Trending Products</h2>

            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 lg:gap-10 xl:gap-12">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="bg-white text-black rounded-lg overflow-hidden shadow-lg transition-transform duration-300 transform hover:scale-105 w-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex flex-col"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-[220px] sm:h-[220px] md:h-[240px] lg:h-[330px] object-cover"
                            />
                            <div className="p-2 flex-grow flex flex-col justify-between">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <p className="text-lg font-semibold mt-1">{product.price}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-8">
                <a
                    href=""
                    className="inline-block mt-6 bg-white text-black font-bold px-6 py-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors duration-300"
                >
                    View All Products
                    <Image
                        src={whatsapp}
                        alt="WhatsApp Icon"
                        width={32} 
                        height={32}
                        className="inline-block ml-2 " 
                    />
                </a>
            </div>
        </div>
    );
};

export default TrendingProducts;
