import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center text-center">
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-primary/5 to-transparent -z-10 blur-3xl" />

        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-6 ring-1 ring-inset ring-primary/20">
            Streamlining B2B Procurement
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
            The Future of <br className="hidden md:block" />
            <span className="text-gradient">RFQ Management</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with top-tier suppliers, manage quotes effortlessly, and streamline your procurement process with our intelligent marketplace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-foreground bg-white/50 backdrop-blur-sm border border-border hover:bg-white/80 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          {
            title: "Smart Matching",
            description: "Automatically connect with suppliers that match your specific requirements and standards.",
            icon: (
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )
          },
          {
            title: "Instant Quotes",
            description: "Receive and compare competitive quotes in real-time. Make data-driven decisions faster.",
            icon: (
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: "Secure Trading",
            description: "Bank-grade security ensuring your data and transactions are protected at every step.",
            icon: (
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )
          }
        ].map((feature, i) => (
          <div key={i} className="group glass-card p-8 rounded-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              {feature.icon}
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/80 to-white/20 flex items-center justify-center shadow-inner mb-6 text-primary">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Stats Section with Glass effect */}
      <section className="glass rounded-3xl p-12 text-center my-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Suppliers", value: "2k+" },
            { label: "RFQs Processed", value: "50k+" },
            { label: "Total Volume", value: "$120M+" },
            { label: "Satisfaction", value: "99%" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 mb-2">
                {stat.value}
              </span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
