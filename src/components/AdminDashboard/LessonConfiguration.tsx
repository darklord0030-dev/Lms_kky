import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';

interface LessonConfigurationProps {
  lessonId?: string;
  lessonTitle?: string;
  onBack: () => void;
  onSave: (data: LessonConfigData) => void;
}

export interface LessonConfigData {
  lessonName: string;
  description: string;
  thumbnailFile?: File;
  videoFile?: File;
}

/* ------------------------------------------------------
   FILE UPLOAD COMPONENT
------------------------------------------------------ */
function FileUpload({
  label,
  onFileSelect,
  acceptedFormats = '*',
  fileName
}: {
  label: string;
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  fileName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-orange-400', 'bg-gray-750');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-orange-400', 'bg-gray-750');
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-orange-400', 'bg-gray-750');
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />

      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 transition-colors"
      >
        <Upload className="w-8 h-8 text-gray-500 mb-3" />

        <p className="text-gray-400 text-center mb-3">
          Drop your files here or <span className="text-orange-500">click to upload</span>
        </p>

        {fileName && <p className="text-sm text-gray-500 mb-3">{fileName}</p>}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded font-medium hover:from-orange-600 hover:to-rose-600 transition-all"
        >
          Select File
        </button>
      </label>
    </div>
  );
}

/* ------------------------------------------------------
   LESSON CONFIGURATION COMPONENT
------------------------------------------------------ */
export default function LessonConfiguration({
  lessonTitle = 'Lesson',
  onBack,
  onSave
}: LessonConfigurationProps) {
  // Load data from localStorage
  const savedData = typeof window !== 'undefined' ? localStorage.getItem('lessonConfig') : null;
  const parsedData: any = savedData ? JSON.parse(savedData) : {};

  const [lessonName, setLessonName] = useState(parsedData.lessonName || 'lesson xyz');
  const [description, setDescription] = useState(parsedData.description || 'Hello World 🚀');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(parsedData.thumbnailData || '');
  const [videoPreview, setVideoPreview] = useState(parsedData.videoData || '');
  const [isSaving, setIsSaving] = useState(false);

  // Convert file to Base64 and store in localStorage
  const handleFileChangeWithStorage = (file: File, type: 'thumbnail' | 'video') => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'thumbnail') {
        setThumbnailFile(file);
        setThumbnailPreview(result);
        saveToLocalStorage({ thumbnailData: result });
      } else {
        setVideoFile(file);
        setVideoPreview(result);
        saveToLocalStorage({ videoData: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const saveToLocalStorage = (extraData: any) => {
    const dataToSave = {
      lessonName,
      description,
      thumbnailData: thumbnailPreview,
      videoData: videoPreview,
      ...extraData
    };
    localStorage.setItem('lessonConfig', JSON.stringify(dataToSave));
  };

  // Update localStorage when lessonName or description changes
  useEffect(() => {
    saveToLocalStorage({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonName, description]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Convert Base64 previews back to File objects if needed
      const getFileFromBase64 = (base64: string, fileName: string) => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], fileName, { type: mime });
      };

      const finalThumbnail = thumbnailFile || (thumbnailPreview ? getFileFromBase64(thumbnailPreview, 'thumbnail.png') : undefined);
      const finalVideo = videoFile || (videoPreview ? getFileFromBase64(videoPreview, 'video.mp4') : undefined);

      onSave({
        lessonName,
        description,
        thumbnailFile: finalThumbnail,
        videoFile: finalVideo
      });

      // Clear storage after save
      localStorage.removeItem('lessonConfig');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lesson Configuration</h1>
            <p className="text-gray-400">Configure the video and description for this lesson.</p>
          </div>

          <div className="space-y-6">
            {/* LESSON NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Lesson Name</label>
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="lesson xyz"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center gap-0 px-3 py-2 border-b border-gray-700 bg-gray-850 overflow-x-auto">
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 transition-colors font-bold text-sm">B</button>
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 transition-colors italic text-sm">I</button>
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 transition-colors line-through text-sm">S</button>
                  <div className="w-px h-6 bg-gray-700 mx-1" />
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-xs">H1</button>
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-xs">H2</button>
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-xs">H3</button>
                  <div className="w-px h-6 bg-gray-700 mx-1" />
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">☰</button>
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">≡</button>
                  <div className="w-px h-6 bg-gray-700 mx-1" />
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">↶</button>
                  <button className="p-2 hover:bg-gray-700 rounded text-gray-300 text-sm">↷</button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-4 bg-gray-800 text-white placeholder-gray-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* FILE UPLOADS */}
            <FileUpload
              label="Thumbnail Image"
              acceptedFormats="image/*"
              onFileSelect={(file) => handleFileChangeWithStorage(file, 'thumbnail')}
              fileName={thumbnailFile?.name || (thumbnailPreview ? 'Saved Thumbnail' : '')}
            />

            <FileUpload
              label="Video File"
              acceptedFormats="video/*"
              onFileSelect={(file) => handleFileChangeWithStorage(file, 'video')}
              fileName={videoFile?.name || (videoPreview ? 'Saved Video' : '')}
            />

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-6 border-t border-gray-700">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
