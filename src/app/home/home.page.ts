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
// Player
let goblin;
// Controler
let isMoving = 0;
// area
let areas;

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
  isInitialized = false;

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

  sendMove() {
    this.socket.emit("send-move", { x: 4, y: 4 });
  }

  ionViewWillLeave() {
    this.socket.disconnect();
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
    game.load.image("goblin", "assets/phaser/player.png");
    game.load.image("goblin2", "assets/phaser/player.png");
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

    // Goblin
    goblin = game.add.sprite(200, 600, "goblin");
    goblin.scale.set(2);
    //  We need to enable physics on the player
    game.physics.arcade.enable(goblin);
    //  Player physics properties. Give the little guy a slight bounce.
    goblin.body.bounce.y = 0.2;
    goblin.body.collideWorldBounds = true;

    // area
    areas = game.add.group();
    areas.enableBody = true;
    areas.physicsBodyType = Phaser.Physics.ARCADE;

    that.createAreas();

    //  Player physics properties. Give the little guy a slight bounce.
  }

  createAreas() {
    let area = areas.create(200, 300, "goblin2");
    area.scale.set(2);
  }

  // Update this game from events
  update() {
    goblin.body.velocity.y = 0;
    if (isMoving < 0) {
      goblin.body.velocity.y = isMoving;
      isMoving += 100;
    }
    //   if (that.isStarted != undefined) {
    //     console.log(that.isStarted);
    //   }
    //   if (that.isInitialized != undefined) {
    //     console.log(that.isInitialized);
    //   }
    //   if (that.isStarted && !that.isInitialized) {
    //     console.log(player);
    //     that.isInitialized = true;
    //   }
    game.physics.arcade.overlap(
      goblin,
      areas,
      that.collisionHandler,
      null,
      this
    );
  }
  collisionHandler(obj1, obj2) {
    console.log("test");
    obj2.kill();
  }
  upStart(event) {
    isMoving = -2100;
  }
}
