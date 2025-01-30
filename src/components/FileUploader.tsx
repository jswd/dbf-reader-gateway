import React, { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DropZone from './DropZone';

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
    <DropZone
      isDragging={isDragging}
      isLoading={isLoading}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onFileSelect={handleFile}
    />
  );
};

export default FileUploader;