import { round, sum, ratio, days, money, metric, notice } from "./lib.mjs";
export const config = {
  slug: "booking-conversion-kit",
  title: "Booking Conversion Kit",
  description:
    "Qualify consultation requests and manage conflict-free appointment slots.",
  scope:
    "A local booking desk with a downloadable intake form. Visitors prepare an email request; your team confirms appointments manually. No external calendar synchronization.",
  method:
    "Confirmed bookings for the same owner must not overlap. Times are UTC. Requested slots do not reserve capacity. Adjacent appointments are allowed.",
  port: 4416,
  asOf: "2026-11-15",
  fields: [
    {
      key: "name",
      label: "Customer / business name",
      type: "text",
    },
    {
      key: "email",
      label: "Customer email",
      type: "email",
    },
    {
      key: "owner",
      label: "Owner",
      type: "text",
    },
    {
      key: "start",
      label: "Appointment starts (UTC)",
      type: "datetime-local",
    },
    {
      key: "duration",
      label: "Duration (minutes)",
      type: "number",
      min: 5,
      max: 480,
      integer: true,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["requested", "confirmed", "completed", "cancelled", "no-show"],
    },
    {
      key: "budget",
      label: "Available budget",
      type: "number",
      min: 0,
      max: 100000000,
    },
    {
      key: "requirements",
      label: "What the customer needs",
      type: "text",
    },
  ],
  settings: [
    {
      key: "currency",
      label: "Currency code (one currency per workspace)",
      type: "text",
      maxLength: 3,
    },
    {
      key: "minimumBudget",
      label: "Qualification budget threshold",
      type: "number",
      min: 0,
      max: 100000000,
    },
  ],
  actions: [
    {
      label: "Confirm slot",
      patch: {
        status: "confirmed",
      },
      when: {
        status: ["requested"],
      },
    },
    {
      label: "Mark completed",
      patch: {
        status: "completed",
      },
      when: {
        status: ["confirmed"],
      },
    },
  ],
  document: false,
};
config.validate = function validate(records) {
  const confirmed = records.filter((r) => r.status === "confirmed");
  for (let i = 0; i < confirmed.length; i++)
    for (let j = i + 1; j < confirmed.length; j++) {
      const a = confirmed[i],
        b = confirmed[j];
      const sa = Date.parse(a.start + "Z"),
        sb = Date.parse(b.start + "Z");
      if (
        a.owner.toLowerCase() === b.owner.toLowerCase() &&
        sa < sb + b.duration * 60000 &&
        sb < sa + a.duration * 60000
      )
        throw new Error("Confirmed appointments overlap for the same owner");
    }
};
export const example = {
  schemaVersion: 1,
  project: "booking-conversion-kit",
  settings: {
    currency: "USD",
    minimumBudget: 1000,
  },
  records: [
    {
      id: "booking-1",
      name: "Maple Studio",
      email: "buyer@example.com",
      owner: "Amina",
      start: "2026-11-16T10:00",
      duration: 30,
      status: "confirmed",
      budget: 3000,
      requirements: "Discuss a customer portal",
    },
    {
      id: "booking-2",
      name: "River Foods",
      email: "team@example.com",
      owner: "Amina",
      start: "2026-11-16T11:00",
      duration: 30,
      status: "requested",
      budget: 500,
      requirements: "Discuss an inventory dashboard",
    },
  ],
};
export function analyze(records, s, asOf) {
  return {
    metrics: [
      metric(
        "Requests awaiting review",
        records.filter((r) => r.status === "requested").length,
      ),
      metric(
        "Upcoming confirmations",
        records.filter(
          (r) => r.status === "confirmed" && r.start.slice(0, 10) >= asOf,
        ).length,
      ),
      metric(
        "Qualified requests",
        records.filter(
          (r) => r.status === "requested" && r.budget >= s.minimumBudget,
        ).length,
      ),
    ],
    notices: records
      .filter((r) => r.status === "confirmed" && r.start.slice(0, 10) < asOf)
      .map((r) =>
        notice(
          r.id,
          `${r.name}: record the outcome of this past appointment.`,
          "warning",
        ),
      ),
    columns: ["Customer", "Owner", "Starts (UTC)", "Status", "Budget fit"],
    rows: records.map((r) => ({
      id: r.id,
      Customer: r.name,
      Owner: r.owner,
      "Starts (UTC)": r.start.replace("T", " "),
      Status: r.status,
      "Budget fit":
        r.budget >= s.minimumBudget ? "Meets threshold" : "Review scope",
    })),
  };
}
