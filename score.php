<?php

declare(strict_types=1);

require __DIR__ . '/src/Autoloader.php';

\ShootingGame\Autoloader::register();

header('Content-Type: application/json; charset=utf-8');

$store = new \ShootingGame\ScoreStore();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    $score = is_array($payload) && isset($payload['score']) ? (int) $payload['score'] : 0;
    $highScore = $store->submit(max(0, $score));
} else {
    $highScore = $store->getHighScore();
}

echo json_encode(['highScore' => $highScore], JSON_THROW_ON_ERROR);

