import { Component, OnInit } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { mergeMap } from "rxjs/operators";
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from "firebase/app";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { ChatService } from "./chat.service";
import { Observable } from "rxjs";
import { Message } from './message';
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  new_message: string = "";
  all_messages: Observable<Message[]>;
  private msgRef: AngularFirestoreCollection<Message>;

  constructor(
    private afMessaging: AngularFireMessaging,
    private db: AngularFirestore,
    public fireAuth: AngularFireAuth,
    private msgService: ChatService
  ) {
    this.msgRef = db.collection<Message>("messages", ref =>
      ref.orderBy("timestamp")
    );
  }

  ngOnInit() {
    this.all_messages = this.msgRef.valueChanges();
  }

  login() {
    this.fireAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  logout() {
    this.fireAuth.auth.signOut();
  }

  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      token => {
        // this.db.collection('fcmTokens')
        if (token) {
          console.log("Permission granted! Save to the server!", token);
          // Save the Device Token to the datastore.
          this.fireAuth.user.subscribe(user => {
            this.db
              .collection("fcmTokens")
              .doc(token)
              .set({ uid: user.uid });
          });
        } else {
          // Need to request permissions to show notifications.
          return this.requestPermission();
        }
      },
      error => {
        console.error(error);
      }
    );
  }
  deleteMyToken() {
    this.afMessaging.getToken
      .pipe(mergeMap(token => this.afMessaging.deleteToken(token)))
      .subscribe(token => {
        console.log("Deleted!");
      });
  }

  listen() {
    this.afMessaging.messages.subscribe(message => {
      console.log(message);
    });
  }

  send(user: string) {
    console.log(this.new_message);
    if (this.new_message !== null && this.new_message.length > 0) {
      let message = {
        msg: this.new_message,
        user: user,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      console.log(message);
      this.msgService
        .addMsg(message)
        .then(res => {
          console.log(res);
          this.new_message = "";
        })
        .then(error => {
          console.log(error);
        });
    }
  }
}
