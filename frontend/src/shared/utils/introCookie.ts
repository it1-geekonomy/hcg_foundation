import {
  INTRO_SEEN_COOKIE,
  INTRO_SEEN_DAYS,
} from "@/shared/constants/introSequence";

export const hasIntroSeen = (): boolean =>
  document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${INTRO_SEEN_COOKIE}=`));

export const markIntroSeen = (): void => {
  const maxAge = INTRO_SEEN_DAYS * 24 * 60 * 60;
  document.cookie = `${INTRO_SEEN_COOKIE}=true; max-age=${maxAge}; path=/; SameSite=Lax`;
};