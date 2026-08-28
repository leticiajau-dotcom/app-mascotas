import React from "react";
import Card from "@/components/ui/Card";

/** Placeholder para las secciones que todavía no reconstruimos en la nueva base web. */
export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-md p-4 pt-8">
      <Card className="text-center">
        <p className="text-lg font-semibold text-ink">{title}</p>
        <p className="mt-2 text-sm text-muted">
          Esta sección se está reconstruyendo sobre la nueva base. Ya llega en una próxima etapa.
        </p>
      </Card>
    </div>
  );
}
