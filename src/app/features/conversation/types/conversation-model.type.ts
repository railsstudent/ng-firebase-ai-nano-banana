import { z } from 'zod';
import { IMAGE_CHANNEL_LIST } from '../constants/image-channel.const';

export const ImageChannelSchema = z.object({
  mode: z.enum(IMAGE_CHANNEL_LIST).default('edit')
});

export type ImageChannel = z.infer<typeof ImageChannelSchema>;
