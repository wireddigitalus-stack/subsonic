/**
 * Subsonic Society — Comms Alert & Status Engine
 * 
 * Manages real-time mobile beacon states for the lower navigation bar:
 * - 🔴 RED: Critical Safety Hold, Weather Freeze, or Security Abuse Violation
 * - 🟡 AMBER: Attention Notice, Match Director Briefing, Squad Call, or COF Update
 * - 🟢 GREEN: New Incoming Chat Transmissions or Unread Messages
 * - ⚪ NONE: All notices cleared and up-to-date
 */

export type CommsAlertLevel = "red" | "amber" | "green" | "none";

export interface CommsStatusState {
  level: CommsAlertLevel;
  unreadCount: number;
  noticeTitle?: string;
  noticeDetail?: string;
  timestamp: number;
}

const STORAGE_KEY = "subsonic_comms_status";
const EVENT_NAME = "subsonic_comms_status_change";

const DEFAULT_STATE: CommsStatusState = {
  level: "none",
  unreadCount: 0,
  timestamp: Date.now(),
};

/**
 * Reads the current comms status from localStorage
 */
export function getCommsStatus(): CommsStatusState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default state with green active messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw);
    return {
      level: parsed.level || "none",
      unreadCount: typeof parsed.unreadCount === "number" ? parsed.unreadCount : 0,
      noticeTitle: parsed.noticeTitle,
      noticeDetail: parsed.noticeDetail,
      timestamp: parsed.timestamp || Date.now(),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/**
 * Updates the comms status and broadcasts the change across the window
 */
export function setCommsStatus(patch: Partial<CommsStatusState>): CommsStatusState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  const current = getCommsStatus();
  const next: CommsStatusState = {
    ...current,
    ...patch,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  } catch {
    // fallback
  }

  return next;
}

/**
 * Helper to explicitly set alert level
 */
export function setCommsAlertLevel(
  level: CommsAlertLevel,
  noticeTitle?: string,
  noticeDetail?: string
): CommsStatusState {
  return setCommsStatus({
    level,
    noticeTitle: noticeTitle || (level === "red" ? "Safety Freeze Alert" : level === "amber" ? "Match Director Notice" : level === "green" ? "New Comms Transmissions" : undefined),
    noticeDetail,
    unreadCount: level === "green" ? Math.max(1, getCommsStatus().unreadCount) : getCommsStatus().unreadCount,
  });
}

/**
 * Increments unread count and switches beacon to green if not red/amber
 */
export function incrementUnreadMessages(by = 1): CommsStatusState {
  const current = getCommsStatus();
  const newCount = (current.unreadCount || 0) + by;
  const newLevel = current.level === "red" || current.level === "amber" ? current.level : "green";

  return setCommsStatus({
    unreadCount: newCount,
    level: newLevel,
  });
}

/**
 * Clears the alert level or marks unread as read
 */
export function clearCommsAlert(targetLevel?: CommsAlertLevel): CommsStatusState {
  const current = getCommsStatus();

  if (!targetLevel || current.level === targetLevel) {
    return setCommsStatus({
      level: "none",
      unreadCount: 0,
      noticeTitle: undefined,
      noticeDetail: undefined,
    });
  }

  return current;
}

/**
 * Subscribes to comms status changes (cross-tab and in-tab)
 */
export function subscribeToCommsStatus(
  callback: (status: CommsStatusState) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<CommsStatusState>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getCommsStatus());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getCommsStatus());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  // Return unsubscribe cleanup
  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
