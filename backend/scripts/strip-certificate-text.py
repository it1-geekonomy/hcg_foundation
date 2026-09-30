"""
Removes the static wording from the Word export of the certificate so that
DonationCertificateService can draw it as real (selectable) text.

In 30.docx every piece of wording is either a picture or text converted to
outlines, so it can't be copied from the PDF. This keeps the background,
logos, seal, dividers and waves and drops only those text layers.

    python scripts/strip-certificate-text.py <word-export.pdf> <certificate-base.pdf>

Requires PyMuPDF (pip install pymupdf).
"""
import sys

import fitz

# Wording exported as outlines: "OF APPRECIATION" and three of the column labels
OUTLINED_TEXT = [
    fitz.Rect(106, 342, 336, 360),
    fitz.Rect(372, 753, 524, 771),
    fitz.Rect(632, 753, 774, 771),
    fitz.Rect(1266, 753, 1442, 771),
]


def is_text_picture(rect: fitz.Rect) -> bool:
    return rect.height < 40 and rect.width / rect.height >= 4


def main(src: str, dst: str) -> None:
    doc = fitz.open(src)
    page = doc[0]

    removed = 0
    for info in page.get_images(full=True):
        xref = info[0]
        if any(is_text_picture(r) for r in page.get_image_rects(xref)):
            page.delete_image(xref)
            removed += 1

    for rect in OUTLINED_TEXT:
        page.add_redact_annot(rect, fill=False)
    page.apply_redactions(
        images=fitz.PDF_REDACT_IMAGE_NONE,
        graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED,
    )

    doc.save(dst, garbage=4, deflate=True)
    print(f"Removed {removed} text pictures and {len(OUTLINED_TEXT)} outlined text areas -> {dst}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
