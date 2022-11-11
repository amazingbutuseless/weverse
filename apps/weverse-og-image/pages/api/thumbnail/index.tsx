import { NextApiRequest, NextApiResponse } from 'next';

import { PlaywrightSettings, WeverseArtistPostHelper } from '../../../helpers';

export default async function ThumbnailApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page, terminate } = await PlaywrightSettings();

  const artistPostHelper = new WeverseArtistPostHelper(
    page,
    req.headers.accept === 'image/png'
  );

  const postPath = ((req.query.url || req.url) as string).replace('.png', '');

  await artistPostHelper.open(postPath);

  const data = await artistPostHelper.screenshot();

  await terminate();

  res.setHeader('cache-control', 's-maxage=31536000, stale-while-revalidate');
  res.setHeader('content-type', 'image/png');
  res.end(data);
}
