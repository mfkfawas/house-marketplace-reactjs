import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'react-toastify';

import { db } from '../firebase.config';
import googleIcon from '../assets/svg/googleIcon.svg';

const OAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //If the signing in user doesn't exist in DB(i.e new user),
      //then we should add the user to the firestore.
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        //2nd arg is the data tobe stored to DB
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }

      navigate('/');
    } catch (error) {
      toast.error('Could not authorize with google');
    }
  };

  return (
    <div className='socialLogin'>
      <p>
        Sign {location.pathname === '/sign-up' ? 'up' : 'in'}{' '}
        with
      </p>
      <button className='socialIconDiv' onClick={onGoogleClick}>
        <img
          className='socialIconImg'
          src={googleIcon}
          alt='google'
        />
      </button>
    </div>
  );
};

export default OAuth;
