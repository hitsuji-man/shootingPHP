<?php

declare(strict_types=1);

namespace ShootingGame;

use JsonSerializable;
use ShootingGame\Entity\Bullet;
use ShootingGame\Entity\EnemyShip;
use ShootingGame\Entity\PlayerShip;

final class GameConfig implements JsonSerializable
{
    private string $title;
    private int $width;
    private int $height;
    private int $highScore;
    private PlayerShip $player;
    private Bullet $playerBullet;
    /** @var EnemyShip[] */
    private array $enemies;
    /** @var array<string, int|float> */
    private array $difficulty;

    public function __construct(int $highScore = 0)
    {
        $this->title = 'PHP Star Shooter';
        $this->width = 960;
        $this->height = 540;
        $this->highScore = $highScore;

        $this->player = new PlayerShip(
            'player',
            'Falcon',
            42,
            42,
            360,
            '#55d6be',
            3,
            160,
            '#f7d85c'
        );

        $this->playerBullet = new Bullet(
            'laser',
            'Pulse Laser',
            6,
            18,
            680,
            '#f7d85c',
            1,
            'player'
        );

        $this->enemies = [
            new EnemyShip('scout', 'Scout', 34, 32, 130, '#ff6f61', 1, 40, 32),
            new EnemyShip('raider', 'Raider', 44, 38, 95, '#ffad4f', 2, 80, 48),
            new EnemyShip('warden', 'Warden', 58, 46, 70, '#b784ff', 4, 180, 24),
        ];

        $this->difficulty = [
            'initialSpawnMs' => 900,
            'minimumSpawnMs' => 260,
            'spawnAcceleration' => 0.982,
            'enemyFireChance' => 0.012,
            'waveEveryMs' => 18000,
        ];
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function jsonSerialize(): array
    {
        return [
            'title' => $this->title,
            'canvas' => [
                'width' => $this->width,
                'height' => $this->height,
            ],
            'highScore' => $this->highScore,
            'player' => $this->player,
            'playerBullet' => $this->playerBullet,
            'enemyTypes' => $this->enemies,
            'difficulty' => $this->difficulty,
        ];
    }
}

