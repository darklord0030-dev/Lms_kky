import { Upload, Sparkles } from "lucide-react";

interface Course {
  title: string;
  slug: string;
  small_description: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: string;
  duration: number;
  price: number;
  status: string;
}

interface BasicInfoFormProps {
  courseData: Partial<Course>;
  onUpdate: (data: Partial<Course>) => void;
}

export default function BasicInfoForm({ courseData, onUpdate }: BasicInfoFormProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({ thumbnail_url: url });
    }
  };

  const generateSlug = () => {
    const slug =
      courseData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "";
    onUpdate({ slug });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>
          <p className="text-sm text-gray-400 mt-1">
            Provide basic information about the course
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
        <input
          type="text"
          placeholder="Title"
          value={courseData.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Slug"
            value={courseData.slug || ""}
            onChange={(e) => onUpdate({ slug: e.target.value })}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={generateSlug}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-all flex items-center gap-2"
          >
            Generate Slug
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Small Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Small Description</label>
        <textarea
          placeholder="Small Description"
          value={courseData.small_description || ""}
          onChange={(e) => onUpdate({ small_description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-700">
            <button className="p-2 hover:bg-gray-700 rounded text-gray-300">
              <span className="font-bold">B</span>
            </button>
            <button className="p-2 hover:bg-gray-700 rounded text-gray-300">
              <span className="italic">I</span>
            </button>
            <button className="p-2 hover:bg-gray-700 rounded text-gray-300">
              <span className="underline">S</span>
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">H1</button>
            <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">H2</button>
            <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">H3</button>
          </div>

          <textarea
            value={courseData.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Hello World!"
            rows={8}
            className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Image</label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="flex flex-col items-center justify-center w-full h-48 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
          >
            {courseData.thumbnail_url ? (
              <img
                src={courseData.thumbnail_url}
                alt="Thumbnail preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-500 mb-3" />
                <p className="text-gray-400 mb-1">
                  Drop your file here or{" "}
                  <span className="text-orange-500">click to upload</span>
                </p>
                <p className="text-sm text-gray-500">Max 5MB</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Category & Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <select
            value={courseData.category || "Development"}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
          <select
            value={courseData.level || "Beginner"}
            onChange={(e) => onUpdate({ level: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Duration & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Duration (hours)</label>
          <input
            type="number"
            min={0}
            value={courseData.duration || 0}
            onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={courseData.price || 0}
            onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Course Status</label>
        <select
          value={courseData.status || "Draft"}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
      </div>
    </div>
  );
}
