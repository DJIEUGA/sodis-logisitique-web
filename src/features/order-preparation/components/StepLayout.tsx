import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, LayoutGrid, Save } from "lucide-react";

import { SubmitButton } from "@/features/order-preparation/components/SubmitButton";
import { Button } from "@/components/ui/button";

type StepLayoutProps = {
  steps: readonly string[];
  currentStep: number;
  currentStepTitle: string;
  currentStepDescription: string;
  isSubmitting: boolean;
  stepErrorCounts: number[];
  onSaveStep: () => void;
  stepSaveStatus?: string;
  validationHint?: string | null;
  hasValidationIssues: boolean;
  onJumpToIssue: () => void;
  compactMode: boolean;
  onToggleCompactMode: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
};

export function StepLayout({
  steps,
  currentStep,
  currentStepTitle,
  currentStepDescription,
  isSubmitting,
  stepErrorCounts,
  onSaveStep,
  stepSaveStatus,
  validationHint,
  hasValidationIssues,
  onJumpToIssue,
  compactMode,
  onToggleCompactMode,
  onBack,
  onNext,
  onSubmit,
  children,
}: StepLayoutProps) {
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <section className="space-y-3">
      <div className="space-y-2.5 rounded-xl border border-[--line] bg-[--surface] p-2.5 md:p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[--ink-soft]">Progression</p>
            <p className="text-sm font-semibold text-[--ink]">Etape {currentStep + 1} sur {steps.length}</p>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onToggleCompactMode}>
            <LayoutGrid className="h-4 w-4" />
            {compactMode ? "Confort" : "Compact"}
          </Button>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--surface-2]">
          <div className="h-full rounded-full bg-[--brand] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <ol className="grid gap-1.5 sm:grid-cols-4">
          {steps.map((step, index) => {
            const active = index === currentStep;
            const complete = index < currentStep;
            const errorCount = stepErrorCounts[index] ?? 0;

            return (
              <li
                key={step}
                className={`rounded-md border px-2.5 py-1.5 text-[11px] ${
                  active ? "border-[--brand] bg-[--brand-soft]" : "border-[--line] bg-[--surface]"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-[--ink]">{step}</span>
                  {complete ? <CheckCircle2 className="h-3.5 w-3.5 text-[--brand]" /> : null}
                </div>
                {errorCount > 0 ? <p className="mt-1 text-[11px] text-[--ink-soft]">{errorCount} erreur(s)</p> : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-xl border border-[--line] bg-[--surface] p-2.5 md:p-3">
        <div className="mb-3 rounded-md border border-[--line] bg-[--surface-2] p-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[--ink-soft]">Focus actuel</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[--ink]">{currentStepTitle}</h3>
          <p className="text-sm text-[--ink-soft]">{currentStepDescription}</p>
        </div>

        {children}
      </div>

      <div className="sticky bottom-2 z-20 flex flex-col gap-2 rounded-xl border border-[--line] bg-[--surface]/95 p-2 shadow-sm backdrop-blur supports-backdrop-filter:bg-[--surface]/85">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onSaveStep} disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            Enregistrer l'etape
          </Button>
          {hasValidationIssues ? (
            <Button type="button" variant="outline" onClick={onJumpToIssue} disabled={isSubmitting}>
              <AlertCircle className="h-4 w-4" />
              Aller a la premiere erreur
            </Button>
          ) : null}
          <span className="text-xs font-semibold text-[--ink-soft]">{stepSaveStatus ?? "Le brouillon s'enregistre automatiquement apres validation."}</span>
        </div>

        {validationHint ? <p className="text-xs font-semibold text-[--ink-soft]">Prochain champ requis : {validationHint}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" onClick={onBack} disabled={currentStep === 0 || isSubmitting}>
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>

          {isLast ? (
            <SubmitButton isSubmitting={isSubmitting} onClick={onSubmit} />
          ) : (
            <Button
              onClick={onNext}
              disabled={isSubmitting}
              className="min-w-36 bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-900"
            >
              Continuer
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
