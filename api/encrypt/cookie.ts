
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

export function setAccessTokenCookie(token: string): string {
  return [
    `accessToken=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${ACCESS_TOKEN_MAX_AGE}`,
  ].join("; ");
}

export function clearAccessTokenCookie(): string {
  return [
    "accessToken=",
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
}
