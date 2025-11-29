export interface Group {
  id: number;
  name: string;
  description?: string;
  branch?: string;
  date?: string | Date; // allow string or Date
  autoEnroll?: boolean;
  groupKey?: string;
}
