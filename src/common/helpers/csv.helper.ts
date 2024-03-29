import { join } from 'path';
import * as fs from 'fs';
import * as fastCSV from 'fast-csv';
import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { createFolderIfNotExists, getFilesCSVFolderPath } from 'src/common/helpers/path.helper';

const logger = new Logger('SaveToCSVHelper');

export const saveToCSV = async (fileName: string, data: any[]) => {
  const filesFolderPath = getFilesCSVFolderPath();
  createFolderIfNotExists(filesFolderPath);

  const filePath = join(filesFolderPath, fileName);
  const fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    // Create the file if it doesn't exist and write the data to it
    const writeStream = fs.createWriteStream(filePath);
    fastCSV.write(data, { headers: false }).pipe(writeStream);
    logger.log('CSV file created and data saved successfully.');
  } else {
    if (data.length === 0) {
      logger.log('No data to write to CSV.');
      return;
    }

    // If the file already exists, append data to it
    const writeStream = fs.createWriteStream(filePath, { flags: 'a' });
    fastCSV.write(data, { headers: false, includeEndRowDelimiter: false }).pipe(writeStream);
    logger.log('Data appended to existing CSV file successfully.');
  }
};

export const processAndRemoveFirstEntry = async (fileName: string) => {
  const filePath = join(getFilesCSVFolderPath(), fileName);
  const readStream = fs.createReadStream(filePath);

  const tempFileName = `temp-data-${randomBytes(4).toString('hex')}.csv`;
  const tempFilePath = join(getFilesCSVFolderPath(), tempFileName);

  let isFirstEntryProcessed = false;
  let firstRowData;

  try {
    await new Promise<void>((resolve, reject) => {
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
    });
  } catch (error) {
    logger.error('An error occurred:', error.message);
  }

  return firstRowData;
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

export const processAndRemoveEntries = async (fileName: string, numRows: number) => {
  const filePath = join(getFilesCSVFolderPath(), fileName);
  const readStream = fs.createReadStream(filePath);

  const tempFileName = `temp-data-${randomBytes(4).toString('hex')}.csv`;
  const tempFilePath = join(getFilesCSVFolderPath(), tempFileName);

  const processedRows = [];

  try {
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(tempFilePath, { flags: 'a' });

      let rowCount = 0;

      fastCSV
        .parseStream(readStream, { headers: false })
        .on('data', async (currentRow) => {
          if (rowCount < numRows) {
            processedRows.push(currentRow);
            rowCount++;
          } else {
            await writeToTempFile(tempFilePath, currentRow);
          }
        })
        .on('end', async () => {
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
    });
  } catch (error) {
    logger.error('An error occurred:', error.message);
  }

  return processedRows;
};
