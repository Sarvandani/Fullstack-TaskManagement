'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface MultiNameInputProps {
  value: string[];
  onChange: (names: string[]) => void;
  placeholder?: string;
}

export default function MultiNameInput({
  value,
  onChange,
  placeholder = 'Enter name...',
}: MultiNameInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    if (inputValue.trim()) {
      const trimmedName = inputValue.trim();
      // Check case-insensitively to avoid duplicates
      const nameExists = value.some(name => name.toLowerCase() === trimmedName.toLowerCase());
      if (!nameExists) {
        const newNames = [...value, trimmedName];
        onChange(newNames);
        setInputValue('');
      } else {
        // Optionally show a message or just clear the input
        setInputValue('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName();
    }
  };

  const removeName = (nameToRemove: string) => {
    const newNames = value.filter((name) => name !== nameToRemove);
    onChange(newNames);
  };

  return (
    <div className="w-full space-y-2">
      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
          {value.map((name, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {name}
              <button
                type="button"
                onClick={() => removeName(name)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                title="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input and Add button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          type="button"
          onClick={handleAddName}
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}

