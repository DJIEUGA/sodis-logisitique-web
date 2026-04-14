import type { Path } from "react-hook-form";

import type { OrderFormValues, OrderSubmissionPayload } from "@/features/order-preparation/model/schema";
import { createOrderReference } from "@/lib/utils";

export const STEPS = ["Commande", "Contacts", "Stock", "Notes et verification"] as const;

export const STEP_FIELDS: Array<Path<OrderFormValues>[]> = [
  ["orderId", "date", "warehouse", "destination", "deliveryType"],
  [
    "sender.fullName",
    "sender.phone",
    "sender.email",
    "receiver.fullName",
    "receiver.phone",
    "receiver.address",
    "receiver.city",
  ],
  ["items"],
  ["notes"],
];

const STEP_STORAGE_KEYS = [
  "order-prep-step-order",
  "order-prep-step-contacts",
  "order-prep-step-stock",
  "order-prep-step-notes",
] as const;

export function getDefaultValues(): OrderFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    orderId: createOrderReference(),
    date: today,
    warehouse: "",
    destination: "",
    deliveryType: "standard",
    sender: {
      fullName: "",
      phone: "",
      email: "",
    },
    receiver: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
    },
    items: [
      {
        itemName: "",
        quantity: 1,
        weight: undefined,
        description: "",
      },
    ],
    notes: "",
  };
}

export function buildSubmissionPayload(data: OrderFormValues): OrderSubmissionPayload {
  return {
    orderId: data.orderId,
    date: data.date,
    warehouse: data.warehouse,
    destination: data.destination,
    deliveryType: data.deliveryType,
    sender: {
      fullName: data.sender.fullName,
      phone: data.sender.phone,
      email: data.sender.email || undefined,
    },
    receiver: {
      fullName: data.receiver.fullName,
      phone: data.receiver.phone,
      address: data.receiver.address,
      city: data.receiver.city,
    },
    items: data.items.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      weight: item.weight,
      description: item.description || undefined,
    })),
    notes: data.notes || undefined,
    createdAt: new Date().toISOString(),
  };
}

function getStepDraft(step: number, values: OrderFormValues) {
  switch (step) {
    case 0:
      return {
        orderId: values.orderId,
        date: values.date,
        warehouse: values.warehouse,
        destination: values.destination,
        deliveryType: values.deliveryType,
      };
    case 1:
      return {
        sender: values.sender,
        receiver: values.receiver,
      };
    case 2:
      return {
        items: values.items,
      };
    case 3:
      return {
        notes: values.notes,
      };
    default:
      return {};
  }
}

export function saveStepDraft(step: number, values: OrderFormValues) {
  const stepKey = STEP_STORAGE_KEYS[step as keyof typeof STEP_STORAGE_KEYS];
  if (!stepKey) {
    return;
  }

  localStorage.setItem(stepKey, JSON.stringify(getStepDraft(step, values)));
}

export function clearStepDrafts() {
  STEP_STORAGE_KEYS.forEach((stepKey) => localStorage.removeItem(stepKey));
}

export function loadStepDrafts(defaultValues: OrderFormValues): OrderFormValues {
  const merged: OrderFormValues = {
    ...defaultValues,
    sender: { ...defaultValues.sender },
    receiver: { ...defaultValues.receiver },
    items: [...defaultValues.items],
  };

  STEP_STORAGE_KEYS.forEach((stepKey) => {
    const draft = localStorage.getItem(stepKey);
    if (!draft) {
      return;
    }

    try {
      const parsed = JSON.parse(draft) as Partial<OrderFormValues>;
      if (parsed.orderId) {
        merged.orderId = parsed.orderId;
      }
      if (parsed.date) {
        merged.date = parsed.date;
      }
      if (parsed.warehouse) {
        merged.warehouse = parsed.warehouse;
      }
      if (parsed.destination) {
        merged.destination = parsed.destination;
      }
      if (parsed.deliveryType) {
        merged.deliveryType = parsed.deliveryType;
      }
      if (parsed.sender) {
        merged.sender = { ...merged.sender, ...parsed.sender };
      }
      if (parsed.receiver) {
        merged.receiver = { ...merged.receiver, ...parsed.receiver };
      }
      if (parsed.items && parsed.items.length > 0) {
        merged.items = parsed.items;
      }
      if (typeof parsed.notes === "string") {
        merged.notes = parsed.notes;
      }
    } catch {
      localStorage.removeItem(stepKey);
    }
  });

  return merged;
}
