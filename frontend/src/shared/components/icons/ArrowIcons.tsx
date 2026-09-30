import React from "react";

export interface ArrowIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const DiagonalArrowIcon = ({
  className = "w-[1rem] h-[0.8rem] sm:w-[1.2925rem] sm:h-[1.034rem]",
  ...props
}: ArrowIconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M4.14521 5.48631e-05L4.08002 2.07446L12.3776 2.33522L-0.00145442 13.96L1.4337 15.4883L13.8128 3.86351L13.552 12.1611L15.6265 12.2263L15.999 0.37257L4.14521 5.48631e-05Z"
      fill="currentColor"
    />
  </svg>
);
