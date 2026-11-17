
function Hero() {
  return (
    <div className="max-w-[560px]">
      <span className="mb-5 inline-block text-[11px] font-extrabold tracking-[2px] text-brand">
        SUBASTAS EN TIEMPO REAL
      </span>

      <h1 className="m-0 text-[clamp(44px,6vw,68px)] leading-[1.05] font-extrabold tracking-[-2px] text-text-primary">
        Cada oferta
        <br />
        <span className="text-brand">cuenta.</span>
      </h1>

      <p className="mt-6 max-w-[460px] text-[15px] leading-relaxed text-text-secondary sm:text-base">
        Descubre productos exclusivos, participa en subastas en vivo y
        encuentra tu próxima gran oportunidad.
      </p>
    </div>
  )
}

export default Hero
