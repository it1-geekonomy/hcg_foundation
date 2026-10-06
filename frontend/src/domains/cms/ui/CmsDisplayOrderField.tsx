"use client";

import { Input } from "@/shared/ui/input";
import type { DisplayOrderMode } from "@/domains/cms/lib/types";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { DISPLAY_ORDER_MODE_OPTIONS } from "@/domains/cms/ui/CmsSelect";

function parseOrder(value?: string | null): number | null {
  const order = Number((value ?? "").trim());
  return Number.isInteger(order) && order >= 1 ? order : null;
}

/** True when the edit form asks for a different, valid position. */
export function isDisplayOrderChanged(initialOrder: string, currentOrder: string) {
  const next = parseOrder(currentOrder);
  return next !== null && next !== parseOrder(initialOrder);
}

/** `orderMode` to send with a PATCH; the backend defaults to "move", so only swap is sent. */
export function orderModeForPatch(
  initialOrder: string,
  currentOrder: string,
  mode: DisplayOrderMode
): DisplayOrderMode | undefined {
  return mode === "swap" && isDisplayOrderChanged(initialOrder, currentOrder)
    ? "swap"
    : undefined;
}

type CmsDisplayOrderFieldProps = {
  value: string;
  onChange: (displayOrder: string) => void;
  mode: DisplayOrderMode;
  onModeChange: (mode: DisplayOrderMode) => void;
  /** Saved order on the edit page; omit on create. */
  initialOrder?: string;
  /** Singular / plural names for hints, e.g. "award" / "awards". */
  itemLabel: string;
  listLabel: string;
  /** False when the item is also moving to another list (e.g. team → trustee). */
  allowSwap?: boolean;
};

export default function CmsDisplayOrderField({
  value,
  onChange,
  mode,
  onModeChange,
  initialOrder,
  itemLabel,
  listLabel,
  allowSwap = true,
}: CmsDisplayOrderFieldProps) {
  const editing = initialOrder !== undefined;
  const target = value.trim();
  const showMode =
    editing && allowSwap && isDisplayOrderChanged(initialOrder, value);

  return (
    <div className="space-y-3">
      <CmsFormField
        label="Display order"
        htmlFor="displayOrder"
        hint={
          editing
            ? `Position among ${listLabel} (1 shows first). Leave blank to keep the current position.`
            : `Position among ${listLabel} (1 shows first). Leave blank to add at the end.`
        }
      >
        <Input
          id="displayOrder"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder={editing ? initialOrder || "e.g. 1" : "End of list"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CmsFormField>

      {showMode ? (
        <CmsFormField
          label="Order change"
          htmlFor="orderMode"
          hint={
            mode === "swap"
              ? `Swaps with the ${itemLabel} at position ${target}; that one takes position ${initialOrder}.`
              : `Moves to position ${target}; the ${listLabel} in between shift by one.`
          }
        >
          <CmsSelect
            id="orderMode"
            value={mode}
            options={DISPLAY_ORDER_MODE_OPTIONS}
            onChange={(next) => onModeChange(next as DisplayOrderMode)}
          />
        </CmsFormField>
      ) : null}
    </div>
  );
}
