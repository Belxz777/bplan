
import { verifyAccessToken } from "../encrypt/jwt";

export interface AuthUser {
  id: number;
  level: number;
}

type AnyReq = Request & {
  params?: Record<string, string>;
};

type AuthedHandler<Req extends AnyReq> = (
  req: Req & { user: AuthUser },
) => Response | Promise<Response>;

interface RequireAuthOptions {
  /**
   * Минимальный уровень доступа (1/2/3), включительно.
   * Если не задан — достаточно валидного токена.
   */
  minLevel?: number;
}

/**
 * Достаёт значение cookie по имени.
 */
function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return value.join("=") || null;
    }
  }

  return null;
}

/**
 * Получает access token:
 *
 * 1. Authorization: Bearer <token>
 * 2. Cookie: accessToken=<token>
 */
function getAccessToken(req: Request): string | null {
  // Сначала проверяем Authorization
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();

    if (token) {
      return token;
    }
  }

  // Если Authorization нет — проверяем cookie
  return getCookie(req, "accessToken");
}

/**
 * Оборачивает обработчик роута:
 *
 * - проверяет JWT из Authorization или cookie
 * - кладёт req.user = { id, level }
 * - при необходимости проверяет минимальный уровень
 */
export function requireAuth<Req extends AnyReq>(
  handler: AuthedHandler<Req>,
  options: RequireAuthOptions = {},
) {
  return async (req: Req): Promise<Response> => {
    const token = getAccessToken(req);

    if (!token) {
      return Response.json(
        {
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    let payload: Awaited<ReturnType<typeof verifyAccessToken>>;

    try {
      payload = await verifyAccessToken(token);
    } catch {
      return Response.json(
        {
          error: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId)) {
      return Response.json(
        {
          error: "Invalid token payload",
        },
        { status: 401 },
      );
    }

    // Проверяем уровень доступа
    if (
      options.minLevel !== undefined &&
      payload.level < options.minLevel
    ) {
      return Response.json(
        {
          error: "Insufficient permissions",
        },
        { status: 403 },
      );
    }

    const user: AuthUser = {
      id: userId,
      level: payload.level,
    };

    return handler(
      Object.assign(req, { user }) as Req & {
        user: AuthUser;
      },
    );
  };
}

/**
 * true, если пользователь:
 *
 * - обращается к самому себе
 * - либо имеет необходимый уровень доступа
 */
export function isSelfOrLevel(
  user: AuthUser,
  targetId: number,
  minLevel: number,
): boolean {
  return user.id === targetId || user.level >= minLevel;
}
