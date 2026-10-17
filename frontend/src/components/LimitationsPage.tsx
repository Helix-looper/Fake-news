import { type FC } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  FileX2,
  Database,
  Globe2,
  Clock,
  Cpu,
  ShieldAlert,
  Lightbulb,
  Layers,
  Sparkles,
} from 'lucide-react';

const LimitationCard: FC<{
  icon: typeof AlertTriangle;
  title: string;
  badge: string;
  badgeColor?: 'amber' | 'blue' | 'rose' | 'purple';
  children: React.ReactNode;
}> = ({ icon: Icon, title, badge, badgeColor = 'amber', children }) => {
  const badgeClasses = {
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    blue: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  }[badgeColor];

  return (
    <div className="glass-card p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-800 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${badgeClasses}`}>
            {badge}
          </span>
        </div>
        <div className="text-sm text-slate-400 space-y-2.5 leading-relaxed pt-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const LimitationsPage: FC = () => {
  return (
    <div className="space-y-8 animate-slide-up pb-10">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-surface-800/90 via-surface-800/60 to-amber-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <AlertTriangle size={14} className="text-amber-400" />
              <span>Critical Operational Insights</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              Model Limitations &amp; Boundary Cases
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Why transformer-based sequence classifiers predict <span className="text-amber-300 font-medium">linguistic credibility</span> rather than <span className="text-amber-300 font-medium">objective factual reality</span>, and why Explainable AI is necessary to audit their logic.
            </p>
          </div>
          <div className="bg-surface-900/80 border border-slate-700/60 rounded-xl p-4 md:w-72 shrink-0 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
              <ShieldAlert size={16} className="text-amber-400" />
              Core Principle
            </div>
            <p className="leading-relaxed">
              High model confidence does <strong className="text-slate-200">not</strong> guarantee factuality. A well-written lie can score as "Real", while informal truth can be flagged as "Fake".
            </p>
          </div>
        </div>
      </div>

      {/* ── Case Study: The Free Laptop Paradox ──────────────────────────────── */}
      <div className="glass-card p-6 md:p-7 space-y-5 border-brand-500/20">
        <div className="flex items-center gap-2.5">
          <Sparkles size={20} className="text-brand-400" />
          <h3 className="text-lg font-bold text-slate-100">
            Case Study: The "Style vs. Fact" Dilemma
          </h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Consider a viral internet scam claiming <em className="text-slate-300 font-serif">"The government is giving free laptops to every college student"</em>. Notice how the presentation style completely alters the AI's classification:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Debunking Article */}
          <div className="bg-surface-900/90 border border-emerald-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <FileCheck2 size={16} />
                <span>Fact-Check / Debunking Report</span>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Model: "Likely Real" (~99%)
              </span>
            </div>
            <div className="p-3 bg-surface-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
              "NEW DELHI: A viral report circulating on social media claims the government will provide free laptops... However, this article provides no verifiable notification or official announcement. Students should avoid submitting personal info..."
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <strong className="text-slate-200">Why it was classified as Real:</strong>
              <p>
                The article is <span className="text-emerald-300 font-medium">genuine journalism</span> warning the public. The presence of formal datelines (<em>"NEW DELHI:"</em>), skeptical modifiers (<em>"claims"</em>, <em>"unverified"</em>), and neutral phrasing trigger strong credibility activations.
              </p>
            </div>
          </div>

          {/* Card 2: Viral Forward */}
          <div className="bg-surface-900/90 border border-rose-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <FileX2 size={16} />
                <span>Raw Viral Forward / Clickbait Scam</span>
              </div>
              <span className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-medium">
                Model: "Likely Fake" (~95%)
              </span>
            </div>
            <div className="p-3 bg-surface-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
              "URGENT BREAKING: Government announces FREE laptops for EVERY student! ₹12,500 Cr allocated. Click link and submit Aadhaar IMMEDIATELY before slots close! Forward to all groups!"
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <strong className="text-slate-200">Why it was classified as Fake:</strong>
              <p>
                Imperative urgency (<em>"URGENT"</em>, <em>"IMMEDIATELY"</em>), sensational punctuation, all-caps words, and call-to-action forwarding phrases match classic disinformation patterns in training corpora.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3 text-xs text-slate-300">
          <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-100">Key Takeaway for Researchers:</strong> NLP sequence classifiers do not verify truth against a national gazette or database. They predict whether text <span className="text-brand-300 font-medium">resembles reputable news reporting</span> versus <span className="text-amber-300 font-medium">unverified clickbait styling</span>.
          </div>
        </div>
      </div>

      {/* ── 6 Core Structural Limitations Grid ──────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Layers size={19} className="text-brand-400" />
          Technical &amp; Methodological Limitations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <LimitationCard
            icon={Database}
            title="No Knowledge Base / Retrieval"
            badge="Architecture"
            badgeColor="rose"
          >
            <p>
              The transformer evaluates purely the lexical and contextual tokens passed into it. It has no external search engine, fact-checking API, or database to cross-reference dates, names, or statistics.
            </p>
            <p className="text-xs text-slate-500">
              A well-constructed lie with plausible dates and institutional names will easily fool the classifier.
            </p>
          </LimitationCard>

          <LimitationCard
            icon={Clock}
            title="Temporal Knowledge Cutoff"
            badge="Data Drift"
            badgeColor="amber"
          >
            <p>
              The model was fine-tuned on benchmark corpora (such as the ISOT Fake News Dataset) with articles primarily from 2016–2020.
            </p>
            <p className="text-xs text-slate-500">
              It has no knowledge of current political administrations, post-pandemic policies, recent conflicts, or new scientific breakthroughs.
            </p>
          </LimitationCard>

          <LimitationCard
            icon={Globe2}
            title="Geographic & Cultural Bias"
            badge="Generalization"
            badgeColor="blue"
          >
            <p>
              Training datasets predominantly feature US and Western English political discourse (Reuters, mainstream political news).
            </p>
            <p className="text-xs text-slate-500">
              Writing conventions, regional vocabularies (e.g., Indian English, African English), and localized government bodies may trigger anomalous classifications.
            </p>
          </LimitationCard>

          <LimitationCard
            icon={ShieldAlert}
            title="Adversarial Vulnerability"
            badge="Security"
            badgeColor="rose"
          >
            <p>
              Sophisticated bad actors can bypass detection by mimicking the stylistic conventions of mainstream wire services ("AP", "Reuters").
            </p>
            <p className="text-xs text-slate-500">
              By removing hyperbolic language and adding passive attribution, propaganda can evade transformer lexical filters.
            </p>
          </LimitationCard>

          <LimitationCard
            icon={Cpu}
            title="512 Token Context Truncation"
            badge="Constraint"
            badgeColor="purple"
          >
            <p>
              RoBERTa accepts a maximum of 512 tokens (~350–400 words). Articles exceeding this length are truncated.
            </p>
            <p className="text-xs text-slate-500">
              Crucial disclaimers, corrections, or fabricated quotes buried in later paragraphs of long articles are completely ignored by the model.
            </p>
          </LimitationCard>

          <LimitationCard
            icon={AlertTriangle}
            title="LIME Local Approximations"
            badge="Explainability"
            badgeColor="amber"
          >
            <p>
              LIME generates 300 random perturbations and fits a sparse linear surrogate model around the input point.
            </p>
            <p className="text-xs text-slate-500">
              The resulting token weights reflect local correlation under perturbation, not absolute semantic causality.
            </p>
          </LimitationCard>
        </div>
      </div>

      {/* ── Guidelines for Responsible Use ───────────────────────────────────── */}
      <div className="glass-card p-6 md:p-7 space-y-4 border-slate-700/80">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <ShieldAlert size={18} className="text-brand-400" />
          Responsible Deployment &amp; Human-in-the-Loop Workflow
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          AI fake news detection systems must always be deployed as <strong className="text-slate-200">decision-support aids</strong> for trained human analysts and fact-checkers, never as automated censors:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-surface-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px]">1</span>
              Triangulate with Official Fact-Checkers
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Always verify claims against official agencies (PIB Fact Check, AltNews, Snopes, PolitiFact, Reuters Fact Check) before reaching conclusions.
            </p>
          </div>

          <div className="p-4 bg-surface-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px]">2</span>
              Audit Word Contributions via LIME
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Examine <em>which</em> tokens drove the prediction. If the model is relying on spurious words (e.g., proper nouns or common prepositions), discount its confidence.
            </p>
          </div>

          <div className="p-4 bg-surface-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px]">3</span>
              Check the Source Domain &amp; Date
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identify the origin URL, publishing entity, and whether credible mainstream outlets have corroborated the announcement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitationsPage;
