<?php

declare(strict_types=1);

namespace ShootingGame\Entity;

use JsonSerializable;

abstract class GameObject implements JsonSerializable
{
    protected string $id;
    protected string $label;
    protected int $width;
    protected int $height;
    protected int $speed;
    protected string $color;

    public function __construct(
        string $id,
        string $label,
        int $width,
        int $height,
        int $speed,
        string $color
    ) {
        $this->id = $id;
        $this->label = $label;
        $this->width = $width;
        $this->height = $height;
        $this->speed = $speed;
        $this->color = $color;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'width' => $this->width,
            'height' => $this->height,
            'speed' => $this->speed,
            'color' => $this->color,
        ];
    }
}

