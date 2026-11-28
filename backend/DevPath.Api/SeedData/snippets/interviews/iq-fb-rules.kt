// Challenge: what is wrong with these rules, and how do you fix them?
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{db}/documents {
//     match /users/{uid} {
//       allow read, write: if request.auth != null;     // any user can edit any profile, including "role"
//     }
//     match /orders/{orderId} {
//       allow read: if true;                            // everyone, even signed out, reads all orders
//       allow create: if request.auth != null;          // can create orders for someone else, any price
//     }
//   }
// }

// A Kotlin client that "trusts" the UI does not help: anyone can run this.
suspend fun readEveryOrder(db: FirebaseFirestore) = db.collection("orders").get().await().documents
