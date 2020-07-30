const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.newPoll = functions.firestore
.document('rooms/{roomId}/polls/{pollId}')
.onCreate(async (snap, context) => {
    const roomSnapshot = await db.doc(`rooms/${context.params.roomId}`).get();
    const userIds = roomSnapshot.data().users;
    const newPoll = snap.data();

    userIds.forEach((userId) => {
        db.collection(`users/${userId}/feed`).add(newPoll);
    });
});