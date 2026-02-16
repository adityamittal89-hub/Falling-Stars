        // Game state variables
        let gameState = {
            score: 0,
            timeLeft: 60,
            gameRunning: false,
            stars: [],
            basket: { x: 375, y: 550, width: 50, height: 30 },
            starSpeed: 2,
            lastSpeedIncrease: 0
        };

        // Canvas setup
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Input handling
        const keys = {};
        document.addEventListener('keydown', (e) => keys[e.key] = true);
        document.addEventListener('keyup', (e) => keys[e.key] = false);

        // Load high score from localStorage or default to 0
        function loadHighScore() {
            const saved = localStorage.getItem('catchStarsHighScore');
            const highScore = saved ? parseInt(saved) : 0;
            document.getElementById('highScore').textContent = highScore;
            return highScore;
        }

        // Save high score to localStorage and update display
        function saveHighScore(score) {
            localStorage.setItem('catchStarsHighScore', score.toString());
            document.getElementById('highScore').textContent = score;
        }

        // Create a new falling star at random x position
        function createStar() {
            return {
                x: Math.random() * (canvas.width - 20) + 10,
                y: -20,
                size: 15,
                speed: gameState.starSpeed + Math.random() * 2
            };
        }

        // Draw a five-point star shape
        function drawStar(x, y, size) {
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#ffed4e';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle1 = (i * 4 * Math.PI) / 5;
                const angle2 = ((i * 4 + 2) * Math.PI) / 5;
                const x1 = x + Math.cos(angle1) * size;
                const y1 = y + Math.sin(angle1) * size;
                const x2 = x + Math.cos(angle2) * size * 0.4;
                const y2 = y + Math.sin(angle2) * size * 0.4;
                
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Draw the basket (brown rectangle)
        function drawBasket() {
            const basket = gameState.basket;
            
            // Basket body
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
            
            // Basket rim
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(basket.x, basket.y, basket.width, 5);
            
            // Basket outline
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(basket.x, basket.y, basket.width, basket.height);
        }

        // Update basket position based on arrow key input
        function updateBasket() {
            const basket = gameState.basket;
            const speed = 5;
            
            if (keys['ArrowLeft'] && basket.x > 0) {
                basket.x -= speed;
            }
            if (keys['ArrowRight'] && basket.x < canvas.width - basket.width) {
                basket.x += speed;
            }
        }

        // Update all falling stars positions and handle collisions
        function updateStars() {
            for (let i = gameState.stars.length - 1; i >= 0; i--) {
                const star = gameState.stars[i];
                star.y += star.speed;
                
                // Check collision with basket
                if (star.y + star.size > gameState.basket.y &&
                    star.y < gameState.basket.y + gameState.basket.height &&
                    star.x + star.size > gameState.basket.x &&
                    star.x - star.size < gameState.basket.x + gameState.basket.width) {
                    
                    // Star caught - increase score and remove star
                    gameState.score++;
                    document.getElementById('currentScore').textContent = gameState.score;
                    gameState.stars.splice(i, 1);
                }
                // Remove stars that have fallen off screen
                else if (star.y > canvas.height + 20) {
                    gameState.stars.splice(i, 1);
                }
            }
        }

        // Spawn new stars randomly
        function spawnStars() {
            if (Math.random() < 0.03) { // 3% chance per frame
                gameState.stars.push(createStar());
            }
        }

        // Increase difficulty every 15 seconds
        function updateDifficulty() {
            const elapsed = 60 - gameState.timeLeft;
            if (elapsed > 0 && elapsed % 15 === 0 && elapsed !== gameState.lastSpeedIncrease) {
                gameState.starSpeed += 0.5;
                gameState.lastSpeedIncrease = elapsed;
            }
        }

        // Main game rendering function
        function render() {
            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#003366');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw all stars
            gameState.stars.forEach(star => {
                drawStar(star.x, star.y, star.size);
            });
            
            // Draw basket
            drawBasket();
        }

        // Game timer countdown
        function updateTimer() {
            if (gameState.timeLeft > 0) {
                gameState.timeLeft--;
                document.getElementById('timeLeft').textContent = gameState.timeLeft;
                
                if (gameState.timeLeft === 0) {
                    endGame();
                }
            }
        }

        // Main game loop
        function gameLoop() {
            if (!gameState.gameRunning) return;
            
            updateBasket();
            updateStars();
            spawnStars();
            updateDifficulty();
            render();
            
            requestAnimationFrame(gameLoop);
        }

        // Timer loop (runs every second)
        function timerLoop() {
            if (!gameState.gameRunning) return;
            
            updateTimer();
            setTimeout(timerLoop, 1000);
        }

        // Start a new game
        function startGame() {
            gameState = {
                score: 0,
                timeLeft: 60,
                gameRunning: true,
                stars: [],
                basket: { x: 375, y: 550, width: 50, height: 30 },
                starSpeed: 2,
                lastSpeedIncrease: 0
            };
            
            document.getElementById('currentScore').textContent = '0';
            document.getElementById('timeLeft').textContent = '60';
            document.getElementById('gameOver').style.display = 'none';
            
            gameLoop();
            timerLoop();
        }

        // End the game and show results
        function endGame() {
            gameState.gameRunning = false;
            
            const currentHighScore = loadHighScore();
            const isNewHighScore = gameState.score > currentHighScore;
            
            if (isNewHighScore) {
                saveHighScore(gameState.score);
                document.getElementById('newHighScore').style.display = 'block';
            } else {
                document.getElementById('newHighScore').style.display = 'none';
            }
            
            document.getElementById('finalScore').textContent = gameState.score;
            document.getElementById('gameOver').style.display = 'block';
        }

        // Restart the game
        function restartGame() {
            startGame();
        }

        // Initialize the game when page loads
        window.addEventListener('load', () => {
            loadHighScore(); // Load saved high score from localStorage
            render(); // Show initial state
            
            // Start game when any key is pressed
            document.addEventListener('keydown', function startOnKeyPress() {
                if (!gameState.gameRunning) {
                    document.removeEventListener('keydown', startOnKeyPress);
                    startGame();
                }
            });
        });