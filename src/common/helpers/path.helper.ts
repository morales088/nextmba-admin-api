import { join } from "path";
import * as fs from 'fs';

export const getFilesCSVFolderPath = () => {
  return join('src', 'common', 'files', 'csv');
};

export const getMailerliteMappingFolderPath = (fileName: string) => {
  return join('src', 'common', 'mailerlite', 'json', fileName);
};

export const getStoredTokensPath = () => {
  return join('src', 'common', 'files', 'json', 'tokens.json');
};

export const createFolderIfNotExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};