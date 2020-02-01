import { Component } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { ToastController } from "@ionic/angular";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  message = "";
  messages = [];
  currentUser = "";

  constructor(private socket: Socket, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.socket.connect();

    let name = `user-${new Date().getTime()}`;
    this.currentUser = name;

    this.socket.emit("set-name", name);

    this.socket.fromEvent("users-changed").subscribe(data => {
      let user = data["user"];
      if (data["event"] === "left") {
        this.showToast("User left: " + user);
      } else {
        this.showToast("User joined: " + user);
      }
    });

    this.socket.fromEvent("message").subscribe(message => {
      this.messages.push(message);
    });

    this.socket.fromEvent("move").subscribe(({ x, y, user }) => {
      console.log("move received", x, y, user);
      this.messages.push("" + x + y + user);
    });
  }

  sendMessage() {
    this.socket.emit("send-message", { text: this.message });
    this.message = "";
    this.sendMove();
    console.log("move sent");
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
}
