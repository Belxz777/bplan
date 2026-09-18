# Что изменилось

## ORM
Добавлен **Drizzle ORM** (`drizzle-orm` + `bun-sqlite` драйвер, `drizzle-kit` для миграций).

Установка:
```bash
bun add drizzle-orm
bun add -d drizzle-kit
```

## Файлы
- `db/schema.ts` — описание таблиц `users`, `plans`, `plan_members`, `tasks` — строго по твоему реальному `db.ts`, без выдуманных таблиц/колонок.
- `db/index.ts` — замена `db.ts`: тот же `bun:sqlite`, обёрнутый в `drizzle()`.
- `drizzle.config.ts` — конфиг для `drizzle-kit generate` / `drizzle-kit push`.
- `routes/*.ts` — та же логика эндпоинтов на Drizzle query builder вместо сырых SQL-строк.

Применить схему:
```bash
bunx drizzle-kit push
```

## `positions` убраны полностью
Таблицы `positions` в БД не было — убрал её из схемы и удалил `routes/positions.ts`.
Заодно убрал из `users` всё, чего тоже нет в реальной схеме: `full_name`, `avatar_url`, `role`, `status`, `position_id`. Остался только `level` (1/2/3), как в твоём `db.ts`.

### Как это поменяло логику `users.ts`
- Валидация `role` (`admin/manager/user`) заменена на валидацию `level` (`1/2/3`).
- Защита "нельзя удалить последнего админа" теперь звучит как "нельзя удалить последнего пользователя с `level = 3`" (условно приравнял 3 к прежнему admin — поправь `MAX_LEVEL` в `routes/users.ts`, если у тебя другая семантика уровней).
- В `/api/auth/login` убрана проверка статуса аккаунта (`Account is {status}`) — колонки `status` не существует, блокировать вход по ней нечем.
- `/api/positions/:id/users` эндпоинт удалён вместе с файлом `positions.ts`.

## Попутные исправления (из прошлого шага, актуальны)
- В `users.ts` было `console.log(body)` с паролем в открытом виде перед ответами об ошибке — убрано.
- `UPDATE ... COALESCE(?, x)` заменён на `.set({...})` — Drizzle пропускает `undefined`-поля, поведение "не передали — не трогаем" сохранено, но теперь можно явно передать `null`, чтобы очистить поле.
