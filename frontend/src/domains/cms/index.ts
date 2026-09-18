/**
 * CMS domain layout:
 *   shell/     Admin layout, auth gate, login
 *   ui/        Shared CMS primitives (chrome, pickers, list shell)
 *   features/  One folder per admin entity
 *   lib/       API client, types, toast, confirm
 */
export * from "./shell";
export * from "./ui";
export * from "./features";
