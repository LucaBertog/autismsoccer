const ABYSS_SRC = '/abyss.png'

export function IcebergAbyss() {
  return (
    <section className="iceberg-abyss" aria-label="O Abismo">
      <img
        src={ABYSS_SRC}
        alt=""
        className="iceberg-abyss-image"
        loading="lazy"
        decoding="async"
      />
      <div className="iceberg-abyss-fade" aria-hidden />
    </section>
  )
}
