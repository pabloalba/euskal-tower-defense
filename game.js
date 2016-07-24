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

            this.speedX = speedX;
            this.speedY = speedY;
            this.image = new Image();
            this.image.src = imageSrc;
            this.visible = true;
            this.countDown = 0;
            this.laserCountDown = 0;
            this.power = 0;
            this.targetEnemy = null;
            this.range = 0;
            this.life = 0;
            this.strength = 0;
            this.towerType = "";

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



var game = {
  setup: function() {
    this.score = 0;
    this.life = 9;
    this.money = 200;
    this.gameOver = false;
    this.enemyCountDown = 0;
    this.level = level0;
    this.currentHorde = 0;
    this.currentHordeEnemies = 0;
    this.currentTowerType = "plain";

    //characters
    this.background = [];
    this.resourcesBg = new Character("images/money.png", 95, 5, 0, 0);
    this.livesBg = new Character("images/life.png", 415, 5, 0, 0);
    this.scoreBg = new Character("images/score.png", 725, 5, 0, 0);
    this.selectTowerBg = new Character("images/select_tower.png", 315, 645, 0, 0);
    this.selectTower1 = new Character("images/tower.png", 395, 670, 0, 0);
    this.selectTower2 = new Character("images/snake.png", 490, 670, 0, 0);
    this.selectTower3 = new Character("images/snow.png", 585, 670, 0, 0);
    this.selectTowerMark = new Character("images/mark.png", 393, 668, 0, 0);


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
    }
  },

  createEnemy: function(strength){
    var enemy;

    for (var i=0; i<game.enemies.length;i++){
      if (!game.enemies[i].visible){
        enemy = game.enemies[i];
      }
    }
    if (!enemy){
      enemy = new Character("images/enemy_test.png", TILE_SIZE * (game.level.startPointX -1), TILE_SIZE * game.level.startPointY, 0.15, 0.15);
      game.enemies[game.enemies.length] = enemy;
    }

    enemy.image.src = "images/enemy_test.png";
    enemy.x = TILE_SIZE * (game.level.startPointX -1);
    enemy.y = TILE_SIZE * game.level.startPointY;
    enemy.targetX = TILE_SIZE * game.level.startPointX;
    enemy.targetY = TILE_SIZE * game.level.startPointY;
    enemy.life = strength;
    enemy.strength = strength;
    enemy.visible = true;
    return enemy;
  },

  createTower: function(x, y, towerType){
    if (game.money >= 100){
      var tower = new Character("images/tower_"+towerType+".png", TILE_SIZE * x, TILE_SIZE * y, 0, 0);
      tower.towerType=towerType;
      tower.range = 100;
      tower.strength = 1;
      game.towers[game.towers.length] = tower;
      game.level.map[y][x] = 10;
      game.money -= 100;
      return tower;
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
        tower.range = 125;
        tower.strength = 1.25;
        game.level.map[y][x] = 11;
        game.money -= 50;
      }
      return tower;
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
      tower.countDown = 600 - 100 * tower.strength;
      tower.laserCountDown = 50;

      tower.targetEnemy.life -= tower.strength;

      if ((tower.targetEnemy.life <= 0) && (tower.targetEnemy.image.src != "images/explossion.png")){
        tower.targetEnemy.countDown = 150;
        tower.targetEnemy.image.src = "images/explossion.png";
        tower.targetEnemy = null;
      }
    }

  },

  moveEnemy: function(enemy, delta){
    enemy.countDown -= delta;
    if (enemy.visible){
      if (enemy.life > 0){
        var moveUp = false;
        // Only moves right
        if (enemy.targetX > enemy.x){
          enemy.x += enemy.speedX * delta;
        }
        if (enemy.targetY > enemy.y){
          enemy.y += enemy.speedY * delta;
          moveUp = true;
        } else if (enemy.targetY < enemy.y){
          moveUp = false;
          enemy.y -= enemy.speedY * delta;
        }

        if ((Math.abs(enemy.x - enemy.targetX) < 5) && (Math.abs(enemy.y - enemy.targetY) < 5)){
          enemy.x = enemy.targetX;
          enemy.y = enemy.targetY;

          var posX = enemy.x / TILE_SIZE;
          var posY = enemy.y / TILE_SIZE;


          if (game.level.map[posY][posX+1] == 1){
            enemy.targetX = (posX+1) * TILE_SIZE;
          } else {
            if (moveUp){
              if (game.level.map[posY+1][posX] == 1){
                enemy.targetY = (posY+1) * TILE_SIZE;
              } else if (game.level.map[posY-1][posX] == 1){
                enemy.targetY = (posY-1) * TILE_SIZE;
              }
            } else {
              if (game.level.map[posY-1][posX] == 1){
                enemy.targetY = (posY-1) * TILE_SIZE;
              } else if (game.level.map[posY+1][posX] == 1){
                enemy.targetY = (posY+1) * TILE_SIZE;
              }
            }
          }

          if ((posX == game.level.endPointX) && (posY == game.level.endPointY)){
            enemy.targetX = (game.level.endPointX+1) * TILE_SIZE;
          }

          if ((enemy.visible) && (posX == game.level.endPointX+1) && (posY == game.level.endPointY)){

            enemy.visible = false;
            enemy.x = -1000;
            enemy.y = -1000;
            enemy.targetX = -10000;
            enemy.targetY = -1000;
            game.life -= 1;
            if (game.life == 0){
              game.gameOver = true;
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
        game.createEnemy(game.level.hordes[game.currentHorde].strength);
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


  endGame: function(){
    game.gameOver = true;
    //document.getElementById("audio_sound").pause();
  },






  mainLoop: function(){
      var last = game.lastLoop;
      game.lastLoop  = new Date().getTime();
      game.lastClick  = new Date().getTime();
      var delta = game.lastLoop - last;

      if (!game.gameOver){
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
      var posX = Math.floor(x / TILE_SIZE);
      var posY = Math.floor(y / TILE_SIZE);
      if (posY < TILE_H -2){
        game.manageTower(posX, posY);
      } else {
        game.selectTowerType(x, y);
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
    game.setup();
    window.setTimeout(game.mainLoop, 10);

    $("#board").click(function(e) {
      var offset = $(this).offset();
      game.userClick(e.pageX - offset.left, e.pageY - offset.top);
    });


});


var level0 = {
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
    },
    {
      num: 10,
      strength: 2,
      countDown: 500,
      rest: 5000,
    },
    {
      num: 10,
      strength: 3,
      countDown: 500,
      rest: 5000,
    },
    {
      num: 10,
      strength: 5,
      countDown: 500,
      rest: 5000,
    },
    {
      num: 10,
      strength: 10,
      countDown: 500,
      rest: 5000,
    },
    {
      num: 10,
      strength: 11,
      countDown: 500,
      rest: 5000,
    },
    {
      num: 20,
      strength: 2,
      countDown: 200,
      rest: 5000,
    },
    {
      num: 20,
      strength: 3,
      countDown: 200,
      rest: 5000,
    },
    {
      num: 15,
      strength: 12,
      countDown: 500,
      rest: 4000,
    },
    {
      num: 15,
      strength: 15,
      countDown: 300,
      rest: 4000,
    },
  ]
}


var level1 = {
  map: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  startPointX: 0,
  startPointY: 1,
  endPointX: 15,
  endPointY: 8,
}
