import Image from 'next/image';
import { LOGO_SRC } from '@/lib/constants';

export default function BrandLogo({ size = 40, className = '', priority = false }) {
  return (
    <Image
      src={LOGO_SRC}
      alt="RentzyPro logo"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
