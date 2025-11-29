import { useEffect, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000/api/video";

export interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  created_at?: string;
}

// ✅ FIX: Ensure absolute URL always points to correct backend
const API_BASE = "http://localhost:3000";
const getFullUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http")) return url;
          console.log("getFullUrl:"+getFullUrl);
 
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
};
 
function VideoCard({ video }: { video: Video }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-xl shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-yellow-400/20"
      >
        {/* ✅ FIX: Ensure thumbnail is displayed correctly */}
        <img
          src={getFullUrl(video.thumbnail_url)}
          alt={video.title}
          className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-110"
          
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
          <div className="bg-black/60 p-4 rounded-full">
            <Play size={40} className="text-white" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            className="relative bg-black rounded-lg max-w-4xl w-full overflow-hidden shadow-lg border border-yellow-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-white text-2xl hover:text-yellow-400 z-10"
            >
              ✕
            </button>

            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <Loader2 className="animate-spin text-yellow-400" size={48} />
              </div>
            )}

            {/* ✅ FIX: Ensure correct full URL for video source */}
            <video
              src={getFullUrl(video.video_url)}
              controls
              autoPlay
              className="w-full h-[70vh] object-contain bg-black rounded-lg"
              onLoadedData={() => setIsVideoLoading(false)}
              onError={() => setIsVideoLoading(false)}
            />

            <div className="p-4 text-center">
              <h2 className="text-white text-xl font-light">{video.title}</h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function VideoPlayer() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${axios.defaults.baseURL}/all`);
      const data = res.data.videos || res.data;

      // ✅ FIX: Ensure all URLs are absolute
      const normalized = data.map((v: Video) => ({
        ...v,
        thumbnail_url: getFullUrl(v.thumbnail_url),
        video_url: getFullUrl(v.video_url),
      }));

      setVideos(normalized);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId.trim() || !title.trim()) {
      alert("Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(0);
      await axios.post(`${axios.defaults.baseURL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        },
      });
      setFile(null);
      setTitle("");
      setUserId("");
      await fetchVideos();
      alert("✅ Video uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed!");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <form
          onSubmit={handleUpload}
          className="mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-500 transition font-semibold"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {loading && (
          <div className="w-full max-w-lg mx-auto mb-8 bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-400 h-3 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <h2 className="text-white text-5xl font-light mb-8 text-center sm:text-left">
          <span className="border-l-4 border-yellow-400 pl-4">
            Latest Videos
          </span>
        </h2>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <div className="text-center text-white/60 text-lg py-20">
            No videos available yet.
          </div>
        )}
      </div>
    </div>
  );
}
