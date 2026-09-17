import { rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { $ } from "bun";

async function cleanup() {
  console.log("🧹 Начинаем очистку проекта от ESLint и Husky...\n");

  // 1. Читаем текущий package.json
  const pkgPath = "./package.json";
  const pkg = await Bun.file(pkgPath).json();

  // 2. Удаляем скрипты, связанные с линтером и хаски
  if (pkg.scripts) {
    delete pkg.scripts.lint;
    delete pkg.scripts["lint:fix"];
    delete pkg.scripts.prepare; // Хук husky
    
    // Опционально: добавим скрипт для prettier, так как eslint мы удаляем
    pkg.scripts.format = "prettier --write .";
    console.log("✅ Скрипты 'lint', 'lint:fix' и 'prepare' удалены.");
    console.log("✅ Добавлен скрипт 'format' для Prettier.");
  }

  // 3. Сохраняем обновленный package.json
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  console.log("✅ package.json обновлен.\n");

  // 4. Удаляем пакеты из зависимостей с помощью bun remove
  console.log("⏳ Удаление npm пакетов...");
  await $`bun remove @eslint/js eslint eslint-plugin-react globals husky lint-staged typescript-eslint`;
  console.log("✅ Пакеты ESLint и Husky удалены.\n");

  // 5. Удаляем папку .husky
  if (existsSync(".husky")) {
    await rm(".husky", { recursive: true, force: true });
    console.log("✅ Папка .husky удалена.");
  }

  // 6. Удаляем конфиги ESLint (поддерживаем разные расширения)
  const eslintConfigs = [
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".eslintrc.yml",
    ".eslintrc.yaml",
    ".eslintignore"
  ];

  for (const file of eslintConfigs) {
    if (existsSync(file)) {
      await rm(file);
      console.log(`✅ Файл ${file} удален.`);
    }
  }

  console.log("\n🎉 Очистка успешно завершена!");
}

cleanup().catch((err) => {
  console.error("❌ Произошла ошибка во время очистки:", err);
  process.exit(1);
});