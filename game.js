var WIDTH = 1024;
var HEIGHT = 768;

var TILE_W = 16;
var TILE_H = 12;
var TILE_SIZE = 64;


function Character(imageSrc, x, y, speedX, speedY){
            this.x = x;
            this.y = y;

            this.targetX = x;
            this.targetY = y;
            this.direction = "right";

            this.speedX = speedX;
            this.speedY = speedY;
            if (imageSrc != ""){
              this.image = new Image();
              this.image.src = imageSrc;
            }

            this.visible = true;
            this.countDown = 0;
            this.laserCountDown = 0;
            this.power = 0;
            this.targetEnemy = null;
            this.range = 0;
            this.life = 0;
            this.strength = 0;
            this.towerType = "";
            this.slowed = false;
            this.poisoned = false;
            this.maxFireCountdown = 0;
            this.direction;


            this.touchPoint = function(x, y) {
                return (
                  (this.x <= x) && (this.x + this.image.width >= x) &&
                  (this.y <= y) && (this.y + this.image.height >= y)
                )
            }

            this.collides = function(character) {
              return this.touchPoint(character.x, character.y) ||
                      this.touchPoint(character.x + character.image.width, character.y) ||
                      this.touchPoint(character.x, character.y + character.image.height) ||
                      this.touchPoint(character.x + character.image.width, character.y + character.image.height) ||
                      character.touchPoint(this.x, this.y)||
                      character.touchPoint(this.x + this.image.width, this.y)||
                      character.touchPoint(this.x, this.y + this.image.height)||
                      character.touchPoint(this.x + this.image.width, this.y + this.image.height);
            }

            this.distanceWith = function(character) {
              var a2 = (character.x - x) * (character.x - x);
              var b2 = (character.y - y) * (character.y - y);
              return Math.sqrt(a2+b2);
            }

}

function createImage(imgSrc){
  var img = new Image();
  img.src = imgSrc;
  return img;
}


// Preload images
var images_enemies = {
  "enemy1":[
    [createImage("images/enemy1_u_0.png"), createImage("images/enemy1_u_1.png"), createImage("images/enemy1_u_2.png"), createImage("images/enemy1_u_3.png")],
    [createImage("images/enemy1_r_0.png"), createImage("images/enemy1_r_1.png"), createImage("images/enemy1_r_2.png"), createImage("images/enemy1_r_3.png")],
    [createImage("images/enemy1_d_0.png"), createImage("images/enemy1_d_1.png"), createImage("images/enemy1_d_2.png"), createImage("images/enemy1_d_3.png")],
  ],
  "enemy2":[
    [createImage("images/enemy2_u_0.png"), createImage("images/enemy2_u_1.png"), createImage("images/enemy2_u_2.png"), createImage("images/enemy2_u_3.png")],
    [createImage("images/enemy2_r_0.png"), createImage("images/enemy2_r_1.png"), createImage("images/enemy2_r_2.png"), createImage("images/enemy2_r_3.png")],
    [createImage("images/enemy2_d_0.png"), createImage("images/enemy2_d_1.png"), createImage("images/enemy2_d_2.png"), createImage("images/enemy2_d_3.png")],
  ],
  "enemy3":[
    [createImage("images/enemy3_u_0.png"), createImage("images/enemy3_u_1.png"), createImage("images/enemy3_u_2.png"), createImage("images/enemy3_u_3.png")],
    [createImage("images/enemy3_r_0.png"), createImage("images/enemy3_r_1.png"), createImage("images/enemy3_r_2.png"), createImage("images/enemy3_r_3.png")],
    [createImage("images/enemy3_d_0.png"), createImage("images/enemy3_d_1.png"), createImage("images/enemy3_d_2.png"), createImage("images/enemy3_d_3.png")],
  ]
};

var image_explossion = new Image();
image_explossion.src = "images/explossion.png";






var game = {
  setup: function(levelNum) {
    document.getElementById("audio_sound").load();
    document.getElementById("audio_sound").pause();
    document.getElementById("audio_sound").volume = 0.5;
    if (levelNum == 0){
      this.score = 0;
      this.life = 9;
    } else {
      this.score += this.money;
    }

    this.money = 200;
    this.gameOver = false;
    this.enemyCountDown = 2000;
    this.level = levels[levelNum];
    this.cleanMap();
    this.currentHorde = 0;
    this.currentHordeEnemies = 0;
    this.currentTowerType = "plain";
    this.paused = false;
    this.killedEnemies = 0;
    this.win = false;
    this.levelNum = levelNum;
    this.createdEnemies = 0;

    //characters
    this.background = [];
    this.resourcesBg = new Character("images/money.png", 95, 5, 0, 0);
    this.livesBg = new Character("images/life.png", 415, 5, 0, 0);
    this.scoreBg = new Character("images/score.png", 725, 5, 0, 0);
    this.selectTowerBg = new Character("images/select_tower.png", 315, 645, 0, 0);
    this.selectTower1 = new Character("images/tower.png", 395, 670, 0, 0);
    this.selectTower2 = new Character("images/snake.png", 490, 670, 0, 0);
    this.selectTower3 = new Character("images/snow.png", 585, 670, 0, 0);
    this.selectTowerMark = new Character("images/mark.png", 393, 665, 0, 0);
    this.pauseMenu = new Character("images/paused.png", 120, 100, 0, 0);
    this.pauseButton = new Character("images/help_button.png", 900, 655, 0, 0);
    this.gameOverLost = new Character("images/gameoverlost.png", 120, 100, 0, 0);
    this.gameOverLost.visible = false;

    this.gameOverWin = new Character("images/levelwin1.png", 260, 0, 0, 0);
    this.gameOverWin.visible = false;

    //this.gameOverWin = new Character("images/gameoverwin.png", 900, 655, 0, 0);

    for (var y=0; y<game.level.map.length; y++){
      for (var x=0; x<game.level.map[0].length; x++){
        var bgTile;
        if (game.level.map[y][x]==1){
          bgTile = new Character("images/grass.png", TILE_SIZE * x, TILE_SIZE * y, 0, 0);
        } else if (game.level.map[y][x]==3){
          bgTile = new Character("images/tree.png", TILE_SIZE * x, TILE_SIZE * y, 0, 0);
        } else {
          bgTile = new Character("images/stone.png", TILE_SIZE * x, TILE_SIZE * y, 0, 0);
        }
        this.background[this.background.length] = bgTile;
      }

    }

    this.enemies = [];
    this.towers = [];
    this.arrows = [];


    gui.setup();

    this.lastLoop = new Date().getTime();
    this.pause();
  },

  cleanMap: function(){
    for (var i=0; i<game.level.map.length;i++){
      for (var j=0; j<game.level.map[i].length;j++){
        if (game.level.map[i][j] >= 10) {
          game.level.map[i][j] = 0;
        }
      }

    }
  },

  pause: function(){
    game.paused = ! this.paused;
    game.pauseMenu.visible = game.paused;
    if (game.paused){
      document.getElementById("audio_sound").pause();
    } else {
      document.getElementById("audio_sound").play();
    }
  },

  selectTowerType: function(x, y){
    if ((x > 395) && (x < 395 + 64) && (y > 670) && (y<670+64)){
      game.currentTowerType = "plain";
      this.selectTowerMark.x = 393;
    } else if ((x > 490) && (x < 490 + 64) && (y > 670) && (y<670+64)){
      game.currentTowerType = "snake";
      this.selectTowerMark.x = 488;
    } else if ((x > 585) && (x < 585 + 64) && (y > 670) && (y<670+64)){
      game.currentTowerType = "snow";
      this.selectTowerMark.x = 583;
    } else if ((x > 900) && (x < 900 + 100) && (y > 655) && (y<655+100)){
      game.pause();
    }

  },

  createEnemy: function(strength, baseImage){
    var enemy;


    for (var i=0; i<game.enemies.length;i++){
      if (!game.enemies[i].visible){
        enemy = game.enemies[i];
      }
    }
    if (!enemy){
      enemy = new Character("", TILE_SIZE * (game.level.startPointX -1), TILE_SIZE * game.level.startPointY, 0.20, 0.20);
      game.enemies[game.enemies.length] = enemy;
    }
    enemy.baseImage = baseImage;
    enemy.image = images_enemies[baseImage][1][0];
    enemy.x = TILE_SIZE * (game.level.startPointX -1);
    enemy.y = TILE_SIZE * game.level.startPointY;
    enemy.targetX = TILE_SIZE * game.level.startPointX;
    enemy.targetY = TILE_SIZE * game.level.startPointY;
    enemy.life = strength;
    if (strength == 1){
      enemy.speedX = 0.20;
      enemy.speedY = 0.20;
    } else if (strength < 3){
      enemy.speedX = 0.15;
      enemy.speedY = 0.15;
    } else if (strength < 10){
      enemy.speedX = 0.10;
      enemy.speedY = 0.10;
    } else {
      enemy.speedX = 0.05;
      enemy.speedY = 0.05;
    }

    enemy.strength = strength;
    enemy.poisoned = false;
    enemy.slowed = false;
    enemy.visible = true;
    return enemy;
  },

  createTower: function(x, y, towerType){
      var tower = new Character("images/tower_"+towerType+".png", TILE_SIZE * x, TILE_SIZE * y, 0, 0);
      tower.towerType=towerType;

      if ((towerType == "plain") && (game.money >= 100)){
        tower.range = 100;
        tower.strength = 1;
        tower.maxFireCountdown = 500;
        game.money -= 100;
        game.level.map[y][x] = 10;
        game.towers[game.towers.length] = tower;
        document.getElementById("audio_tower").load();
        document.getElementById("audio_tower").play();
        return tower;
      } else if ((towerType == "snake") && (game.money >= 150)){
        tower.range = 150;
        tower.strength = 1;
        tower.maxFireCountdown = 700;
        game.money -= 150;
        game.level.map[y][x] = 20;
        game.towers[game.towers.length] = tower;
        document.getElementById("audio_tower").load();
        document.getElementById("audio_tower").play();
        return tower;
      } else if (game.money >= 200){
        tower.range = 100;
        tower.maxFireCountdown = 1200;
        tower.strength = 1;
        game.money -= 200;
        game.level.map[y][x] = 30;
        game.towers[game.towers.length] = tower;
        document.getElementById("audio_tower").load();
        document.getElementById("audio_tower").play();
        return tower;
      } else {
        document.getElementById("audio_error").load();
        document.getElementById("audio_error").play();
      }
  },

  updateTower: function(x, y){
    if (game.money >= 50){
      var tower;
      for (var i=0;i<game.towers.length;i++){
        tower = game.towers[i]
        if ((tower.x == x * TILE_SIZE) && (tower.y == y * TILE_SIZE)){
           break;
        }
      }

      if (tower.towerType == "plain") {
        tower.image.src = "images/tower_"+tower.towerType+"2.png";
        tower.range = 150;
        tower.strength = 1.5;
        game.level.map[y][x] = 11;
        game.money -= 50;
        document.getElementById("audio_tower").load();
        document.getElementById("audio_tower").play();
      }
      return tower;
    } else {
      document.getElementById("audio_error").load();
      document.getElementById("audio_error").play();
    }
  },




  moveTower: function(tower, delta){
    tower.countDown -= delta;
    tower.laserCountDown -= delta;
    if (tower.targetEnemy) {
      // check distance
      var dist = tower.distanceWith(tower.targetEnemy);
      if (dist > tower.range){
        tower.targetEnemy = null;
      }
    }

    if (! tower.targetEnemy) {
      // find enemy
      var minDist = 100000;
      for (var i=0; i<game.enemies.length;i++){
        var dist = tower.distanceWith(game.enemies[i]);
        if ((dist < minDist) && (dist < tower.range)){
          minDist = dist;
          tower.targetEnemy = game.enemies[i];
        }
      }
    }

    if ((tower.targetEnemy) && (tower.countDown <=0)) {
      // Fire!
      tower.countDown = tower.maxFireCountdown;
      tower.laserCountDown = 50;

      document.getElementById("audio_laser").load();
      document.getElementById("audio_laser").play();

      if (tower.towerType == "plain"){
        tower.targetEnemy.life -= tower.strength;

        if ((tower.targetEnemy.life <= 0) && (tower.targetEnemy.image.src != "images/explossion.png")){
          tower.targetEnemy.countDown = 150;
          tower.targetEnemy.image = image_explossion;
          tower.targetEnemy = null;
        }
      } else if (tower.towerType == "snake"){
        tower.targetEnemy.poisoned = true;
        tower.targetEnemy = null;
      } else if (tower.towerType == "snow"){
        tower.targetEnemy.slowed = true;
        tower.targetEnemy = null;
      }


    }

  },

  moveEnemy: function(enemy, delta){
    var spriteNum = Math.round((new Date().getTime() / 100)) % 4;
    enemy.countDown -= delta;
    if (enemy.visible){
      if (enemy.poisoned){
        enemy.life -= 0.00025 * delta;
      }
      if (enemy.life > 0){
        var moveUp = false;
        // Only moves right
        if (enemy.targetX > enemy.x){
          var vel = enemy.speedX;
          if (enemy.slowed){
            vel *= 0.5;
          }
          enemy.x += vel * delta;

          // Change image
          enemy.image = images_enemies[enemy.baseImage][1][spriteNum];
        }
        if (enemy.targetY > enemy.y){
          var vel = enemy.speedY;
          if (enemy.slowed){
            vel *= 0.5;
          }
          enemy.y += vel * delta;
          moveUp = true;
          // Change image
          enemy.image = images_enemies[enemy.baseImage][2][spriteNum];
        } else if (enemy.targetY < enemy.y){
          var vel = enemy.speedY;
          if (enemy.slowed){
            vel *= 0.5;
          }
          moveUp = false;
          enemy.y -= vel * delta;
          // Change image
          enemy.image = images_enemies[enemy.baseImage][0][spriteNum];
        }

        if (
          ((enemy.direction == "up") && (enemy.y <= enemy.targetY)) ||
          ((enemy.direction == "down") && (enemy.y >= enemy.targetY)) ||
          ((enemy.direction == "right") && (enemy.x >= enemy.targetX))
        ){
          enemy.x = enemy.targetX;
          enemy.y = enemy.targetY;

          var posX = enemy.x / TILE_SIZE;
          var posY = enemy.y / TILE_SIZE;


          if (game.level.map[posY][posX+1] == 1){
            enemy.targetX = (posX+1) * TILE_SIZE;
            enemy.direction = "right";
          } else {
            if (moveUp){
              if (game.level.map[posY+1][posX] == 1){
                enemy.targetY = (posY+1) * TILE_SIZE;
                enemy.direction = "down";
              } else if (game.level.map[posY-1][posX] == 1){
                enemy.targetY = (posY-1) * TILE_SIZE;
                enemy.direction = "up";
              }
            } else {
              if (game.level.map[posY-1][posX] == 1){
                enemy.targetY = (posY-1) * TILE_SIZE;
                enemy.direction = "up";
              } else if (game.level.map[posY+1][posX] == 1){
                enemy.targetY = (posY+1) * TILE_SIZE;
                enemy.direction = "down";
              }
            }
          }

          if ((posX == game.level.endPointX) && (posY == game.level.endPointY)){
            enemy.targetX = (game.level.endPointX+1) * TILE_SIZE;
            enemy.direction = "right";
          }

          if ((enemy.visible) && (posX == game.level.endPointX+1) && (posY == game.level.endPointY)){

            enemy.visible = false;
            enemy.x = -1000;
            enemy.y = -1000;
            enemy.targetX = -10000;
            enemy.targetY = -1000;
            game.life -= 1;
            document.getElementById("audio_auch").load();
            document.getElementById("audio_auch").play();
            if (game.life == 0){
              game.endGame(false);
            }
          }

        }
      } else if (enemy.countDown <= 0){
        enemy.visible = false;
        enemy.x = -1000;
        enemy.y = -1000;
        enemy.targetX = -1000;
        enemy.targetY = -1000;
        game.score += enemy.strength;
        game.money += 3 + enemy.strength * 3;
      }





    }
  },

  moveCharacters: function(delta){
    for (var i=0; i<game.enemies.length;i++){
      game.moveEnemy(game.enemies[i], delta);
    }

    for (var i=0; i<game.towers.length;i++){
      game.moveTower(game.towers[i], delta);
    }

    for (var i=0; i<game.arrows.length;i++){
      game.moveArrow(game.arrows[i], delta);
    }

  },

  createEnemies: function(delta){
    if (game.currentHorde < game.level.hordes.length) {
      game.enemyCountDown -= delta;
      if (game.enemyCountDown <=0){
        game.createdEnemies += 1;
        game.createEnemy(game.level.hordes[game.currentHorde].strength, game.level.hordes[game.currentHorde].baseImage);
        game.currentHordeEnemies += 1;
        if (game.currentHordeEnemies < game.level.hordes[game.currentHorde].num){
          game.enemyCountDown = game.level.hordes[game.currentHorde].countDown;
        } else {

          game.currentHordeEnemies = 0;
          game.currentHorde += 1;

          if (game.currentHorde < game.level.hordes.length){
            game.enemyCountDown = game.level.hordes[game.currentHorde-1].rest;
          }

        }
      }
    }
  },


  endGame: function(gameWin){
    game.gameOver = true;
    game.win = gameWin;
    document.getElementById("audio_sound").pause();

    if (gameWin) {
      game.gameOverWin.image.src = "images/levelwin"+game.levelNum+".png";
      game.gameOverWin.visible = true;

    } else {
      game.gameOverLost.visible = true;
    }
  },






  mainLoop: function(){
      var last = game.lastLoop;
      game.lastLoop  = new Date().getTime();
      game.lastClick  = new Date().getTime();
      var delta = game.lastLoop - last;

      if ((!game.paused) && (!game.gameOver)){
        if (game.currentHorde == game.level.hordes.length){
          var end = true;
          for (var i=0; i<game.enemies.length;i++){
            if (game.enemies[i].visible){
              end = false;
              break;
            }
          }
          if (end){
            game.endGame(true);
          }
        }
        game.moveCharacters(delta);
        game.createEnemies(delta);
      }

      gui.refresh();
      window.setTimeout(game.mainLoop, 10);
  },



  userClick: function(x, y){
    var time = new Date().getTime();
    if (time - game.lastClick > 0.200){
      game.lastClick  = time;
      if (game.gameOver){
        if (game.win){
          game.levelNum = (game.levelNum + 1) % 4;
        } else {
          game.levelNum = 0;
        }
        game.setup(game.levelNum);
      } else {
        if (game.paused){
          game.pause();
        } else {
          var posX = Math.floor(x / TILE_SIZE);
          var posY = Math.floor(y / TILE_SIZE);
          if (posY < TILE_H -2){
            game.manageTower(posX, posY);
          } else {
            game.selectTowerType(x, y);
          }
        }
      }
    }
  },

  manageTower: function(x, y){
    if (game.level.map[y][x] == 0){
      game.createTower(x, y, game.currentTowerType);
    } else if (game.level.map[y][x] == 10){
      game.updateTower(x, y);
    }
  }



}


$(document).ready(function() {
    console.log( "ready!" );
    game.setup(0);
    window.setTimeout(game.mainLoop, 10);

    $("#board").click(function(e) {
      var offset = $(this).offset();
      game.userClick(e.pageX - offset.left, e.pageY - offset.top);
    });


});



var levels = [
{
  map: [
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,3,3,0,0,0,1,1,1,1],
    [0,0,1,1,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
    [0,0,1,0,0,3,3,3,3,0,1,0,1,0,0,0],
    [1,1,1,0,0,3,3,3,3,0,1,1,1,0,0,0],
    [0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  ],
  totalEnemies: 80,
  startPointX: 0,
  startPointY: 8,
  endPointX: 15,
  endPointY: 2,
  hordes: [
    {
      num: 10,
      strength: 1,
      countDown: 700,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 3,
      countDown: 700,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 10,
      strength: 5,
      countDown: 600,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 6,
      strength: 10,
      countDown: 600,
      rest: 7000,
      baseImage: "enemy3"
    },
    {
      num: 15,
      strength: 2,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 15,
      countDown: 500,
      rest: 4000,
      baseImage: "enemy3"
    },
  ]
},
{
  map: [
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,3],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  ],
  startPointX: 0,
  startPointY: 1,
  endPointX: 15,
  endPointY: 8,
  totalEnemies: 130,
  hordes: [
    {
      num: 10,
      strength: 1,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 2,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 4,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 10,
      strength: 6,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 10,
      strength: 10,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy3"
    },
    {
      num: 10,
      strength: 14,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy3"
    },
    {
      num: 20,
      strength: 2,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 20,
      strength: 3,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 15,
      strength: 12,
      countDown: 500,
      rest: 4000,
      baseImage: "enemy3"
    },
    {
      num: 15,
      strength: 15,
      countDown: 300,
      rest: 4000,
      baseImage: "enemy3"
    },
  ]
},
{
  map: [
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,3],
    [3,3,3,3,3,3,0,1,1,1,1,1,1,1,1,1],
    [3,3,3,3,3,3,0,1,0,0,0,0,0,0,0,3],
    [3,3,0,0,0,0,0,1,0,3,3,3,3,3,3,3],
    [1,1,1,1,0,0,0,1,0,3,3,3,3,3,3,3],
    [3,3,0,1,0,0,0,1,0,3,3,3,3,3,3,3],
    [3,3,0,1,1,1,1,1,0,3,3,3,3,3,3,3],
    [3,3,0,0,0,0,0,0,0,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  ],
  startPointX: 0,
  startPointY: 6,
  endPointX: 15,
  endPointY: 3,
  totalEnemies: 130,
  hordes: [
    {
      num: 10,
      strength: 1,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 2,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 3,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 10,
      strength: 5,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 15,
      strength: 2,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 10,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy3"
    },
    {
      num: 10,
      strength: 11,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy3"
    },
    {
      num: 20,
      strength: 3,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 15,
      strength: 12,
      countDown: 500,
      rest: 4000,
      baseImage: "enemy3"
    },
    {
      num: 20,
      strength: 15,
      countDown: 300,
      rest: 4000,
      baseImage: "enemy3"
    },
  ]
},
{
  map: [
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [0,0,0,0,0,0,3,3,3,3,3,3,1,1,1,1],
    [0,0,1,1,1,3,3,3,3,3,3,0,1,0,0,0],
    [0,0,1,0,1,0,3,0,3,0,0,3,1,0,0,0],
    [0,0,1,3,1,1,1,1,1,1,1,0,1,0,0,0],
    [0,0,1,0,0,3,0,3,0,0,1,3,1,0,0,0],
    [3,0,1,0,0,3,3,3,3,0,1,0,1,0,0,0],
    [1,1,1,3,0,3,3,3,3,0,1,1,1,0,0,0],
    [3,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  ],
  totalEnemies: 130,
  startPointX: 0,
  startPointY: 8,
  endPointX: 15,
  endPointY: 2,
  hordes: [
    {
      num: 10,
      strength: 1,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 2,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 10,
      strength: 3,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 10,
      strength: 5,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 10,
      strength: 10,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy3"
    },
    {
      num: 10,
      strength: 11,
      countDown: 500,
      rest: 5000,
      baseImage: "enemy3"
    },
    {
      num: 20,
      strength: 2,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy1"
    },
    {
      num: 20,
      strength: 3,
      countDown: 200,
      rest: 5000,
      baseImage: "enemy2"
    },
    {
      num: 15,
      strength: 12,
      countDown: 500,
      rest: 4000,
      baseImage: "enemy3"
    },
    {
      num: 15,
      strength: 15,
      countDown: 300,
      rest: 4000,
      baseImage: "enemy3"
    },
  ]
},
];
