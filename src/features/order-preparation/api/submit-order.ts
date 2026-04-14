import axios from "axios";

import type { OrderSubmissionPayload } from "@/features/order-preparation/model/schema";

type SubmissionTarget = "webhook" | "airtable";

type AirtableFieldMap = {
  orderId: string;
  date: string;
  warehouse: string;
  destination: string;
  deliveryType: string;
  senderFullName: string;
  senderPhone: string;
  senderEmail: string;
  receiverFullName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  itemsJson: string;
  notes: string;
  createdAt: string;
};

const DEFAULT_WEBHOOK_ENDPOINT = "https://httpbin.org/post";

const DEFAULT_AIRTABLE_FIELD_MAP: AirtableFieldMap = {
  orderId: "OrderId",
  date: "Date",
  warehouse: "Warehouse",
  destination: "Destination",
  deliveryType: "DeliveryType",
  senderFullName: "SenderName",
  senderPhone: "SenderPhone",
  senderEmail: "SenderEmail",
  receiverFullName: "ReceiverName",
  receiverPhone: "ReceiverPhone",
  receiverAddress: "ReceiverAddress",
  receiverCity: "ReceiverCity",
  itemsJson: "ItemsJson",
  notes: "Notes",
  createdAt: "CreatedAt",
};

export function getSubmissionTarget(): SubmissionTarget {
  const value = (import.meta.env.VITE_SUBMISSION_TARGET ?? "webhook").toLowerCase();
  return value === "airtable" ? "airtable" : "webhook";
}

function getAirtableFieldMap(): AirtableFieldMap {
  const rawMap = import.meta.env.VITE_AIRTABLE_FIELD_MAP_JSON;
  if (!rawMap) {
    return DEFAULT_AIRTABLE_FIELD_MAP;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMap);
  } catch {
    throw new Error("VITE_AIRTABLE_FIELD_MAP_JSON must be valid JSON.");
  }

  const candidate = parsed as Partial<AirtableFieldMap>;
  const requiredKeys = Object.keys(DEFAULT_AIRTABLE_FIELD_MAP) as Array<keyof AirtableFieldMap>;

  for (const key of requiredKeys) {
    const value = candidate[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`VITE_AIRTABLE_FIELD_MAP_JSON is missing required field mapping: ${key}`);
    }
  }

  return candidate as AirtableFieldMap;
}

function toAirtableRecord(payload: OrderSubmissionPayload, map: AirtableFieldMap) {
  return {
    fields: {
      [map.orderId]: payload.orderId,
      [map.date]: payload.date,
      [map.warehouse]: payload.warehouse,
      [map.destination]: payload.destination,
      [map.deliveryType]: payload.deliveryType,
      [map.senderFullName]: payload.sender.fullName,
      [map.senderPhone]: payload.sender.phone,
      [map.senderEmail]: payload.sender.email ?? "",
      [map.receiverFullName]: payload.receiver.fullName,
      [map.receiverPhone]: payload.receiver.phone,
      [map.receiverAddress]: payload.receiver.address,
      [map.receiverCity]: payload.receiver.city,
      [map.itemsJson]: JSON.stringify(payload.items),
      [map.notes]: payload.notes ?? "",
      [map.createdAt]: payload.createdAt,
    },
  };
}

async function submitToWebhook(payload: OrderSubmissionPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_ORDER_WEBHOOK_URL || DEFAULT_WEBHOOK_ENDPOINT;
  const response = await axios.post(endpoint, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error("La soumission webhook a echoue");
  }
}

async function submitToAirtable(payload: OrderSubmissionPayload): Promise<void> {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
  const fieldMap = getAirtableFieldMap();

  if (!apiKey || !baseId || !tableName) {
    throw new Error("Configuration Airtable manquante. Renseignez VITE_AIRTABLE_API_KEY, VITE_AIRTABLE_BASE_ID et VITE_AIRTABLE_TABLE_NAME.");
  }

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const response = await axios.post(
    airtableUrl,
    {
      records: [toAirtableRecord(payload, fieldMap)],
      typecast: true,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error("La soumission Airtable a echoue");
  }
}

export async function submitOrder(payload: OrderSubmissionPayload): Promise<void> {
  if (getSubmissionTarget() === "airtable") {
    await submitToAirtable(payload);
    return;
  }

  await submitToWebhook(payload);
}
