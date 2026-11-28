// firestore.rules shipped in version 1.0
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /boards/{boardId} {
//       allow read, write: if request.auth != null;
//       match /tasks/{taskId} {
//         allow read, write: if request.auth != null;
//       }
//     }
//     match /users/{uid} {
//       allow read, write: if request.auth != null;       // includes the "role" field
//     }
//   }
// }

// The app hides other boards in the UI, so the team thought it was safe:
fun visibleBoards(all: List<Board>, uid: String) = all.filter { uid in it.members }
