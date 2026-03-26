"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { storage } from "../lib/storage";

// Dynamically import to avoid SSR issues with window/document access
const MarketingHub = dynamic(() => import("../components/MarketingHub"), { ssr: false });
const AIAssistant = dynamic(() => import("../components/AIAssistant"), { ssr: false });

// Inject the storage polyfill into window so the hub component can use it
// without modification (it calls window.storage.get / .set)
function StorageInjector() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.storage = storage;
    }
  }, []);
  return null;
}

export default function Page() {
  const [aiOpen, setAiOpen] = useState(false);

  // Shadow state — mirrors what the hub stores, so the AI gets live context
  const [hubState, setHubState] = useState({
    brands: null,
    company: null,
    initiatives: null,
    campaigns: null,
    strategy: null,
    teamMembers: null,
  });

  // Poll hub state from localStorage so AI always has fresh context
  useEffect(() => {
    const sync = async () => {
      const [s, i, co, br, ca, tm] = await Promise.all([
        storage.get("ns-strategy"),
        storage.get("ns-initiatives"),
        storage.get("ns-company"),
        storage.get("ns-brands"),
        storage.get("ns-campaigns", true),
        storage.get("ns-team", true),
      ]);
      setHubState({
        strategy: s ? JSON.parse(s.value) : null,
        initiatives: i ? JSON.parse(i.value) : [],
        company: co ? JSON.parse(co.value) : null,
        brands: br ? JSON.parse(br.value) : null,
        campaigns: ca ? JSON.parse(ca.value) : [],
        teamMembers: tm ? JSON.parse(tm.value) : [],
      });
    };

    // Sync immediately and then every 3 seconds so AI sees live changes
    sync();
    const id = setInterval(sync, 3000);
    return () => clearInterval(id);
  }, []);

  /**
   * Handle actions emitted by the AI assistant.
   * Each action type reads current storage, mutates, and writes back —
   * which causes the MarketingHub to re-read and update via its own effects.
   */
  const handleAction = useCallback(async (action) => {
    if (!action?.type) return;
    const { type, payload } = action;

    switch (type) {
      case "ADD_INITIATIVE": {
        const existing = await storage.get("ns-initiatives");
        const list = existing ? JSON.parse(existing.value) : [];
        const newInit = {
          id: `init-ai-${Date.now()}`,
          title: payload.title || "Untitled Initiative",
          description: payload.description || "",
          owner: payload.owner || "Brand Team",
          pillar: payload.pillar || "Brand & Identity",
          quarter: payload.quarter || "Q2 2026",
          brandId: payload.brandId || null,
          startDate: payload.startDate || "",
          endDate: payload.endDate || "",
          revolving: payload.revolving || false,
          fileUrl: null, fileName: null, _brief: null, _briefSource: null,
        };
        await storage.set("ns-initiatives", JSON.stringify([...list, newInit]));
        // Force a re-render hint via a custom event
        window.dispatchEvent(new CustomEvent("hub-updated", { detail: { type } }));
        break;
      }

      case "UPDATE_INITIATIVE": {
        const existing = await storage.get("ns-initiatives");
        const list = existing ? JSON.parse(existing.value) : [];
        const updated = list.map(init =>
          init.id === payload.id ? { ...init, ...payload.updates } : init
        );
        await storage.set("ns-initiatives", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("hub-updated", { detail: { type } }));
        break;
      }

      case "ADD_CAMPAIGN": {
        const existing = await storage.get("ns-campaigns", true);
        const list = existing ? JSON.parse(existing.value) : [];
        const newCampaign = {
          id: `cmp-ai-${Date.now()}`,
          title: payload.title || "Untitled Campaign",
          brand: payload.brand || "CÚRADOR",
          concept: payload.concept || "",
          status: payload.status || "brief",
          brief: payload.brief || null,
          createdAt: new Date().toISOString(),
        };
        await storage.set("ns-campaigns", JSON.stringify([newCampaign, ...list]), true);
        window.dispatchEvent(new CustomEvent("hub-updated", { detail: { type } }));
        break;
      }

      case "UPDATE_STRATEGY": {
        const existing = await storage.get("ns-strategy");
        const strategy = existing ? JSON.parse(existing.value) : {};
        await storage.set("ns-strategy", JSON.stringify({ ...strategy, ...payload }));
        window.dispatchEvent(new CustomEvent("hub-updated", { detail: { type } }));
        break;
      }

      case "SUGGEST_BRIEF": {
        // No hub mutation — the AI message shows the brief inline
        console.log("Brief suggestion:", payload);
        break;
      }

      default:
        console.warn("Unknown AI action:", type);
    }
  }, []);

  return (
    <>
      <StorageInjector />
      <MarketingHub />
      <AIAssistant
        hubState={hubState}
        onAction={handleAction}
        isOpen={aiOpen}
        onToggle={() => setAiOpen(o => !o)}
      />
    </>
  );
}
