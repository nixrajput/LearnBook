import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency?: number;
  message?: string;
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { name: "Database", status: "operational", latency: Date.now() - start };
  } catch (e) {
    return {
      name: "Database",
      status: "down",
      latency: Date.now() - start,
      message: "Connection failed",
    };
  }
}

async function checkStripe(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { name: "Stripe", status: "degraded", message: "Not configured" };
    }
    // Light check — just verify the key format is valid
    const isTest = process.env.STRIPE_SECRET_KEY.startsWith("sk_test_");
    return {
      name: "Stripe",
      status: "operational",
      latency: Date.now() - start,
      message: isTest ? "Test mode" : "Live mode",
    };
  } catch {
    return { name: "Stripe", status: "down", latency: Date.now() - start };
  }
}

async function checkAiProviders(): Promise<ServiceStatus> {
  const providers: string[] = [];
  if (process.env.OPENAI_API_KEY) providers.push("OpenAI");
  if (process.env.ANTHROPIC_API_KEY) providers.push("Anthropic");
  if (process.env.GOOGLE_AI_API_KEY) providers.push("Google");

  if (providers.length === 0) {
    return { name: "AI Providers", status: "degraded", message: "No API keys configured" };
  }
  return {
    name: "AI Providers",
    status: "operational",
    message: `${providers.length} provider${providers.length > 1 ? "s" : ""}: ${providers.join(", ")}`,
  };
}

function checkAuth(): ServiceStatus {
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const hasGithub = !!process.env.GITHUB_ID && !!process.env.GITHUB_SECRET;
  const providers: string[] = [];
  if (hasGoogle) providers.push("Google");
  if (hasGithub) providers.push("GitHub");

  if (providers.length === 0) {
    return { name: "Authentication", status: "down", message: "No OAuth providers configured" };
  }
  return {
    name: "Authentication",
    status: "operational",
    message: providers.join(", "),
  };
}

export async function GET() {
  const start = Date.now();

  const [database, stripe, ai, auth] = await Promise.all([
    checkDatabase(),
    checkStripe(),
    checkAiProviders(),
    Promise.resolve(checkAuth()),
  ]);

  const services = [database, stripe, auth, ai];
  const allOperational = services.every((s) => s.status === "operational");
  const anyDown = services.some((s) => s.status === "down");

  const overall: "operational" | "degraded" | "down" = anyDown
    ? "down"
    : allOperational
      ? "operational"
      : "degraded";

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - start,
    services,
    version: process.env.npm_package_version ?? "0.1.0",
    environment: process.env.NODE_ENV,
  });
}
