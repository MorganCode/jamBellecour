import { Component } from "@angular/core";
import { MenuController } from "@ionic/angular";

declare let Phaser;

let that;
let game;
// Background
let background;
// Device
let heightDevice;
let widthDevice;
@Component({
  selector: "app-home",
  templateUrl: "game.page.html",
  styleUrls: ["game.page.scss"]
})
export class HomePage {
  constructor(private menuCtrl: MenuController) {
    game = new Phaser.Game(
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

    that = Object.create(this.constructor.prototype);
  }

  // Preload this game
  preload() {
    heightDevice = window.innerHeight;
    widthDevice = window.innerWidth;
    game.load.image("background", "assets/phaser/Arena_test.png");
  }

  create() {
    console.log(heightDevice);
    console.log(widthDevice);
    // Set background
    background = game.add.image(10, 0, "background");
    background.scale.set(0.35);
    // back.smoothed = false;
  }
}
