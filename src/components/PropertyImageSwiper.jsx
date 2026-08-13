import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const PREMIUM_FALLBACKS = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80"
];

export default function PropertyImageSwiper({ images, alt }) {
    let sliderImages = images && images.length > 0 ? [...images] : [];
    
    if (sliderImages.length === 0) {
        return (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <i className="fas fa-image text-slate-300 text-3xl"></i>
            </div>
        );
    }

    if (sliderImages.length <= 1) {
        // Pad with premium real estate photos to ensure the swiper shows multiple images
        const extra = PREMIUM_FALLBACKS.filter(img => !sliderImages.includes(img));
        sliderImages = [...sliderImages, ...extra.slice(0, 3 - sliderImages.length)];
    }

    return (
        <div className="relative w-full h-full group/swiper">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ 
                    clickable: true,
                    dynamicBullets: true 
                }}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                loop={sliderImages.length > 1}
                className="w-full h-full"
            >
                {sliderImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                        <Image
                            src={img}
                            alt={`${alt} - ${idx + 1}`}
                            width={1600}
                            height={900}
                            className="w-full h-full object-cover group-hover/swiper:scale-110 transition-transform duration-1000 ease-out"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
            
            {/* Custom Navigation Arrows - Only visible on hover */}
            <button className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-all hover:bg-white hover:text-indigo-600 shadow-md">
                <i className="fas fa-chevron-left text-[10px]"></i>
            </button>
            <button className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-all hover:bg-white hover:text-indigo-600 shadow-md">
                <i className="fas fa-chevron-right text-[10px]"></i>
            </button>

            <style jsx global>{`
                .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.6;
                }
                .swiper-pagination-bullet-active {
                    opacity: 1;
                    width: 16px !important;
                    border-radius: 4px !important;
                    background: white !important;
                }
            `}</style>
        </div>
    );
}
