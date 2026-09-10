import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skip JWT — only for login / health / explicitly public routes */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
