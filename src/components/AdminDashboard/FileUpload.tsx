import { Upload } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  fileName?: string;
}

export default function FileUpload({
  label,
  onFileSelect,
  acceptedFormats = '*',
  fileName: initialFileName,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | undefined>(initialFileName);

  // Load file name from localStorage on mount
  useEffect(() => {
    const storedFileName = localStorage.getItem('uploadedFileName');
    if (storedFileName) setFileName(storedFileName);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      localStorage.setItem('uploadedFileName', file.name); // store in localStorage
      onFileSelect(file);
    }
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
    if (file) {
      setFileName(file.name);
      localStorage.setItem('uploadedFileName', file.name); // store in localStorage
      onFileSelect(file);
    }
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
          onClick={(e) => {
            e.preventDefault();
            inputRef.current?.click();
          }}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded font-medium hover:from-orange-600 hover:to-rose-600 transition-all"
        >
          Select File
        </button>
      </label>
    </div>
  );
}
