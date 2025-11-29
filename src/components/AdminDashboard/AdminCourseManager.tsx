import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  Image,
  ChevronDown,
  ChevronRight,
  X,
  Copy,
} from "lucide-react";

// AdminCourseManager.tsx
// - Full polished admin manager
// - Features: role-based access, enrollment drawer (search + bulk enroll + approval),
//   course cloning, drag & drop reordering (chapters & lessons), video upload + auto-duration,
//   thumbnail capture, activity log, progress quick-stats, and confetti on publish.
// Dependencies: axios, framer-motion, canvas-confetti, react-beautiful-dnd, lucide-react, tailwindcss

const API_BASE = "/api";

/* ------------------------------ Types -------------------------------- */
type Lesson = { id: string; title: string; duration?: string; videoUrl?: string | null; thumbnailUrl?: string | null };
type Chapter = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; description?: string; image_url?: string | null; chapters: Chapter[]; status?: string };
type UserShort = { id: string; name: string; email: string; role?: string };

type Activity = { id: string; text: string; time: string };

/* --------------------------- helpers --------------------------------- */
const uid = (p = "") => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${p}`;
const clamp = (v:number, a:number,b:number)=> Math.max(a, Math.min(b,v));

/* ------------------------ Small subcomponents ------------------------- */
function IconButton({ children, ...props }: any) {
  return (
    <button {...props} className={`inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 ${props.className || ""}`}>
      {children}
    </button>
  );
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------ Main admin component ----------------------- */
export default function AdminCourseManager({ currentUser }: { currentUser?: UserShort }) {
  // state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<null | Course>(null);
  const [draftImagePreview, setDraftImagePreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  // enrollment drawer
  const [enrollDrawer, setEnrollDrawer] = useState<{ open: boolean; courseId?: string } | null>(null);
  const [users, setUsers] = useState<UserShort[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState(0);

  // activity & progress
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({}); // courseId -> percent

  const searchTimer = useRef<number | null>(null);

  // role helpers
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin";
  const isInstructor = currentUser?.role === "instructor";

  /* --------------------- load initial data --------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cRes, aRes, pRes] = await Promise.all([
          axios.get(`${API_BASE}/courses`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/activities`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/enrollments/pending/count`).catch(() => ({ data: { count: 0 } })),
        ]);
        setCourses(cRes.data || []);
        setActivities(aRes.data || []);
        setPendingEnrollmentsCount(pRes.data?.count || 0);
        // compute quick mock progress
        const pm: Record<string, number> = {};
        (cRes.data || []).forEach((c: Course) => { pm[c.id] = Math.floor(Math.random() * 60); });
        setProgressMap(pm);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------------- Enrollment UX ------------------------ */
  useEffect(() => {
    if (!enrollDrawer?.open) return;
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE}/users?search=${encodeURIComponent(userQuery)}`);
        setUsers(res.data || []);
      } catch (e) {
        setUsers([]);
      }
    }, 250);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [userQuery, enrollDrawer]);

  const openEnrollDrawer = (courseId?: string) => {
    if (!isAdmin) return alert("Only admins can enroll learners");
    setEnrollDrawer({ open: true, courseId });
    setUserQuery(""); setUsers([]); setSelectedUsers({}); setSelectAll(false);
  };
  const closeEnrollDrawer = () => setEnrollDrawer(null);

  const toggleUserSelect = (id: string) => setSelectedUsers((s) => ({ ...s, [id]: !s[id] }));
  const toggleSelectAll = () => {
    const next = !selectAll; setSelectAll(next);
    if (next) {
      const map: Record<string, boolean> = {};
      users.forEach((u) => (map[u.id] = true));
      setSelectedUsers(map);
    } else setSelectedUsers({});
  };

  const doBulkEnroll = async (approveImmediately = false) => {
    if (!enrollDrawer?.courseId) return;
    const ids = Object.keys(selectedUsers).filter((k) => selectedUsers[k]);
    if (ids.length === 0) return alert("Select at least one user");
    try {
      await axios.post(`${API_BASE}/enrollments/bulk`, { courseId: enrollDrawer.courseId, userIds: ids, approve: approveImmediately });
      confetti({ particleCount: 70, spread: 50 });
      setActivities((a) => [{ id: uid("act"), text: `Enrolled ${ids.length} users to course`, time: new Date().toISOString() }, ...a]);
      closeEnrollDrawer();
    } catch (e) {
      alert("Bulk enroll failed");
    }
  };

  /* ---------------------- Course CRUD ------------------------ */
  const openNew = () => {
    const newCourse: Course = { id: uid("course"), title: "", description: "", image_url: null, chapters: [{ id: uid("ch"), title: "Chapter 1", lessons: [{ id: uid("l"), title: "Lesson 1", videoUrl: null }] }], status: "draft" };
    setEditing(newCourse); setDraftImagePreview(null);
  };
  const openEdit = (c: Course) => { setEditing(JSON.parse(JSON.stringify(c))); setDraftImagePreview(c.image_url || null); };
  const discardEdit = () => { setEditing(null); setDraftImagePreview(null); };

  const saveCourse = async (opts?: { publish?: boolean }) => {
    if (!editing) return; if (!editing.title.trim()) return alert("Title required");
    try {
      setLoading(true);
      const payload = { ...editing }; if (opts?.publish) payload.status = "published";
      const res = await axios.post(`${API_BASE}/courses`, payload).catch(() => ({ data: payload }));
      const saved: Course = res.data;
      setCourses((p) => { const exists = p.some((x) => x.id === saved.id); if (exists) return p.map((x)=>x.id===saved.id?saved:x); return [saved, ...p]; });
      if (saved.status === "published") confetti({ particleCount: 120, spread: 80 });
      setActivities((a) => [{ id: uid("act"), text: `Course ${saved.title} saved${saved.status==="published"?" & published":""}`, time: new Date().toISOString() }, ...a]);
      setEditing(null); setDraftImagePreview(null);
    } finally { setLoading(false); }
  };

  const deleteCourse = async (id: string) => { if (!confirm("Delete course?")) return; try { await axios.delete(`${API_BASE}/courses/${id}`); setCourses((c)=>c.filter(x=>x.id!==id)); setActivities((a)=>[{ id: uid("act"), text: `Deleted course`, time: new Date().toISOString() }, ...a]); } catch { setCourses((c)=>c.filter(x=>x.id!==id)); } };

  const cloneCourse = async (c: Course) => {
    const clone = JSON.parse(JSON.stringify(c)); clone.id = uid("course"); clone.title = `${c.title} (Copy)`;
    try {
      const res = await axios.post(`${API_BASE}/courses`, clone).catch(() => ({ data: clone }));
      setCourses((p)=>[res.data, ...p]);
      setActivities((a)=>[{ id: uid("act"), text: `Cloned course ${c.title}`, time: new Date().toISOString() }, ...a]);
    } catch { }
  };

  /* ------------------- Drag & drop handlers -------------------- */
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (!editing) return;

    // chapters reorder
    if (type === "chapter") {
      const ch = Array.from(editing.chapters);
      const [m] = ch.splice(source.index, 1);
      ch.splice(destination.index, 0, m);
      setEditing({ ...editing, chapters: ch });
      return;
    }

    // lessons reorder (within same chapter or across chapters)
    if (type === "lesson") {
      const ch = Array.from(editing.chapters);
      const sIdx = Number(source.droppableId.replace("chapter-", ""));
      const dIdx = Number(destination.droppableId.replace("chapter-", ""));
      const sLessons = Array.from(ch[sIdx].lessons);
      const [m] = sLessons.splice(source.index, 1);
      ch[sIdx].lessons = sLessons;
      const dLessons = Array.from(ch[dIdx].lessons);
      dLessons.splice(destination.index, 0, m);
      ch[dIdx].lessons = dLessons;
      setEditing({ ...editing, chapters: ch });
      return;
    }
  };

  /* ------------------- Video helpers -------------------- */
  // extract duration and optionally thumbnail from uploaded file (client-side) then upload
  const handleVideoFile = async (chId: string, lId: string, file?: File | null) => {
    if (!editing) return;
    if (!file) { updateLesson(chId, lId, { videoUrl: null, duration: undefined, thumbnailUrl: null }); return; }
    const objectUrl = URL.createObjectURL(file);
    updateLesson(chId, lId, { videoUrl: objectUrl });

    try {
      // read duration using a hidden video element
      const vid = document.createElement("video");
      vid.preload = "metadata";
      vid.src = objectUrl;
      await new Promise((res) => { vid.onloadedmetadata = res; });
      const dur = Math.floor(vid.duration);
      const mm = `${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')}`;
      updateLesson(chId, lId, { duration: mm });

      // capture thumbnail at 2s (if available)
      const canvas = document.createElement("canvas");
      canvas.width = vid.videoWidth || 320; canvas.height = vid.videoHeight || 180;
      vid.currentTime = clamp(2, 0, vid.duration || 0);
      await new Promise((res) => { vid.onseeked = res; });
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(vid, 0, 0, canvas.width, canvas.height); const dataUrl = canvas.toDataURL("image/jpeg", 0.8); updateLesson(chId, lId, { thumbnailUrl: dataUrl }); }

      // upload file to API (multipart)
      const form = new FormData(); form.append("file", file);
      const up = await axios.post(`${API_BASE}/upload/video`, form, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => ({ data: { url: objectUrl } }));
      const url = up.data?.url || objectUrl;
      updateLesson(chId, lId, { videoUrl: url });

      // upload thumbnail if present to /upload/image
      const thumbData = canvas.toDataURL("image/jpeg", 0.8);
      const blob = await (await fetch(thumbData)).blob();
      const f = new File([blob], `${lId}-thumb.jpg`, { type: "image/jpeg" });
      const imgForm = new FormData(); imgForm.append("file", f);
      const imgUp = await axios.post(`${API_BASE}/upload/image`, imgForm).catch(() => ({ data: { url: thumbData } }));
      const thumbUrl = imgUp.data?.url || thumbData;
      updateLesson(chId, lId, { thumbnailUrl: thumbUrl });

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- editing helpers ---------------- */
  const updateChapterTitle = (chId: string, title: string) => { if (!editing) return; setEditing({ ...editing, chapters: editing.chapters.map((ch) => ch.id === chId ? { ...ch, title } : ch) }); };
  const updateLesson = (chId: string, lId: string, patch: Partial<Lesson>) => { if (!editing) return; setEditing({ ...editing, chapters: editing.chapters.map((ch)=> ch.id===chId ? { ...ch, lessons: ch.lessons.map((l)=> l.id===lId ? { ...l, ...patch } : l) } : ch) }); };
  const addChapter = () => { if (!editing) return; const next: Chapter = { id: uid("ch"), title: `Chapter ${editing.chapters.length+1}`, lessons: [{ id: uid("l"), title: "New lesson", videoUrl: null }] }; setEditing({ ...editing, chapters: [...editing.chapters, next] }); };
  const removeChapter = (chId: string) => { if (!editing) return; setEditing({ ...editing, chapters: editing.chapters.filter((c)=>c.id!==chId) }); };
  const addLesson = (chId: string) => { if (!editing) return; setEditing({ ...editing, chapters: editing.chapters.map((ch)=> ch.id===chId ? { ...ch, lessons: [...ch.lessons, { id: uid("l"), title: "New lesson", videoUrl: null }] } : ch) }); };
  const removeLesson = (chId:string, lId:string) => { if (!editing) return; setEditing({ ...editing, chapters: editing.chapters.map((ch)=> ch.id===chId ? { ...ch, lessons: ch.lessons.filter((l)=> l.id!==lId) } : ch) }); };

  /* ------------------ UI helpers ------------------ */
  const quickStats = useMemo(()=>({ total: courses.length, pending: pendingEnrollmentsCount, activities: activities.slice(0,5) }), [courses, pendingEnrollmentsCount, activities]);

  /* --------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-white text-slate-900 p-6">
      <div className="max-w-[1200px] mx-auto flex gap-6">
        {/* left column: controls & stats */}
        <aside className="w-[320px] flex-shrink-0 rounded-lg overflow-hidden shadow bg-white border">
          <div className="px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Admin — Courses</h3>
            <div className="text-sm text-slate-500">Manage content & enroll users</div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Courses</div>
                <div className="font-medium text-lg">{quickStats.total}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Pending enroll</div>
                <div className="font-medium text-lg">{quickStats.pending}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">Recent activity</div>
              <div className="space-y-2 max-h-40 overflow-auto">
                {quickStats.activities.map((a) => (
                  <div key={a.id} className="text-sm text-slate-600">• {a.text} <span className="text-xs text-slate-400 ml-2">{new Date(a.time).toLocaleString()}</span></div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button onClick={openNew} className="w-full px-3 py-2 rounded bg-blue-600 text-white flex items-center justify-center gap-2"> <Plus size={14} /> New course</button>
            </div>

            <div className="pt-2">
              <label className="text-xs text-slate-500">View</label>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setViewMode("grid")} className={`px-2 py-1 rounded ${viewMode==="grid"?"bg-slate-100":"hover:bg-slate-50"}`}>Grid</button>
                <button onClick={() => setViewMode("list")} className={`px-2 py-1 rounded ${viewMode==="list"?"bg-slate-100":"hover:bg-slate-50"}`}>List</button>
              </div>
            </div>
          </div>
        </aside>

        {/* main area */}
        <main className="flex-1 rounded-lg overflow-hidden bg-white border p-4">
          {loading && <div className="text-sm text-slate-500">Loading…</div>}

          {/* courses grid/list */}
          {!editing && viewMode === "grid" && (
            <div>
              <div className="text-xl font-semibold mb-4">Courses</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="bg-white border rounded shadow-sm overflow-hidden">
                    <div className="w-full h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {c.image_url ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" /> : <div className="text-slate-400">No image</div>}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.description}</div>
                          <div className="text-xs text-slate-400 mt-2">{(c.chapters || []).length} chapters</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-slate-500">{progressMap[c.id] ?? 0}%</div>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(c)} className="px-2 py-1 rounded bg-slate-50 text-slate-700">Edit</button>
                            <button onClick={() => cloneCourse(c)} className="px-2 py-1 rounded bg-slate-50"> <Copy size={14} /> </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {isAdmin && <button onClick={() => openEnrollDrawer(c.id)} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Enroll learners</button>}
                        <button onClick={() => deleteCourse(c.id)} className="px-3 py-2 rounded bg-red-50 text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!editing && viewMode === "list" && (
            <div>
              <div className="text-xl font-semibold mb-4">Course list</div>
              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c.id} className="p-3 border rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-slate-100 flex items-center justify-center">{c.image_url ? <img src={c.image_url} className="w-full h-full object-cover" /> : <Image />}</div>
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-slate-500">{c.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && <button onClick={() => openEnrollDrawer(c.id)} className="px-2 py-1 rounded bg-emerald-600 text-white">Enroll</button>}
                      <button onClick={() => openEdit(c)} className="px-2 py-1 rounded bg-slate-50">Edit</button>
                      <button onClick={() => cloneCourse(c)} className="px-2 py-1 rounded bg-slate-50">Clone</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* editor */}
          {editing && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-semibold">{editing.title || "New course"}</div>
                  <div className="text-xs text-slate-500">Edit course content</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={discardEdit} className="px-2 py-1 rounded">Cancel</button>
                  <button onClick={() => saveCourse({ publish: false })} className="px-3 py-2 rounded bg-blue-600 text-white">Save</button>
                  <button onClick={() => saveCourse({ publish: true })} className="px-3 py-2 rounded bg-emerald-600 text-white">Publish</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="p-4 border rounded">
                    <InputRow label="Title">
                      <input value={editing.title} onChange={(e)=>setEditing({...editing, title: e.target.value})} className="w-full p-2 border rounded" />
                    </InputRow>
                    <InputRow label="Description">
                      <textarea value={editing.description} onChange={(e)=>setEditing({...editing, description: e.target.value})} className="w-full p-2 border rounded" />
                    </InputRow>

                    <InputRow label="Cover image">
                      <div className="flex items-center gap-3">
                        <label className="px-3 py-2 bg-slate-50 rounded cursor-pointer">
                          Upload image
                          <input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>{ setDraftImagePreview(String(r.result)); setEditing({...editing, image_url: String(r.result)}); }; r.readAsDataURL(f);} }} />
                        </label>
                        <button className="px-3 py-2 rounded" onClick={()=>{ setEditing({...editing, image_url: null}); setDraftImagePreview(null); }}>Remove</button>
                      </div>
                      {draftImagePreview && <div className="mt-3 w-48 h-28 overflow-hidden rounded"><img src={draftImagePreview} className="w-full h-full object-cover" /></div>}
                    </InputRow>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Chapters</div>
                        <button onClick={()=>{ const next: Chapter = { id: uid("ch"), title: `Chapter ${editing.chapters.length+1}`, lessons: [{ id: uid("l"), title: "New lesson", videoUrl: null }] }; setEditing({...editing, chapters: [...editing.chapters, next]}); }} className="px-2 py-1 bg-slate-50 rounded">Add chapter</button>
                      </div>

                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="chapters" type="chapter">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                              {editing.chapters.map((ch, chIdx)=> (
                                <Draggable key={ch.id} draggableId={ch.id} index={chIdx}>
                                  {(prov) => (
                                    <div ref={prov.innerRef} {...prov.draggableProps} className="p-3 border rounded bg-slate-50">
                                      <div className="flex items-center justify-between" {...prov.dragHandleProps}>
                                        <input value={ch.title} onChange={(e)=>updateChapterTitle(ch.id, e.target.value)} className="flex-1 p-1 border rounded" />
                                        <div className="flex items-center gap-2 ml-3">
                                          <button onClick={()=> { setEditing({...editing, chapters: editing.chapters.filter(x=>x.id!==ch.id)}); }} className="px-2 py-1 rounded"><Trash2 /></button>
                                        </div>
                                      </div>

                                      <Droppable droppableId={`chapter-${chIdx}`} type="lesson">
                                        {(p) => (
                                          <div ref={p.innerRef} {...p.droppableProps} className="mt-3 space-y-2 pl-3">
                                            {ch.lessons.map((l, lIdx)=> (
                                              <Draggable key={l.id} draggableId={l.id} index={lIdx}>
                                                {(pr) => (
                                                  <div ref={pr.innerRef} {...pr.draggableProps} className="flex items-center gap-2 p-2 bg-white border rounded">
                                                    <div {...pr.dragHandleProps} className="cursor-grab px-2">☰</div>
                                                    <input value={l.title} onChange={(e)=>updateLesson(ch.id, l.id, { title: e.target.value })} className="flex-1 p-1 border rounded" />
                                                    <input value={l.duration||""} onChange={(e)=>updateLesson(ch.id, l.id, { duration: e.target.value })} className="w-20 p-1 border rounded" placeholder="3:45" />

                                                    <label className="px-2 py-1 bg-slate-100 rounded cursor-pointer">
                                                      <input type="file" accept="video/*" className="hidden" onChange={(e)=> handleVideoFile(ch.id, l.id, e.target.files?.[0] ?? null)} />
                                                      Upload video
                                                    </label>

                                                    {l.thumbnailUrl && <img src={l.thumbnailUrl} className="w-20 h-12 object-cover rounded" alt="thumb" />}

                                                    <button onClick={()=> removeLesson(ch.id, l.id)} className="px-2 py-1 rounded"><Trash2 /></button>
                                                  </div>
                                                )}
                                              </Draggable>
                                            ))}
                                            {p.placeholder}
                                            <div>
                                              <button onClick={()=>{ const newL={id: uid("l"), title: `Lesson ${ch.lessons.length+1}`, videoUrl: null}; setEditing({...editing, chapters: editing.chapters.map(x=> x.id===ch.id? {...x, lessons:[...x.lessons, newL]}:x)}); }} className="mt-2 px-2 py-1 rounded bg-slate-100">Add lesson</button>
                                            </div>
                                          </div>
                                        )}
                                      </Droppable>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                    </div>

                  </div>
                </div>

                {/* preview column */}
                <div>
                  <div className="p-4 border rounded">
                    <div className="text-xs text-slate-500">Live preview</div>
                    <div className="mt-3 w-full h-40 bg-slate-100 flex items-center justify-center overflow-hidden rounded">
                      {editing.image_url ? <img src={editing.image_url} className="w-full h-full object-cover" alt="cover" /> : <div className="text-slate-400">No cover</div>}
                    </div>

                    <div className="mt-3">
                      <div className="text-lg font-semibold">{editing.title || "Course title"}</div>
                      <div className="text-sm text-slate-500">{editing.description || "Course description"}</div>

                      <div className="mt-4">
                        <button onClick={()=>saveCourse({ publish: true })} className="w-full px-3 py-2 rounded bg-emerald-600 text-white">Publish course</button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 border rounded">
                    <div className="text-xs text-slate-500">Activity (recent)</div>
                    <div className="mt-2 text-sm text-slate-600 max-h-40 overflow-auto">
                      {activities.map((a)=> (<div key={a.id} className="mb-2">• {a.text} <span className="text-xs text-slate-400 ml-2">{new Date(a.time).toLocaleString()}</span></div>))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* enrollment drawer */}
      {enrollDrawer?.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeEnrollDrawer} />
          <motion.div initial={{ x: 360 }} animate={{ x: 0 }} className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-lg font-semibold">Enroll users</div>
                <div className="text-xs text-slate-500">Search users and bulk enroll (admins only)</div>
              </div>
              <button onClick={closeEnrollDrawer} className="px-2 py-1 rounded"><X /></button>
            </div>

            <div className="mb-3">
              <input value={userQuery} onChange={(e)=>setUserQuery(e.target.value)} placeholder="Search name or email" className="w-full p-2 border rounded" />
            </div>

            <div className="mb-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /> <span className="text-sm">Select all</span></label>
              <div className="text-sm text-slate-500">{users.length} users</div>
            </div>

            <div className="max-h-[60vh] overflow-auto mb-3 border rounded">
              {users.length===0 ? <div className="p-4 text-sm text-slate-500">No users</div> : users.map(u=> (
                <div key={u.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email} {u.role?`• ${u.role}`:null}</div>
                  </div>
                  <div>
                    <input type="checkbox" checked={!!selectedUsers[u.id]} onChange={()=>toggleUserSelect(u.id)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button onClick={closeEnrollDrawer} className="px-3 py-2 rounded">Cancel</button>
              <button onClick={()=>doBulkEnroll(false)} className="px-3 py-2 rounded bg-slate-100">Request enrollment (approval)</button>
              <button onClick={()=>doBulkEnroll(true)} className="px-3 py-2 rounded bg-emerald-600 text-white">Enroll & approve</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
