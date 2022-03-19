//To solve the issue of when a hard reload/refresh is done on (Profile.jsx - where auth data is essential), it renders the comp
//before it fetch the data(auth) from firebase ehich lead to err.
import { useEffect, useState } from 'react';
//onAuthStateChanged is fired off whenever the state changes from logged in to not logged in.
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Brad's method, its not the best
  // const isMounted = useRef(true);
  // useEffect(() => {
  //   if (isMounted) {
  //     const auth = getAuth();
  //     onAuthStateChanged(auth, user => {
  //       if (user) {
  //         setLoggedIn(true);
  //       }
  //       setCheckingStatus(false);
  //     });
  //   }
  //   return () => {
  //     isMounted.current = false;
  //   };
  // }, [isMounted]);

  //Look Q&A of lecture 91(PrivateRoute componenent & useAuthStatus hook)
  useEffect(() => {
    const auth = getAuth();

    //onAuthStateChanged creates a websocket listener that watches/listens for a event in the Firestore of auth
    //changed i.e. user log in / sign up / log out.
    // The function returns another function which cancels/unsubscribes from that event listenter.
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        setLoggedIn(true);
      }
      setCheckingStatus(false);
    });

    // Cleanup fn.
    return unsub;
  }, []);

  return { loggedIn, checkingStatus };
};

export default useAuthStatus;

// Protected routes in v6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
