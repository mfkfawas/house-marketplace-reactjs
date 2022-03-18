import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);

  //firebase store auth details of user in indexDB(not regular localStorage), we dont want to worry about refreshing or
  //passing anything to getAuth(), firebase will fetch from browser as needed.
  const auth = getAuth();

  useEffect(() => {
    setUser(auth.currentUser);
  }, [auth.currentUser]);

  return user ? (
    <h1>{user.displayName}</h1>
  ) : (
    <h1>Not Logged In</h1>
  );
};

export default Profile;
