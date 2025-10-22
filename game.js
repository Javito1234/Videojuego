// Juego estilo "Chrome Dino" con temática Tortugas Ninja
// Implementación completa en un solo archivo: canvas, jugador, obstáculos, salto, puntaje y reinicio.

window.addEventListener('load', () => {
    const canvas = document.getElementById('juegoCanvas');
    const ctx = canvas.getContext('2d');

    // Configuración
    const CANVAS_W = canvas.width;
    const CANVAS_H = canvas.height;
    const GROUND_Y = CANVAS_H - 40; // línea del suelo

    // Jugador (Tortuga)
    const player = {
        x: 60,
        y: GROUND_Y - 50,
        width: 48,
        height: 50,
        vy: 0,
        gravity: 0.0018, // px per ms^2
        jumpForce: -0.6, // px per ms
        isOnGround: true,
        color: '#2ecc71', // verde tortuga
        bandana: '#ff7300ff' // color de la banda
    };

    // Obstáculos
    const obstacles = [];
    let spawnTimer = 0;
    let spawnInterval = 1400; // ms

    // Velocidad del juego
    let speed = 0.35; // px per ms
    let speedIncreaseTimer = 0;

    // Estado
    let lastTime = 0;
    let running = true;
    let score = 0;

    // Controles
    function jump() {
        if (player.isOnGround && running) {
            player.vy = player.jumpForce;
            player.isOnGround = false;
        } else if (!running) {
            // Si el juego terminó, reiniciar con espacio
            resetGame();
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            jump();
        }
    });

    // Soporte táctil / click
    canvas.addEventListener('mousedown', () => jump());
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, {passive: false});

    // Spawnear obstáculos
    function spawnObstacle() {
        const h = 30 + Math.random() * 40; // altura variable
        const w = 20 + Math.random() * 30;
        obstacles.push({
            x: CANVAS_W + 20,
            y: GROUND_Y - h,
            width: w,
            height: h,
            color: '#8e44ad' // color enemigo
        });
    }

    // Reiniciar juego
    function resetGame() {
        obstacles.length = 0;
        spawnTimer = 0;
        spawnInterval = 1400;
        speed = 0.35;
        score = 0;
        running = true;
        player.y = GROUND_Y - player.height;
        player.vy = 0;
        player.isOnGround = true;
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    // Colisiones AABB
    function collides(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // Dibujar tortuga (simple estilizado)
    function drawPlayer(ctx) {
        // cuerpo
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // caparazón - círculo central
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width/2, player.y + player.height/2, player.width*0.6, player.height*0.45, 0, 0, Math.PI*2);
        ctx.fill();

        // banda ninja
        ctx.fillStyle = player.bandana;
        ctx.fillRect(player.x + 6, player.y + 10, player.width - 12, 8);
    }

    function drawObstacle(ctx, obs) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // ojos (para darle personalidad)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + obs.width*0.15, obs.y + obs.height*0.2, obs.width*0.18, obs.height*0.18);
        ctx.fillRect(obs.x + obs.width*0.6, obs.y + obs.height*0.2, obs.width*0.18, obs.height*0.18);
        ctx.fillStyle = '#000';
        ctx.fillRect(obs.x + obs.width*0.18, obs.y + obs.height*0.25, 2, 2);
        ctx.fillRect(obs.x + obs.width*0.63, obs.y + obs.height*0.25, 2, 2);
    }

    function drawGround(ctx) {
        ctx.fillStyle = '#444';
        ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    }

    function drawScore(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Puntuación: ' + Math.floor(score), 12, 28);
    }

    function drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Game Over!', CANVAS_W/2, CANVAS_H/2 - 10);
        ctx.font = '18px Arial';
        ctx.fillText('Presiona Espacio o toca para reiniciar', CANVAS_W/2, CANVAS_H/2 + 20);
    }

    // Bucle principal
    function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt = timestamp - lastTime; // ms
        lastTime = timestamp;

        // Limpiar
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        if (running) {
            // Actualizar jugador (física simple)
            player.vy += player.gravity * dt;
            player.y += player.vy * dt;
            if (player.y + player.height >= GROUND_Y) {
                player.y = GROUND_Y - player.height;
                player.vy = 0;
                player.isOnGround = true;
            }

            // Spawning
            spawnTimer += dt;
            if (spawnTimer >= spawnInterval) {
                spawnTimer = 0;
                spawnInterval = 900 + Math.random() * 1200; // un poco variable
                spawnObstacle();
            }

            // Actualizar obstáculos
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= speed * dt;
                if (obs.x + obs.width < -50) obstacles.splice(i, 1);
                // Colisión
                if (collides(player, obs)) {
                    running = false;
                }
            }

            // Aumentar velocidad lentamente
            speedIncreaseTimer += dt;
            if (speedIncreaseTimer > 5000) { // cada 5s
                speed += 0.03;
                speedIncreaseTimer = 0;
            }

            // Puntuación aumenta con el tiempo
            score += dt * 0.02;
        }

        // Dibujar
        // fondo
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        drawGround(ctx);
        drawPlayer(ctx);
        obstacles.forEach(o => drawObstacle(ctx, o));
        drawScore(ctx);

        if (!running) drawGameOver(ctx);

        requestAnimationFrame(loop);
    }

    // Iniciar primer frame
    lastTime = performance.now();
    requestAnimationFrame(loop);
});