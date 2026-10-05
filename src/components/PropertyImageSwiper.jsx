
import { useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';



export default function PropertyImageSwiper({ images, image, alt }) {
    const uniqueId = useId().replace(/:/g, "");

    // Older listings only have the singular `image` field - normalise both
    // shapes so a real photo is never dropped. No placeholder art is
    // substituted when a listing genuinely has no photo.
    const sliderImages = [...(Array.isArray(images) ? images : []).filter(Boolean), ...(image ? [image] : [])].filter(
        (img, idx, arr) => arr.indexOf(img) === idx
    );

    if (sliderImages.length === 0) {
        return null;
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
                    nextEl: `.swiper-button-next-${uniqueId}`,
                    prevEl: `.swiper-button-prev-${uniqueId}`,
                }}
                loop={sliderImages.length > 1}
                className="w-full h-full"
            >
                {sliderImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                        <img
                            src={img}
                            alt={`${alt} - ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover/swiper:scale-110 transition-transform duration-1000 ease-out"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
            
            {/* Custom Navigation Arrows - Only visible on hover */}
            <button className={`swiper-button-prev-${uniqueId} absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-all hover:bg-white hover:text-indigo-600 shadow-md`}>
                <i className="fas fa-chevron-left text-[10px]"></i>
            </button>
            <button className={`swiper-button-next-${uniqueId} absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-all hover:bg-white hover:text-indigo-600 shadow-md`}>
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
