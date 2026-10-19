# Лендинг: Анастасия Ельешевич

Статичный сайт, готов к загрузке на любой хостинг (корень сайта = эта папка).

## Перед публикацией
1. Замените `https://example.com` на ваш домен во всех файлах:
   `grep -rl "https://example.com" . | xargs sed -i 's#https://example.com#https://ВАШ-ДОМЕН.ru#g'`
   (index.html, robots.txt, sitemap.xml, llms.txt)
2. Отзывы в блоке «Отзывы» (index.html, секция #reviews) — временные заглушки. Замените их реальными отзывами из Instagram.
   После этого можно добавить в JSON-LD разметку Review/AggregateRating — только с настоящими отзывами.
3. Добавьте сайт в Яндекс.Вебмастер и Google Search Console, отправьте sitemap.xml.
4. Зарегистрируйте точку в Яндекс.Бизнесе и 2ГИС с тем же адресом — это главный сигнал для локального поиска.

## Структура
- index.html — страница (SEO-мета, Open Graph, JSON-LD: BeautySalon, Person, FAQPage)
- css/style.css, js/main.js — стили и скрипты без зависимостей
- img/ — WebP + JPEG в 2 размерах (480/960), og-image, иконки
- video/ — H.264 MP4 с faststart (играют на iPhone и Android без звука, кнопка «Звук»)
- robots.txt, sitemap.xml, llms.txt (GEO — для ИИ-поисковиков), site.webmanifest, humans.txt, .htaccess
