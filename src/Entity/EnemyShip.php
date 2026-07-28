<?php

declare(strict_types=1);

namespace ShootingGame\Entity;

final class EnemyShip extends GameObject
{
    private int $health;
    private int $scoreValue;
    private int $drift;

    public function __construct(
        string $id,
        string $label,
        int $width,
        int $height,
        int $speed,
        string $color,
        int $health,
        int $scoreValue,
        int $drift
    ) {
        parent::__construct($id, $label, $width, $height, $speed, $color);
        $this->health = $health;
        $this->scoreValue = $scoreValue;
        $this->drift = $drift;
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'health' => $this->health,
            'scoreValue' => $this->scoreValue,
            'drift' => $this->drift,
        ]);
    }
}

