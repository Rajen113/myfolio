"use client";

import { useState } from "react";
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Reply,
  Inbox,
  Search,
  X,
  Clock,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";

export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
}

interface MessagesClientProps {
  initialMessages: ContactMessageDTO[];
  initialUnreadCount: number;
}

export default function MessagesClient({
  initialMessages,
  initialUnreadCount,
}: MessagesClientProps) {
  const [messages, setMessages] = useState<ContactMessageDTO[]>(initialMessages);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ARCHIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageDTO | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter messages based on active tab & search query
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === "UNREAD" && msg.status !== "UNREAD") return false;
    if (activeTab === "ARCHIVED" && msg.status !== "ARCHIVED") return false;
    if (activeTab === "ALL" && msg.status === "ARCHIVED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = msg.name.toLowerCase().includes(q);
      const matchEmail = msg.email.toLowerCase().includes(q);
      const matchSubject = (msg.subject || "").toLowerCase().includes(q);
      const matchMessage = msg.message.toLowerCase().includes(q);
      return matchName || matchEmail || matchSubject || matchMessage;
    }

    return true;
  });

  const handleSelectMessage = async (msg: ContactMessageDTO) => {
    setSelectedMessage(msg);

    // If message is UNREAD, automatically mark as READ
    if (msg.status === "UNREAD") {
      await updateMessageStatus(msg.id, "READ");
    }
  };

  const updateMessageStatus = async (
    id: string,
    newStatus: "UNREAD" | "READ" | "ARCHIVED"
  ) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );

        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }

        // Recalculate unread count
        const newUnread = messages.reduce((acc, m) => {
          const itemStatus = m.id === id ? newStatus : m.status;
          return itemStatus === "UNREAD" ? acc + 1 : acc;
        }, 0);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        setDeleteConfirmId(null);

        // Recalculate unread count
        const newUnread = messages
          .filter((m) => m.id !== id)
          .filter((m) => m.status === "UNREAD").length;
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>Contact Leads & Inquiries</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            View and respond to direct messages submitted by visitors on your public portfolio.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-center">
          {(["ALL", "UNREAD", "ARCHIVED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "ALL" ? "Inbox" : tab === "UNREAD" ? `Unread (${unreadCount})` : "Archived"}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by sender name, email, or message keyword..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* INBOX & MESSAGE DETAIL SPLIT VIEW */}
      {filteredMessages.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Inbox className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {activeTab === "ARCHIVED"
              ? "No archived messages"
              : activeTab === "UNREAD"
              ? "No unread messages"
              : "No messages yet"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {activeTab === "ARCHIVED"
              ? "Messages you archive will be stored here."
              : "When visitors submit your public portfolio contact form, their inquiries will land right here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MESSAGES LIST (5 Columns on Large Screens) */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredMessages.map((msg) => {
              const isUnread = msg.status === "UNREAD";
              const isSelected = selectedMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-800/90 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30"
                      : isUnread
                      ? "bg-slate-900/90 border-indigo-500/30 hover:border-indigo-500/60"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {isUnread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                      )}
                      <span
                        className={`text-sm truncate ${
                          isUnread ? "font-bold text-white" : "font-medium text-slate-300"
                        }`}
                      >
                        {msg.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 mt-1 truncate">
                    {msg.subject || "No Subject"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* MESSAGE DETAIL VIEW (7 Columns on Large Screens) */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl sticky top-6">
                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        selectedMessage.status === "UNREAD"
                          ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                          : selectedMessage.status === "ARCHIVED"
                          ? "bg-slate-800 text-slate-400"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {selectedMessage.status}
                    </span>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="flex items-center gap-2">
                    {selectedMessage.status === "UNREAD" ? (
                      <button
                        type="button"
                        onClick={() => updateMessageStatus(selectedMessage.id, "READ")}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
                        title="Mark as read"
                      >
                        <MailOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateMessageStatus(selectedMessage.id, "UNREAD")}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
                        title="Mark as unread"
                      >
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Mark Unread</span>
                      </button>
                    )}

                    {selectedMessage.status === "ARCHIVED" ? (
                      <button
                        type="button"
                        onClick={() => updateMessageStatus(selectedMessage.id, "READ")}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
                        title="Unarchive message"
                      >
                        <Inbox className="w-3.5 h-3.5 text-blue-400" />
                        <span>Unarchive</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateMessageStatus(selectedMessage.id, "ARCHIVED")}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
                        title="Archive message"
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-400" />
                        <span>Archive</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(selectedMessage.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium transition-all"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Sender Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        <span>{selectedMessage.name}</span>
                      </h2>
                      <p className="text-xs font-mono text-indigo-300">
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{selectedMessage.email}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </p>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
                      <p className="flex items-center gap-1 text-slate-500 justify-end">
                        <Clock className="w-3 h-3" />
                        <span>Received</span>
                      </p>
                      <p>{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>

                  {/* Subject */}
                  {selectedMessage.subject && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-200">
                      <span className="text-slate-500 font-normal">Subject: </span>
                      {selectedMessage.subject}
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line min-h-[160px]">
                  {selectedMessage.message}
                </div>

                {/* Reply Action */}
                <div className="pt-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                      selectedMessage.subject
                        ? `Re: ${selectedMessage.subject}`
                        : `Re: MyFolio Inquiry`
                    )}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply via Email Client</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                Select a message from the list to read its content.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Message?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this contact message? It will be completely removed from your MyFolio inbox.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteMessage(deleteConfirmId)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 inline-flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
