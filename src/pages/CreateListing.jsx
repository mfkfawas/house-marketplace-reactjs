//one suggestion: better to make a custom hook to get the current logged in user.

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../components/Spinner';

//Declaring outside of the component guarantees it doesn't change
// and so stays the same Object reference in memory and won't trigger a useEffect.
const initialFormState = {
  type: 'rent',
  name: '',
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  address: '',
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  images: {},
  latitude: 0,
  longitude: 0,
};

function CreateListing() {
  const [geolocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const navigate = useNavigate();
  // const isMounted = useRef(true);

  //Here in CreateListing you don't need a isMounted ref, as onAuthStateChanged returns a unsubscribe function that you can return to cleanup
  //from useEffect. Just checking for isMounted will stop memory leaks of trying to update state in an unmounted component but the Firebase
  //listener will still be running so you will still have memory leaks, there just won't be a warning about it.
  // useEffect(() => {
  //   if (isMounted) {
  //     onAuthStateChanged(auth, (user) => {
  //       if (user) {
  //         setFormData({ ...formData, userRef: user.uid })
  //       } else {
  //         navigate('/sign-in')
  //       }
  //     })
  //   }

  //   return () => {
  //     isMounted.current = false
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isMounted])

  //This useEffect is not brad's, from lecture 98 Q&A
  //This useEffect is to get the loggedin user, but there is much simpler way in line 89
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, user => {
  //     if (user) {
  //       setFormData({ ...initialFormState, userRef: user.uid });
  //     } else {
  //       navigate('/sign-in');
  //     }
  //   });

  //   return unsubscribe;
  // }, [auth, navigate]);

  const auth = getAuth();
  useEffect(() => {
    if (auth?.currentUser?.uid) {
      setFormData(prevState => ({ ...prevState, userRef: auth.currentUser.uid }));
    }
  }, [auth.currentUser.uid]);

  const onSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error('Discounted price needs to be less than regular price');
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 images');
      return;
    }

    let geolocation = {};
    // let location;

    if (geolocationEnabled) {
      //Google geocoding need credit card
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      // );

      // const data = await response.json();

      // geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      // geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      // location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0]?.formatted_address;

      // if (location === undefined || location.includes('undefined')) {
      //   setLoading(false);
      //   toast.error('Please enter a correct address');
      //   return;
      // }

      //PositionalStackAPI
      const response = await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${process.env.REACT_APP_GEOCODE_API_KEY}&query=${address}`
      );
      const data = await response.json();
      console.log(data);

      if (data.data.length === 0) {
        setLoading(false);
        toast.error('Please enter a correct address');
        return;
      }

      setFormData(prevState => ({
        ...prevState,
        latitude: data?.data[0]?.latitude,
        longitude: data?.data[0]?.longitude,
      }));
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    // Store image in firebase
    const storeImage = async image => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          //if img doesnt upload to  firebase storage.
          error => {
            reject(error);
          },
          //if img uploaded to  firebase storage.
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all([...images].map(image => storeImage(image))).catch(() => {
      setLoading(false);
      toast.error('Images not uploaded');
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy);
    setLoading(false);
    toast.success('Listing saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = e => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      console.log(e.target.files);
      setFormData(prevState => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData(prevState => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <div className='margin-1'>
            <label className='formLabel'>Sell / Rent</label>
            <div className='formButtons'>
              <button
                type='button'
                className={type === 'sale' ? 'formButtonActive' : 'formButton'}
                id='type'
                value='sale'
                onClick={onMutate}
              >
                Sell
              </button>
              <button
                type='button'
                className={type === 'rent' ? 'formButtonActive' : 'formButton'}
                id='type'
                value='rent'
                onClick={onMutate}
              >
                Rent
              </button>
            </div>
          </div>

          <div className='margin-1'>
            <label className='formLabel'>Name</label>
            <input
              className='formInputName'
              type='text'
              id='name'
              value={name}
              onChange={onMutate}
              maxLength='32'
              minLength='10'
              required
            />
          </div>

          <div className='formRooms flex margin-1'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <div className='margin-1'>
            <label className='formLabel'>Parking spot</label>
            <div className='formButtons'>
              <button
                className={parking ? 'formButtonActive' : 'formButton'}
                type='button'
                id='parking'
                value={true}
                onClick={onMutate}
                min='1'
                max='50'
              >
                Yes
              </button>
              <button
                className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
                type='button'
                id='parking'
                value={false}
                onClick={onMutate}
              >
                No
              </button>
            </div>
          </div>

          <div className='margin-1'>
            <label className='formLabel'>Furnished</label>
            <div className='formButtons'>
              <button
                className={furnished ? 'formButtonActive' : 'formButton'}
                type='button'
                id='furnished'
                value={true}
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
                type='button'
                id='furnished'
                value={false}
                onClick={onMutate}
              >
                No
              </button>
            </div>
          </div>

          <div className='margin-1'>
            <label className='formLabel'>Address</label>
            <textarea
              className='formInputAddress'
              type='text'
              id='address'
              value={address}
              onChange={onMutate}
              required
            />
          </div>

          {!geolocationEnabled && (
            <div className='formLatLng flex margin-1'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <div className='margin-1'>
            <label className='formLabel'>Offer</label>
            <div className='formButtons'>
              <button
                className={offer ? 'formButtonActive' : 'formButton'}
                type='button'
                id='offer'
                value={true}
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
                type='button'
                id='offer'
                value={false}
                onClick={onMutate}
              >
                No
              </button>
            </div>

            <label className='formLabel'>Regular Price</label>
            <div className='formPriceDiv'>
              <input
                className='formInputSmall'
                type='number'
                id='regularPrice'
                value={regularPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required
              />
              {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
            </div>

            {offer && (
              <>
                <label className='formLabel'>Discounted Price</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='discountedPrice'
                  value={discountedPrice}
                  onChange={onMutate}
                  min='50'
                  max='750000000'
                  required={offer}
                />
              </>
            )}
          </div>

          <div className='margin-1'>
            <label className='formLabel'>Images</label>
            <p className='imagesInfo'>The first image will be the cover (max 6).</p>
            <input
              className='formInputFile'
              type='file'
              id='images'
              onChange={onMutate}
              max='6'
              accept='.jpg,.png,.jpeg'
              multiple
              required
            />
          </div>

          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
