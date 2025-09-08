/**
 * Utility function for combining class names
 * Similar to clsx or classnames but simpler
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
