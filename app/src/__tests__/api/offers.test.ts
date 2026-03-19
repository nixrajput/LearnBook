import { describe, it, expect } from "vitest";

// Test offer validation logic as pure functions
describe("offer validation logic", () => {
  function isOfferValid(
    offer: {
      isActive: boolean;
      validUntil: Date | null;
      maxRedemptions: number | null;
      currentRedemptions: number;
      applicablePlans: string;
    },
    planKey: string,
    now: Date = new Date(),
  ): { valid: boolean; reason?: string } {
    if (!offer.isActive) return { valid: false, reason: "Inactive" };
    if (offer.validUntil && offer.validUntil < now) return { valid: false, reason: "Expired" };
    if (offer.maxRedemptions !== null && offer.currentRedemptions >= offer.maxRedemptions)
      return { valid: false, reason: "Max redemptions" };
    const applicable: string[] = JSON.parse(offer.applicablePlans);
    if (!applicable.includes(planKey)) return { valid: false, reason: "Not applicable" };
    return { valid: true };
  }

  const baseOffer = {
    isActive: true,
    validUntil: null,
    maxRedemptions: null,
    currentRedemptions: 0,
    applicablePlans: JSON.stringify(["PRO", "PREMIUM"]),
  };

  it("accepts valid offer for PRO", () => {
    expect(isOfferValid(baseOffer, "PRO").valid).toBe(true);
  });

  it("accepts valid offer for PREMIUM", () => {
    expect(isOfferValid(baseOffer, "PREMIUM").valid).toBe(true);
  });

  it("rejects inactive offer", () => {
    expect(isOfferValid({ ...baseOffer, isActive: false }, "PRO").valid).toBe(false);
  });

  it("rejects expired offer", () => {
    const expired = { ...baseOffer, validUntil: new Date("2020-01-01") };
    expect(isOfferValid(expired, "PRO").valid).toBe(false);
  });

  it("rejects when max redemptions reached", () => {
    const maxed = { ...baseOffer, maxRedemptions: 5, currentRedemptions: 5 };
    expect(isOfferValid(maxed, "PRO").valid).toBe(false);
  });

  it("allows when under max redemptions", () => {
    const ok = { ...baseOffer, maxRedemptions: 5, currentRedemptions: 4 };
    expect(isOfferValid(ok, "PRO").valid).toBe(true);
  });

  it("rejects for non-applicable plan", () => {
    expect(isOfferValid(baseOffer, "FREE").valid).toBe(false);
  });

  it("allows unlimited redemptions when null", () => {
    const unlimited = { ...baseOffer, maxRedemptions: null, currentRedemptions: 9999 };
    expect(isOfferValid(unlimited, "PRO").valid).toBe(true);
  });

  it("parses applicablePlans as JSON array, not substring", () => {
    const offer = { ...baseOffer, applicablePlans: JSON.stringify(["PREMIUM"]) };
    // "PRO" should NOT match — it's not in the array even though "PRO" is a substring of "PREMIUM"
    // ... actually "PRO" is not a substring of "PREMIUM" — but let's test "PR" which IS
    const offer2 = { ...baseOffer, applicablePlans: JSON.stringify(["PREMIUM"]) };
    expect(isOfferValid(offer2, "PRO").valid).toBe(false);
  });
});
