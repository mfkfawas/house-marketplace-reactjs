import { useEffect, useState } from 'react';

import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { db } from '../firebase.config';

const Profile = () => {
  //firebase store auth details of user in indexDB(not regular localStorage), we dont want to worry about refreshing or
  //passing anything to getAuth(), firebase will fetch from browser as needed.
  const auth = getAuth();

  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const navigate = useNavigate();

  const { name, email } = formData;

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        //Update displayName in firebase authentication
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        //Update in firestore
        //id for user in firestore is = id in the authentication
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
        //we r no updating email coz firebase auth doesnt allow us to change email
      }
    } catch (error) {
      toast.error('Could not update profile details!');
    }
  };

  const onChange = e => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button
          type='button'
          className='logOut'
          onClick={onLogout}
        >
          Logout
        </button>
      </header>

      <main>
        <div className='profileDetailsHeader'>
          <p className='personalDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails(prevState => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
      </main>

      <div className='profileCard'>
        <form>
          <input
            type='text'
            id='name'
            className={
              changeDetails ? 'profileName' : 'profileNameActive'
            }
            disabled={!changeDetails}
            value={name}
            onChange={onChange}
          />

          <input
            type='text'
            id='email'
            className={
              changeDetails
                ? 'profileEmail'
                : 'profileEmailActive'
            }
            disabled={!changeDetails}
            value={email}
            onChange={onChange}
          />
        </form>
      </div>
    </div>
  );
};

export default Profile;
