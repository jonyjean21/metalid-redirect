import Papa from 'papaparse';

export interface UserData {
  id: string;
  type: 'profile' | 'redirect';
  name?: string;
  bio?: string;
  link1_label?: string;
  link1_url?: string;
  link2_label?: string;
  link2_url?: string;
  link3_label?: string;
  link3_url?: string;
  link4_label?: string;
  link4_url?: string;
  link5_label?: string;
  link5_url?: string;
}

export interface Link {
  label: string;
  url: string;
}

export async function getUserData(id: string): Promise<UserData | null> {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    console.error('SPREADSHEET_ID is not set');
    return null;
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

  try {
    const response = await fetch(csvUrl, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('Failed to fetch spreadsheet');
      return null;
    }

    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse<UserData>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const user = results.data.find((row) => row.id === id);
          resolve(user || null);
        },
        error: (error: Error) => {
          console.error('CSV parse error:', error);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export function getLinks(userData: UserData): Link[] {
  const links: Link[] = [];
  
  for (let i = 1; i <= 5; i++) {
    const label = userData[`link${i}_label` as keyof UserData] as string;
    const url = userData[`link${i}_url` as keyof UserData] as string;
    
    if (label && url) {
      links.push({ label, url });
    }
  }
  
  return links;
}