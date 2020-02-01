import { Component } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { ToastController } from "@ionic/angular";
import { CONSTANTS } from "../../constants";

declare let Phaser;

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

  // Phaser needs
  that;
  game;
  // Background
  background;
  // Device
  heightDevice;
  widthDevice;
  // Player
  player;
  // Controler
  mobileCursors = {
    left: false,
    right: false
  };

  constructor(private socket: Socket, private toastCtrl: ToastController) {
    this.that = Object.create(this.constructor.prototype);
  }

  ionViewDidEnter() {
    this.game = new Phaser.Game(
      window.innerWidth,
      window.innerHeight,
      Phaser.AUTO,
      "game",
      {
        preload: this.preload,
        create: this.create
        // update: this.update
        // render: this.render
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
    this.heightDevice = window.innerHeight;
    this.widthDevice = window.innerWidth;
    this.game.load.image("background", "assets/phaser/Arena_test.png");
    this.game.load.image("ship", "assets/phaser/player.png");
  }

  create() {
    // Background
    this.background = this.game.add.image(0, 0, "background");
    this.background.scale.set(0.35);
  }
}
