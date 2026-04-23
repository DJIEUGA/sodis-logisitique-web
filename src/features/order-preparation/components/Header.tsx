type HeaderProps = {
  submissionTarget: "webhook" | "airtable";
};

export function Header({ submissionTarget }: HeaderProps) {
  const targetLabel = submissionTarget === "airtable" ? "Connecteur Airtable" : "Connecteur Webhook";

  return (
    <header className="rounded-2xl border border-[--line] bg-[--surface] p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-[--line] bg-[--surface-2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.17em] text-[--ink-soft]">
            SODIS logistique
          </p>
          <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-[--ink] md:text-4xl">
            Console de préparation de commandes
          </h1>
          <p className="max-w-2xl text-sm text-[--ink-soft] md:text-base">
            Capturez, validez et transmettez les données de commande.
          </p>
        </div>

        <div className="flex flex-col gap-2 py-1 rounded-xl border border-[--line]">
          <span className="bg-[--surface-2] px-3 text-xs font-semibold text-[--ink-soft]">
            Cible d'integration : <b>{targetLabel}</b>
          </span>
          <span className="bg-[--surface-2] px-3 text-xs font-semibold text-[--ink-soft]">
            Brouillon : <b>par etape</b>
          </span>
        </div>
      </div>
    </header>
  );
}
