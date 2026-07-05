import fs from 'fs';
import path from 'path';

export const getCategories = (req: any, res: any) => {
  try {
    const dataPath = path.join(__dirname, '../data/words.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const wordsData = JSON.parse(fileContent);
    
    // Extract category keys
    const categories = Object.keys(wordsData);
    
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};
