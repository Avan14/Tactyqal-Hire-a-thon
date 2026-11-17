import Image from 'next/image';

/**
 * A real screenshot of a student's app, cropped to a consistent frame from
 * the top so the app's header and hero always show. Source images are the
 * live site's success-stories screenshots (1600px WebP in public/apps).
 */
export function Shot({
  src,
  alt,
  sizes = '(max-width: 820px) 90vw, 30vw',
  className = '',
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={`shot ${className}`.trim()}>
      <Image src={src} alt={alt} width={1600} height={880} sizes={sizes} />
    </div>
  );
}
