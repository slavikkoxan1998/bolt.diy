## [2026-09-29 02:17] Вирішення проблеми 403 при пуші (Богдан)
- Проблема: Локальний коміт не пушився через відсутність прав на оригінальний репозиторій `stackblitz-labs/bolt.diy`.
- Рішення: Створено власний форк через GitHub CLI (`slavikkoxan1998/bolt.diy`). Remote `origin` переведено на форк.
- Результат: Код успішно запушено. Гілка `main` тепер відстежує наш форк.

# JOURNAL — Bolt.diy

> Журнал розгортання, задач та змін проєкту.

---

## 2026-09-16 23:55 CEST — Початкове розгортання та налаштування продакшн-сервісу

**Ініціатор:** Власник
**Виконавець:** Antigravity AI Agent

### Виконані кроки:

1. **Клонування та структура:**
   - Репозиторій: `https://github.com/stackblitz-labs/bolt.diy.git`
   - Локація проекту: `/root/bolt-diy` (у корені, за стандартом проєктів сервера).
   - Встановлено залежності (`pnpm install`).

2. **Збірка продакшн-бандлу:**
   - Спроба базового `pnpm run build` викликала переповнення купи V8 (OOM exit code 134).
   - Вирішено запуском з підвищеним лімітом пам'яті: `NODE_OPTIONS="--max-old-space-size=4096" pnpm run build`.
   - Успішно зібрано `build/client` та `build/server`.

3. **Створення системного сервісу systemd:**
   - Створено юніт `/etc/systemd/system/bolt-diy.service`.
   - Налаштовано робочу директорію `/root/bolt-diy`, автоперезапуск, порт 5173, ліміт пам'яті 4G.
   - Сервіс додано до автозавантаження та активовано: `systemctl enable --now bolt-diy.service`.
   - Статус: `active (running)`.

4. **Маршрутизація та SSL через Caddy:**
   - DNS A-запис додано Власником: `bolt.n8n-accaisona.site -> 144.91.92.176`.
   - У `/root/caddy/Caddyfile` додано блок `bolt.n8n-accaisona.site` з проксі на `172.17.0.1:5173`.
   - Перезавантажено Caddy-контейнер (`docker restart ai-assistant-caddy-1`).
   - Caddy автоматично випустив TLS-сертифікат від Let's Encrypt.

5. **Оформлення документації:**
   - `MAP.md` — ментальна карта та архітектура.
   - `RUNBOOK.md` — операційний довідник, команди та траблшутинг.
   - `JOURNAL.md` — цей журнал.

### Перевірка працездатності:
- Локально: `curl -I http://127.0.0.1:5173/` -> `HTTP/1.1 200 OK`
- Публічно: `curl -I https://bolt.n8n-accaisona.site/` -> `HTTP/2 200`
- Заголовки ізоляції для WebContainer (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) присутні.
