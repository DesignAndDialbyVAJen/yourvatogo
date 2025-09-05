import React, { useEffect, useState } from "react";

// Staffingly Notes - Single-file React component
// Usage: paste into a React app (Create React App, Vite, CodeSandbox). Tailwind required for styling.

export default function StaffinglyNotes() {
  const STORAGE_KEY = "staffingly-notes";

  const blank = { id: null, datetime: "", name: "", phone: "", email: "", notes: "" };
  const [now, setNow] = useState(new Date());
  const [form, setForm] = useState(() => ({ ...blank }));
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSave(e) {
    e && e.preventDefault();
    const entry = {
      id: form.id ?? Date.now(),
      datetime: form.datetime || new Date().toLocaleString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    };

    setNotes((prev) => {
      const exists = prev.find((p) => p.id === entry.id);
      if (exists) {
        return prev.map((p) => (p.id === entry.id ? entry : p));
      }
      return [entry, ...prev];
    });

    setForm({ ...blank });
  }

  function handleEdit(id) {
    const item = notes.find((n) => n.id === id);
    if (!item) return;
    setForm({ ...item });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((p) => p.id !== id));
  }

  function handleClearAll() {
    if (!confirm("Clear ALL notes? This cannot be undone.")) return;
    setNotes([]);
  }

  function handleExportCSV() {
    if (!notes.length) return alert("No notes to export.");
    const headers = ["DateTime", "Name", "Phone", "Email", "Notes"];
    const rows = notes.map((r) => [r.datetime, r.name, r.phone, r.email, r.notes]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staffingly-notes-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function filteredNotes() {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.phone.toLowerCase().includes(q) ||
        n.email.toLowerCase().includes(q) ||
        n.notes.toLowerCase().includes(q) ||
        n.datetime.toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold mb-1">Staffingly Notes</h1>
          <p className="text-sm text-gray-600">Simple notepad for staff — saves to your PC (browser) localStorage.</p>
        </header>

        <section className="bg-white rounded-2xl shadow p-6 mb-6">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Date and Time (PC Time)</label>
                <input
                  name="datetime"
                  value={form.datetime || now.toLocaleString()}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone or mobile"
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 p-2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Write your notes here..."
                className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 p-3"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                {form.id ? "Update Note" : "Save Note"}
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...blank })}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
              >
                Clear
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
                >
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2 rounded-lg border border-red-200 bg-white text-red-600"
                >
                  Clear All
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-lg p-2 border border-gray-200"
            />
            <div className="text-sm text-gray-500">Showing {filteredNotes().length} notes</div>
          </div>

          <div className="space-y-3">
            {filteredNotes().length === 0 && (
              <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">No notes yet.</div>
            )}

            {filteredNotes().map((n) => (
              <article key={n.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">{n.datetime}</div>
                  <h3 className="font-semibold text-lg mt-1">{n.name || "—"}</h3>
                  <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{n.notes || "(no notes)"}</div>
                  <div className="text-xs text-gray-500 mt-2">{n.phone ? `Phone: ${n.phone}` : ""} {n.email ? ` • ${n.email}` : ""}</div>
                </div>

                <div className="mt-3 md:mt-0 md:ml-4 flex gap-2">
                  <button onClick={() => handleEdit(n.id)} className="px-3 py-2 rounded-lg border bg-white">Edit</button>
                  <button onClick={() => handleDelete(n.id)} className="px-3 py-2 rounded-lg border border-red-200 text-red-600">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 mt-8">Notes are stored locally in your browser. No data leaves your PC.</footer>
      </div>
    </div>
  );
}
