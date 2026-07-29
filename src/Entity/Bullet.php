<?php

declare(strict_types=1);

namespace ShootingGame\Entity;

final class Bullet extends GameObject
{
    private int $damage;
    private string $owner;

    public function __construct(
        string $id,
        string $label,
        int $width,
        int $height,
        int $speed,
        string $color,
        int $damage,
        string $owner
    ) {
        parent::__construct($id, $label, $width, $height, $speed, $color);
        $this->damage = $damage;
        $this->owner = $owner;
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'damage' => $this->damage,
            'owner' => $this->owner,
        ]);
    }
}

