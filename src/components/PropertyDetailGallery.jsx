"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export default function PropertyDetailGallery({ images, title }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const list = Array.isArray(images) ? images.filter(Boolean) : [];
    const dialogRef = useRef(null);
    useEffect(() => { setCurrentIndex(0); }, [images]);
    useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.querySelector('button')?.focus();
        const handleKey = event => {
            if (event.key === 'Escape') setIsOpen(false);
            if (event.key === 'ArrowRight' && list.length) setCurrentIndex(index => (index + 1) % list.length);
            if (event.key === 'ArrowLeft' && list.length) setCurrentIndex(index => (index - 1 + list.length) % list.length);
            if (event.key === 'Tab') {
                const buttons = dialogRef.current?.querySelectorAll('button');
                if (!buttons?.length) return;
                const first = buttons[0], last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
    }, [isOpen, list.length]);

    const handleNext = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % list.length);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Main Stage */}
            <div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[550px] rounded-[32px] overflow-hidden group shadow-2xl border border-slate-100 dark:border-white/5 bg-slate-900">
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex gap-2 z-30 pointer-events-none">
                    <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-600 text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">Verified</span>
                    <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white/90 backdrop-blur-md text-slate-900 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Premium</span>
                </div>

                <AnimatePresence mode="wait">
                    {list.length > 0 ? (
                        <motion.img
                            key={currentIndex}
                            src={list[currentIndex]}
                            alt={`${title} - image ${currentIndex + 1}`}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="w-full h-full object-cover cursor-zoom-in"
                            onClick={() => setIsOpen(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-600">
                            <i className="fas fa-image text-4xl sm:text-5xl"></i>
                            <p className="text-xs sm:text-sm font-semibold">No photos uploaded by the owner yet</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Counter Badge */}
                {list.length > 0 && (
                    <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/10 shadow-lg">
                        {currentIndex + 1} / {list.length}
                    </div>
                )}

                {/* Fullscreen Button */}
                {list.length > 0 && (
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-lg"
                    >
                        <Maximize2 size={16} />
                    </button>
                )}

                {/* Left/Right Navigation */}
                {list.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all active:scale-90 shadow-xl opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all active:scale-90 shadow-xl opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails Row */}
            {list.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-none snap-x">
                    {list.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-2xl overflow-hidden flex-shrink-0 transition-all snap-start ${
                                idx === currentIndex
                                    ? "ring-4 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-950 scale-105"
                                    : "opacity-60 hover:opacity-100 border border-slate-200 dark:border-white/10"
                            }`}
                        >
                                    <Image src={img} width={112} height={64} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isOpen && list.length > 0 && typeof document !== "undefined" && createPortal(
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${title || 'Property'} image gallery`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between items-center p-4 sm:p-6"
                    >
                        {/* Top Bar / Close Button */}
                        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-[100000] pointer-events-none">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-300 drop-shadow-md truncate pr-4 pointer-events-auto mt-2 sm:mt-0">
                                {title}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close image viewer"
                                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-white/10 hover:bg-rose-600 transition-colors flex items-center justify-center text-white border border-white/20 backdrop-blur-md shadow-2xl pointer-events-auto active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Main Lightbox Display */}
                        <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 min-h-[300px]">
                            <motion.img
                                key={currentIndex}
                                src={list[currentIndex]}
                                alt=""
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                            />

                            {/* Lightbox Navigation */}
                            <button
                                onClick={handlePrev}
                                className="absolute left-2 sm:-left-6 md:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/50 sm:bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-95 border border-white/20 sm:border-white/10 z-50"
                            >
                                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 sm:-right-6 md:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/50 sm:bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-95 border border-white/20 sm:border-white/10 z-50"
                            >
                                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                        </div>

                        {/* Lightbox Thumbnails */}
                        <div className="w-full max-w-3xl flex gap-3 overflow-x-auto justify-start sm:justify-center py-4 scrollbar-none snap-x mt-auto">
                            {list.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`relative h-14 w-20 sm:h-16 sm:w-28 rounded-xl overflow-hidden flex-shrink-0 transition-all snap-start ${
                                        idx === currentIndex
                                            ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 opacity-100"
                                            : "opacity-40 hover:opacity-100"
                                    }`}
                                >
                            <Image src={img} width={128} height={80} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    );
}
