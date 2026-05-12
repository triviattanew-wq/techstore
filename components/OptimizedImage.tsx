import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
}: OptimizedImageProps) {
  if (!src) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100',
        fill ? 'absolute inset-0' : 'w-full h-full',
      )} />
    )
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn('absolute inset-0 w-full h-full object-cover', className)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('max-w-full', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
