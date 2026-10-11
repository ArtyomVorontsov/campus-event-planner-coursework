# Lecture 10: PHP

Tasks 1 and 2 are implemented in `index.php`: footer date/time (Europe/Riga) and a validated name/surname/date-of-birth POST form. Output is HTML-escaped. Start from the repository root with `php -S 127.0.0.1:3012 -t exercises`, then open `/lecture10/index.php`.

Task 3 currently contains a working Symfony 7.4 skeleton and controller. **PHPJunkyard RanTex integration is pending the download confirmation step; this task is not yet complete.**

## Symfony setup

Requires PHP 8.2+ and Composer:

```sh
cd symfony-app
cp .env.example .env
# Replace the placeholder APP_SECRET locally before using the project.
composer install
php -S 127.0.0.1:3014 -t public
```

Open http://127.0.0.1:3014. The controller displays the current integration status. Local secrets, dependencies and cache files are excluded from Git. Tasks 1/2 passed PHP syntax checking and a browser POST round trip with synthetic data. Symfony dependencies installed and its cache-clear command completed.

The older lecture slide names BitBucket; the Moodle assignment asks for GitHub, which is the repository used for this coursework.
