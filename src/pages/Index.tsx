import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import { readDBFFile } from '@/lib/dbfReader';
import { DBFRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [data, setData] = useState<DBFRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileLoaded = async (buffer: ArrayBuffer) => {
    setIsLoading(true);
    try {
      const dbfData = await readDBFFile(buffer);
      setColumns(dbfData.fields.map(f => f.name));
      setData(dbfData.records);
      toast({
        title: "Archivo cargado exitosamente",
        description: `Se encontraron ${dbfData.records.length} registros.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al procesar el archivo",
        description: "El archivo parece estar corrupto o no ser un archivo DBF válido.",
      });
      setData([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lector de Archivos DBF
          </h1>
          <p className="text-gray-600">
            Suba su archivo .DBF para visualizar sus datos
          </p>
        </div>

        <FileUploader onFileLoaded={handleFileLoaded} isLoading={isLoading} />

        {isLoading && (
          <div className="text-center text-gray-600">
            Procesando archivo...
          </div>
        )}

        {data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Datos del archivo ({data.length} registros)
            </h2>
            <DataTable data={data} columns={columns} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;