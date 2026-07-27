<?php

declare(strict_types=1);

namespace ShootingGame\Entity;

final class PlayerShip extends GameObject
{
    private int $lives;
    private int $fireCooldownMs;
    private string $accentColor;

    public function __construct(
        string $id,
        string $label,
        int $width,
        int $height,
        int $speed,
        string $color,
        int $lives,
        int $fireCooldownMs,
        string $accentColor
    ) {
        parent::__construct($id, $label, $width, $height, $speed, $color);
        $this->lives = $lives;
        $this->fireCooldownMs = $fireCooldownMs;
        $this->accentColor = $accentColor;
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'lives' => $this->lives,
            'fireCooldownMs' => $this->fireCooldownMs,
            'accentColor' => $this->accentColor,
        ]);
    }
}

