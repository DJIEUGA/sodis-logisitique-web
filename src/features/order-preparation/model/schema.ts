import { z } from "zod";

export const stockItemSchema = z.object({
  itemName: z.string().min(1, "Le nom de l'article est requis"),
  quantity: z
    .number({ invalid_type_error: "La quantite est requise" })
    .int("La quantite doit etre un nombre entier")
    .positive("La quantite doit etre superieure a 0"),
  weight: z
    .number({ invalid_type_error: "Le poids doit etre un nombre" })
    .positive("Le poids doit etre positif")
    .optional(),
  description: z.string().optional(),
});

export const orderFormSchema = z.object({
  orderId: z.string().min(1, "La reference de commande est requise"),
  date: z.string().min(1, "La date est requise"),
  warehouse: z.string().min(1, "L'entrepot / point de retrait est requis"),
  destination: z.string().min(1, "La destination est requise"),
  deliveryType: z.enum(["standard", "express", "bulk"]),
  sender: z.object({
    fullName: z.string().min(1, "Le nom complet de l'expediteur est requis"),
    phone: z.string().min(1, "Le numero de telephone de l'expediteur est requis"),
    email: z.string().email("Adresse e-mail invalide").optional().or(z.literal("")),
  }),
  receiver: z.object({
    fullName: z.string().min(1, "Le nom complet du destinataire est requis"),
    phone: z.string().min(1, "Le numero de telephone du destinataire est requis"),
    address: z.string().min(1, "L'adresse du destinataire est requise"),
    city: z.string().min(1, "La ville du destinataire est requise"),
  }),
  items: z.array(stockItemSchema).min(1, "Ajoutez au moins un article de stock"),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export type OrderSubmissionPayload = {
  orderId: string;
  date: string;
  warehouse: string;
  destination: string;
  deliveryType: "standard" | "express" | "bulk";
  sender: {
    fullName: string;
    phone: string;
    email?: string;
  };
  receiver: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    itemName: string;
    quantity: number;
    weight?: number;
    description?: string;
  }>;
  notes?: string;
  createdAt: string;
};
