export const PATIENT_STORAGE_KEYS = [
  "vkare_appointments",
  "vkare_registered_patients",
  "vkare_payment_requests",
  "vkare_payment_transactions",
] as const;

const HANDOVER_RESET_FLAG = "vkare_handover_patient_reset_2026_11_26_v1";

/**
 * Clears ONLY patient/appointment/payment test records while strictly preserving
 * services, doctors, community programs, awareness content, and doctor fee/QR settings.
 */
export function clearPatientDataOnly(): void {
  try {
    for (const key of PATIENT_STORAGE_KEYS) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    window.dispatchEvent(new CustomEvent("vkare_appointments_updated"));
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
  } catch (err) {
    console.error("Failed clearing patient storage keys:", err);
  }
}

/**
 * One-time handover initialization: starts patient, appointment, and payment records empty
 * without erasing any services, doctors, programs, awareness media, or doctor QR/fee setup.
 */
export function runHandoverPatientCleanup(): void {
  try {
    if (localStorage.getItem(HANDOVER_RESET_FLAG) === "done") return;
    for (const key of PATIENT_STORAGE_KEYS) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    localStorage.setItem(HANDOVER_RESET_FLAG, "done");
  } catch {
    // ignore storage access issues
  }
}
