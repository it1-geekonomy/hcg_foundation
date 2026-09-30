import { cx } from "./team-utils";

export function FlipIcon({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("h-4 w-4 stroke-[#967300]", back && "rotate-[225deg]")}
    >
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  );
}

export function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous" : "Next"}
      className="flex h-10 w-10 flex-none touch-manipulation select-none items-center justify-center border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus:bg-transparent active:bg-transparent disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx(
          "h-6 w-6 transition-colors",
          disabled
            ? "stroke-[#FCCC2D]/30"
            : "stroke-[#FCCC2D] hover:stroke-[#E3B400]",
        )}
      >
        {direction === "left" ? (
          <path d="M15 19l-7-7 7-7" />
        ) : (
          <path d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}
