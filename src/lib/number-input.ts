/** True for text a user might still be in the middle of typing toward a
 * valid number — e.g. "0." on the way to "0.25", or a lone "-". Committing
 * these early (as their Number() value) snaps the input back and eats the
 * character the user just typed. */
export function isPartialNumericInput(raw: string): boolean {
  return raw === "-" || raw.endsWith(".");
}
