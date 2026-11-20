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

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[];
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export function useDynamicData() {
  const [doctors, setDoctors] = useState<Doctor[]>(() =>
    loadFromStorage<Doctor>(DOCTORS_KEY, DOCTORS)
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage<Service>(SERVICES_KEY, SERVICES)
  );
  const [programs, setPrograms] = useState<CommunityProgram[]>(() =>
    loadFromStorage<CommunityProgram>(PROGRAMS_KEY, DEFAULT_COMMUNITY_PROGRAMS)
  );
  const [videos, setVideos] = useState<AwarenessVideo[]>(() =>
    loadFromStorage<AwarenessVideo>(VIDEOS_KEY, DEFAULT_AWARENESS_VIDEOS)
  );
  const [blogs, setBlogs] = useState<AwarenessBlog[]>(() =>
    loadFromStorage<AwarenessBlog>(BLOGS_KEY, DEFAULT_AWARENESS_BLOGS)
  );

  // Keep in sync if localStorage changes (e.g. admin tab saves while public site is open)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DOCTORS_KEY) {
        setDoctors(loadFromStorage<Doctor>(DOCTORS_KEY, DOCTORS));
      }
      if (e.key === SERVICES_KEY) {
        setServices(loadFromStorage<Service>(SERVICES_KEY, SERVICES));
      }
      if (e.key === PROGRAMS_KEY) {
        setPrograms(loadFromStorage<CommunityProgram>(PROGRAMS_KEY, DEFAULT_COMMUNITY_PROGRAMS));
      }
      if (e.key === VIDEOS_KEY) {
        setVideos(loadFromStorage<AwarenessVideo>(VIDEOS_KEY, DEFAULT_AWARENESS_VIDEOS));
      }
      if (e.key === BLOGS_KEY) {
        setBlogs(loadFromStorage<AwarenessBlog>(BLOGS_KEY, DEFAULT_AWARENESS_BLOGS));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveDoctors = useCallback((updated: Doctor[]) => {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(updated));
    setDoctors(updated);
  }, []);

  const saveServices = useCallback((updated: Service[]) => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
    setServices(updated);
  }, []);

  const savePrograms = useCallback((updated: CommunityProgram[]) => {
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(updated));
    setPrograms(updated);
  }, []);

  const saveVideos = useCallback((updated: AwarenessVideo[]) => {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(updated));
    setVideos(updated);
  }, []);

  const saveBlogs = useCallback((updated: AwarenessBlog[]) => {
    localStorage.setItem(BLOGS_KEY, JSON.stringify(updated));
    setBlogs(updated);
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
