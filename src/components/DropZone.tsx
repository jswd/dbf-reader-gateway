import React from 'react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  isDragging: boolean;
  isLoading: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  isDragging,
  isLoading,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}) => {
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-12 transition-all duration-200 ease-in-out",
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="text-center">
        <input
          type="file"
          accept=".dbf"
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">
            {isLoading ? "Procesando..." : "Arrastre su archivo .DBF aquí"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            o haga clic para seleccionar
          </p>
        </label>
      </div>
    </div>
  );
};

export default DropZone;