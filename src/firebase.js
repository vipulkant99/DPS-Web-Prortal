/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
// All database calls for this web app
/* eslint-disable guard-for-in */
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import arrayMove from 'array-move';
import ActionTypes from './redux/actions';
import Roles from './helpers/Roles';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAjpLLmyaS1VqIWD83C2wU9DgpC85LqvjE',
  authDomain: 'peertech-59408.firebaseapp.com',
  databaseURL: 'https://peertech-59408-default-rtdb.firebaseio.com',
  projectId: 'peertech-59408',
  storageBucket: 'peertech-59408.appspot.com',
  messagingSenderId: '216359758460',
  appId: '1:216359758460:web:1d3f72f6235ec3076bf7f9',
  measurementId: 'G-1LM32HX657',
};
firebase.initializeApp(firebaseConfig);

// Helpful constants
const firestore = firebase.firestore();
export const auth = firebase.auth();
const { arrayRemove, arrayUnion } = firebase.firestore.FieldValue;


/** ******************************************************* */
//                 ACCOUNT & AUTH FUNCTIONS                 //
/** ******************************************************* */

// Fetch account data from accounts collection
export function loadAccountData(uid, dispatch, successCallback) {
  firestore.collection('accounts').doc(uid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const accountData = doc.data();
        dispatch({ type: ActionTypes.FETCH_AUTH, payload: accountData });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        successCallback();
      } else {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'No record exists for this account' });
      }
    })
    .catch((error) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    });
}

// Set up Firebase listener for auth object
export function createAuthListener() {
  return (dispatch) => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        dispatch({ type: ActionTypes.CLEAR_AUTH, payload: null });
      }
    });
  };
}

// Sign in with firebase and load account data on success
export function signInAndFetchData(email, password, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    auth.signInWithEmailAndPassword(email, password)
      .then((authCredential) => {
        dispatch({ type: ActionTypes.FETCH_AUTH, payload: authCredential.user });
        loadAccountData(authCredential.user.uid, dispatch, successCallback);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Sign out with firebase
// Note: the redux auth state is not updated here; it is handled by the auth listener, which marks both intentional sign-outs and timeouts
export function signOut(successCallback, suspended) {
  return (dispatch) => {
    auth.signOut()
      .then((authCredential) => {
        successCallback(); // Return directly to calling scope
        if (suspended) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: 'User org is suspended. Please contact amanda@digitalpeersupport.org for further assistance.' });
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function fetchUser(userID, callback) {
  return (dispatch) => {
    firestore.collection('accounts').doc(userID)
      .get()
      .then((doc) => {
        callback(doc.data());
        // dispatch({ type: ActionTypes.FETCH_ORG_USERS, payload: foundDocsData });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function fetchAll(role) {
  return (dispatch) => {
    firestore.collection('accounts').where('role', '==', role)
      .get()
      .then((querySnapshot) => {
        const foundDocs = querySnapshot.docs;
        const foundDocsData = [];
        for (const index in foundDocs) {
          const dataWithID = { ...foundDocs[index].data(), id: foundDocs[index].id };
          foundDocsData.push(dataWithID);
        }
        if (role === Roles.SERVICE_USER) {
          dispatch({ type: ActionTypes.FETCH_ORG_USERS, payload: foundDocsData });
        } else if (role === Roles.PEER) {
          dispatch({ type: ActionTypes.FETCH_ORG_PEERS, payload: foundDocsData });
        } else if (role === Roles.ADMIN) {
          dispatch({ type: ActionTypes.FETCH_ORG_ADMINS, payload: foundDocsData });
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Fetch all an organization's accounts with the specific role
// Return as array of user objects
export function fetchRole(orgID, role) {
  return (dispatch) => {
    firestore.collection('accounts').where('orgID', '==', orgID).where('role', '==', role)
      .get()
      .then((querySnapshot) => {
        const foundDocs = querySnapshot.docs;
        const foundDocsData = [];
        for (const index in foundDocs) {
          const dataWithID = { ...foundDocs[index].data(), id: foundDocs[index].id };
          foundDocsData.push(dataWithID);
        }
        if (role === Roles.SERVICE_USER) {
          dispatch({ type: ActionTypes.FETCH_ORG_USERS, payload: foundDocsData });
        } else if (role === Roles.PEER) {
          dispatch({ type: ActionTypes.FETCH_ORG_PEERS, payload: foundDocsData });
        } else if (role === Roles.ADMIN) {
          dispatch({ type: ActionTypes.FETCH_ORG_ADMINS, payload: foundDocsData });
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Deletes a user (and its references) from the database
// Cannot delete peers that have service users
export function deleteUser(userID, role, orgID) {
  return (dispatch) => {
    firestore.collection('accounts').doc(userID).get()
      .then((user) => {
        if (role === Roles.SERVICE_USER) {
          const orgRef = firestore.collection('organizations').doc(orgID);
          orgRef.update({
            serviceUserIDs: arrayRemove(userID),
          });
          const peerRef = firestore.collection('accounts').doc(user.data().peerID);
          peerRef.update({
            serviceUserIDs: arrayRemove(userID),
          });
          firestore.collection('accounts').doc(userID).delete();
          dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'service user deleted succesfully!' });
        } else if (role === Roles.PEER) {
          if (user.data().serviceUserIDs.length !== 0) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: 'cannot delete peer with service users' });
          } else {
            firestore.collection('accounts').doc(userID).delete();
            dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'peer deleted succesfully!' });
          }
        } else {
          firestore.collection('accounts').doc(userID).delete();
          dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'user deleted succesfully!' });
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function resendInvite(email) {
  return (dispatch) => {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'password reset send!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function resetAllPasswords(users) {
  if (users) {
    users.forEach((user) => {
      if (user && user.email) {
        auth.sendPasswordResetEmail(user.email)
          .then(() => {
            console.log('Success');
          })
          .catch((error) => {
            console.log(error.message, 'user email: ', user.email);
          });
      }
    });
  }
}


/** ******************************************************* */
//                  USER-PEER FUNCTIONS                     //
/** ******************************************************* */

// Fetch all a peer's service users
// Return as array of user objects
export function fetchUsers(orgID, peerID) {
  return (dispatch) => {
    firestore.collection('accounts').where('orgID', '==', orgID).where('role', '==', 'Service-User')
      .where('peerID', '==', peerID)
      .get()
      .then((querySnapshot) => {
        const foundDocs = querySnapshot.docs;
        const foundDocsData = [];
        for (const index in foundDocs) {
          const dataWithID = { ...foundDocs[index].data(), id: foundDocs[index].id };
          foundDocsData.push(dataWithID);
        }
        dispatch({ type: ActionTypes.FETCH_ORG_USERS, payload: foundDocsData });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Fetch all goals for a specific user
// Return as array of goals
export function fetchGoals(orgID, userID, callback) {
  return (dispatch) => {
    firestore.collection('organizations').doc(orgID).collection('goals').where('userID', '==', userID)
      .get()
      .then((querySnapshot) => {
        const foundDocs = querySnapshot.docs;
        const foundDocsData = [];
        for (let i = 0; i < querySnapshot.size; i += 1) {
          const dataWithID = { ...foundDocs[i].data(), id: foundDocs[i].id };
          foundDocsData.push(dataWithID);
        }
        callback(foundDocsData);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function fetchWellness(orgID, userID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    const org = firestore.collection('organizations').doc(orgID);
    Promise.all([
      org.collection('wellnessActivities').where('userID', '==', userID).get(),
      org.collection('wellnessStrategies').where('userID', '==', userID).get(),
      org.collection('wellnessContacts').where('userID', '==', userID).get(),
    ])
      .then(([todosSnapshot, strategiesSnapshot, contactsSnapshot]) => {
        const todos = todosSnapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
        const strategies = strategiesSnapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
        const contacts = contactsSnapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
        contacts.sort((a, b) => {
          if (a.lastName < b.lastName) return -1;
          if (a.lastName > b.lastName) return 1;
          return 0;
        });

        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback(todos, strategies, contacts);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function fetchUserResources(orgID, callback) {
  // Get the resourceIDs for this organization
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const org = firestore.collection('organizations').doc(orgID);

    org.get().then((docSnapshot) => {
      // Start a set of ids of resources we want to show by adding the org's selected resources
      const idSet = new Set(docSnapshot.data().selectedResources.map(resourceRef => resourceRef.id));
      // Get the ordered array of all resources
      return firestore.collection('resources').doc('resourceArray').get()
        .then((resourceArrayDoc) => {
          // Add required resources to the set of resources to display
          resourceArrayDoc.data().required.forEach(resourceRef => idSet.add(resourceRef.id));
          // Filter the ordered array to only have required resource and resources the org is using
          const orgResourceRefs = resourceArrayDoc.data().resources.filter((refItem) => {
            return idSet.has(refItem.id);
          });
          return Promise.all(orgResourceRefs.map(ref => ref.get()));
        })
        .then((resourceDocs) => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          callback(resourceDocs.map(doc => ({ ...doc.data(), id: doc.id })));
        })
        .catch((error) => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        });
    });
  };
}

/** ******************************************************* */
//            SUPERADMIN ALL RESOURCE FUNCTIONS             //
/** ******************************************************* */

// Fetch all resources for a specific organization
// Return as array of 2 arrays: published & drafts
export function fetchResources(callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('resources').doc('resourceArray')
      .get()
      .then((arrayDoc) => {
        // grab all published stuff here
        const publishedArray = arrayDoc.data().resources;
        // populate it with whether it's required
        const requiredSet = new Set(arrayDoc.data().required.map(doc => doc.id));
        const publishedPromises = [];
        publishedArray.forEach((resourceRef) => {
          publishedPromises.push(
            resourceRef
              .get()
              .then((doc) => {
                const foundResource = doc.data();
                foundResource.resourceID = doc.id;
                foundResource.required = requiredSet.has(doc.id);
                return foundResource;
              }),
          );
        });
        // grab drafts here, requirement info not used
        const draftArray = arrayDoc.data().drafts;
        const draftPromises = [];
        draftArray.forEach((resourceRef) => {
          draftPromises.push(
            resourceRef
              .get()
              .then((doc) => {
                const foundResource = doc.data();
                foundResource.resourceID = doc.id;
                return foundResource;
              }),
          );
        });
        return Promise.all([Promise.all(publishedPromises), Promise.all(draftPromises)]);
      })
      .then((bothFoundResources) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback(bothFoundResources);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Create and add specific resource
// Parameter is a resource object with title, imageURL, and pages already set
// atomically adds to both the collection and drafts array
export function addResource(resource, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    // initialize new atomic write batch
    const batch = firestore.batch();
    // create the ref and generate the id
    const newResourceRef = firestore.collection('resources').doc();
    const newResource = {
      title: resource.title,
      pages: resource.pages,
    };
    batch.set(newResourceRef, newResource);
    // update the array by pushing the id to the end
    const resourceArrays = firestore.collection('resources').doc('resourceArray');
    // need to use this function to update a firebase array smartly
    batch.update(resourceArrays, {
      drafts: arrayUnion(newResourceRef),
    });
    // execute all writes atomically
    batch.commit()
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        successCallback(newResourceRef.id);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// changes the order of resources
// moves the item from oldIndex to newIndex
export function reorderResource(oldIndex, newIndex, successCallback) {
  return (dispatch) => {
    if (oldIndex === newIndex) return;
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('resources').doc('resourceArray')
      .get()
      .then((arrayDoc) => {
        const resourceArray = arrayDoc.data().resources;
        return firestore.collection('resources').doc('resourceArray')
          .update({
            resources: arrayMove(resourceArray, oldIndex, newIndex),
          });
      })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        successCallback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// toggle a resource to required status
// adds it to the required pool
export function requireResource(resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const resourceRef = firestore.collection('resources').doc(resourceID);
    firestore.collection('resources').doc('resourceArray')
      .update({ required: arrayUnion(resourceRef) })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// toggle a resource to optional status
// removes it from the required pool
export function unrequireResource(resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const resourceRef = firestore.collection('resources').doc(resourceID);
    firestore.collection('resources').doc('resourceArray')
      .update({ required: arrayRemove(resourceRef) })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function publishSpecificResource(resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    // new atomic batch
    const resourceRef = firestore.collection('resources').doc(resourceID);
    // add to active published resources, remove from drafts
    firestore.collection('resources').doc('resourceArray')
      .update({
        resources: arrayUnion(resourceRef),
        drafts: arrayRemove(resourceRef),
      })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// unpublishes a resource and also unrequires it
export function unpublishSpecificResource(resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    // new atomic batch
    const resourceRef = firestore.collection('resources').doc(resourceID);
    // add to drafts, remove from active published resources
    // also trigger unrequire
    firestore.collection('resources').doc('resourceArray')
      .update({
        required: arrayRemove(resourceRef),
        resources: arrayRemove(resourceRef),
        drafts: arrayUnion(resourceRef),
      })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Read specific resource for an organization
// Return resource object with pages stored as array of Markdown arrays
export function fetchSpecificResource(resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('resources').doc(resourceID)
      .get()
      .then((doc) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        const data = doc.data();
        const resource = {
          title: data.title,
        };
        const pages = [];
        Object.keys(data.pages).forEach((key) => {
          pages.push(data.pages[key]);
        });
        resource.pages = pages;
        callback(resource);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Update specific resource (modifies its pages)
// Parameters include resource's ID and resource's pages as an array of Markdown arrays
export function updateSpecificResource(resourceID, pages, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const pagesObject = {};
    pages.forEach((page, index) => {
      pagesObject[index] = page;
    });
    firestore.collection('resources').doc(resourceID)
      .update(
        { pages: pagesObject },
      )
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        successCallback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Update Specific Title or Image of a resource
export function updateSpecificPart(resourceID, thing, successCallback, tOf) {
  if (tOf) { // For Image send it a true
    return (dispatch) => {
      firestore.collection('resources').doc(resourceID)
        .update(
          { imageURL: thing },
        )
        .then(() => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          successCallback();
        })
        .catch((error) => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        });
    };
  } else {
    return (dispatch) => {
      firestore.collection('resources').doc(resourceID)
        .update(
          { title: thing },
        )
        .then(() => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          successCallback();
        })
        .catch((error) => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        });
    };
  }
}

// delete a specific resource
// resourceID is the id to be deleted
// atomically deletes both the resource from the collection and the array
export function deleteSpecificResource(resourceID, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    // check addResource for comments
    const batch = firestore.batch();
    const deleteResourceRef = firestore.collection('resources').doc(resourceID);
    batch.delete(deleteResourceRef);
    const resourceArray = firestore.collection('resources').doc('resourceArray');
    // need to use this function to update a firebase array smartly
    batch.update(resourceArray, {
      resources: arrayRemove(deleteResourceRef),
      required: arrayRemove(deleteResourceRef),
      drafts: arrayRemove(deleteResourceRef),
    });
    // execute all writes atomically
    batch.commit()
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        successCallback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}


/** ******************************************************* */
//          ADMIN ORGANIZATION RESOURCE FUNCTIONS           //
/** ******************************************************* */

// grabs ALL resources and returns them as an array
// but also adds attributes to each resource indicated required and selected status
// can be rendered in various different ways
export function fetchOrgResources(orgID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const fetchPromises = [];
    // specificorg doc
    fetchPromises.push(firestore.collection('organizations').doc(orgID).get());
    // overall ordered array & required array
    fetchPromises.push(firestore.collection('resources').doc('resourceArray').get());
    Promise.all(fetchPromises)
      .then(([selectedOrg, allResourceArray]) => {
        // create the array and sets
        const resourceArray = allResourceArray.data().resources;
        const selectedData = selectedOrg.data().selectedResources;
        const requiredData = allResourceArray.data().required;
        const requiredSet = (requiredData !== undefined) ? new Set(requiredData.map(doc => doc.id)) : new Set();
        const selectedSet = (selectedData !== undefined) ? new Set(selectedData.map(doc => doc.id)) : new Set();
        const promises = [];
        resourceArray.forEach((resourceRef) => {
          promises.push(
            resourceRef
              .get()
              .then((doc) => {
                const foundResource = doc.data();
                foundResource.resourceID = doc.id;
                // attach info for component to filter however it wants
                foundResource.required = requiredSet.has(doc.id);
                foundResource.selected = selectedSet.has(doc.id);
                return foundResource;
              }),
          );
        });
        return Promise.all(promises);
      })
      .then((foundResources) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback(foundResources);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// adds a given resource to a given org's selected pool
export function selectOrgResource(orgID, resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const resourceRef = firestore.collection('resources').doc(resourceID);
    // add to the selected array
    firestore.collection('organizations').doc(orgID)
      .update({ selectedResources: arrayUnion(resourceRef) })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function unselectOrgResource(orgID, resourceID, callback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const resourceRef = firestore.collection('resources').doc(resourceID);
    // remove from the selected array
    firestore.collection('organizations').doc(orgID)
      .update({ selectedResources: arrayRemove(resourceRef) })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}


/** ******************************************************* */
//               ACCOUNT CREATION FUNCTIONS                 //
/** ******************************************************* */

// Create an account request
// Cloud Function listener on accountRequests collection created Google Identity Platform account using passed data
export function createAccountRequest(orgID, email, role, name, peerID, successCallback) {
  const newUser = {
    email,
    role,
    name,
  };
  if (role !== Roles.SUPER_ADMIN) {
    newUser.orgID = orgID;
  }
  if (role === Roles.SERVICE_USER) {
    newUser.peerID = peerID;
  }
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    auth.signInWithEmailAndPassword(email, 'testpassword').then().catch((err) => {
      console.log(err.code);
      const errorCode = err.code;
      if (errorCode === 'auth/user-not-found') {
        firestore.collection('accountRequests')
          .add(newUser)
          .then((documentReference) => {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Account request sent!' });
            successCallback();
          })
          .catch((error) => {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
          });
      } else {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Email exists' });
      }
    });
  };
}


/** ******************************************************* */
//                ORG MANAGEMENT FUNCTIONS                 //
/** ******************************************************* */

// Add a new organization to database
export function addOrganization(name, successCallback) {
  return (dispatch) => {
    firestore.collection('organizations')
      .add({
        name,
        selectedResources: [],
        suspended: false,
      })
      .then((documentReference) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Organization created!' });
        successCallback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function orgInfo(orgID) {
  firestore.collection('accounts')
    .where('orgID', '==', orgID)
    .get()
    .then((querySnapshot) => {
      let total = 0;
      let pairs = 0;
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.role === Roles.SERVICE_USER) {
          pairs += 1;
        }
        total += 1;
      });
      console.log(total);
      return (total, pairs);
    })
    .catch((error) => {
      console.log(`Error getting org info: ${error}`);
    });
}

// export function fetchOrganizations(successCallback) {
//   return (dispatch) => {
//     dispatch({ type: ActionTypes.SET_LOADING, payload: true });
//     firestore.collection('organizations')
//       .get()
//       .then((querySnapshot) => {
//         const foundDocsData = querySnapshot.docs.forEach((doc) => {
//           const documentData = doc.data();
//           orgInfo(doc.id)
//             .then(() => {
//               console.log('in then');
//               const cleanedDoc = {
//                 name: documentData.name,
//                 orgID: doc.id,
//               };
//               return cleanedDoc;
//             })
//             .catch((error) => {
//               console.log(`Error on info: ${error}`);
//             });
//         });
//         dispatch({ type: ActionTypes.SET_ORGANIZATIONS, payload: foundDocsData });
//         dispatch({ type: ActionTypes.SET_LOADING, payload: false });
//         successCallback(foundDocsData);
//       })
//       .catch((error) => {
//         console.log('error from here');
//         dispatch({ type: ActionTypes.SET_LOADING, payload: false });
//         dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
//       });
//   };
// }

// Read all organizations from database
export function fetchOrganizations(successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('organizations')
      .get()
      .then((querySnapshot) => {
        const foundDocsData = querySnapshot.docs.map((doc) => {
          const documentData = doc.data();
          const cleanedDoc = {
            name: documentData.name,
            suspended: documentData.suspended,
            orgID: doc.id,
          };
          return cleanedDoc;
        });
        dispatch({ type: ActionTypes.SET_ORGANIZATIONS, payload: foundDocsData });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        successCallback(foundDocsData);
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function fetchSpecificOrganization(orgID, callback) {
  return (dispatch) => {
    firestore.collection('organizations').doc(orgID)
      .get()
      .then((docSnapshot) => {
        const documentData = docSnapshot.data();
        documentData.orgID = docSnapshot.id;
        dispatch({
          type: ActionTypes.SELECT_ORGANIZATION,
          payload: {
            orgID: documentData.orgID,
            orgName: documentData.name,
            suspended: documentData.suspended,
          },
        });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        callback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function changeOrganizationStatus(orgID, status) {
  return (dispatch) => {
    firestore.collection('organizations').doc(orgID)
      .update({ suspended: status })
      .then(() => {
        dispatch({
          type: ActionTypes.CHANGE_ORG_STATUS,
          payload: {
            suspended: status,
          },
        });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Org status updated!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

/** ******************************************************* */
//                    SURVEY FUNCTIONS                     //
/** ******************************************************* */

// Read all Surveys from database
export function fetchSurveys() {
  return (dispatch) => {
    firestore.collection('surveys')
      .orderBy('createdAt', 'desc').get()
      .then((querySnapshot) => {
        const surveys = querySnapshot.docs;
        const allSurveyData = surveys.map((survey) => {
          const surveyData = survey.data();
          surveyData.id = survey.id;
          return surveyData;
        });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.FETCH_SURVEYS, payload: allSurveyData });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function updatePublish(surveyId, newVal) {
  return (dispatch) => {
    firestore.collection('surveys').doc(surveyId).update({
      published: newVal,
    }).then(() => {
      firestore.collection('surveys')
        .orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
          const surveys = querySnapshot.docs;
          const allSurveyData = surveys.map((survey) => {
            const surveyData = survey.data();
            surveyData.id = survey.id;
            return surveyData;
          });
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          dispatch({ type: ActionTypes.FETCH_SURVEYS, payload: allSurveyData });
        })
        .catch((error) => {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        });
    });
  };
}

export function fetchSpecificSurvey(surveyID, callback) {
  return (dispatch) => {
    firestore.collection('surveys').doc(surveyID)
      .get()
      .then((doc) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        const survey = doc.data();
        if (survey) {
          survey.id = doc.id;
          firestore.collection('surveys').doc(surveyID).collection('questions')
            .get()
            .then((questionsSnapshot) => {
              const surveyQuestions = questionsSnapshot.docs;
              const allQuestions = surveyQuestions.map((quest) => {
                const questData = quest.data();
                questData.id = quest.id;
                return questData;
              });
              callback(survey, allQuestions);
            });
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function fetchSurvey(surveyID, callback) {
  firestore.collection('surveys').doc(surveyID)
    .get()
    .then((doc) => {
      const survey = doc.data();
      if (survey) {
        survey.id = doc.id;
        firestore.collection('surveys').doc(surveyID).collection('questions')
          .get()
          .then((questionsSnapshot) => {
            const surveyQuestions = questionsSnapshot.docs;
            const allQuestions = surveyQuestions.map((quest) => {
              const questData = quest.data();
              questData.id = quest.id;

              return questData;
            });
            callback(survey, allQuestions);
          });
      }
    })
    .catch((error) => {


    });
}

// getting all answerSets
export function fetchAnswers() {
  return (dispatch) => {
    firestore.collection('answerSets')
      .get()
      .then((querySnapshot) => {
        const answerSets = querySnapshot.docs;
        const allAnswerData = answerSets.map((answerSet) => {
          const answerData = answerSet.data();
          answerData.id = answerSet.id;
          return answerData;
        });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.FETCH_ANSWER_SETS, payload: allAnswerData });
      }).catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// getting all answerSets
export function fetchAllAnswers(callback) {
  return (dispatch) => {
    firestore.collection('answerSets')
      .get()
      .then((querySnapshot) => {
        const answerSets = querySnapshot.docs;
        const allAnswerData = answerSets.map((answerSet) => {
          const answerData = answerSet.data();
          answerData.id = answerSet.id;
          return answerData;
        });
        callback();
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.FETCH_ANSWER_SETS, payload: allAnswerData });
      }).catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Assign Survey to service users in an organization (admin capability)
export function assignSurvey(orgId, startDate, times, surveyRef, answerSetRefs, callback) {
  const answerSetRefsFB = []; // FB means firebase
  for (let i = 0; i < answerSetRefs.length; i += 1) {
    answerSetRefsFB.push(firestore.doc('answerSets/' + answerSetRefs[i]));
  }
  return (dispatch) => {
    firestore.collection('organizations').doc(orgId).collection('surveys')
      .add({
        startDate,
        times,
        surveyRef: firestore.doc('surveys/' + surveyRef),
        answerSetRefs: answerSetRefsFB,
      })
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'You have Succesfully Assigned the survey!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
    firestore.collection('surveys').doc(surveyRef)
      .update({
        organizations: firebase.firestore.FieldValue.arrayUnion(orgId),
      })
      .then(() => {
        if (callback) {
          fetchSurvey(surveyRef, callback);
        }
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Survey Succesfully Assigned to Organization!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function addSurvey(questions, title, desc) {
  return (dispatch) => {
    // new survey reference
    const batch = firestore.batch();
    const createdAt = new Date();
    const surveyDoc = firestore.collection('surveys').doc();
    batch.set(surveyDoc, {
      title,
      desc,
      published: false,
      createdAt,
    });
    const questionsOrder = [];
    Object.keys(questions).forEach((key) => {
      const question = questions[key];
      const newQuestion = surveyDoc.collection('questions').doc();
      questionsOrder.push(newQuestion.id);
      batch.set(newQuestion, question);
    });
    batch.update(surveyDoc, {
      questionsOrder,
      organizations: [],
    });
    batch.commit();
  };
}

export function removeQuestionsFromSurvey(surveyId, removedQuestions) {
  const batch = firestore.batch();
  const surveyDoc = firestore.collection('surveys').doc(surveyId);
  removedQuestions.forEach((question) => {
    const questionDoc = surveyDoc.collection('questions').doc(question);
    batch.delete(questionDoc);
    batch.update(surveyDoc, {
      questionsOrder: arrayRemove(question),
    });
  });
  batch.commit();
}

export function changeQuestions(surveyId, changedQuestions, questionsMap) {
  const batch = firestore.batch();
  if (changedQuestions !== undefined && changedQuestions !== null && changedQuestions.size > 0) {
    const surveyDoc = firestore.collection('surveys').doc(surveyId);
    changedQuestions.forEach((key, value, set) => {
      const question = surveyDoc.collection('questions').doc(value);
      batch.update(question, { question: questionsMap[value].question, answerId: questionsMap[value].answerId, answerName: questionsMap[value].answerName });
    });
    batch.commit();
  }
}

export function changeQuestionsInQuestions(surveyId, changedQuestions, questionsMap) {
  return (dispatch) => {
    const batch = firestore.batch();
    if (changedQuestions !== undefined && changedQuestions !== null && changedQuestions.size > 0) {
      const surveyDoc = firestore.collection('surveys').doc(surveyId);
      changedQuestions.forEach((key, value, set) => {
        const question = surveyDoc.collection('questions').doc(value);
        batch.update(question, { question: questionsMap[value].question, answerId: questionsMap[value].answerId, answerName: questionsMap[value].answerName });
      });
      batch.commit();
    }
  };
}

export function updateTheSurvey(surveyId, surveyTitle, surveyDescription, addedQuestions, removedQuestions, questionsMap, changedQuestions, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    removeQuestionsFromSurvey(surveyId, removedQuestions);
    changeQuestions(surveyId, changedQuestions, questionsMap);
    firestore.collection('surveys').doc(surveyId)
      .update({
        title: surveyTitle || '',
        desc: surveyDescription || '',
      })
      .then((docRef) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Survey succesfully updated!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}


export function addQuestionToSurvey(surveyId, questionObj, updateSurveyState) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('surveys').doc(surveyId).collection('questions').add(questionObj)
      .then((added) => {
        firestore.collection('surveys').doc(surveyId).update({
          questionsOrder: arrayUnion(added.id),
        }).then(() => {
          fetchSurvey(surveyId, updateSurveyState);
        });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Added question!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

function generateRandomMapKey() {
  const num = Math.floor(Math.random() * 1000000);
  const otherRand = Math.random().toString(36).substr(2, 5);
  return num + '' + otherRand;
}

// deleting a single survey
export function deleteSurvey(surveyId) {
  console.log(surveyId);
  return (dispatch) => {
    const surveyDoc = firestore.collection('surveys').doc(surveyId);
    surveyDoc.get().then((doc) => {
      const survey = doc.data();
      const batch = firestore.batch();
      if (survey !== undefined) {
        firestore.collection('surveys').doc(surveyId).collection('questions').get()
          .then((querySnapshot) => {
            const questions = querySnapshot.docs;
            // delete each question in collection
            questions.forEach((q) => {
              batch.delete(q.ref);
            });
            batch.delete(surveyDoc);
            if (survey.organizations !== undefined && survey.organizations.length > 0) {
              survey.organizations.forEach((org) => {
                firestore.collection('organizations').doc(org).collection('surveys').get()
                  .then((orgSurveySnapshot) => {
                    orgSurveySnapshot.docs.forEach((orgSurvey) => {
                      const surId = orgSurvey.data().surveyRef.id + '';
                      if (surId === surveyId) {
                        batch.delete(orgSurvey.ref);
                      }
                    });
                  })
                  .then(() => {
                    batch.commit();
                  });
              });
            } else {
              batch.commit();
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };
}


export function unassignSurvey(surveyId, orgId, callback) {
  return (dispatch) => {
    const surveyDoc = firestore.collection('surveys').doc(surveyId);
    surveyDoc.get().then((doc) => {
      const survey = doc.data();
      const tempOrganizations = survey.organizations.filter(org => org !== orgId);
      surveyDoc
        .update({
          organizations: tempOrganizations,
        })
        .then(() => {
          firestore.collection('organizations').doc(orgId).collection('surveys').get()
            .then((orgSurveySnapshot) => {
              orgSurveySnapshot.docs.forEach((orgSurvey) => {
                const surId = orgSurvey.data().surveyRef.id + '';
                if (surId === surveyId) {
                  orgSurvey.ref.delete();
                }
              });
            })
            .then(() => {
              if (callback) {
                fetchSurvey(surveyId, callback);
              }
            })
            .catch((error) => {
              dispatch({ type: ActionTypes.SET_LOADING, payload: false });
              dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            });
        });
    });
  };
}

// getting a specific answer set from doc id
export function fetchAnswer(id, successCallback) {
  return (dispatch) => {
    firestore.collection('answerSets')
      .doc(id)
      .get()
      .then((docRef) => {
        successCallback(docRef.data());
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// add new answer set to firebase
export function createAnswerSet(title, answers, answersOrder, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('answerSets')
      .add({
        title,
        answers,
        answersOrder,
      })
      .then((docRef) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Answer Set succesfully created!' });
        if (successCallback) {
          successCallback(docRef.id, title);
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Update an Answer Set
// ** parameters: answerSetId is firebase assigned ID for document containing the answer set, answerSetTitle is a string title for the answer set
// ** parameters cont'd: map answers is object with pair of all the answers-value pairs
export function updateAnswerSet(answerSetId, answerSetTitle, answersObject, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('answerSets').doc(answerSetId)
      .update({
        title: answerSetTitle,
        answers: answersObject,
      })
      .then((docRef) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Answer Set succesfully updated!' });
        if (successCallback) {
          successCallback(docRef.id);
        }
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function removeAnswersFromAnswerSet(answerSetId, removedAnswers) {
  const batch = firestore.batch();
  const answerSetDoc = firestore.collection('answerSets').doc(answerSetId);
  answerSetDoc.get().then((doc) => {
    let dict = {};
    if (doc.exists) {
      dict = doc.data().answers;
      removedAnswers.forEach((ans) => {
        delete dict[`${ans}`];
        batch.update(answerSetDoc, { answersOrder: arrayRemove(ans) });
      });
    }
    batch.commit();
    return dict;
  })
    .then((newAnswers) => {
      firestore.collection('answerSets').doc(answerSetId).update({
        answers: newAnswers,
      });
    });
}

export function changeAnswers(answerSetId, changedAnswers, answersMap) {
  const batch = firestore.batch();
  if (changedAnswers !== undefined && changedAnswers !== null && changedAnswers.size > 0) {
    const answerSetDoc = firestore.collection('answerSets').doc(answerSetId);
    changedAnswers.forEach((key, value, set) => {
      const newAnswer = answersMap[key];
      batch.update(answerSetDoc, { [`answers.${key}`]: newAnswer });
    });
    batch.commit();
  }
}

export function updateTheAnswerSet(answerId, answerTitle, removedAnswers, answersMap, changedAnswers) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    removeAnswersFromAnswerSet(answerId, removedAnswers);
    changeAnswers(answerId, changedAnswers, answersMap);
    firestore.collection('answerSets').doc(answerId)
      .update({
        title: answerTitle || '',
      })
      .then((docRef) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Survey succesfully updated!' });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// Delete an Answer Set , removes an answerSet Document from the answerSet collection
// parameters: parameters: answerSetId is firebase assigned ID for document containing the answer set
export function deleteAnswerSet(answerSetId, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('answerSets').doc(answerSetId)
      .delete()
      .then(() => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Answer Set succesfully deleted!' });
        successCallback();
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

export function addAnswerToAnswerSet(answerSetId) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    const randKey = generateRandomMapKey();
    firestore.collection('answerSets').doc(answerSetId).update({
      [`answers.${randKey}`]: ['', 1],
      answersOrder: arrayUnion(randKey),
    }).then(() => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Added question!' });
    })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// export function fetchGoals(orgID, userID, callback) {
//   return (dispatch) => {
//     firestore.collection('organizations').doc(orgID).collection('goals').where('userID', '==', userID)
//       .get()
//       .then((querySnapshot) => {
//         const foundDocs = querySnapshot.docs;
//         const foundDocsData = [];
//         for (let i = 0; i < querySnapshot.size; i += 1) {
//           const dataWithID = { ...foundDocs[i].data(), id: foundDocs[i].id };
//           foundDocsData.push(dataWithID);
//         }
//         callback(foundDocsData);
//       })
//       .catch((error) => {
//         dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
//       });
//   };
// }


export function getOrgSurveys(orgID, successCallback) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    firestore.collection('organizations')
      .doc(orgID)
      .collection('surveys')
      .get()
      .then((snapshot) => {
        const surveys = snapshot.docs;
        const foundDocsData = [];
        for (let i = 0; i < snapshot.size; i += 1) {
          const dataWithID = { ...surveys[i].data(), surveyID: surveys[i].data().surveyRef.id, id: surveys[i].id };
          foundDocsData.push(dataWithID);
        }

        successCallback(foundDocsData);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      })
      .catch((error) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      });
  };
}

// getting an individual service user's survey responses
export const getSurveyResponses = async (orgID, userID, successCallback) => {
  const surveyIDs = [];
  // Get the surveyIDs for this organization
  firestore.collection('organizations').doc(orgID).collection('surveys').get()
    .then((querySnapshot) => {
    // Get the survey responses for each user
      querySnapshot.docs.forEach((doc) => {
        surveyIDs.push(doc.data().surveyRef.id);
      });
    });
  const promises2 = [];
  // Get the most recent response to each survey
  firestore.collection('organizations').doc(orgID).collection('survey-responses')
    .get()
    .then((surveyResponseSnapshots) => {
      surveyResponseSnapshots.docs.forEach((snapshot, index) => {
        snapshot.ref.collection(surveyIDs[index]).orderBy('completionDate', 'desc').get()
          .then(
            response => response.docs.forEach(
              respDoc => successCallback(respDoc.data()),
            ),
          );
        promises2.push(snapshot.ref.collection(surveyIDs[index]).get());
      });
    });
  return Promise.all(promises2);
};


// CHAT METHODS
/** ******************************************************* */
//                     CHAT FUNCTIONS                      //
/** ******************************************************* */

// method for parsing through data from return of firebase get
export const parse = (data) => {
  const id = data.message[0].user._id;
  const { text } = data.message[0];
  const createdAt = data.message[0].createdAt.toDate();
  const message = {
    senderID: id,
    createdAt,
    text,
  };
  return message;
};

// Read in chats between a peer & a user
export function fetchChats(orgID, userID, peerID, successCallback) {
  const unsubscribe = firestore.collection('organizations').doc(orgID).collection('chats')
    .where('peerID', '==', peerID)
    .where('userID', '==', userID)
    .orderBy('timestamp', 'desc')
    .get()
    .then((querySnapshot) => {
      if (querySnapshot) {
        const output = [];
        querySnapshot.docs.forEach((doc) => {
          output.push({ ...parse(doc.data()), firebaseID: doc.id });
        });
        successCallback(output);
      }
    })
    .catch((error) => {
      console.log(`Error fetching chats: ${error}`);
    });
  return unsubscribe;
}
