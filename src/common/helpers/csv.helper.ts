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

  // Create the file if it doesn't exist and write the data to it
  if (!fileExists) {
    const writeStream = fs.createWriteStream(filePath);
    fastCSV.write(data, { headers: false, includeEndRowDelimiter: true }).pipe(writeStream);
    logger.log('CSV file created and data saved successfully.');
  } else {
    if (data.length === 0) {
      logger.log('No data to write to CSV.');
      return;
    }

    // If the file already exists, append data to it
    const writeStream = fs.createWriteStream(filePath, { flags: 'a' });
    fastCSV.write(data, { headers: false, includeEndRowDelimiter: true }).pipe(writeStream);
    logger.log('Data appended to existing CSV file successfully.');
  }
};

export const processAndRemoveFirstEntry = async (fileName: string) => {
  const filePath = join(getFilesCSVFolderPath(), fileName);
  const readStream = fs.createReadStream(filePath);

  const tempFileName = `temp-${fileName.split('.')[0]}-${randomBytes(4).toString('hex')}.csv`;
  const tempFilePath = join(getFilesCSVFolderPath(), tempFileName);

  let firstRowData;

  try {
    firstRowData = await processFirstEntry(readStream, tempFilePath);

    await moveTempFile(tempFilePath, filePath);

    logger.log('CSV processing complete.');
  } catch (error) {
    logger.error('An error occurred:', error.message);

    if (fs.existsSync(tempFilePath)) {
      await deleteTempFile(tempFilePath);
    }
  }

  return firstRowData;
};

const processFirstEntry = async (readStream: fs.ReadStream, tempFilePath: string) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(tempFilePath, { flags: 'a' });

    let isFirstEntryProcessed = false;
    let firstRowData;

    readStream
      .pipe(fastCSV.parse({ headers: false }))
      .on('data', async (currentRow) => {
        if (!isFirstEntryProcessed) {
          firstRowData = currentRow;
          isFirstEntryProcessed = true;
        } else {
          await writeToTempFile(writeStream, currentRow);
        }
      })
      .on('end', () => {
        writeStream.end(() => {
          resolve(firstRowData);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const processAndRemoveEntries = async (fileName: string, numRows: number) => {
  const filePath = join(getFilesCSVFolderPath(), fileName);
  const readStream = fs.createReadStream(filePath);

  const tempFileName = `temp-${fileName.split('.')[0]}-${randomBytes(4).toString('hex')}.csv`;
  const tempFilePath = join(getFilesCSVFolderPath(), tempFileName);

  let processedRows = [];

  try {
    processedRows = await processEntries(readStream, tempFilePath, numRows);

    await moveTempFile(tempFilePath, filePath);

    logger.log('CSV processing complete.');
  } catch (error) {
    logger.error('An error occurred:', error.message);

    if (fs.existsSync(tempFilePath)) {
      await deleteTempFile(tempFilePath);
    }
  }

  return processedRows;
};

const processEntries = async (readStream: fs.ReadStream, tempFilePath: string, numRows: number) => {
  return new Promise<any[]>((resolve, reject) => {
    const writeStream = fs.createWriteStream(tempFilePath, { flags: 'a' });

    const processedRows: any[] = [];

    let rowCounter = 0;

    readStream
      .pipe(fastCSV.parse({ headers: false }))
      .on('data', async (currentRow) => {
        if (rowCounter < numRows) {
          processedRows.push(currentRow);
          rowCounter++;
        } else {
          await writeToTempFile(writeStream, currentRow);
        }
      })
      .on('end', () => {
        writeStream.end(() => {
          resolve(processedRows);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const writeToTempFile = async (writeStream: fs.WriteStream, row: any) => {
  return new Promise<void>((resolve, reject) => {
    const stringifiedRow = Object.values(row).join(',') + '\n';

    writeStream.write(stringifiedRow, (error) => {
      if (error) {
        logger.error(`Error appending row to temp CSV file: ${error.message}`);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const moveTempFile = async (tempFilePath: string, filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.rename(tempFilePath, filePath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const deleteTempFile = async (tempFilePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(tempFilePath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
