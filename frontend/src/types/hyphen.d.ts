declare module "hyphen/en" {
  type HyphenOptions = {
    debug?: boolean;
    exceptions?: string[];
    hyphenChar?: string;
    minWordLength?: number;
  };

  export function hyphenateSync(text: string, options?: HyphenOptions): string;
  export function hyphenate(text: string, options?: HyphenOptions): Promise<string>;
}
