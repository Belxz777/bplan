import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const encoder = new TextEncoder();

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add JWT_SECRET=<random string> to your .env",
    );
  }

  return encoder.encode(secret);
}

export interface AccessTokenPayload extends JWTPayload {
  level: number;
}

const ACCESS_TOKEN_TTL = "2h";

export async function signAccessToken(user: {
  id: number;
  level: number;
}): Promise<string> {
  return new SignJWT({ level: user.level })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecretKey());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload & { sub: string }> {
  const { payload } = await jwtVerify(token, getSecretKey());

  if (typeof payload.sub !== "string" || typeof payload.level !== "number") {
    throw new Error("Malformed token payload");
  }

  return payload as AccessTokenPayload & { sub: string };
}