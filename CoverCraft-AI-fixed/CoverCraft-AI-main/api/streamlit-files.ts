import fs from 'node:fs';
import path from 'node:path';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const projectDir = path.join(process.cwd(), 'CoverCraft-AI');
  const allowedFiles = [
    {
      name: 'app.py',
      language: 'python',
      description: 'Complete Streamlit application & Gemini SDK integration',
    },
    {
      name: 'requirements.txt',
      language: 'text',
      description: 'Python package dependencies',
    },
    {
      name: '.env.example',
      language: 'bash',
      description: 'Environment variable template for GEMINI_API_KEY',
    },
    {
      name: '.gitignore',
      language: 'text',
      description: 'Git exclusions protecting secrets and virtualenvs',
    },
    {
      name: 'README.md',
      language: 'markdown',
      description: 'Beginner-friendly installation, API key, and local run guide',
    },
  ];

  try {
    const files = allowedFiles
      .map((item) => {
        const fullPath = path.join(projectDir, item.name);
        if (!fs.existsSync(fullPath)) {
          return null;
        }
        return {
          name: item.name,
          path: `CoverCraft-AI/${item.name}`,
          language: item.language,
          description: item.description,
          content: fs.readFileSync(fullPath, 'utf-8'),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return res.status(200).json({ files });
  } catch {
    return res.status(500).json({ error: 'Unable to load Streamlit project source files.' });
  }
}
