export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="px-28 pt-20 pb-16 max-w-3xl">
        <p className="linkio-eyebrow mb-4">About Linkio</p>
        <h1 className="font-serif text-5xl font-normal text-navy-deep leading-tight mb-6">
          Built for Algeria.<br />
          Built for <em className="text-red not-italic">everyone</em>
          <br />
          in it.
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-lg">
          Linkio was created to solve a real gap in Algeria's professional
          ecosystem — a trusted, transparent space where verified talent meets
          serious employers, across all 58 wilayas.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
          We believe that where you live should never limit what you can achieve.
          Whether you're a developer in Tamanrasset or a civil engineer in Oran,
          Linkio connects you to the opportunity you deserve.
        </p>
      </div>

      {/* Mission */}
      <div className="mx-10 mb-16 bg-navy rounded-2xl px-28 py-16">
        <div className="flex gap-20">
          <div className="w-80 flex-shrink-0">
            <p className="text-[11px] tracking-widest text-white/40 uppercase mb-4">
              Our Mission
            </p>
            <h2 className="font-serif text-3xl font-normal text-white leading-snug">
              To make professional opportunity{" "}
              <em>accessible</em> to every Algerian.
            </h2>
          </div>

          <div className="flex-1">
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              We started Linkio because we saw talented professionals in
              Algeria struggling to be found — and companies struggling to find
              them. The problem wasn't talent. It was infrastructure.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mb-10">
              So we built a platform that puts verification first, removes
              geographic friction, and gives both sides the transparency they
              need to make confident decisions.
            </p>
            <div className="flex gap-3">
              {[
                { n: "2024", l: "Founded in Alger" },
                { n: "Free", l: "For professionals, always" },
              ].map((b) => (
                <div key={b.n} className="bg-white/10 rounded-xl px-6 py-4">
                  <p className="font-serif text-xl text-white">{b.n}</p>
                  <p className="text-xs text-white/50 mt-1">{b.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}