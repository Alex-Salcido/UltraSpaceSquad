// js/UI.js
class UI {
    constructor() {
        this.mainMenu = document.getElementById('mainMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.info = document.getElementById('info');
        this.bars = document.getElementById('bars');
        this.powerUpMessage = document.getElementById('powerUpMessage');

        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.brakeBarFill = document.getElementById('brakeBarFill');
        this.boostBarFill = document.getElementById('boostBarFill');
    }

    showGameUI() {
        this.mainMenu.style.display = 'none';
        this.info.style.display = 'block';
        this.bars.style.display = 'block';
        this.powerUpMessage.style.display = 'block';
    }

    displayPowerUpMessage(message) {
        this.powerUpMessage.textContent = message;
        setTimeout(() => this.powerUpMessage.textContent = '', 3000);
    }

    update(player, boss) {
        this.scoreDisplay.textContent = player.score;
        this.livesDisplay.innerHTML = '';
        for (let i = 0; i < player.lives; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            this.livesDisplay.appendChild(heart);
        }
// Assuming brakeBar is added later, default to 100% for now
        this.brakeBarFill.style.width = `${Math.floor(player.brakeBar)}%`
        this.boostBarFill.style.width = `${Math.floor(player.boostBar)}%`;
    }
}

export default UI;