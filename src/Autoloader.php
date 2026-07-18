<?php

declare(strict_types=1);

namespace ShootingGame;

final class Autoloader
{
    public static function register(): void
    {
        spl_autoload_register(static function (string $className): void {
            $prefix = __NAMESPACE__ . '\\';

            if (strncmp($prefix, $className, strlen($prefix)) !== 0) {
                return;
            }

            $relativeClass = substr($className, strlen($prefix));
            $file = __DIR__ . '/' . str_replace('\\', '/', $relativeClass) . '.php';

            if (is_file($file)) {
                require $file;
            }
        });
    }
}

