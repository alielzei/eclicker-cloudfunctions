const functions = require('firebase-functions');
const { user } = require('firebase-functions/lib/providers/auth');
// const admin = require('firebase-admin');
// admin.initializeApp();
// const db = admin.firestore();

// when a new user is created
// they provide an email and a password
// that's it, i will create a new entry 
// in cloud firestore with a default username
exports.createProfile = functions.auth
.user()
.onCreate((user) => {
    const { email, uid } = user;

    return db
    .collection("users")
    .doc(uid)
    .set({ name: null, email, username: uid})
    .catch(console.error);
});