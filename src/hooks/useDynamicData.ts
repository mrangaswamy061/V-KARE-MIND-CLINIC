import { useState, useEffect, useCallback } from "react";
import {
  DOCTORS,
  SERVICES,
  DEFAULT_COMMUNITY_PROGRAMS,
  DEFAULT_AWARENESS_VIDEOS,
  DEFAULT_AWARENESS_BLOGS,
} from "../data/clinicData";
import { Doctor, Service, CommunityProgram, AwarenessVideo, AwarenessBlog } from "../types";

const DOCTORS_KEY = "vkare_doctors";
const SERVICES_KEY = "vkare_services";
const PROGRAMS_KEY = "vkare_programs";
const VIDEOS_KEY = "vkare_videos";
const BLOGS_KEY = "vkare_blogs";
const VERSION_KEY = "vkare_data_version";
const CURRENT_VERSION = "v3_clean_links_blogs_1";
const DYNAMIC_DATA_EVENT = "vkare_dynamic_data_updated";

function checkAndMigrateDefaults() {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      // Clean stale Instagram query fragments on saved videos without discarding custom entries
      const rawVideos = localStorage.getItem(VIDEOS_KEY);
      if (rawVideos) {
        const parsedVideos = JSON.parse(rawVideos);
        if (Array.isArray(parsedVideos)) {
          const cleaned = parsedVideos.map((v: AwarenessVideo) =>
            typeof v.videoUrl === "string" && v.videoUrl.includes("?__pwa=1")
              ? { ...v, videoUrl: "https://www.instagram.com/mind_and_brain_clinic/" }
              : v
          );
          localStorage.setItem(VIDEOS_KEY, JSON.stringify(cleaned));
        }
      }
      // Enrich untouched default blogs with full content and remove dead Instagram fallback links
      const rawBlogs = localStorage.getItem(BLOGS_KEY);
      if (rawBlogs) {
        const parsedBlogs = JSON.parse(rawBlogs);
        if (Array.isArray(parsedBlogs)) {
          const updatedBlogs = parsedBlogs.map((b: AwarenessBlog) => {
            const match = DEFAULT_AWARENESS_BLOGS.find((db) => db.id === b.id);
            if (
              match &&
              (!b.content || b.articleUrl === "https://www.instagram.com/mind_and_brain_clinic/")
            ) {
              return {
                ...match,
                ...b,
                articleUrl:
                  b.articleUrl === "https://www.instagram.com/mind_and_brain_clinic/"
                    ? undefined
                    : b.articleUrl,
                content: b.content || match.content,
              };
            }
            return b;
          });
          localStorage.setItem(BLOGS_KEY, JSON.stringify(updatedBlogs));
        }
      }
    }
  } catch {
    // ignore
  }
}
checkAndMigrateDefaults();

function loadFromStorage<T>(key: string, fallback: T[], allowEmpty: boolean = false): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && (allowEmpty || parsed.length > 0)) {
        return parsed as T[];
      }
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

function safeSaveList<T>(key: string, updated: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(DYNAMIC_DATA_EVENT, { detail: { key } }));
    return true;
  } catch (err) {
    console.error(`Failed persisting ${key}:`, err);
    return false;
  }
}

export function useDynamicData() {
  const [doctors, setDoctors] = useState<Doctor[]>(() =>
    loadFromStorage<Doctor>(DOCTORS_KEY, DOCTORS)
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage<Service>(SERVICES_KEY, SERVICES)
  );
  const [programs, setPrograms] = useState<CommunityProgram[]>(() =>
    loadFromStorage<CommunityProgram>(PROGRAMS_KEY, DEFAULT_COMMUNITY_PROGRAMS, true)
  );
  const [videos, setVideos] = useState<AwarenessVideo[]>(() =>
    loadFromStorage<AwarenessVideo>(VIDEOS_KEY, DEFAULT_AWARENESS_VIDEOS, true)
  );
  const [blogs, setBlogs] = useState<AwarenessBlog[]>(() =>
    loadFromStorage<AwarenessBlog>(BLOGS_KEY, DEFAULT_AWARENESS_BLOGS, true)
  );

  const syncByKey = useCallback((key: string | null) => {
    if (!key || key === DOCTORS_KEY) {
      setDoctors(loadFromStorage<Doctor>(DOCTORS_KEY, DOCTORS));
    }
    if (!key || key === SERVICES_KEY) {
      setServices(loadFromStorage<Service>(SERVICES_KEY, SERVICES));
    }
    if (!key || key === PROGRAMS_KEY) {
      setPrograms(
        loadFromStorage<CommunityProgram>(PROGRAMS_KEY, DEFAULT_COMMUNITY_PROGRAMS, true)
      );
    }
    if (!key || key === VIDEOS_KEY) {
      setVideos(loadFromStorage<AwarenessVideo>(VIDEOS_KEY, DEFAULT_AWARENESS_VIDEOS, true));
    }
    if (!key || key === BLOGS_KEY) {
      setBlogs(loadFromStorage<AwarenessBlog>(BLOGS_KEY, DEFAULT_AWARENESS_BLOGS, true));
    }
  }, []);

  // Keep in sync across both same-tab components and separate browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => syncByKey(e.key);
    const handleCustomSync = (e: Event) => {
      const custom = e as CustomEvent<{ key?: string }>;
      syncByKey(custom.detail?.key ?? null);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(DYNAMIC_DATA_EVENT, handleCustomSync);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DYNAMIC_DATA_EVENT, handleCustomSync);
    };
  }, [syncByKey]);

  const saveDoctors = useCallback((updated: Doctor[]): boolean => {
    const saved = safeSaveList(DOCTORS_KEY, updated);
    if (saved) setDoctors(updated);
    return saved;
  }, []);

  const saveServices = useCallback((updated: Service[]): boolean => {
    const saved = safeSaveList(SERVICES_KEY, updated);
    if (saved) setServices(updated);
    return saved;
  }, []);

  const savePrograms = useCallback((updated: CommunityProgram[]): boolean => {
    const saved = safeSaveList(PROGRAMS_KEY, updated);
    if (saved) setPrograms(updated);
    return saved;
  }, []);

  const saveVideos = useCallback((updated: AwarenessVideo[]): boolean => {
    const saved = safeSaveList(VIDEOS_KEY, updated);
    if (saved) setVideos(updated);
    return saved;
  }, []);

  const saveBlogs = useCallback((updated: AwarenessBlog[]): boolean => {
    const saved = safeSaveList(BLOGS_KEY, updated);
    if (saved) setBlogs(updated);
    return saved;
  }, []);

  return {
    doctors,
    services,
    programs,
    videos,
    blogs,
    saveDoctors,
    saveServices,
    savePrograms,
    saveVideos,
    saveBlogs,
  };
}
