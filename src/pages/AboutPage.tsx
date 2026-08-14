export function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 anim-fade-up">
      <section className="relative overflow-hidden rounded-3xl border border-sky-bright/15 bg-gradient-to-br from-ink-panel/80 via-ink-soft/70 to-ink/90 px-6 py-10 sm:px-10">
        <div
          className="glow-drift pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky/20 blur-3xl"
          aria-hidden
        />
        <div
          className="glow-drift-slow pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-blue/20 blur-3xl"
          aria-hidden
        />

        <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-sky-bright/80 anim-fade-up">
          Autism Soccer
        </p>
        <h1 className="relative mt-3 font-display text-3xl font-semibold text-white text-glow sm:text-4xl anim-fade-up anim-delay-1">
          Sobre
        </h1>
        <p className="relative mt-4 max-w-xl text-base leading-relaxed text-mist anim-fade-up anim-delay-2">
          Este site reúne histórias, memes, situações e lore do grupo Autism Soccer. O iceberg
          em camadas é o ponto central — da superfície ao que quase ninguém vê.
        </p>
        <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-fog anim-fade-up anim-delay-3">
          Conteúdo provisório. Atualize este texto quando quiser contar mais sobre o grupo.
        </p>

        <div className="relative mt-8 h-28 overflow-hidden rounded-2xl border border-sky-bright/20 bg-ink/50 anim-fade-up anim-delay-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(37,99,235,0.2),transparent_50%)]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sky/10 to-transparent" />
          <p className="absolute bottom-4 left-5 font-display text-sm text-sky-100/90">
            Iceberg · Discord · Lore
          </p>
        </div>
      </section>
    </div>
  )
}
