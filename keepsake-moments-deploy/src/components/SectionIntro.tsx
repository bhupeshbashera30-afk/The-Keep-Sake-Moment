type Props = { eyebrow: string; title: string; description: string }
export function SectionIntro({ eyebrow, title, description }: Props) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-4xl leading-tight text-burgundy-950 md:text-6xl">{title}</h2>
      <p className="mt-5 text-sm leading-8 text-burgundy-700 md:text-base">{description}</p>
    </div>
  )
}
