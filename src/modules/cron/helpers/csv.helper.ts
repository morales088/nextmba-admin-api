import { join } from 'path';
import * as fs from 'fs';
import * as fastCSV from 'fast-csv';
import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

const logger = new Logger('SaveToCsvHelper');

export const getFilesFolderPath = () => {
  return join('src', 'common', 'files');
};

export const createFolderIfNotExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const saveToCSV = async (fileName: string, data: any[]) => {
  if (data.length === 0) {
    logger.log('No data to write to CSV.');
    return;
  }

  const filesFolderPath = join('src', 'common', 'files');
  const filePath = join(filesFolderPath, fileName);

  createFolderIfNotExists(filesFolderPath);

  const fileExists = fs.existsSync(filePath);
  const writeStream = fs.createWriteStream(filePath, { flags: fileExists ? 'a' : 'w' });

  fastCSV
    .write(data, { headers: false, includeEndRowDelimiter: true })
    .pipe(writeStream)
    .on('finish', () => {
      logger.log(`CSV file saved successfully at: ${filePath}`);
    });
};

export const processAndRemoveFirstEntry = async (fileName: string, processFirstEntry: (row: any) => void) => {
  const filePath = join(getFilesFolderPath(), fileName);
  const readStream = fs.createReadStream(filePath);

  const tempFileName = `temp-data-${randomBytes(4).toString('hex')}.csv`;
  const tempFilePath = join(getFilesFolderPath(), tempFileName);

  let isFirstEntryProcessed = false;

  return new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(tempFilePath, { flags: 'a' });

    fastCSV
      .parseStream(readStream, { headers: false })
      .on('data', async (currentRow) => {
        if (!isFirstEntryProcessed) {
          // Process the first entry using the provided function
          processFirstEntry(currentRow);
          isFirstEntryProcessed = true;
        } else {
          await writeToTempFile(tempFilePath, currentRow);
        }
      })
      .on('end', async () => {
        logger.log('CSV processing complete.');

        // Close the write stream before resolving the promise
        writeStream.end(() => {
          logger.log('Write stream closed.');

          // Rename the temp file to replace the original file
          fs.rename(tempFilePath, filePath, (error) => {
            if (error) {
              logger.error('Error renaming file:', error.message);
              reject(error);
            } else {
              logger.log('File renamed successfully.');
              resolve();
            }
          });
        });
      })
      .on('error', (error) => {
        logger.error('Error processing CSV:', error.message);
        reject(error);
      });
  });
};

const writeToTempFile = async (tempFilePath: string, row: any) => {
  return new Promise<void>((resolve, reject) => {
    const stringifiedRow = Object.values(row).join(',') + '\n';

    fs.appendFile(tempFilePath, stringifiedRow, (error) => {
      if (error) {
        logger.error(`Error appending row to temp CSV file: ${error.message}`);
        reject(error);
      } else {
        // logger.log(`Row appended to temp CSV file: ${tempFilePath}`);
        resolve();
      }
    });
  });
};
