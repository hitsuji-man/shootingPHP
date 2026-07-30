class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
}

class InputController {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Set();
        this.pointerActive = false;
        this.pointer = new Vector2();
        this.fire = false;

        window.addEventListener('keydown', (event) => {
            this.keys.add(event.code);
            if (event.code === 'Space') {
                event.preventDefault();
                this.fire = true;
            }
        });

        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.code);
            if (event.code === 'Space') {
                this.fire = false;
            }
        });

        canvas.addEventListener('pointerdown', (event) => {
            this.pointerActive = true;
            this.fire = true;
            this.updatePointer(event);
            canvas.setPointerCapture(event.pointerId);
        });

        canvas.addEventListener('pointermove', (event) => {
            if (this.pointerActive) {
                this.updatePointer(event);
            }
        });

        canvas.addEventListener('pointerup', (event) => {
            this.pointerActive = false;
            this.fire = false;
            canvas.releasePointerCapture(event.pointerId);
        });

        canvas.addEventListener('pointercancel', () => {
            this.pointerActive = false;
            this.fire = false;
        });
    }

    updatePointer(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.pointer.set((event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY);
    }

    axis() {
        let x = 0;
        let y = 0;

        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) {
            x -= 1;
        }

        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) {
            x += 1;
        }

        if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) {
            y -= 1;
        }

        if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) {
            y += 1;
        }

        if (x !== 0 && y !== 0) {
            const diagonal = Math.SQRT1_2;
            x *= diagonal;
            y *= diagonal;
        }

        return new Vector2(x, y);
    }
}

class ShipRenderer {
    static player(context, ship) {
        context.save();
        context.translate(ship.position.x, ship.position.y);
        context.globalAlpha = ship.invincibleMs > 0 && Math.floor(ship.invincibleMs / 90) % 2 === 0 ? 0.45 : 1;
        context.fillStyle = ship.color;
        context.beginPath();
        context.moveTo(0, -ship.height / 2);
        context.lineTo(ship.width / 2, ship.height / 2);
        context.lineTo(0, ship.height / 3);
        context.lineTo(-ship.width / 2, ship.height / 2);
        context.closePath();
        context.fill();
        context.fillStyle = ship.accentColor;
        context.fillRect(-4, -ship.height / 4, 8, ship.height / 2);
        context.restore();
    }

    static enemy(context, enemy) {
        context.save();
        context.translate(enemy.position.x, enemy.position.y);
        context.fillStyle = enemy.color;
        context.beginPath();
        context.moveTo(-enemy.width / 2, -enemy.height / 2);
        context.lineTo(enemy.width / 2, -enemy.height / 2);
        context.lineTo(enemy.width * 0.32, enemy.height / 2);
        context.lineTo(0, enemy.height * 0.22);
        context.lineTo(-enemy.width * 0.32, enemy.height / 2);
        context.closePath();
        context.fill();
        context.fillStyle = 'rgba(255, 255, 255, 0.72)';
        context.fillRect(-enemy.width * 0.18, -enemy.height * 0.08, enemy.width * 0.36, 4);
        context.restore();
    }
}

class Player {
    constructor(config, bounds) {
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed;
        this.color = config.color;
        this.accentColor = config.accentColor;
        this.maxLives = config.lives;
        this.lives = config.lives;
        this.fireCooldownMs = config.fireCooldownMs;
        this.cooldownMs = 0;
        this.invincibleMs = 0;
        this.position = new Vector2(bounds.width / 2, bounds.height - 72);
    }

    reset(bounds) {
        this.lives = this.maxLives;
        this.cooldownMs = 0;
        this.invincibleMs = 1200;
        this.position.set(bounds.width / 2, bounds.height - 72);
    }

    update(deltaMs, input, bounds) {
        const deltaSeconds = deltaMs / 1000;
        const axis = input.axis();
        this.position.x += axis.x * this.speed * deltaSeconds;
        this.position.y += axis.y * this.speed * deltaSeconds;

        if (input.pointerActive) {
            const follow = 0.24;
            this.position.x += (input.pointer.x - this.position.x) * follow;
            this.position.y += (input.pointer.y - this.position.y) * follow;
        }

        this.position.x = Math.max(this.width / 2, Math.min(bounds.width - this.width / 2, this.position.x));
        this.position.y = Math.max(this.height / 2, Math.min(bounds.height - this.height / 2, this.position.y));
        this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);
        this.invincibleMs = Math.max(0, this.invincibleMs - deltaMs);
    }

    canFire(input) {
        return input.fire && this.cooldownMs <= 0;
    }

    fire(bulletConfig) {
        this.cooldownMs = this.fireCooldownMs;
        return new Bullet(
            this.position.x,
            this.position.y - this.height / 2,
            0,
            -bulletConfig.speed,
            bulletConfig.width,
            bulletConfig.height,
            bulletConfig.color,
            bulletConfig.damage,
            'player'
        );
    }

    hit() {
        if (this.invincibleMs > 0) {
            return false;
        }

        this.lives -= 1;
        this.invincibleMs = 1300;
        return true;
    }

    draw(context) {
        ShipRenderer.player(context, this);
    }
}

class Enemy {
    constructor(type, x, level) {
        this.id = type.id;
        this.width = type.width;
        this.height = type.height;
        this.baseSpeed = type.speed;
        this.speed = type.speed + level * 8;
        this.color = type.color;
        this.health = type.health + Math.floor(level / 4);
        this.scoreValue = type.scoreValue;
        this.drift = type.drift;
        this.phase = Math.random() * Math.PI * 2;
        this.position = new Vector2(x, -this.height);
        this.ageMs = 0;
    }

    update(deltaMs) {
        const deltaSeconds = deltaMs / 1000;
        this.ageMs += deltaMs;
        this.position.y += this.speed * deltaSeconds;
        this.position.x += Math.sin(this.ageMs / 540 + this.phase) * this.drift * deltaSeconds;
    }

    damage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    fire() {
        return new Bullet(
            this.position.x,
            this.position.y + this.height / 2,
            0,
            260,
            7,
            16,
            '#ff6f61',
            1,
            'enemy'
        );
    }

    draw(context) {
        ShipRenderer.enemy(context, this);
    }
}

class Bullet {
    constructor(x, y, velocityX, velocityY, width, height, color, damage, owner) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(velocityX, velocityY);
        this.width = width;
        this.height = height;
        this.color = color;
        this.damage = damage;
        this.owner = owner;
    }

    update(deltaMs) {
        const deltaSeconds = deltaMs / 1000;
        this.position.x += this.velocity.x * deltaSeconds;
        this.position.y += this.velocity.y * deltaSeconds;
    }

    isOut(bounds) {
        return this.position.y < -40 || this.position.y > bounds.height + 40;
    }

    draw(context) {
        context.save();
        context.fillStyle = this.color;
        context.shadowBlur = 14;
        context.shadowColor = this.color;
        context.fillRect(
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height
        );
        context.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2((Math.random() - 0.5) * 220, (Math.random() - 0.5) * 220);
        this.lifeMs = 420 + Math.random() * 280;
        this.maxLifeMs = this.lifeMs;
        this.size = 2 + Math.random() * 4;
        this.color = color;
    }

    update(deltaMs) {
        const deltaSeconds = deltaMs / 1000;
        this.lifeMs -= deltaMs;
        this.position.x += this.velocity.x * deltaSeconds;
        this.position.y += this.velocity.y * deltaSeconds;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }

    draw(context) {
        context.save();
        context.globalAlpha = Math.max(0, this.lifeMs / this.maxLifeMs);
        context.fillStyle = this.color;
        context.fillRect(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
        context.restore();
    }
}

class Star {
    constructor(bounds) {
        this.reset(bounds, true);
    }

    reset(bounds, randomY = false) {
        this.x = Math.random() * bounds.width;
        this.y = randomY ? Math.random() * bounds.height : -4;
        this.speed = 40 + Math.random() * 110;
        this.size = Math.random() > 0.84 ? 2 : 1;
        this.alpha = 0.25 + Math.random() * 0.65;
    }

    update(deltaMs, bounds) {
        this.y += this.speed * (deltaMs / 1000);
        if (this.y > bounds.height + 4) {
            this.reset(bounds);
        }
    }

    draw(context) {
        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = '#ffffff';
        context.fillRect(this.x, this.y, this.size, this.size);
        context.restore();
    }
}

class Game {
    constructor(config) {
        this.config = config;
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        this.bounds = config.canvas;
        this.input = new InputController(this.canvas);
        this.player = new Player(config.player, this.bounds);
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = Array.from({ length: 110 }, () => new Star(this.bounds));
        this.state = 'idle';
        this.score = 0;
        this.highScore = Math.max(config.highScore || 0, this.loadLocalHighScore());
        this.wave = 1;
        this.spawnTimerMs = 0;
        this.spawnEveryMs = config.difficulty.initialSpawnMs;
        this.waveTimerMs = 0;
        this.lastFrameMs = performance.now();

        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('highScore');
        this.livesEl = document.getElementById('lives');
        this.waveEl = document.getElementById('wave');
        this.overlay = document.getElementById('overlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlaySub = document.getElementById('overlaySub');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');

        this.bindUi();
        this.syncHud();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    bindUi() {
        this.startButton.addEventListener('click', () => {
            if (this.state === 'gameover' || this.state === 'idle') {
                this.start();
            } else if (this.state === 'paused') {
                this.resume();
            }
        });

        this.pauseButton.addEventListener('click', () => {
            if (this.state === 'playing') {
                this.pause();
            } else if (this.state === 'paused') {
                this.resume();
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.code === 'Enter' && (this.state === 'idle' || this.state === 'gameover')) {
                this.start();
            }

            if (event.code === 'KeyP') {
                if (this.state === 'playing') {
                    this.pause();
                } else if (this.state === 'paused') {
                    this.resume();
                }
            }
        });
    }

    start() {
        this.score = 0;
        this.wave = 1;
        this.spawnEveryMs = this.config.difficulty.initialSpawnMs;
        this.waveTimerMs = 0;
        this.spawnTimerMs = 0;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.player.reset(this.bounds);
        this.state = 'playing';
        this.startButton.textContent = 'Restart';
        this.pauseButton.textContent = 'Pause';
        this.overlay.classList.add('hidden');
        this.syncHud();
    }

    pause() {
        this.state = 'paused';
        this.pauseButton.textContent = 'Resume';
        this.showOverlay('PAUSED', 'Resume');
    }

    resume() {
        this.state = 'playing';
        this.pauseButton.textContent = 'Pause';
        this.overlay.classList.add('hidden');
    }

    gameOver() {
        this.state = 'gameover';
        this.startButton.textContent = 'Restart';
        this.pauseButton.textContent = 'Pause';
        this.persistHighScore();
        this.showOverlay('GAME OVER', 'Restart');
    }

    showOverlay(title, subtitle) {
        this.overlayTitle.textContent = title;
        this.overlaySub.textContent = subtitle;
        this.overlay.classList.remove('hidden');
    }

    loop(now) {
        const deltaMs = Math.min(34, now - this.lastFrameMs);
        this.lastFrameMs = now;

        this.updateBackground(deltaMs);

        if (this.state === 'playing') {
            this.update(deltaMs);
        }

        this.draw();
        requestAnimationFrame(this.loop);
    }

    update(deltaMs) {
        this.player.update(deltaMs, this.input, this.bounds);

        if (this.player.canFire(this.input)) {
            this.bullets.push(this.player.fire(this.config.playerBullet));
        }

        this.spawnTimerMs += deltaMs;
        this.waveTimerMs += deltaMs;

        if (this.spawnTimerMs >= this.spawnEveryMs) {
            this.spawnTimerMs = 0;
            this.spawnEnemy();
            this.spawnEveryMs = Math.max(
                this.config.difficulty.minimumSpawnMs,
                this.spawnEveryMs * this.config.difficulty.spawnAcceleration
            );
        }

        if (this.waveTimerMs >= this.config.difficulty.waveEveryMs) {
            this.waveTimerMs = 0;
            this.wave += 1;
            this.spawnEveryMs = Math.max(this.config.difficulty.minimumSpawnMs, this.spawnEveryMs - 60);
        }

        this.enemies.forEach((enemy) => {
            enemy.update(deltaMs);
            const levelFireChance = this.config.difficulty.enemyFireChance + this.wave * 0.0014;
            if (enemy.position.y > 20 && Math.random() < levelFireChance) {
                this.bullets.push(enemy.fire());
            }
        });

        this.bullets.forEach((bullet) => bullet.update(deltaMs));
        this.particles.forEach((particle) => particle.update(deltaMs));
        this.resolveCollisions();
        this.cleanup();
        this.syncHud();
    }

    updateBackground(deltaMs) {
        this.stars.forEach((star) => star.update(deltaMs, this.bounds));
    }

    spawnEnemy() {
        const types = this.config.enemyTypes;
        const weighted = [...types, types[0], this.wave > 2 ? types[1] : types[0], this.wave > 4 ? types[2] : types[0]];
        const type = weighted[Math.floor(Math.random() * weighted.length)];
        const margin = type.width / 2 + 12;
        const x = margin + Math.random() * (this.bounds.width - margin * 2);
        this.enemies.push(new Enemy(type, x, this.wave));
    }

    resolveCollisions() {
        for (const bullet of this.bullets) {
            if (bullet.owner === 'player') {
                for (const enemy of this.enemies) {
                    if (!enemy.dead && this.intersects(bullet, enemy)) {
                        bullet.dead = true;
                        if (enemy.damage(bullet.damage)) {
                            enemy.dead = true;
                            this.score += enemy.scoreValue * this.wave;
                            this.burst(enemy.position.x, enemy.position.y, enemy.color, 12);
                        } else {
                            this.burst(bullet.position.x, bullet.position.y, bullet.color, 4);
                        }
                        break;
                    }
                }
            } else if (this.intersects(bullet, this.player)) {
                bullet.dead = true;
                this.damagePlayer();
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.dead && this.intersects(enemy, this.player)) {
                enemy.dead = true;
                this.burst(enemy.position.x, enemy.position.y, enemy.color, 10);
                this.damagePlayer();
            }
        }
    }

    damagePlayer() {
        if (this.player.hit()) {
            this.burst(this.player.position.x, this.player.position.y, this.player.color, 16);
            if (this.player.lives <= 0) {
                this.gameOver();
            }
        }
    }

    burst(x, y, color, count) {
        for (let i = 0; i < count; i += 1) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    cleanup() {
        this.bullets = this.bullets.filter((bullet) => !bullet.dead && !bullet.isOut(this.bounds));
        this.enemies = this.enemies.filter((enemy) => !enemy.dead && enemy.position.y < this.bounds.height + enemy.height);
        this.particles = this.particles.filter((particle) => particle.lifeMs > 0);
    }

    intersects(a, b) {
        return Math.abs(a.position.x - b.position.x) * 2 < a.width + b.width
            && Math.abs(a.position.y - b.position.y) * 2 < a.height + b.height;
    }

    draw() {
        const context = this.context;
        context.clearRect(0, 0, this.bounds.width, this.bounds.height);
        this.drawBackdrop(context);
        this.stars.forEach((star) => star.draw(context));
        this.bullets.forEach((bullet) => bullet.draw(context));
        this.enemies.forEach((enemy) => enemy.draw(context));
        this.player.draw(context);
        this.particles.forEach((particle) => particle.draw(context));
        this.drawVignette(context);
    }

    drawBackdrop(context) {
        const gradient = context.createLinearGradient(0, 0, 0, this.bounds.height);
        gradient.addColorStop(0, '#05060d');
        gradient.addColorStop(0.54, '#0b0d12');
        gradient.addColorStop(1, '#14100c');
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.bounds.width, this.bounds.height);

        context.strokeStyle = 'rgba(85, 214, 190, 0.08)';
        context.lineWidth = 1;
        for (let y = 0; y < this.bounds.height; y += 48) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(this.bounds.width, y);
            context.stroke();
        }
    }

    drawVignette(context) {
        const gradient = context.createRadialGradient(
            this.bounds.width / 2,
            this.bounds.height / 2,
            this.bounds.height * 0.15,
            this.bounds.width / 2,
            this.bounds.height / 2,
            this.bounds.width * 0.62
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.bounds.width, this.bounds.height);
    }

    syncHud() {
        this.scoreEl.textContent = String(this.score);
        this.highScore = Math.max(this.highScore, this.score);
        this.highScoreEl.textContent = String(this.highScore);
        this.livesEl.textContent = String(Math.max(0, this.player.lives));
        this.waveEl.textContent = String(this.wave);
    }

    loadLocalHighScore() {
        return Number.parseInt(localStorage.getItem('phpStarShooterHighScore') || '0', 10);
    }

    persistHighScore() {
        localStorage.setItem('phpStarShooterHighScore', String(this.highScore));

        fetch('score.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: this.highScore }),
        })
            .then((response) => response.ok ? response.json() : null)
            .then((payload) => {
                if (payload && Number.isFinite(payload.highScore)) {
                    this.highScore = Math.max(this.highScore, payload.highScore);
                    this.highScoreEl.textContent = String(this.highScore);
                }
            })
            .catch(() => {
                this.highScoreEl.textContent = String(this.highScore);
            });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game(window.SHOOTING_GAME_CONFIG);
});
