import { DBFData, DBFField, DBFRecord } from './types';

export async function readDBFFile(buffer: ArrayBuffer): Promise<DBFData> {
  const view = new DataView(buffer);
  
  // Leer el encabezado
  const numRecords = view.getInt32(4, true);
  const headerLength = view.getInt16(8, true);
  const recordLength = view.getInt16(10, true);
  
  // Leer la definición de los campos
  const fields: DBFField[] = [];
  let offset = 32; // Inicio de la definición de campos
  
  while (offset < headerLength - 1) {
    const fieldName = String.fromCharCode(
      ...new Uint8Array(buffer.slice(offset, offset + 11))
    ).replace(/\u0000/g, '').trim();
    
    const fieldType = String.fromCharCode(view.getInt8(offset + 11));
    const fieldLength = view.getInt8(offset + 16);
    
    fields.push({
      name: fieldName,
      type: fieldType,
      length: fieldLength,
      value: null
    });
    
    offset += 32; // Cada definición de campo tiene 32 bytes
  }
  
  // Leer los registros
  const records: DBFRecord[] = [];
  offset = headerLength; // Inicio de los registros
  
  for (let i = 0; i < numRecords; i++) {
    const record: DBFRecord = {};
    let fieldOffset = offset + 1; // Skip deletion flag
    
    for (const field of fields) {
      const fieldData = new Uint8Array(
        buffer.slice(fieldOffset, fieldOffset + field.length)
      );
      const fieldValue = new TextDecoder().decode(fieldData).trim();
      
      record[field.name] = fieldValue;
      fieldOffset += field.length;
    }
    
    records.push(record);
    offset += recordLength;
  }
  
  return { fields, records };
}