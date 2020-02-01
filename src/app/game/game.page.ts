import { Component } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { CONSTANTS } from "../../constants";

declare let Phaser;

@Component({
  selector: "app-game",
  templateUrl: "game.page.html",
  styleUrls: ["game.page.scss"]
})
export class GamePage {
  // that;
  // game;
  // // Background
  // background;
  // // Device
  // heightDevice;
  // widthDevice;
  // // Player
  // player;
  // // Controler
  // mobileCursors = {
  //   left: false,
  //   right: false
  // };

  constructor(private menuCtrl: MenuController) {
    // this.that = Object.create(this.constructor.prototype);
  }

  // ionViewDidEnter() {
  //   this.game = new Phaser.Game(
  //     window.innerWidth,
  //     window.innerHeight,
  //     Phaser.AUTO,
  //     "game",
  //     {
  //       preload: this.preload,
  //       create: this.create
  //       // update: this.update
  //       // render: this.render
  //     }
  //   );
  // }

  // // Preload this game
  // preload() {
  //   this.heightDevice = window.innerHeight;
  //   this.widthDevice = window.innerWidth;
  //   this.game.load.image("background", "assets/phaser/Arena_test.png");
  //   this.game.load.image("ship", "assets/phaser/player.png");
  // }

  // create() {
  //   // Background
  //   this.background = this.game.add.image(0, 0, "background");
  //   this.background.scale.set(0.35);
  // }
}
