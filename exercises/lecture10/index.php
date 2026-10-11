<?php
declare(strict_types=1);
function escape(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function currentDateTime(): DateTimeImmutable { return new DateTimeImmutable('now', new DateTimeZone('Europe/Riga')); }
$errors = []; $values = ['name' => '', 'surname' => '', 'birthdate' => '']; $submitted = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($values as $field => $_) {
        $values[$field] = is_string($_POST[$field] ?? null) ? trim($_POST[$field]) : '';
    }
    foreach (['name', 'surname'] as $field) {
        if ($values[$field] === '' || mb_strlen($values[$field]) > 80) $errors[] = ucfirst($field).' must contain 1–80 characters.';
    }
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $values['birthdate']);
    if (!$date || $date->format('Y-m-d') !== $values['birthdate'] || $date > currentDateTime()) $errors[] = 'Enter a valid date of birth that is not in the future.';
    $submitted = count($errors) === 0;
    if ($errors) http_response_code(422);
}
$now = currentDateTime();
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PHP student form</title><link rel="stylesheet" href="../shared/style.css"></head><body><main>
<h1>PHP student form</h1><p>Lecture 10 tasks 1 and 2: server-side form processing and footer date/time.</p>
<?php if ($errors): ?><div role="alert"><h2>Please correct the form</h2><ul><?php foreach ($errors as $error): ?><li><?= escape($error) ?></li><?php endforeach; ?></ul></div><?php endif; ?>
<form method="post" action="index.php">
<label for="name">Name</label><input id="name" name="name" required maxlength="80" value="<?= escape($values['name']) ?>">
<label for="surname">Surname</label><input id="surname" name="surname" required maxlength="80" value="<?= escape($values['surname']) ?>">
<label for="birthdate">Date of birth</label><input id="birthdate" name="birthdate" type="date" required max="<?= $now->format('Y-m-d') ?>" value="<?= escape($values['birthdate']) ?>">
<button type="submit">Submit</button></form>
<?php if ($submitted): ?><section aria-label="Submitted information"><h2>Submitted information</h2><dl><dt>Name</dt><dd><?= escape($values['name']) ?></dd><dt>Surname</dt><dd><?= escape($values['surname']) ?></dd><dt>Date of birth</dt><dd><?= escape($values['birthdate']) ?></dd></dl></section><?php endif; ?>
<footer>&copy; <?= $now->format('Y') ?> Campus Workshop. Server date and time: <time datetime="<?= $now->format(DateTimeInterface::ATOM) ?>"><?= $now->format('d.m.Y H:i:s T') ?></time></footer>
</main></body></html>
