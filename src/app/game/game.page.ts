import { Component } from "@angular/core";
import { MenuController } from "@ionic/angular";

declare let Phaser;

@Component({
  selector: "app-game",
  templateUrl: "game.page.html",
  styleUrls: ["game.page.scss"]
})
export class GamePage {
  that;
  game;
  // Background
  background;
  // Device
  heightDevice;
  widthDevice;

  constructor(private menuCtrl: MenuController) {
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
        // update: this.update,
        // render: this.render
      }
    );
  }

  // Preload this game
  preload() {
    this.heightDevice = window.innerHeight;
    this.widthDevice = window.innerWidth;
    this.game.load.image("background", "assets/phaser/Arena_test.png");
  }

  create() {
    console.log(this.heightDevice);
    console.log(this.widthDevice);
    // Set background
    this.background = this.game.add.image(10, 0, "background");
    console.log(this.background);
    this.background.scale.set(0.35);
    // back.smoothed = false;
  }
}
