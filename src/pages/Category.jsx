import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { toast } from 'react-toastify';

import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

const Category = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();

  //This useEffect run for initial fetching, when 1st time this comp loads
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get the collection
        const listingsCollection = collection(db, 'listings');

        //create a query
        const q = query(
          listingsCollection,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        //execute query
        const querySnap = await getDocs(q);

        //To get the last doc of a fetching(for pagination)
        const lastFetchedDoc = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastFetchedDoc);

        const listings = [];

        //firebase9 is little wierd here.
        querySnap.forEach(doc => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch listings');
      }
    };

    fetchListings();
  }, [params.categoryName]);

  // This fn run when load more button is clicked(for pagination)
  const onFetchMoreListings = async () => {
    try {
      // Get reference
      const listingsRef = collection(db, 'listings');

      // Create a query
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing), //To fetch next 10.
        limit(1)
      );

      // Execute query
      const querySnap = await getDocs(q);

      //To get the last doc of each fetching(for pagination)
      const lastFetchedDoc = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastFetchedDoc);

      // Create a query to get the last doc of our collection
      // const queryOfLastDocOfCollection = query(listingsRef, orderBy('timestamp', 'desc'), limit(1));
      // const querySnapOfLastDoc = await getDocs(queryOfLastDocOfCollection);
      // const lastDocOfCollection = querySnapOfLastDoc.docs[0];

      // console.log(lastDocOfCollection.id, lastFetchedDoc.id, lastFetchedListing);

      // if (lastDocOfCollection.id === lastFetchedDoc.id) {
      //   setLastFetchedListing(null);
      // } else {
      //   setLastFetchedListing(lastFetchedDoc);
      // }

      const listings = [];

      querySnap.forEach(doc => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(prevState => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch listings');
    }
  };

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>{`Places for ${params.categoryName}`}</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map(listing => (
                <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {lastFetchedListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
};

export default Category;
