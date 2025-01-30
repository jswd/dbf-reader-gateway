import React, { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  onFileLoaded: (data: ArrayBuffer) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.dbf')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, seleccione un archivo .DBF válido",
      });
      return;
    }

    try {
      // Leer el archivo como ArrayBuffer para la visualización
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          onFileLoaded(e.target.result);
        }
      };
      reader.readAsArrayBuffer(file);

      // Subir el archivo a Supabase
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('dbf_uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Procesar el archivo
      const { error: processError } = await supabase.functions.invoke('process-dbf', {
        body: { fileName: file.name, filePath }
      });

      if (processError) {
        throw processError;
      }

      toast({
        title: "Archivo subido exitosamente",
        description: "El archivo se está procesando...",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al procesar el archivo",
      });
    }
  }, [onFileLoaded, toast]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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

export default FileUploader;