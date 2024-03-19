import { join } from 'path';
import * as fs from 'fs';
import * as fastCSV from 'fast-csv';
import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { createFolderIfNotExists, getFilesCSVFolderPath } from 'src/common/helpers/path.helper';

const logger = new Logger('SaveToCSVHelper');

export const saveToCSV = async (fileName: string, data: any[]) => {
  if (data.length === 0) {
    logger.log('No data to write to CSV.');
    return;
  }

  const filesFolderPath = getFilesCSVFolderPath();
  const filePath = join(filesFolderPath, fileName);

  createFolderIfNotExists(filesFolderPath);

  const fileExists = fs.existsSync(filePath);
  const writeStream = fs.createWriteStream(filePath, { flags: fileExists ? 'a' : 'w' });

  fastCSV
    .write(data, { headers: false, includeEndRowDelimiter: true })
    .pipe(writeStream)
    .on('finish', () => {
      logger.log(`CSV file saved successfully`);
    });
};

export const processAndRemoveFirstEntry = async (fileName: string) => {
  const filePath = join(getFilesCSVFolderPath(), fileName);
  const readStream = fs.createReadStream(filePath);

  const tempFileName = `temp-data-${randomBytes(4).toString('hex')}.csv`;
  const tempFilePath = join(getFilesCSVFolderPath(), tempFileName);

  let isFirstEntryProcessed = false;
  let firstRowData;

  return new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(tempFilePath, { flags: 'a' });

    fastCSV
      .parseStream(readStream, { headers: false })
      .on('data', async (currentRow) => {
        if (!isFirstEntryProcessed) {
          firstRowData = currentRow;
          isFirstEntryProcessed = true;
        } else {
          await writeToTempFile(tempFilePath, currentRow);
        }
      })
      .on('end', async () => {
        console.log('');
        logger.log('CSV processing complete.');

        // Close the write stream before resolving the promise
        writeStream.end(() => {
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
  }).then(() => firstRowData);
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
