import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

export const systemInstructionResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const featureId = route.paramMap.get('featureId') || '';

  // https://www.easemate.ai/ai-resources/how-to-restore-old-photos-with-nano-banana.html
  if (featureId === 'restoration') {
    return 'Restore this photograph to its original quality. Remove scratches, enhance details, correct colors, and make it look as close to the original as possible when it was first taken.';
  } else if (featureId === 'figurine') {
    return 'First ask me to upload an image and then create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is a 3D modeling process of this figurine. Next to the computer screen is a toy packaging box, designed in a style reminiscent of high-quality collectible figures, printed with original artwork. The packaging features two-dimensional flat illustrations.';
  }

  return '';
};
