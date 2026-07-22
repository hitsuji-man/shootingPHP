<?php

declare(strict_types=1);

namespace ShootingGame;

final class GamePage
{
    private GameConfig $config;

    public function __construct(GameConfig $config)
    {
        $this->config = $config;
    }

    public function render(): string
    {
        $title = htmlspecialchars($this->config->getTitle(), ENT_QUOTES, 'UTF-8');
        $configJson = json_encode($this->config, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);

        return <<<HTML
<!doctype html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{$title}</title>
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <main class="game-shell">
        <section class="hud-panel" aria-label="Game status">
            <div class="brand">
                <span class="brand-mark" aria-hidden="true"></span>
                <h1>{$title}</h1>
            </div>
            <div class="metrics" aria-live="polite">
                <div class="metric">
                    <span>Score</span>
                    <strong id="score">0</strong>
                </div>
                <div class="metric">
                    <span>Best</span>
                    <strong id="highScore">0</strong>
                </div>
                <div class="metric">
                    <span>Lives</span>
                    <strong id="lives">3</strong>
                </div>
                <div class="metric">
                    <span>Wave</span>
                    <strong id="wave">1</strong>
                </div>
            </div>
            <div class="actions">
                <button id="startButton" type="button">Start</button>
                <button id="pauseButton" type="button">Pause</button>
            </div>
        </section>

        <section class="stage-frame" aria-label="Game stage">
            <canvas id="gameCanvas" width="960" height="540"></canvas>
            <div id="overlay" class="overlay">
                <p id="overlayTitle">READY</p>
                <span id="overlaySub">Click Start</span>
            </div>
        </section>
    </main>
    <script>
        window.SHOOTING_GAME_CONFIG = {$configJson};
    </script>
    <script src="assets/game.js"></script>
</body>
</html>
HTML;
    }
}

