"use client"

import React, { useState } from 'react';
import FooterModal from './FooterModal'; // Import FooterModal correctly

const Footer = () => {
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const openTermsModal = () => setIsTermsModalOpen(true);
    const openHelpModal = () => setIsHelpModalOpen(true);
    const closeModal = () => {
        setIsTermsModalOpen(false);
        setIsHelpModalOpen(false);
    };

    return (
        <div className="bg-black text-white p-4 text-center mt-0 relative">
            <div className="mb-4 mt-8">
                &copy; Copyright | All Rights Reserved <br /> KARMIC VISION
            </div>

            {/* Updated flex layout for buttons */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
                <button 
                    onClick={openTermsModal}
                    className="hover:underline hover:text-gray-300 transition-colors"
                >
                    Terms & Conditions
                </button>
                <button
                    onClick={openHelpModal}
                    className="hover:underline hover:text-gray-300 transition-colors"
                >
                    Help & Support
                </button>
            </div>

            {isTermsModalOpen && (
                <FooterModal
                    message="We take great pride in the quality of our products. If your product arrives damaged or defective, we offer a one-time exchange for a like-for-like item. Please note, we do not offer refunds under any circumstances. For product exchanges, please contact us within 14 days of receiving your item. Any exchange requests made after this period may be declined. For any concerns or issues, please contact us at example@gmail.com or send us a direct message on our Instagram page."
                    onClose={closeModal}
                />
            )}

            {isHelpModalOpen && (
                <FooterModal
                    message="For any queries, issues, or assistance, feel free to contact us via email at example@gmail.com or send us a direct message on Instagram. We strive to respond to all inquiries within 48 hours. Your satisfaction is our priority."
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default Footer;
