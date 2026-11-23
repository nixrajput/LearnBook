import { randomInt } from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion

/** Generate an 8-character cryptographically secure alphanumeric invite code */
export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CHARS[randomInt(CHARS.length)];
  }
  return code;
}
