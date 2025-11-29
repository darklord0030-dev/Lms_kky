import { useState } from 'react';
import { CornerDownLeft } from 'lucide-react';

export default function FrameUnitContent() {
  const [url, setUrl] = useState('');

  return (
    <div className="min-h-screen bg-white p-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Iframe unit</h1>

      <div className="mb-8">
        <p className="text-gray-400 text-lg mb-4">Add content</p>

        <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste the URL of the webpage you want to embed"
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none pr-10"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <CornerDownLeft size={20} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-400 text-lg">Add content</p>
      </div>
    </div>
  );
}


