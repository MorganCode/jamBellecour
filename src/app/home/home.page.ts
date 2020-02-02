import { Component } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { ToastController } from "@ionic/angular";
import { CONSTANTS } from "../../constants";

declare let Phaser;
// Phaser needs
let that;
let game;
// Background
let background;
let canon;
// Fleches
let arrow;
// Player
let lutin;
// area
let areas;
// Controler
let isMoving = { x: 0, y: 0 };
// let isMovingX = false;
// let isMovingY = false;
// Shot
let shotStartPoint = { x: 0, y: 0 };
let shotVector = { x: 0, y: 0 };
let shotAngle = 0;

let animationsToPlay = [];

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  userName = "";
  roomName = "";
  players = 0;
  isConnected = false;
  isStarted = false;

  constructor(private socket: Socket, private toastCtrl: ToastController) {
    that = Object.create(this.constructor.prototype);
  }

  ionViewDidEnter() {
    game = new Phaser.Game(
      window.innerWidth,
      window.innerHeight,
      Phaser.AUTO,
      "game",
      {
        preload: this.preload,
        create: this.create,
        update: this.update
      }
    );
  }

  connect() {
    this.socket.connect();
    this.socket.emit("set-name", this.userName);

    this.socket.fromEvent("users-changed").subscribe(data => {
      let user = data["user"];
      if (data["event"] === "left") {
        this.showToast("User left: " + user);
        this.players--;
      } else {
        this.showToast("User joined: " + user);
        this.players++;
        this.isConnected = true;
      }
    });

    this.socket.fromEvent("move").subscribe(({ x, y, user }) => {
      console.log("move received", x, y, user);
    });

    this.socket.fromEvent("startGame").subscribe(() => {
      console.log("LETS GO");
      this.isStarted = true;
    });
  }

  startGame() {
    this.socket.emit("start-game", this.roomName);
  }

  fireStart(event) {
    // isMovingX = true;
    // isMovingY = true;
    shotStartPoint = {
      x: event.changedTouches[0].screenX,
      y: event.changedTouches[0].screenY
    };
    animationsToPlay.push({ obj: "canon", anim: "load" });
  }

  fireAim(event) {
    shotVector = {
      x: shotStartPoint.x - event.changedTouches[0].screenX,
      y: shotStartPoint.y - event.changedTouches[0].screenY
    };
    shotAngle = that.calcAngle(shotVector.x, -shotVector.y);
  }

  fireShoot(event) {
    console.log(shotVector);
    isMoving = { x: shotVector.x * 10, y: shotVector.y * 10 };
    console.log(shotAngle);
    animationsToPlay.push({ obj: "canon", anim: "fire" });
    animationsToPlay.push({ obj: "lutin", anim: "fire" });
  }

  sendMove() {
    this.socket.emit("send-move", { x: 4, y: 4 });
  }

  ionViewWillLeave() {
    this.socket.disconnect();
  }

  calcHypotenuse(a, b) {
    return Math.sqrt(a * a + b * b);
  }
  calcAngle(opposite, adjacent) {
    return (Math.atan2(opposite, adjacent) * 180) / Math.PI;
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: "top",
      duration: 2000
    });
    toast.present();
  }

  // PHASER
  // Preload this game
  preload() {
    game.load.image("background", "assets/phaser/arena.png");
    game.load.spritesheet(
      "canon",
      "assets/phaser/spritesheet/canon.png",
      100,
      100
    );
    game.load.image("arrow", "assets/phaser/fleche_puissance.png");
    game.load.image("lutinWalk", "assets/icon/lutin walk green.png");
    game.load.image("lutinShot", "assets/icon/lutin shot green.png");
    game.load.image("lutinStun", "assets/icon/lutin stun green.png");
    game.load.spritesheet(
      "lutin",
      "assets/phaser/spritesheet/canon.png",
      100,
      100
    );
  }

  create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    const hRatio = window.innerHeight / CONSTANTS.bgHeight;
    const wRatio = window.innerWidth / CONSTANTS.bgWidth;

    if (hRatio > wRatio) {
      CONSTANTS.ratio = wRatio;
      CONSTANTS.posY = ((hRatio - wRatio) * CONSTANTS.bgHeight) / 2;
    } else {
      CONSTANTS.ratio = hRatio;
      CONSTANTS.posX = ((wRatio - hRatio) * CONSTANTS.bgWidth) / 2;
    }

    // Background
    background = game.add.image(CONSTANTS.posX, CONSTANTS.posY, "background");
    background.scale.set(CONSTANTS.ratio);

    // Canon
    canon = game.add.sprite(
      game.world.centerX,
      CONSTANTS.bgHeight * CONSTANTS.ratio,
      "canon"
    );
    //	Set the anchor of the sprite in the center, otherwise it would rotate around the top-left corner
    canon.anchor.setTo(0.5, 0.5);
    canon.scale.set(1);
    game.physics.arcade.enable(canon);
    // canon.animations.add(NAME, FRAMES, TIME, REPEAT);
    canon.animations.add("load", [1, 2, 3, 4, 5, 6], 10, false);
    canon.animations.add("fire", [7, 8, 9, 10, 11, 12], 10, false);

    // Fleches
    arrow = game.add.sprite(
      game.world.centerX + 120 * CONSTANTS.ratio,
      CONSTANTS.bgHeight * CONSTANTS.ratio,
      "arrow"
    );
    //	Set the anchor of the sprite in the center, otherwise it would rotate around the top-left corner
    arrow.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(arrow);

    that.createlutin();

    // area
    areas = game.add.group();
    areas.enableBody = true;
    areas.physicsBodyType = Phaser.Physics.ARCADE;

    that.createAreas();
  }

  createlutin() {
    // lutin
    lutin = game.add.sprite(game.world.centerX, 600, "lutin");
    //	Set the anchor of the sprite in the center, otherwise it would rotate around the top-left corner
    lutin.anchor.setTo(0.5, 0.5);
    // lutin.animations.add(NAME, FRAMES, TIME, REPEAT);
    lutin.animations.add("fire", [0], 10, false);
    lutin.animations.add("stun", [1], 10, false);
    lutin.animations.add("walk", [2], 10, false);
    lutin.animations.add("idle", [3], 10, false);

    lutin.scale.set(1);
    //  We need to enable physics on the player
    game.physics.arcade.enable(lutin);
    //  Player physics properties. Give the little guy a slight bounce.
    lutin.body.bounce.y = 0.2;
    lutin.body.collideWorldBounds = true;
  }

  createAreas() {
    let area = areas.create(200, 300, "lutin2");
    area.scale.set(2);
  }

  // Update this game from events
  update() {
    lutin.body.velocity.x = isMoving.x;
    lutin.body.velocity.y = isMoving.y;

    that.updateAiming();
    that.updateShot();
    that.updateAnimations();

    game.physics.arcade.overlap(
      lutin,
      areas,
      that.collisionHandler,
      null,
      this
    );
  }

  updateAiming() {
    canon.angle = shotAngle;
    arrow.body.velocity = { x: 0, y: 0 };
    if (
      (shotVector.x != 0 || shotVector.y != 0) &&
      isMoving.x == 0 &&
      isMoving.y == 0
    ) {
      arrow.scale.set(that.calcHypotenuse(shotVector.x, shotVector.y) / 1000);
    } else {
      arrow.position = {
        x: game.world.centerX + 120 * CONSTANTS.ratio,
        y: CONSTANTS.bgHeight * CONSTANTS.ratio
      };
      arrow.scale.set(0);
    }
  }

  updateShot() {
    if (isMoving.x != 0 || isMoving.y != 0) {
      console.log(isMoving);
      lutin.angle = shotAngle;
      if (isMoving.x != 0) {
        let step = shotVector.x / 4;
        isMoving.x -= step;
        isMoving.x = Math.trunc(isMoving.x);
        if (
          (isMoving.x <= 0 && isMoving.x >= step) ||
          (isMoving.x >= 0 && isMoving.x <= step)
        ) {
          isMoving.x = 0;
          shotVector.x = 0;
          // isMovingX = false;
        }
      }
      if (isMoving.y != 0) {
        let step = shotVector.y / 4;
        isMoving.y -= step;
        isMoving.y = Math.trunc(isMoving.y);
        if (
          (isMoving.y <= 0 && isMoving.y >= step) ||
          (isMoving.y >= 0 && isMoving.y <= step)
        ) {
          isMoving.y = 0;
          shotVector.y = 0;
          // isMovingY = false;
        }
      }
    } else {
      // lutin.frameName = "lutin";
    }
  }

  updateAnimations() {
    animationsToPlay.forEach((a, index, object) => {
      if (a.obj == "canon") canon.animations.play(a.anim);
      if (a.obj == "lutin") lutin.animations.play(a.anim);
      object.splice(index, 1);
    });
  }

  collisionHandler(obj1, obj2) {
    console.log("test");
    obj2.kill();
  }
}
