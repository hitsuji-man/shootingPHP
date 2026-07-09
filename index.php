<?php

declare(strict_types=1);

require __DIR__ . '/src/Autoloader.php';

\ShootingGame\Autoloader::register();

$scoreStore = new \ShootingGame\ScoreStore();
$config = new \ShootingGame\GameConfig($scoreStore->getHighScore());
$page = new \ShootingGame\GamePage($config);

echo $page->render();

