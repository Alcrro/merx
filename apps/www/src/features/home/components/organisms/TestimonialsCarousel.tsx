'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  metric: string
  initials: string
}

interface Props {
  items: Testimonial[]
}

export function TestimonialsCarousel({ items }: Props) {
  const autoplay = useRef(Autoplay({ delay: 5500, stopOnInteraction: false }))
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', duration: 50 }, [autoplay.current])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const onMouseEnter = useCallback(() => autoplay.current.stop(), [])
  const onMouseLeave = useCallback(() => autoplay.current.play(), [])

  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {items.map((item) => (
            <div
              key={item.name}
              className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_26%] min-w-0 pl-4"
            >
              <figure className="flex flex-col h-full rounded-xl border border-line-strong bg-surface-elevated p-4 shadow-sm">
                <blockquote className="flex-1">
                  <p className="text-xs leading-relaxed text-fg-muted">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </blockquote>

                <div className="mt-4 pt-4 border-t border-line flex items-center gap-2.5">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary-subtle flex items-center justify-center text-[10px] font-bold text-primary">
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-fg truncate">{item.name}</p>
                    <p className="text-[10px] text-fg-subtle truncate">{item.role} · {item.company}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-primary bg-primary-subtle px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.metric}
                  </span>
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={scrollPrev}
          aria-label="Previous"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface-elevated text-fg-muted hover:text-fg hover:border-line transition-colors"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M10.06 3.47a.75.75 0 0 1 0 1.06L6.59 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L4.47 8 9 3.47a.75.75 0 0 1 1.06 0z" />
          </svg>
        </button>

        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-fg-subtle opacity-40 hover:opacity-70'
              }`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          aria-label="Next"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface-elevated text-fg-muted hover:text-fg hover:border-line transition-colors"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M5.94 3.47a.75.75 0 0 0 0 1.06L9.41 8 5.94 11.47a.75.75 0 1 0 1.06 1.06L11.53 8 7 3.47a.75.75 0 0 0-1.06 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
