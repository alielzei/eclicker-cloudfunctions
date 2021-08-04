const functions = require('firebase-functions');
const admin = require('firebase-admin');

const auth = require('./auth');

admin.initializeApp();

const db = admin.firestore();

const other = require('./other.js');
exports.helloWorld = other.helloWorld;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions



// a user might want to change his username
// we will ask him to add his new username
// to usernames/{username}
// and we will know what to do from there
// this need to be an http function
exports.changeUsername = functions.firestore
.document('usernames/{newUsername}')
.onCreate(async (docSnap, context) => {
    const { newUsername } = context.params;
    const { uid } = docSnap.data();
    
    const userSnap = await db.doc(`users/${uid}`).get();
    const oldUsername = userSnap.data().username;
    const { email, name } = userSnap.data();

    return Promise
    .all([
        db
        .doc(`usernames/${oldUsername}`)
        .delete(),

        db
        .doc(`usernames/${newUsername}`)
        .update({ email, name }),

        db
        .doc(`users/${uid}`)
        .update({ username: newUsername })
    ]);
});

// to follow or unfollow a user adds or removes 
// the follow from the entries of the target user
exports.modifyFollower = functions.firestore
.document('users/{authorId}/followers/{followerId}')
.onWrite(async (change, context) => {
    const { authorId, followerId } = context.params;
    
    const feedPostRef = postId => db.doc(`users/${followerId}/feed/${postId}`);
    const action = change.after.exists
    ? postSnap => feedPostRef(postSnap.id).set(postSnap.data())
    : postSnap => feedPostRef(postSnap.id).delete();
    
    const postsQuerySnap = await db.collection(`users/${authorId}/posts`).get();
    return postsQuerySnap.forEach(action);
});

// to add or remove a post, a user adds or removes the post
// from his posts, and the function will make sure to remove it
// from everyone's entries
exports.modifyPost = functions.firestore
.document('users/{authorId}/posts/{postId}')    
.onWrite(async (change, context) => {
    const { authorId, postId } = context.params;

    const postRef = userId => db.doc(`users/${userId}/feed/${postId}`)
    const action = change.after.exists
    ? followerSnap => postRef(followerSnap.id).set(change.after.data())
    : followerSnap => postRef(followerSnap.id).delete();

    const followersQuerySnap = await db.collection(`users/${authorId}/followers`).get();
    return followersQuerySnap.forEach(action);
});

