import { describe, it, expect } from "vitest";

describe("account DELETE confirmation logic", () => {
  function validateDeleteConfirmation(confirm: unknown): { valid: boolean; error?: string } {
    if (confirm !== "delete") {
      return { valid: false, error: 'Must confirm by sending { confirm: "delete" }' };
    }
    return { valid: true };
  }

  it("accepts correct confirmation string", () => {
    expect(validateDeleteConfirmation("delete").valid).toBe(true);
  });

  it("rejects wrong confirmation string", () => {
    expect(validateDeleteConfirmation("DELETE").valid).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateDeleteConfirmation("").valid).toBe(false);
  });

  it("rejects undefined", () => {
    expect(validateDeleteConfirmation(undefined).valid).toBe(false);
  });

  it("rejects old confirmation string", () => {
    expect(validateDeleteConfirmation("DELETE_MY_ACCOUNT").valid).toBe(false);
  });

  it("rejects boolean true", () => {
    expect(validateDeleteConfirmation(true).valid).toBe(false);
  });
});
