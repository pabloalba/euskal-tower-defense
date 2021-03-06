var gui = {
    setup: function() {
        this.ctx = document.getElementById("board").getContext("2d");
        this.ctx.font="28px Arial";
        this.ctx.fillStyle = "#FFFFFF";
    },

    clear: function() {
        gui.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    },

    drawCharacter: function(character) {
      if (character.visible){
        gui.ctx.drawImage(character.image, character.x, character.y);
      }
    },

    drawEnemy: function(character) {
      if (character.visible){

        var fillStyle = gui.ctx.fillStyle;

        if (character.poisoned) {
          gui.ctx.fillStyle = "rgba(0, 255, 0, 0.08)";
          gui.ctx.fillRect(character.x + 10, character.y + 5, 45, 54);
        }

        if (character.slowed) {
          gui.ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          gui.ctx.fillRect(character.x + 10, character.y + 5, 45, 54);
        }

        gui.ctx.drawImage(character.image, character.x, character.y);

        gui.ctx.fillStyle = fillStyle;



      }
    },

    drawLaser: function(character) {
      if (character.visible){
        if ((character.targetEnemy) && (character.laserCountDown > 0)){
          if (character.towerType=="plain"){
            if (character.strength==1){
              gui.ctx.strokeStyle = '#000000';
            } else {
              gui.ctx.strokeStyle = '#ff0000';
            }
          } else if (character.towerType=="snake"){
            gui.ctx.strokeStyle = '#00FF00';
          } else {
            gui.ctx.strokeStyle = '#FFFFFF';
          }
          gui.ctx.beginPath();
          gui.ctx.lineWidth = 3;
          gui.ctx.moveTo(character.x+32, character.y+32);
          gui.ctx.lineTo(character.targetEnemy.x+32,character.targetEnemy.y+32);
          gui.ctx.stroke();
        }
      }
    },

    drawCharacterList: function(characters) {
      for (i=0; i < characters.length;i++){
        gui.drawCharacter(characters[i]);
      }
    },

    drawEnemiesList: function(characters) {
      for (i=0; i < characters.length;i++){
        gui.drawEnemy(characters[i]);
      }
    },

    drawTowersList: function(characters) {
      for (i=0; i < characters.length;i++){
        gui.drawCharacter(characters[i]);
      }
      for (i=0; i < characters.length;i++){
        gui.drawLaser(characters[i]);
      }
    },

    drawScore: function (score) {
      gui.ctx.fillText(("0000"+score).slice(-5),780,38);
    },

    drawLife: function (life) {
      gui.ctx.fillText(life,505,38);
    },

    drawMoney: function (money) {
      gui.ctx.fillText(("0000"+money).slice(-5),150, 38);
    },

    drawCharacters: function() {
      this.drawCharacterList(game.background);
      this.drawEnemiesList(game.enemies);
      this.drawTowersList(game.towers);
      this.drawCharacterList(game.arrows);
      this.drawCharacter(game.scoreBg);
      this.drawCharacter(game.resourcesBg);
      this.drawCharacter(game.livesBg);
      this.drawScore(game.score);
      this.drawLife(game.life);
      this.drawMoney(game.money);
      this.drawCharacter(game.selectTowerBg);
      this.drawCharacter(game.selectTower1);
      this.drawCharacter(game.selectTower2);
      this.drawCharacter(game.selectTower3);
      this.drawCharacter(game.selectTowerMark);
      this.drawCharacter(game.pauseButton);
      this.drawCharacter(game.pauseMenu);
      this.drawCharacter(game.gameOverLost);
      this.drawCharacter(game.gameOverWin);
    },


    refresh: function() {
        gui.drawCharacters();
    }
}
