import { BadRequestException } from '@nestjs/common';

export const extractPublicIdFromUrl = async (url: string) => {
  const projectFolderName = (process.env.CLOUD_PROJECT_FOLDER_NAME ??= '');

  const regex = new RegExp(`${projectFolderName}\/(.+)$`);
  const match = url.match(regex);

  if (!match) {
    throw new BadRequestException('Invalid image link format.');
  }

  const extractedPublicId = match[0].split('.')[0]; // remove the extension name

  return extractedPublicId;
};
