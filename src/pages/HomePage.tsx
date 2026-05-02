import { Link } from 'react-router-dom'
import { Camera, Gift, Moon, PartyPopper, HeartHandshake } from 'lucide-react'
import { InquiryForm } from '../components/InquiryForm'
import { SectionIntro } from '../components/SectionIntro'
import { marqueeItems, packageOptions } from '../lib/data'

const highlights = [
  {
    icon: Camera,
    title: 'Photobooth Rental',
    body: 'Elegant booth styling and guest-friendly experiences for social and brand-led events.',
    link: '/services/photobooth-rental',
  },
  {
    icon: Gift,
    title: 'Hampers & Flower',
    body: 'Luxury gifting collections with flowers, curated pairings, and ready-price selections.',
    link: '/services/hampers-and-flower',
  },
  {
    icon: Moon,
    title: 'Dinner Night',
    body: 'Romantic and intimate dinner experiences styled around mood, detail, and atmosphere.',
    link: '/services/dinner-night',
  },
  {
    icon: PartyPopper,
    title: 'Event & Decor',
    body: 'Birthday, anniversary, proposal, and corporate styling with an editorial sensibility.',
    link: '/services/event-and-decor',
  },
]

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-burgundy-100 bg-[radial-gradient(circle_at_top,_rgba(126,48,71,0.18),_transparent_40%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left — headline */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">Premium event and gifting studio</p>
              <h1 className="mt-6 max-w-4xl font-serif text-6xl leading-[0.92] text-burgundy-950 md:text-8xl">
                Curated moments designed in a timeless burgundy mood.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-burgundy-700 md:text-lg">
                Keepsake Moments creates intimate celebrations, luxury hampers, photobooth installations, dinner nights,
                and custom decor stories for modern clients who want every detail to feel memorable.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white transition hover:bg-burgundy-700"
                >
                  Start your enquiry
                </Link>
                <Link
                  to="/packages"
                  className="rounded-full border border-burgundy-300 px-6 py-3 text-sm text-burgundy-800 transition hover:border-burgundy-500"
                >
                  Explore packages
                </Link>
              </div>
            </div>

            {/* Right — Brand mood block */}
            <div className="relative">
              <div className="overflow-hidden rounded-[2.5rem] bg-burgundy-900 p-10 text-white shadow-[0_32px_80px_rgba(90,20,40,0.35)]">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-burgundy-700 opacity-30 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-burgundy-600 opacity-20 blur-xl" />
                <p className="relative text-xs uppercase tracking-[0.4em] text-white/50">Our story</p>
                <p className="relative mt-5 font-serif text-4xl leading-snug text-white">
                  Every occasion deserves to feel
                  <span className="block italic text-white/70"> deeply considered.</span>
                </p>
                <p className="relative mt-5 text-sm leading-7 text-white/70">
                  We believe celebrations should carry real feeling — not just decoration.
                  Every setup, every hamper, every detail is shaped around the story
                  you want to tell and the memory you want to keep.
                </p>
                <div className="relative mt-8 flex flex-wrap gap-2">
                  {['Photobooth', 'Hampers', 'Dinner Night', 'Décor'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-burgundy-100 bg-white/60 py-4">
          <div className="flex overflow-hidden whitespace-nowrap">
            <div className="flex min-w-full animate-marquee gap-10 px-6">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <span key={`${item}-${index}`} className="font-serif text-3xl text-burgundy-800 md:text-5xl">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid — all 4 */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionIntro
          eyebrow="Services"
          title="A collection of experiences, not just offerings."
          description="Each service is crafted around a different kind of moment — from intimate gifting to full event styling. Fixed-price services can be browsed directly; custom work flows into a guided consultation."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="group rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft transition hover:-translate-y-1 hover:border-burgundy-200 hover:shadow-md"
            >
              <item.icon className="h-7 w-7 text-burgundy-700" />
              <h3 className="mt-6 font-serif text-2xl text-burgundy-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-burgundy-700">{item.body}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-burgundy-600 transition group-hover:text-burgundy-900">
                Discover →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionIntro
                eyebrow="Packages"
                title="Structured packages with room for bespoke refinement."
                description="Browse a package direction, submit the service you want, and the team personalises the details — pricing, styling, and execution — from there."
              />
              <Link
                to="/packages"
                className="mt-8 inline-flex rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white transition hover:bg-burgundy-700"
              >
                View all packages
              </Link>
            </div>
            <div className="grid gap-5">
              {packageOptions.map((option) => (
                <article key={option.name} className="rounded-[2rem] border border-burgundy-100 bg-parchment p-6">
                  <h3 className="font-serif text-2xl text-burgundy-900">{option.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-burgundy-700">{option.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.includes.map((item) => (
                      <span key={item} className="rounded-full border border-burgundy-200 bg-white px-3 py-1 text-xs text-burgundy-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionIntro
              eyebrow="Enquiry"
              title="Tell the team what you are planning."
              description="The booking form captures the basics so the team can respond with a tailored proposal — especially for custom styling, décor, and package requests."
            />
            <div className="mt-8 rounded-[2rem] border border-burgundy-100 bg-burgundy-900 p-8 text-white">
              <HeartHandshake className="h-8 w-8 text-white/60" />
              <p className="mt-5 font-serif text-3xl">A premium consultation-led workflow</p>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Fixed-price sections can still lead to enquiry, while custom work stays flexible and personal
                from the first conversation onward.
              </p>
            </div>
          </div>
          <InquiryForm />
        </div>
      </section>
    </div>
  )
}
