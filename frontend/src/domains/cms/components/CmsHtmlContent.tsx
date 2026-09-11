"use client";

type CmsHtmlContentProps = {
  html: string;
  className?: string;
};

/**
 * Renders CMS HTML safely for light admin/site surfaces.
 * Pasted content often carries `text-white` / dark-theme classes that
 * disappear on a white background — we force readable colors.
 */
export default function CmsHtmlContent({ html, className = "" }: CmsHtmlContentProps) {
  return (
    <div
      className={[
        "cms-html-content max-w-none font-manrope text-[#212121]",
        "[&_*]:!text-[#212121]",
        "[&_a]:!text-[#9A7B00] [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold",
        "[&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold",
        "[&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_p]:mb-3 [&_p]:leading-relaxed",
        "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mb-1",
        "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse",
        "[&_th]:border [&_th]:border-black/10 [&_th]:!bg-[#F5F5F3] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
        "[&_td]:border [&_td]:border-black/10 [&_td]:!bg-white [&_td]:px-3 [&_td]:py-2",
        "[&_tr]:!bg-transparent",
        className,
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
