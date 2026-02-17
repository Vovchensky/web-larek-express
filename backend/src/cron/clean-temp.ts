import { CronJob } from 'cron';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '..', '..', 'public', 'temp');
const MAX_AGE = 60 * 60 * 1000;

const cleanTemp = new CronJob('0 * * * *', () => {
  if (!fs.existsSync(tempDir)) return;

  const files = fs.readdirSync(tempDir);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(tempDir, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > MAX_AGE) {
      fs.unlinkSync(filePath);
    }
  });
});

export default cleanTemp;
