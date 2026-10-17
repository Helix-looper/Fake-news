import { type FC } from 'react';
import { type LucideIcon, BookOpen, Zap, FlaskConical, HelpCircle } from 'lucide-react';

const Section: FC<{ icon: LucideIcon; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="glass-card p-6">
    <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
      <Icon size={17} className="text-brand-400" />
      {title}
    </h3>
    <div className="text-sm text-slate-400 space-y-3 leading-relaxed">{children}</div>
  </div>
);

const AboutPage: FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
        <BookOpen size={20} className="text-brand-400" />
        Research Context
      </h2>
      <p className="text-slate-400 text-sm leading-relaxed">
        This application is an educational research prototype demonstrating{' '}
        <strong className="text-slate-200">transformer-based fake news detection</strong> with{' '}
        <strong className="text-slate-200">local explainability</strong>. It is inspired by the
        research theme "Explainable Fake News Detection Using Transformers and SHAP–LIME." The goal
        is to make model predictions interpretable, not to serve as a definitive fact-checking service.
      </p>
    </div>

    <Section icon={Zap} title="Why Transformer Models?">
      <p>
        Transformer models like <strong className="text-slate-300">BERT</strong> (Bidirectional
        Encoder Representations from Transformers),{' '}
        <strong className="text-slate-300">RoBERTa</strong>, and{' '}
        <strong className="text-slate-300">DistilBERT</strong> learn rich contextual representations
        of text by attending to all tokens in a sequence simultaneously — not just sequentially like
        older RNNs or LSTMs.
      </p>
      <p>
        This bidirectional context makes them well-suited for nuanced text classification tasks where
        meaning depends heavily on surrounding words, tone, and rhetorical structure — all patterns
        that appear in fake versus real news writing styles.
      </p>
    </Section>

    <Section icon={FlaskConical} title="What is Explainable AI (XAI)?">
      <p>
        Modern ML models are often high-accuracy but opaque "black boxes." Explainable AI methods
        aim to reveal <em>why</em> a model made a particular prediction, supporting human oversight,
        debugging, and trust calibration.
      </p>
      <p>
        In this demo, XAI means showing which words in a submitted article contributed most to the
        model's classification — allowing you to assess whether the rationale seems sensible, not
        just whether the label is correct.
      </p>
    </Section>

    <Section icon={HelpCircle} title="LIME — Local Interpretable Model-agnostic Explanations">
      <p>
        LIME (Ribeiro et al., 2016) explains individual predictions by creating many perturbed
        variants of the input (randomly masking words), observing how the model's output changes,
        and fitting a simple interpretable linear model in that local neighborhood.
      </p>
      <p>
        Words that most change the predicted probability when removed get high absolute weights.
        Positive weights indicate the word pushes toward the predicted class; negative weights push
        against it.
      </p>
      <p className="text-amber-400/80">
        ⚠ LIME explanations are <strong>local approximations</strong> — they describe the model's
        behavior near one specific input, not global feature importances. The same word may receive
        different weights in different articles.
      </p>
    </Section>

    <Section icon={HelpCircle} title="SHAP vs LIME">
      <p>
        <strong className="text-slate-300">SHAP</strong> (SHapley Additive exPlanations) uses
        cooperative game theory to distribute a model's output among features. SHAP values have
        desirable theoretical guarantees (efficiency, symmetry, dummy) and are globally consistent
        across samples.
      </p>
      <p>
        <strong className="text-slate-300">LIME</strong> is faster and model-agnostic but uses a
        local linear approximation that may be unstable for distant perturbations. For transformer
        text models, SHAP's <code className="text-brand-300">Partition</code> or{' '}
        <code className="text-brand-300">KernelExplainer</code> are slower but more theoretically
        sound.
      </p>
      <p>
        This demo implements LIME. SHAP integration is possible via the{' '}
        <code className="text-brand-300">shap</code> library at the{' '}
        <code className="text-brand-300">/api/explain</code> endpoint without frontend changes.
      </p>
    </Section>

    <Section icon={HelpCircle} title="Important Caveat: Explanations ≠ Factual Truth">
      <p className="text-amber-400/80">
        Model predictions and LIME explanations reflect statistical patterns learned from training
        data. A prediction of "Likely Fake" does not prove a claim is false, and a prediction of
        "Likely Real" does not verify factual accuracy.
      </p>
      <p>
        Use this tool to explore how language models respond to writing style and structure, not as
        a replacement for fact-checking by domain experts or trusted journalistic sources.
      </p>
    </Section>
  </div>
);

export default AboutPage;
