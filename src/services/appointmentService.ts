// Centralized Clinical Appointment & Patient ID Service for V-KARE Clinic

export const APPOINTMENTS_STORAGE_KEY = "vkare_appointments";
export const REGISTERED_PATIENTS_KEY = "vkare_registered_patients";
export const NOTIFICATION_PHONE = "8317399068";

const MONTH_ABBRS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/**
 * Format appointment reference following the date:
 * Pattern: VK-{YEAR}-{MONTH}-{SERIAL:0001}
 * e.g. VK-2026-NOV-0001
 */
export function formatApptRef(dateStr?: string, serial: number = 1): string {
  let year = 2026;
  let month = "NOV";

  if (dateStr && typeof dateStr === "string" && dateStr.trim()) {
    const trimmed = dateStr.trim();
    // Parse YYYY-MM-DD
    const parts = trimmed.split("-");
    if (parts.length >= 2 && !isNaN(parseInt(parts[0], 10)) && !isNaN(parseInt(parts[1], 10))) {
      year = parseInt(parts[0], 10);
      const mIdx = parseInt(parts[1], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        month = MONTH_ABBRS[mIdx];
      }
    } else {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        year = d.getFullYear();
        month = MONTH_ABBRS[d.getMonth()] || "NOV";
      }
    }
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = MONTH_ABBRS[now.getMonth()] || "NOV";
  }

  const paddedSerial = String(serial).padStart(4, "0");
  return `VK-${year}-${month}-${paddedSerial}`;
}

/**
 * Scan all stored appointments to determine the next continuous serial number
 * and return the new continuous reference code (e.g. VK-2026-NOV-0001, VK-2026-NOV-0002...)
 */
export function getNextApptRef(dateStr?: string): { refId: string; serial: number } {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    let maxSerial = 0;

    if (Array.isArray(existing)) {
      existing.forEach((a: any) => {
        const id = a.id || a.refId || "";
        // Match VK-YYYY-MMM-XXXX or trailing digits
        const match = id.match(/VK-\d{4}-[A-Z]{3}-(\d+)/i) || id.match(/-(\d{4})$/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSerial) {
            maxSerial = num;
          }
        }
      });
      if (existing.length > maxSerial) {
        maxSerial = existing.length;
      }
    }

    const nextSerial = maxSerial + 1;
    return {
      serial: nextSerial,
      refId: formatApptRef(dateStr, nextSerial),
    };
  } catch {
    return {
      serial: 1,
      refId: formatApptRef(dateStr, 1),
    };
  }
}

/**
 * Format patient ID in serial up-to-down sequence (e.g. VK-P001, VK-P002...)
 */
export function formatPatientId(num: number): string {
  return `VK-P${String(num).padStart(3, "0")}`;
}

/**
 * Retrieve or allocate persistent patient ID from registered patients
 */
export async function copyToClipboardSafe(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

/**
 * Intercepts `sms:` links on desktop browsers so tabs are never trapped by
 * disallowed protocol navigations, copying the SMS body instead while letting mobile launch natively.
 */
export function handleDesktopSmsClick(
  e: { preventDefault: () => void },
  smsBody: string,
  onDesktopCopied?: () => void
): void {
  const isMobile =
    typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    e.preventDefault();
    void copyToClipboardSafe(smsBody).then(() => {
      onDesktopCopied?.();
    });
  }
}

export function getOrRegisterPatientId(
  patientName: string,
  phone: string,
  extra?: {
    email?: string;
    message?: string;
    service?: string;
    date?: string;
    age?: string;
    gender?: string;
    parentName?: string;
  }
): string {
  const cleanPhone = (phone || "").trim().replace(/[^0-9]/g, "");
  const cleanName = (patientName || "").trim();

  try {
    const regRaw = localStorage.getItem(REGISTERED_PATIENTS_KEY);
    const regList = regRaw ? JSON.parse(regRaw) : [];

    if (Array.isArray(regList)) {
      // Find existing by exact phone or case-insensitive name
      const existingIdx = regList.findIndex((p: any) => {
        const pPhone = (p.phone || "").replace(/[^0-9]/g, "");
        return (cleanPhone && pPhone === cleanPhone) || (cleanName && p.name.toLowerCase() === cleanName.toLowerCase());
      });

      if (existingIdx >= 0) {
        const existing = regList[existingIdx];
        const pId = existing.regId && existing.regId.startsWith("VK-P")
          ? existing.regId
          : formatPatientId(existingIdx + 1);
        existing.regId = pId;
        if (extra?.date) existing.lastVisit = extra.date;
        if (extra?.service) existing.service = extra.service;
        if (extra?.email) existing.email = extra.email;
        if (extra?.message) existing.notes = extra.message;
        if (extra?.age) existing.age = extra.age;
        if (extra?.gender) existing.gender = extra.gender;
        if (extra?.parentName) existing.parent = extra.parentName;
        localStorage.setItem(REGISTERED_PATIENTS_KEY, JSON.stringify(regList));
        return pId;
      }

      // New patient registration
      const nextNum = regList.length + 1;
      const patientId = formatPatientId(nextNum);
      regList.push({
        regId: patientId,
        name: cleanName || `Patient ${nextNum}`,
        age: extra?.age || "—",
        gender: extra?.gender || "—",
        parent: extra?.parentName || "—",
        address: "Tumkur",
        phone: cleanPhone || phone,
        email: extra?.email || "",
        service: extra?.service || "Mind & Brain Care",
        lastVisit: extra?.date || new Date().toISOString().split("T")[0],
        notes: extra?.message || "Clinic Consultation Booking",
      });
      localStorage.setItem(REGISTERED_PATIENTS_KEY, JSON.stringify(regList));
      return patientId;
    }
  } catch {}

  return "VK-P001";
}
