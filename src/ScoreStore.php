<?php

declare(strict_types=1);

namespace ShootingGame;

final class ScoreStore
{
    private const SESSION_KEY = 'shooting_php_high_score';

    public function __construct()
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
    }

    public function getHighScore(): int
    {
        return isset($_SESSION[self::SESSION_KEY]) ? (int) $_SESSION[self::SESSION_KEY] : 0;
    }

    public function submit(int $score): int
    {
        if ($score > $this->getHighScore()) {
            $_SESSION[self::SESSION_KEY] = $score;
        }

        return $this->getHighScore();
    }
}

