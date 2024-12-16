// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
const player = { x: canvas.width / 2 - 20, y: canvas.height - 100, size: 40, color: "white", speed: 10 };
const obstacles = [];
const powerUps = [];
const inventory = { money: 0, nonsenseItems: [] };
let score = 0;
let collisions = 0;
let multiplier = 1;
let gameOver = false;
let bossSpawned = false;
let bossClicksRemaining = 0;
let difficultyLevel = 1;

const shopItems = [
    { name: "Red Color", cost: 100 },
    { name: "Blue Color", cost: 150 },
    { name: "Green Color", cost: 200 },
    { name: "Yellow Color", cost: 250 },
    { name: "Rainbow Color", cost: 999999 },
    { name: "Half-Eaten Cheeseburger", cost: 50 },
    { name: "Box of Air", cost: 20 },
    { name: "Imaginary Hat", cost: 500 },
];

// Power-Up types
const powerUpTypes = [
    { type: "speed", chance: 0.25, color: "blue", effect: () => (player.speed += 5) },
    { type: "shield", chance: 0.25, color: "green", effect: () => (collisions = Math.max(0, collisions - 1)) },
    { type: "multiplier", chance: 0.20, color: "gold", effect: () => (multiplier *= 2) },
    { type: "slowTime", chance: 0.15, color: "purple", effect: slowTimeEffect },
    { type: "heal", chance: 0.15, color: "red", effect: healEffect },
];

// Helper Functions
function getRandomColor() {
    const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function slowTimeEffect() {
    obstacles.forEach((obs) => (obs.speed = Math.max(1, obs.speed / 2)));
    setTimeout(() => obstacles.forEach((obs) => (obs.speed *= 2)), 5000);
}

function healEffect() {
    collisions = Math.max(0, collisions - 2);
    console.log("Heal Activated!");
}

// Spawn Power-Up
function spawnPowerUp() {
    const rand = Math.random();
    let cumulativeChance = 0;

    for (const powerUp of powerUpTypes) {
        cumulativeChance += powerUp.chance;
        if (rand < cumulativeChance) {
            const pu = {
                x: Math.random() * (canvas.width - 30),
                y: -30,
                size: 30,
                color: powerUp.color,
                type: powerUp.type,
                effect: powerUp.effect,
                speed: 3,
            };
            powerUps.push(pu);
            break;
        }
    }
}

// Open Shop
function openShop() {
    const shopMenu = document.getElementById("shopMenu");
    shopMenu.style.display = "block";

    const shopItemsDiv = document.getElementById("shopItems");
    shopItemsDiv.innerHTML = "";

    shopItems.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `${item.name} - ${item.cost} money <button onclick="buyItem(${index})">Buy</button>`;
        shopItemsDiv.appendChild(itemDiv);
    });
}

document.getElementById("closeShop").addEventListener("click", () => {
    document.getElementById("shopMenu").style.display = "none";
});

function buyItem(index) {
    const item = shopItems[index];

    if (inventory.money >= item.cost) {
        inventory.money -= item.cost;
        console.log(`You bought ${item.name}! Remaining money: ${inventory.money}`);

        if (item.name.includes("Color")) {
            player.color = item.name.split(" ")[0].toLowerCase();
        } else {
            inventory.nonsenseItems.push(item.name);
        }
    } else {
        console.log("Not enough money!");
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "s" || e.key === "S") openShop();
});

// Spawn Boss
function spawnBoss() {
    if (bossSpawned) return;
    bossSpawned = true;
    bossClicksRemaining = 10;

    const bossPopup = document.createElement("div");
    bossPopup.id = "bossPopup";
    bossPopup.innerHTML = `
        <div>A boss appeared!</div>
        <div id="bossTracker">Clicks Remaining: ${bossClicksRemaining}</div>
        <button id="bossKill">Click it to kill it!</button>
    `;
    document.body.appendChild(bossPopup);

    document.getElementById("bossKill").addEventListener("click", () => {
        bossClicksRemaining--;
        document.getElementById("bossTracker").innerText = `Clicks Remaining: ${bossClicksRemaining}`;

        if (bossClicksRemaining <= 0) {
            bossSpawned = false;
            score += 10000;
            document.body.removeChild(bossPopup);
            console.log("Boss defeated!");
        }
    });
}

// Adjust Difficulty
function adjustDifficulty() {
    if (score >= difficultyLevel * 5000) {
        difficultyLevel++;
        obstacles.forEach((obs) => (obs.speed += 0.5));
        console.log(`Difficulty increased to level ${difficultyLevel}!`);
    }
}

// Game Loop
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText(`Game Over! Score: ${score}`, canvas.width / 2 - 150, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update objects
    adjustDifficulty();

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    requestAnimationFrame(gameLoop);
}

gameLoop();
