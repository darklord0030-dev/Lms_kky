// SearchResults.tsx
import React from "react";
import noresultIllustration from "../assets/noresult.png"; // add your own image path

interface SearchResultsProps {
  query: string;
  results: any[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, results }) => {
  if (!query) return null; // nothing typed yet

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <img src={noresultIllustration} alt="No results" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-gray-500 dark:text-gray-400">
          No results found for <span className="font-semibold">"{query}"</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto p-4">
      {results.map((item, index) => (
        <div
          key={index}
          className="p-3 mb-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <p className="font-medium text-gray-800 dark:text-gray-100">{item.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
