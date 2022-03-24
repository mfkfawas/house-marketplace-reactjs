import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ListingItem from '../components/ListingItem';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';

function Profile() {
  //firebase store auth details of user in indexDB(not regular localStorage), we dont want to worry about refreshing or
  //passing anything to getAuth(), firebase will fetch from browser as needed.
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings');

      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach(doc => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onEdit = listingId => navigate(`/edit-listing/${listingId}`);

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

  const onDelete = async listingId => {
    if (window.confirm('Are you sure you want to delete?')) {
      await deleteDoc(doc(db, 'listings', listingId));
      const updatedListings = listings.filter(listing => listing.id !== listingId);
      setListings(updatedListings);
      toast.success('Successfully deleted listing');
    }
  };

  return (
    <main className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
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
            className={changeDetails ? 'profileName' : 'profileNameActive'}
            disabled={!changeDetails}
            value={name}
            onChange={onChange}
          />

          <input
            type='text'
            id='email'
            className={changeDetails ? 'profileEmail' : 'profileEmailActive'}
            disabled={!changeDetails}
            value={email}
            onChange={onChange}
          />
        </form>
      </div>

      <Link to='/create-listing' className='createListing'>
        <img src={homeIcon} alt='home' />
        <p>Sell or rent your home</p>
        <img src={arrowRight} alt='arrow right' />
      </Link>

      {/* logged in user's listings */}
      {!loading && listings?.length > 0 && (
        <>
          <p className='listingText'>Your Listings</p>
          <ul className='listingsList'>
            {listings.map(listing => (
              <ListingItem
                key={listing.id}
                listing={listing.data}
                id={listing.id}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default Profile;
