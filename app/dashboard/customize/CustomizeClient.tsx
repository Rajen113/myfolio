"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PortfolioCustomization,
  PortfolioData,
} from "@/types/portfolio";
import {
  DEFAULT_CUSTOMIZATION,
  THEME_MODE_OPTIONS,
  PRESET_THEME_COLORS,
  FONT_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  isValidHexColor,
} from "@/lib/constants/portfolio-customization";
import {
  Palette,
  Type,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Save,
  Eye,
  Check,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import SeoSettingsSection from "@/components/portfolio/SeoSettingsSection";

interface CustomizeClientProps {
  initialCustomization: PortfolioCustomization;
  initialTemplate: string;
  portfolioData: PortfolioData;
  initialSeoTitle: string | null;
  initialSeoDescription: string | null;
  primaryUrl?: string;
}

export default function CustomizeClient({
  initialCustomization,
  initialTemplate,
  portfolioData,
  initialSeoTitle,
  initialSeoDescription,
  primaryUrl,
}: CustomizeClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"visual" | "seo">("visual");

  const [customization, setCustomization] =
    useState<PortfolioCustomization>(initialCustomization);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const handleFieldChange = <K extends keyof PortfolioCustomization>(
    key: K,
    value: PortfolioCustomization[K]
  ) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (!isValidHexColor(customization.themeColor)) {
      setErrorMessage("Please enter a valid hex color (e.g. #2563EB).");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/portfolio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customization),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save portfolio customization.");
      }

      setSuccessMessage("✓ Portfolio customization saved successfully.");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred while saving customization.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    setShowResetModal(false);
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/portfolio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_CUSTOMIZATION),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset customization.");
      }

      setSuccessMessage("✓ Portfolio customization reset to defaults.");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred while resetting customization.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>Appearance & SEO Control</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Customize Portfolio
          </h1>
          <p className="text-sm text-slate-400">
            Personalize your public portfolio appearance, typography, layout, and search engine metadata.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "visual"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Visual Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "seo"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>SEO & Social</span>
          </button>
        </div>
      </div>

      {activeTab === "seo" ? (
        <SeoSettingsSection
          initialSeoTitle={initialSeoTitle}
          initialSeoDescription={initialSeoDescription}
          portfolioData={portfolioData}
          themeColor={customization.themeColor}
          primaryUrl={primaryUrl}
        />
      ) : (
        <>
          {/* Mobile Preview Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{showMobilePreview ? "Hide Preview" : "Show Live Preview"}</span>
            </button>
          </div>

          {/* Notifications */}
          {successMessage && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CONTROLS PANEL */}
            <div className="lg:col-span-5 space-y-8 glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
              {/* SECTION 1: APPEARANCE & THEME */}
              <div className="space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>Theme & Appearance</span>
                </h2>

                {/* Theme Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_MODE_OPTIONS.map((mode) => {
                      const isChecked = customization.themeMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => handleFieldChange("themeMode", mode.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Color */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Theme Color Accent
                  </label>

                  {/* Preset Color Palette */}
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_THEME_COLORS.map((preset) => {
                      const isSelected =
                        customization.themeColor.toLowerCase() ===
                        preset.value.toLowerCase();
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          title={preset.name}
                          onClick={() => handleFieldChange("themeColor", preset.value)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                            isSelected ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: preset.value }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hex Custom Color Input */}
                  <div className="flex items-center gap-3 pt-1">
                    <div
                      className="w-8 h-8 rounded-lg border border-slate-700 shrink-0 shadow"
                      style={{ backgroundColor: customization.themeColor }}
                    />
                    <input
                      type="text"
                      value={customization.themeColor}
                      onChange={(e) => handleFieldChange("themeColor", e.target.value)}
                      placeholder="#2563EB"
                      maxLength={7}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: TYPOGRAPHY & BUTTON STYLES */}
              <div className="space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Type className="w-4 h-4 text-indigo-400" />
                  <span>Typography & Elements</span>
                </h2>

                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Font Family
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((font) => {
                      const isSelected = customization.fontFamily === font.value;
                      return (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() => handleFieldChange("fontFamily", font.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {font.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Button Style */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Button Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUTTON_STYLE_OPTIONS.map((style) => {
                      const isSelected = customization.buttonStyle === style.value;
                      return (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => handleFieldChange("buttonStyle", style.value)}
                          className={`px-2 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Card & Container Radius
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BORDER_RADIUS_OPTIONS.map((radius) => {
                      const isSelected = customization.borderRadius === radius.value;
                      return (
                        <button
                          key={radius.value}
                          type="button"
                          onClick={() => handleFieldChange("borderRadius", radius.value)}
                          className={`px-2 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {radius.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 3: SECTION VISIBILITY */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Section Visibility</span>
                </h2>

                <div className="space-y-3 text-xs">
                  {[
                    { key: "showAbout", label: "About / Bio Section" },
                    { key: "showSkills", label: "Skills Section" },
                    { key: "showProjects", label: "Projects Section" },
                    { key: "showExperience", label: "Experience Section" },
                    { key: "showEducation", label: "Education Section" },
                    { key: "showContact", label: "Contact Form / Details" },
                    { key: "showSocialLinks", label: "Social Links" },
                  ].map((sec) => {
                    const isVisible = Boolean(
                      customization[sec.key as keyof PortfolioCustomization]
                    );
                    return (
                      <label
                        key={sec.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                      >
                        <span className="font-semibold text-slate-300">
                          {sec.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) =>
                            handleFieldChange(
                              sec.key as keyof PortfolioCustomization,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONS FOOTER */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowResetModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* RIGHT LIVE PREVIEW PANEL */}
            <div
              className={`lg:col-span-7 space-y-4 ${
                showMobilePreview ? "block" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Live Interactive Preview</span>
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  Template: {initialTemplate}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl max-h-[850px] overflow-y-auto relative">
                <PortfolioRenderer
                  portfolioData={portfolioData}
                  template={initialTemplate}
                  customization={customization}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* CONFIRMATION MODAL FOR RESET */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-400" />
                <span>Reset Customization?</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will restore all theme colors, typography, layout styles, and section visibility settings to their defaults. Your profile, projects, skills, experience, and education data will remain untouched.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-md shadow-indigo-500/20"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
