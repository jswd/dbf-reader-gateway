export interface DBFField {
  name: string;
  type: string;
  length: number;
  value: string | number | null;
}

export interface DBFRecord {
  [key: string]: string | number | null;
}

export interface DBFData {
  fields: DBFField[];
  records: DBFRecord[];
}