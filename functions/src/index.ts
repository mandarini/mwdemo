import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

export const sendNotifications = functions.firestore
  .document("messages/{messageID}")
  .onWrite((change, context) => {
    console.log(change.after.data());
    let message = change.after.data() ? change.after.data() : {};
    const payload = {
      notification: {
        title: `New msg from ${message ? message["user"] : "someone"}`,
        body: `${message ? message["msg"] : "..."}`,
        click_action: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      }
    };

    // Get the list of device tokens.
    return db
      .collection("fcmTokens")
      .get()
      .then(tokens_snapshot => {
        tokens_snapshot.forEach(token => {
          // Send notifications to all tokens.
          return admin
            .messaging()
            .sendToDevice(token.id, payload)
            .then(response => {
              // For each message check if there was an error.

              response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                  console.error(
                    "Failure sending notification to",
                    token,
                    error
                  );
                  // Cleanup the tokens who are not registered anymore.
                  if (
                    error.code === "messaging/invalid-registration-token" ||
                    error.code === "messaging/registration-token-not-registered"
                  ) {
                    db.collection("fcmTokens")
                      .doc(token.id)
                      .delete();
                  }
                }
              });
            });
        });
      });
  });
