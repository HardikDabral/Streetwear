import React from 'react';

const FooterModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-[#2d2d2d] p-6 rounded-lg shadow-lg max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-300 hover:text-gray-100 font-semibold text-3xl sm:text-4xl md:text-5xl"
                >
                    &times;
                </button>
                <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-4 text-center sm:text-xl md:text-2xl text-white">
                    {message}
                </h2>
            </div>
        </div>
    );
};

export default FooterModal;
