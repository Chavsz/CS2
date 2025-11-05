import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "./firebase";

export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  // Create or merge a user profile document in Firestore
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        provider: user.providerData?.[0]?.providerId ?? "password",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // Intentionally swallow Firestore profile creation errors to not block auth
  }
  return credential;
};

export const doSignInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        provider: user.providerData?.[0]?.providerId ?? "password",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // no-op
  }
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        provider: user.providerData?.[0]?.providerId ?? "google.com",
        // Do not overwrite createdAt if the doc exists; merge keeps existing
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // no-op
  }
  return result;
};

export const doSignOut = async () => {
  return signOut(auth);
};

// export const doPasswordReset = async (email: string) => {
//   return sendPasswordResetEmail(auth, email);
// };

// export const doPasswordChange = async (password: string) => {
//   return updatePassword(auth.currentUser, password);
// };

// export const doSendEmailVerification = async () => {
//   return sendEmailVerification(auth.currentUser, {
//     url: `${window.location.origin}/home`,
//   });
// };
