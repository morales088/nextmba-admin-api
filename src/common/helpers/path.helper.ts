import { join } from "path";
import * as fs from 'fs';

export const getFilesCSVFolderPath = () => {
  return join('src', 'common', 'files', 'csv');
};

export const getCourseGroupMappingFolderPath = (fileName: string) => {
  return join('src', 'common', 'files', 'json', fileName);
};

export const createFolderIfNotExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};