"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

type Photo = { src: string; alt: string }

/** Category photos with a full-screen preview. Arrow keys move between photos. */
export function PhotoGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const [hero, ...rest] = photos
  const index = open ?? 0
  const go = (delta: number) => setOpen((i) => ((i ?? 0) + delta + photos.length) % photos.length)

  return (
    <figure className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen(0)}
        className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-sand"
        aria-label={`View larger: ${hero.alt}`}
      >
        <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink">
          <Expand aria-hidden className="size-4" /> View {photos.length} photos
        </span>
      </button>
      <ul className="grid grid-cols-3 gap-2">
        {rest.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              onClick={() => setOpen(i + 1)}
              className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-sand transition-opacity hover:opacity-85"
              aria-label={`View larger: ${p.alt}`}
            >
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 20vw, 33vw" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <figcaption className="text-sm text-muted-foreground">
        Representative photos. The vehicle you receive may be a different make, model or colour.
      </figcaption>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent
          className="w-[calc(100vw-2rem)] max-w-4xl gap-3 bg-ink p-3 text-white ring-0 sm:max-w-4xl sm:p-4"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1)
            if (e.key === "ArrowLeft") go(-1)
          }}
        >
          <DialogTitle className="pr-10 text-base text-white">
            {name} · photo {index + 1} of {photos.length}
          </DialogTitle>
          <DialogDescription className="sr-only">{photos[index].alt}. Use the arrow keys to move between photos.</DialogDescription>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black sm:aspect-[16/10]">
            <Image src={photos[index].src} alt={photos[index].alt} fill sizes="(min-width: 1024px) 56rem, 100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous photo" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <ChevronLeft aria-hidden />
            </Button>
            <ol className="flex gap-2" aria-label="Photos">
              {photos.map((p, i) => (
                <li key={p.src}>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    className="relative block size-12 overflow-hidden rounded-lg opacity-50 aria-[current=true]:opacity-100 aria-[current=true]:ring-2 aria-[current=true]:ring-white sm:size-14"
                  >
                    <Image src={p.src} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ol>
            <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next photo" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  )
}
