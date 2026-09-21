import type { LiveCallSnapshot, RecentCallSummary } from "@/types";

/**
 * Demo snapshot matching SRD §33 example activity log.
 * Replace with live WebSocket/SSE payloads in a later ticket.
 */
export const DEMO_LIVE_CALL: LiveCallSnapshot = {
  callId: "call_demo_1032",
  status: "connected",
  language: "Hinglish",
  conversationState: "WAITING_FOR_USER",
  intent: "BOOK_APPOINTMENT",
  waiting: true,
  toolActivity: "checkAvailability — last success",
  appointmentResult: "Dermatology slot offered: tomorrow 6:00 PM",
  handoffStatus: "none",
  durationLabel: "01:12",
  errorMessage: null,
  activity: [
    { id: "e1", time: "10:32:01", label: "Call connected", kind: "info" },
    { id: "e2", time: "10:32:05", label: "Intent detected — BOOK_APPOINTMENT", kind: "info" },
    { id: "e3", time: "10:32:12", label: "Doctor searched — dermatology", kind: "tool" },
    { id: "e4", time: "10:32:16", label: "Availability found — tomorrow 6:00 PM", kind: "tool" },
    { id: "e5", time: "10:32:22", label: "User requested wait", kind: "wait" },
    { id: "e6", time: "10:32:22", label: "State → WAITING_FOR_USER", kind: "state" },
    { id: "e7", time: "10:32:45", label: "Background speech detected", kind: "wait" },
    { id: "e8", time: "10:32:45", label: "No response generated", kind: "wait" },
    { id: "e9", time: "10:33:02", label: "Caller returned", kind: "info" },
    { id: "e10", time: "10:33:02", label: "State → USER_RETURNED", kind: "state" },
    { id: "e11", time: "10:33:05", label: "Conversation resumed", kind: "info" },
  ],
};

export const DEMO_RECENT_CALLS: RecentCallSummary[] = [
  {
    id: "hist_001",
    caller: "+91 •••• 4412",
    language: "Hinglish",
    intent: "BOOK_APPOINTMENT",
    outcome: "Booked — Dr. Mehta, tomorrow 6:00 PM",
    durationLabel: "04:18",
    endedAt: "Today 10:28",
    stateAtEnd: "CALL_ENDING",
  },
  {
    id: "hist_002",
    caller: "+91 •••• 9081",
    language: "Hindi",
    intent: "RESCHEDULE_APPOINTMENT",
    outcome: "Rescheduled — Friday 11:30 AM",
    durationLabel: "03:02",
    endedAt: "Today 09:51",
    stateAtEnd: "CALL_ENDING",
  },
  {
    id: "hist_003",
    caller: "+1 •••• 2204",
    language: "English",
    intent: "CANCEL_APPOINTMENT",
    outcome: "Cancelled — confirmation sent",
    durationLabel: "02:11",
    endedAt: "Yesterday 16:40",
    stateAtEnd: "CALL_ENDING",
  },
  {
    id: "hist_004",
    caller: "+91 •••• 7750",
    language: "English",
    intent: "CLINIC_FAQ",
    outcome: "Human handoff — receptionist",
    durationLabel: "05:44",
    endedAt: "Yesterday 14:05",
    stateAtEnd: "HUMAN_HANDOFF",
  },
];
