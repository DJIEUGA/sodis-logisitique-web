import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { ItemList } from "@/features/order-preparation/components/ItemList";
import { StepLayout } from "@/features/order-preparation/components/StepLayout";
import { getSubmissionTarget, submitOrder } from "@/features/order-preparation/api/submit-order";
import {
  buildSubmissionPayload,
  clearStepDrafts,
  getDefaultValues,
  loadStepDrafts,
  saveStepDraft,
  STEPS,
  STEP_FIELDS,
} from "@/features/order-preparation/model/order";
import {
  orderFormSchema,
  type OrderFormValues,
  type OrderSubmissionPayload,
} from "@/features/order-preparation/model/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createOrderReference } from "@/lib/utils";

type ReadinessCheck = {
  label: string;
  passed: boolean;
};

const STEP_META = [
  {
    title: "Contexte de commande",
    description: "Renseignez la reference, la date, l'origine, la destination et le niveau de service.",
  },
  {
    title: "Parties et contacts",
    description: "Verifiez les coordonnees de l'expediteur et du destinataire pour la remise et la livraison.",
  },
  {
    title: "Preparation des lignes de stock",
    description: "Ajoutez chaque ligne d'expedition avec la quantite et les details optionnels.",
  },
  {
    title: "Verification et soumission",
    description: "Validez l'etat de preparation, ajoutez des notes et confirmez l'envoi.",
  },
] as const;

const FIELD_LABELS: Partial<Record<(typeof STEP_FIELDS)[number][number], string>> = {
  orderId: "Reference de commande",
  date: "Date de commande",
  warehouse: "Entrepot / point de retrait",
  destination: "Destination",
  deliveryType: "Type de livraison",
  "sender.fullName": "Nom complet de l'expediteur",
  "sender.phone": "Telephone de l'expediteur",
  "sender.email": "Email de l'expediteur",
  "receiver.fullName": "Nom complet du destinataire",
  "receiver.phone": "Telephone du destinataire",
  "receiver.address": "Adresse du destinataire",
  "receiver.city": "Ville du destinataire",
  notes: "Notes supplementaires",
};

function countNestedErrors(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const entry = value as Record<string, unknown>;
  const hasMessage = typeof entry.message === "string";
  const nestedCount = Object.values(entry).reduce<number>((acc, item) => acc + countNestedErrors(item), 0);
  return (hasMessage ? 1 : 0) + nestedCount;
}

type PreviewPanelProps = {
  payload: OrderSubmissionPayload;
  submissionTarget: "webhook" | "airtable";
  readinessChecks: ReadinessCheck[];
  readinessScore: number;
  compactMode: boolean;
};

function LivePreviewPanel({ payload, submissionTarget, readinessChecks, readinessScore, compactMode }: PreviewPanelProps) {
  const missingItems = readinessChecks.filter((item) => !item.passed);

  return (
    <div className="rounded-2xl border border-[--line] bg-[--surface] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-[--ink]">Apercu de soumission</h3>
        <span className="rounded-full border border-[--line] bg-[--surface-2] px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-[--ink-soft]">
          {submissionTarget === "airtable" ? "Airtable" : "Webhook"}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-[--line] bg-[--surface-2] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[--ink-soft]">Pret a soumettre</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-2xl font-bold text-[--ink]">{readinessScore}%</p>
          <p className="text-xs text-[--ink-soft]">{missingItems.length === 0 ? "Tous les controles sont valides" : `${missingItems.length} controle(s) en attente`}</p>
        </div>
      </div>

      <div className={`mt-3 grid grid-cols-2 gap-2 text-xs ${compactMode ? "" : ""}`}>
        <div className="rounded-lg bg-[--surface-2] p-2">
          <p className="text-[--ink-soft]">ID commande</p>
          <p className="font-semibold text-[--ink]">{payload.orderId || "-"}</p>
        </div>
        <div className="rounded-lg bg-[--surface-2] p-2">
          <p className="text-[--ink-soft]">Type de livraison</p>
          <p className="font-semibold capitalize text-[--ink]">{payload.deliveryType}</p>
        </div>
        <div className="rounded-lg bg-[--surface-2] p-2">
          <p className="text-[--ink-soft]">Articles</p>
          <p className="font-semibold text-[--ink]">{payload.items.length}</p>
        </div>
        <div className="rounded-lg bg-[--surface-2] p-2">
          <p className="text-[--ink-soft]">Destination</p>
          <p className="truncate font-semibold text-[--ink]">{payload.destination || "-"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[--ink-soft]">Checklist</p>
        {readinessChecks.map((check) => (
          <div key={check.label} className="flex items-start gap-2 text-xs">
            {check.passed ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-[--ink-soft]" />
            )}
            <p className={check.passed ? "text-[--brand]" : "text-[--ink-soft]"}>{check.label}</p>
          </div>
        ))}
      </div>

      <details className="mt-4 rounded-xl border border-[--line] bg-[--surface-2] p-2">
        <summary className="cursor-pointer text-xs font-semibold text-[--ink]">Payload JSON brut</summary>
        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>

      <p className="mt-2 text-[11px] text-[--ink-soft]">
        Raccourci : appuyez sur Entree pour continuer. A la derniere etape, appuyez sur Ctrl+Entree pour soumettre.
      </p>
    </div>
  );
}

export function OrderForm() {
  const { toast } = useToast();
  const submissionTarget = getSubmissionTarget();
  const [currentStep, setCurrentStep] = useState(0);
  const [autoOrderId, setAutoOrderId] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<OrderSubmissionPayload | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);
  const [stepSaveStatus, setStepSaveStatus] = useState<string>("Le brouillon s'enregistre automatiquement apres chaque etape validee.");
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState(true);
  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: getDefaultValues(),
    mode: "onBlur",
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedValues = form.watch();

  useEffect(() => {
    form.reset(loadStepDrafts(getDefaultValues()));
  }, [form]);

  useEffect(() => {
    if (!stepContainerRef.current) {
      return;
    }

    stepContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (confirmOpen || isSubmitting) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTextArea = tagName === "textarea";

      if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !isTextArea && currentStep < STEPS.length - 1) {
        event.preventDefault();
        void onNextStep();
      }

      if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && currentStep === STEPS.length - 1) {
        event.preventDefault();
        void requestSubmitConfirmation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmOpen, currentStep, isSubmitting]);

  const onNextStep = async () => {
    const valid = await form.trigger(STEP_FIELDS[currentStep], { shouldFocus: true });
    if (!valid) {
      jumpToFirstIssue();
      return;
    }

    saveStepDraft(currentStep, form.getValues());
    setStepSaveStatus(`Etape ${currentStep + 1} enregistree a ${new Date().toLocaleTimeString()}`);
    setValidationHint(null);
    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const onBackStep = () => {
    setValidationHint(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const regenerateOrderId = () => {
    form.setValue("orderId", createOrderReference(), { shouldDirty: true, shouldValidate: true });
  };

  const requestSubmitConfirmation = form.handleSubmit((values) => {
    saveStepDraft(3, values);
    const payload = buildSubmissionPayload(values);
    setValidationHint(null);
    setPendingPayload(payload);
    setConfirmOpen(true);
  });

  const confirmSubmission = async () => {
    if (!pendingPayload || isConfirmSubmitting) {
      return;
    }

    const payloadToSubmit = pendingPayload;
    setIsConfirmSubmitting(true);

    try {
      await submitOrder(payloadToSubmit);
      const submittedOrderId = payloadToSubmit.orderId;
      setLastSubmittedId(submittedOrderId);
      form.reset(getDefaultValues());
      setCurrentStep(0);
      clearStepDrafts();
      setConfirmOpen(false);
      setPendingPayload(null);

      toast({
        title: "Commande soumise",
        description: `La commande ${submittedOrderId} a ete envoyee avec succes.`,
      });
      setStepSaveStatus("Tous les brouillons d'etape ont ete supprimes apres la soumission.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur de soumission inconnue";
      toast({
        title: "Echec de la soumission",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConfirmSubmitting(false);
    }
  };

  const saveCurrentStepDraft = () => {
    saveStepDraft(currentStep, form.getValues());
    const label = `Etape ${currentStep + 1} enregistree a ${new Date().toLocaleTimeString()}`;
    setStepSaveStatus(label);
    toast({
      title: "Etape enregistree",
      description: label,
    });
  };

  const jumpToFirstIssue = () => {
    if (currentStep === 2) {
      setValidationHint("Renseignez le nom et la quantite pour chaque ligne de stock.");
      form.setFocus("items.0.itemName");
      return;
    }

    const nextField = STEP_FIELDS[currentStep].find((fieldName) => form.getFieldState(fieldName).error);
    if (!nextField) {
      setValidationHint("Champ requis manquant");
      return;
    }

    setValidationHint(FIELD_LABELS[nextField] ?? "Champ requis manquant");
    form.setFocus(nextField);
  };

  const stepErrorCounts = useMemo(() => {
    return STEPS.map((_, stepIndex) => {
      if (stepIndex === 2) {
        return countNestedErrors(form.formState.errors.items);
      }

      return STEP_FIELDS[stepIndex].reduce((count, fieldName) => {
        return count + (form.getFieldState(fieldName).error ? 1 : 0);
      }, 0);
    });
  }, [form, form.formState.errors]);

  const livePayload = useMemo(() => buildSubmissionPayload(watchedValues), [watchedValues]);

  const readinessChecks = useMemo<ReadinessCheck[]>(() => {
    return [
      {
        label: "Les metadonnees de commande sont completes",
        passed: Boolean(watchedValues.orderId && watchedValues.date && watchedValues.deliveryType),
      },
      {
        label: "Les champs de localisation sont renseignes",
        passed: Boolean(watchedValues.warehouse && watchedValues.destination),
      },
      {
        label: "Les contacts expediteur et destinataire sont complets",
        passed: Boolean(
          watchedValues.sender.fullName &&
            watchedValues.sender.phone &&
            watchedValues.receiver.fullName &&
            watchedValues.receiver.phone &&
            watchedValues.receiver.address &&
            watchedValues.receiver.city,
        ),
      },
      {
        label: "Au moins une ligne de stock est valide",
        passed: watchedValues.items.length > 0 && watchedValues.items.every((item) => item.itemName && item.quantity > 0),
      },
      {
        label: "L'etape notes/verification est complete",
        passed: currentStep === STEPS.length - 1 || Boolean(watchedValues.notes),
      },
    ];
  }, [currentStep, watchedValues]);

  const readinessScore = useMemo(() => {
    const passed = readinessChecks.filter((item) => item.passed).length;
    return Math.round((passed / readinessChecks.length) * 100);
  }, [readinessChecks]);

  const currentMeta = STEP_META[currentStep];

  const stepContent = useMemo<ReactNode>(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className={`grid gap-3 md:grid-cols-2 ${compactMode ? "text-sm" : ""}`}>
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Reference de commande</FormLabel>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <FormControl>
                      <Input disabled={autoOrderId || isSubmitting} placeholder="ORD-20260413-AB12" {...field} />
                    </FormControl>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={autoOrderId ? "default" : "outline"}
                        onClick={() => setAutoOrderId((value) => !value)}
                        disabled={isSubmitting}
                      >
                        {autoOrderId ? "ID auto" : "ID manuel"}
                      </Button>
                      <Button type="button" variant="outline" onClick={regenerateOrderId} disabled={!autoOrderId || isSubmitting}>
                        <RefreshCw className="h-4 w-4" />
                        Regenerer
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de livraison</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un type de livraison" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-100">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="bulk">En vrac</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrepot / Point de retrait</FormLabel>
                  <FormControl>
                    <Input placeholder="Hub Nord - Stockholm" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination (Ville / Adresse)</FormLabel>
                  <FormControl>
                    <Input placeholder="Vasagatan 18, Stockholm" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 1:
        return (
          <div className={`space-y-3 ${compactMode ? "text-sm" : ""}`}>
            <div className="grid gap-3 rounded-xl border border-[--line] bg-[--surface-2] p-3 lg:grid-cols-2">
              <div>
                <h3 className="text-base font-bold text-[--ink]">Informations expediteur</h3>
              </div>
              <div>
                <h3 className="text-base font-bold text-[--ink]">Informations destinataire</h3>
              </div>

              <FormField
                control={form.control}
                name="sender.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet expediteur</FormLabel>
                    <FormControl>
                      <Input placeholder="Maria Andersson" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiver.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet destinataire</FormLabel>
                    <FormControl>
                      <Input placeholder="Harris Whitaker" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sender.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone expediteur</FormLabel>
                    <FormControl>
                      <Input placeholder="+46 70 123 45 67" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiver.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone destinataire</FormLabel>
                    <FormControl>
                      <Input placeholder="+46 70 987 65 43" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sender.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email expediteur (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="maria@company.com" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiver.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse destinataire</FormLabel>
                    <FormControl>
                      <Input placeholder="Lagergatan 12" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="hidden lg:block" />
              <FormField
                control={form.control}
                name="receiver.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville destinataire</FormLabel>
                    <FormControl>
                      <Input placeholder="Stockholm" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return <ItemList control={form.control} disabled={isSubmitting} />;
      default:
        return (
          <div className={`space-y-3 ${compactMode ? "text-sm" : ""}`}>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes supplementaires</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Instructions de manutention, details du quai de chargement, notes d'emballage..."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-xl border border-[--line] bg-[--surface-2] p-3 text-sm text-[--ink-soft]">
              <p>
                Verifiez toutes les sections, puis soumettez pour declencher le connecteur webhook/Airtable. Cette interface collecte et transmet uniquement les donnees de preparation de commande.
              </p>
            </div>
          </div>
        );
    }
  }, [autoOrderId, compactMode, currentStep, form.control, isSubmitting]);

  return (
    <>
      <Card className="mx-auto w-full max-w-4x">
        <CardHeader className="p-4 pb-2 md:p-5 md:pb-2">
          <CardTitle>Preparation des donnees d'expedition</CardTitle>
          <CardDescription>Utilisez la barre de controle et validez l'etat du payload en temps reel.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-5 md:pt-0">
          <Form {...form}>
            <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
              <div ref={stepContainerRef} className="space-y-3 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-3 lg:space-y-0">
                <StepLayout
                  steps={STEPS}
                  currentStep={currentStep}
                  currentStepTitle={currentMeta.title}
                  currentStepDescription={currentMeta.description}
                  isSubmitting={isSubmitting}
                  stepErrorCounts={stepErrorCounts}
                  onSaveStep={saveCurrentStepDraft}
                  stepSaveStatus={stepSaveStatus}
                  validationHint={validationHint}
                  hasValidationIssues={(stepErrorCounts[currentStep] ?? 0) > 0}
                  onJumpToIssue={jumpToFirstIssue}
                  compactMode={compactMode}
                  onToggleCompactMode={() => setCompactMode((value) => !value)}
                  onBack={onBackStep}
                  onNext={onNextStep}
                  onSubmit={requestSubmitConfirmation}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      {stepContent}
                    </motion.div>
                  </AnimatePresence>
                </StepLayout>

                <aside className="hidden lg:sticky lg:top-3 lg:block">
                  <LivePreviewPanel
                    payload={livePayload}
                    submissionTarget={submissionTarget}
                    readinessChecks={readinessChecks}
                    readinessScore={readinessScore}
                    compactMode={compactMode}
                  />
                </aside>
              </div>

              <details className="rounded-xl border border-[--line] bg-[--surface-2] p-2.5 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-[--ink]">Apercu du payload</summary>
                <div className="mt-3">
                  <LivePreviewPanel
                    payload={livePayload}
                    submissionTarget={submissionTarget}
                    readinessChecks={readinessChecks}
                    readinessScore={readinessScore}
                    compactMode={compactMode}
                  />
                </div>
              </details>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirmer la soumission de commande</DialogTitle>
            <DialogDescription>
              Cette action enverra le payload de preparation vers votre endpoint configure.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-[--line] bg-[--surface-2] p-4 text-sm text-[--ink-soft]">
            <p>
              <span className="font-semibold text-[--ink]">ID commande :</span> {pendingPayload?.orderId}
            </p>
            <p>
              <span className="font-semibold text-[--ink]">Articles :</span> {pendingPayload?.items.length ?? 0}
            </p>
            <p>
              <span className="font-semibold text-[--ink]">Destination :</span> {pendingPayload?.destination}
            </p>
            <p>
              <span className="font-semibold text-[--ink]">Validation :</span> Champs requis remplis.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting || isConfirmSubmitting}>
              Annuler
            </Button>
            <Button
              onClick={confirmSubmission}
              disabled={isSubmitting || isConfirmSubmitting}
              className={`min-w-36 bg-slate-900 shadow-sm focus-visible:ring-[--brand] cursor-pointer`}
            >
              {isConfirmSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isConfirmSubmitting ? "Envoi en cours..." : "Confirmer et soumettre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lastSubmittedId ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <Card className="border-[--line] bg-[--surface-2]">
            <CardContent className="flex items-center gap-3 p-4 text-[--ink]">
              <CheckCircle2 className="h-5 w-5 text-[--brand]" />
              <p className="text-sm font-semibold">La commande {lastSubmittedId} a ete preparee et soumise avec succes.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </>
  );
}
