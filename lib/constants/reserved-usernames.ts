import { RESERVED_SUBDOMAINS, isReservedSubdomain } from "./reserved-subdomains";

export const RESERVED_USERNAMES: readonly string[] = RESERVED_SUBDOMAINS;

export function isReservedUsername(username: string): boolean {
  return isReservedSubdomain(username);
}
