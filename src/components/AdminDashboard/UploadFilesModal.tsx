import React, { useState, useRef } from "react";
import { X, Paperclip } from "lucide-react";

interface UploadFilesModalProps {
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export default function UploadFilesModal({
  onClose,
  onUpload,
}: UploadFilesModalProps) {
  const [activeTab, setActiveTab] = useState<"local" | "url">("local");
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onUpload(files);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 transition-opacity duration-300"
      style={{ backgroundColor: `rgba(0, 0, 0, ${isVisible ? '0.5' : '0'})` }}
      onClick={handleClose}
    >
      <div
        className={`fixed right-0 top-0 h-full bg-white w-full max-w-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload files</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab("local")}
              className={`py-4 px-1 mr-8 font-medium transition ${
                activeTab === "local"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Select files to upload
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`py-4 px-1 font-medium transition ${
                activeTab === "url"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload from an external URL
            </button>
          </div>
        </div>

        <div className="p-6 flex-1">
          {activeTab === "local" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-16 text-center transition ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-300 hover:border-blue-400"
              }`}
            >
              <Paperclip className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-medium hover:underline"
              >
                Select files to upload
              </button>
              <p className="text-gray-600 mt-2">
                or <span className="font-medium">drag and drop</span> your files here.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-4">
              <input
                type="url"
                placeholder="Enter file URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                Upload
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
