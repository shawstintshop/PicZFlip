import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhotoUploader } from '../components/PhotoUploader';
import AnalysisProgress from '../components/AnalysisProgress';
import { ResultsDisplay } from '../components/ResultsDisplay';
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  Layers,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2
} from 'lucide-react';

const stats = [
  { value: '220+', label: 'Marketplaces scanned' },
  { value: '3 min', label: 'Average analysis time' },
  { value: '12k+', label: 'Listings tracked daily' },
  { value: '98%', label: 'Match accuracy' }
];

const features = [
  {
    title: 'Unified product research',
    description:
      'Search every major marketplace in one pass. PicZFlip surfaces the insights that matter without the manual work.',
    icon: Search
  },
  {
    title: 'Instant positioning copy',
    description:
      'Receive listing-ready descriptions tailored to the marketplace where your item will perform best.',
    icon: Wand2
  },
  {
    title: 'Confidence you can trust',
    description:
      'We benchmark and score every result so you know exactly how strong the signal is before you list.',
    icon: ShieldCheck
  },
  {
    title: 'Signals across sources',
    description:
      'Blend live marketplace data with historic performance to understand real demand trends in seconds.',
    icon: Layers
  }
];

const steps = [
  {
    title: 'Upload a snapshot',
    description: 'Drag in a product image or snap one on the spot. We support high-resolution mobile photos.',
    icon: Camera
  },
  {
    title: 'Let the AI scout',
    description: 'PicZFlip identifies the item, compares listings across channels and benchmarks pricing in real-time.',
    icon: Sparkles
  },
  {
    title: 'Launch with clarity',
    description: 'Go live with ready-made copy, pricing guidance and a prioritized checklist for the top channels.',
    icon: TrendingUp
  }
];

const testimonials = [
  {
    quote:
      'We stopped jumping between tabs trying to validate a single product. PicZFlip gives our team the answer in one beautiful report.',
    author: 'Taylor Brooks',
    role: 'Growth Lead, Re:Commerce'
  },
  {
    quote:
      'The copy suggestions alone save us hours each week. Everything feels crafted and trustworthy, not like a rough AI draft.',
    author: 'Simone Carter',
    role: 'Marketplace Manager, Atlas Supply'
  }
];

const faqs = [
  {
    question: 'Which marketplaces are supported?',
    answer:
      'PicZFlip tracks global and niche channels including eBay, Amazon, Facebook Marketplace, Poshmark, Depop and dozens more. We add new destinations monthly.'
  },
  {
    question: 'How long does an analysis take?',
    answer:
      'Most analyses wrap in under five minutes. Complex, high-volume products might take longer, but you can follow the live status the entire time.'
  },
  {
    question: 'Can I export the insights?',
    answer:
      'Yes. Download structured CSV data, copy optimized descriptions or send the full briefing directly to teammates from the dashboard.'
  }
];

export default function HomePage() {
  const analysisSectionRef = useRef<HTMLDivElement | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string | null>(null);

  const handleAnalysisStart = (analysisId: string) => {
    setAnalysisProgress(analysisId);
    setCurrentAnalysis(null);
  };

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentAnalysis(analysis);
    setAnalysisProgress(null);
  };

  const scrollToAnalysis = () => {
    analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-r from-blue-500/30 via-transparent to-purple-500/30 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                <span>AI marketplace intelligence, without the noise</span>
              </div>
              <h1 className="mt-8 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Discover what makes your product stand out — before you list it.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-200">
                PicZFlip blends image recognition with live marketplace scouting so you can validate demand, pricing and positioning in moments.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={scrollToAnalysis}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:translate-y-0.5 hover:bg-slate-100"
                >
                  Start analyzing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <Link
                  to="/history"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  View past reports
                </Link>
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
                  <div className="text-3xl font-semibold text-white">Real-time pricing</div>
                  <p className="mt-2 text-sm text-slate-200">
                    Median, low and high values pulled from trusted sellers across every major platform.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
                  <div className="text-3xl font-semibold text-white">Channel-ready copy</div>
                  <p className="mt-2 text-sm text-slate-200">
                    Listings built with tone, keywords and formatting optimized per marketplace.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur">
              <div className="rounded-[26px] border border-white/10 bg-white/80 p-6 shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-600">Live insights</div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Updating now
                  </div>
                </div>
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Top markets</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {['Amazon', 'eBay', 'Etsy', 'Facebook'].map((market) => (
                        <div
                          key={market}
                          className="rounded-xl border border-slate-200/70 bg-white/80 px-3 py-3 text-sm font-medium text-slate-700 shadow-sm"
                        >
                          {market}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Confidence</p>
                    <div className="mt-3 flex items-center gap-2">
                      {[68, 74, 92].map((score) => (
                        <div key={score} className="flex-1 rounded-full bg-slate-100 p-2 text-center text-xs font-semibold text-slate-600">
                          {score}%
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Ready to publish</div>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      “Vintage Polaroid Camera with original strap and case. Tested and fully functional.”
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Optimized for Etsy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto grid gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm"
            >
              <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Product intelligence made effortless</h2>
          <p className="mt-4 text-lg text-slate-600">
            Built for operators who want clarity faster. PicZFlip brings design, data and automation together in a crisp workspace.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">How it works</h2>
              <p className="mt-4 text-slate-600">
                Everything about PicZFlip is designed to feel calm, intuitive and fast. Three steps is all it takes to arrive at a ready-to-launch listing.
              </p>
            </div>
            <div className="lg:col-span-2 grid gap-6">
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={analysisSectionRef} className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Run an analysis now</h2>
            <p className="mt-4 text-lg text-slate-600">
              Upload a product photo and let PicZFlip orchestrate the research. Follow progress live and receive a polished briefing once complete.
            </p>
          </div>

          <div className="mt-12 grid gap-10">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/70">
              <PhotoUploader onAnalysisStart={handleAnalysisStart} />
            </div>

            {analysisProgress && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/70">
                <AnalysisProgress
                  analysisId={analysisProgress}
                  onComplete={handleAnalysisComplete}
                />
              </div>
            )}

            {currentAnalysis && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/70">
                <ResultsDisplay analysis={currentAnalysis} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Teams love the calm confidence</h2>
            <p className="mt-4 text-lg text-slate-600">
              PicZFlip removes guesswork while keeping the interface minimal. It feels like having a product researcher on your shoulder.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.author}
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm"
              >
                <MessageCircle className="h-10 w-10 text-slate-300" />
                <blockquote className="mt-6 text-lg font-medium text-slate-700">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6 text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">{testimonial.author}</span>
                  <span className="ml-2">{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900">Questions, answered</h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything about PicZFlip is transparent. Here are the essentials to help you get started fast.
          </p>
        </div>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
            >
              <summary className="flex cursor-pointer items-center justify-between text-left text-lg font-semibold text-slate-900">
                {faq.question}
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-sm text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 px-8 py-14 text-center text-white shadow-xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">Bring clarity to your marketplace strategy</h2>
          <p className="mt-4 text-lg text-slate-200">
            Start your next product listing with confidence. PicZFlip reveals where it wins, how to position it and what to say.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollToAnalysis}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-slate-900/20 transition hover:translate-y-0.5 hover:bg-slate-100"
            >
              Start a free analysis
            </button>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Manage account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
