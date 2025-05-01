import { handleError } from './error/handle';

type Downloadable = {
  url: string;
  type: string;
};

export const download = (data: Downloadable | undefined, id: string) => {
  if (!data) {
    handleError('Error downloading file', 'No data to download.');
    return;
  }

  const link = document.createElement('a');
  const filename = `tersa-${id}`;
  const extension = data.type.split('/').at(-1) ?? 'png';

  link.href = data.url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};
