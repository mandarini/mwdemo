import { Injectable } from "@angular/core";
import { Message } from "./message";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  messages: AngularFirestoreCollection<Message>;

  constructor(private db: AngularFirestore) {
    this.messages = db.collection<Message>("messages");
  }

  addMsg(msg) {
    return this.messages.add(msg);
  }
}
