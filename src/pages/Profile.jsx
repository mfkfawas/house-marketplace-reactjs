import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  //firebase store auth details of user in indexDB(not regular localStorage), we dont want to worry about refreshing or
  //passing anything to getAuth(), firebase will fetch from browser as needed.
  const auth = getAuth();

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
    </div>
  );
};

export default Profile;
