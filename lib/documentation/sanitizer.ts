/**
 * Secret Sanitizer Utility for DocuForge AI
 * Prevents sensitive credentials, API keys, private keys, and tokens
 * from being included in AI prompt context windows.
 */

const SECRET_PATTERNS = [
  // OpenAI, Anthropic, Gemini API Keys
  /sk-[a-zA-Z0-9_-]{20,}/gi,
  /AIzaSy[a-zA-Z0-9_-]{33}/gi,
  /sk-ant-api[a-zA-Z0-9_-]{20,}/gi,

  // GitHub Tokens
  /ghp_[a-zA-Z0-9]{36}/gi,
  /gho_[a-zA-Z0-9]{36}/gi,
  /github_pat_[a-zA-Z0-9_]{50,}/gi,

  // Private Keys
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,

  // Database Connection Strings with Passwords
  /(postgresql|postgres|mysql|mongodb|mongodb\+srv):\/\/[^:\s]+:[^@\s]+@[^\s]+/gi,

  // AWS Access Key IDs & Secret Keys
  /AKIA[0-9A-Z]{16}/g,

  // Bearer JWT Tokens
  /Bearer\s+eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,

  // General ENV Key-Value secrets
  /(SECRET|PASSWORD|PASS|TOKEN|AUTH_KEY|PRIVATE_KEY|API_KEY)\s*=\s*["']?[^\s"']{8,}["']?/gi,
];

export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input;

  // Redact matches
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      if (match.includes("=")) {
        const keyName = match.split("=")[0];
        return `${keyName}=[REDACTED_SECRET]`;
      }
      return "[REDACTED_SECRET]";
    });
  }

  return sanitized;
}

export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeText(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("apikey") ||
        lowerKey.includes("privatekey")
      ) {
        sanitizedObj[key] = "[REDACTED_SECRET]";
      } else {
        sanitizedObj[key] = sanitizeObject(value);
      }
    }
    return sanitizedObj as T;
  }

  return obj;
}
