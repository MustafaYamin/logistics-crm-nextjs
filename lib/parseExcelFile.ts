import * as XLSX from "xlsx";

export interface Agent {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  specialties: string[];
}

export const parseExcelFile = (file: File): Promise<Agent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const parsed: Agent[] = rows.map((row) => ({
        name: row["Name"] || "",
        email: row["Email"] || "",
        phone: row["Phone"] || "",
        company: row["Company"] || "",
        address: row["Address"] || "",
        city: row["City"] || "",
        country: row["Country"] || "",
        specialties: row["Specialties (comma separated)"]
          ? String(row["Specialties (comma separated)"])
              .split(",")
              .map((s) => s.trim())
          : [],
      }));

      resolve(parsed);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
