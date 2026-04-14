import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { OrderFormValues } from "@/features/order-preparation/model/schema";

type ItemListProps = {
  control: Control<OrderFormValues>;
  disabled?: boolean;
};

export function ItemList({ control, disabled }: ItemListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const addItem = () => {
    append({
      itemName: "",
      quantity: 1,
      weight: undefined,
      description: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[--ink]">Details du stock</h3>
          <p className="text-sm text-[--ink-soft]">Ajoutez une ou plusieurs lignes de stock pour cette commande.</p>
        </div>
        <Button type="button" variant="outline" onClick={addItem} disabled={disabled}>
          <Plus className="h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-[--line] bg-[--surface-2] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[--ink]">Article #{index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1 || disabled}
                aria-label={`Supprimer l'article ${index + 1}`}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name={`items.${index}.itemName`}
                render={({ field: rhfField }) => (
                  <FormItem>
                    <FormLabel>Nom de l'article</FormLabel>
                    <FormControl>
                      <Input placeholder="Palette de cartons" disabled={disabled} {...rhfField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`items.${index}.quantity`}
                render={({ field: rhfField }) => (
                  <FormItem>
                    <FormLabel>Quantite</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        disabled={disabled}
                        value={rhfField.value ?? ""}
                        onChange={(event) =>
                          rhfField.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`items.${index}.weight`}
                render={({ field: rhfField }) => (
                  <FormItem>
                    <FormLabel>Poids (kg, optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="125.5"
                        disabled={disabled}
                        value={rhfField.value ?? ""}
                        onChange={(event) =>
                          rhfField.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`items.${index}.description`}
                render={({ field: rhfField }) => (
                  <FormItem>
                    <FormLabel>Description (optionnelle)</FormLabel>
                    <FormControl>
                      <Input placeholder="Fragile, garder debout" disabled={disabled} {...rhfField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
