import { useState } from 'react';

import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { db } from '../firebase.config';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState({
    password: false,
    passwordConfirm: false,
  });

  const validate = Yup.object({
    name: Yup.string()
      .min(3, 'Name should be atleast 3 characters')
      .max(15, 'Name should contain below 15 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Email is Invalid')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be atleast 6 characters.')
      .required('Password is required.'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Password must match!')
      .required('Confirm password is required'),
  });

  const navigate = useNavigate();

  return (
    <>
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          passwordConfirm: '',
        }}
        validationSchema={validate}
        onSubmit={async (data, { setSubmitting, resetForm }) => {
          setSubmitting(true);

          try {
            const auth = getAuth();

            const userCredential =
              await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
              );

            //we can get the user from the userCredential
            const user = userCredential.user;

            updateProfile(auth.currentUser, {
              displayName: data.name,
            });

            navigate('/');
          } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log(errorCode, errorMessage);
          } finally {
            setSubmitting(false);
            resetForm();
          }
        }}
      >
        {({
          errors,
          values,
          isSubmitting,
          touched,
          handleSubmit,
          handleBlur,
          handleChange,
        }) => (
          <div className='pageContainer'>
            <header>
              <p className='pageHeader'>Welcome Back!</p>
            </header>

            <AnimatePresence>
              <form onSubmit={handleSubmit}>
                <div className='input-div'>
                  <input
                    type='text'
                    className='nameInput'
                    placeholder='Name'
                    id='name'
                    name='name'
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.name && errors.name && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className='error-warning'>
                        <ErrorMessage
                          component='span'
                          name='name'
                          className=''
                        />
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className='input-div'>
                  <input
                    type='email'
                    className='emailInput'
                    placeholder='Email'
                    id='email'
                    name='email'
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && errors.email && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className='error-warning'>
                        <ErrorMessage
                          component='span'
                          name='email'
                          className=''
                        />
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className='input-div'>
                  <input
                    type={
                      showPassword.password ? 'text' : 'password'
                    }
                    className='passwordInput'
                    placeholder='Password'
                    id='password'
                    name='password'
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <img
                    src={visibilityIcon}
                    alt='show password'
                    className='showPassword'
                    onClick={() =>
                      setShowPassword(prevState => {
                        // Object.assign would also work
                        return {
                          ...prevState,
                          password: !prevState.password,
                        };
                      })
                    }
                  />
                  {touched.password && errors.password && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className='error-warning'>
                        <ErrorMessage
                          component='span'
                          name='password'
                          className=''
                        />
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className='input-div'>
                  <input
                    type={
                      showPassword.passwordConfirm
                        ? 'text'
                        : 'password'
                    }
                    className='passwordInput'
                    placeholder='Confirm Password'
                    name='passwordConfirm'
                    id='passwordConfirm'
                    value={values.passwordConfirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <img
                    src={visibilityIcon}
                    alt='show password'
                    className='showPassword'
                    onClick={() =>
                      setShowPassword(prevState => {
                        // Object.assign would also work
                        return {
                          ...prevState,
                          passwordConfirm:
                            !prevState.passwordConfirm,
                        };
                      })
                    }
                  />

                  {touched.passwordConfirm &&
                    errors.passwordConfirm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className='error-warning'>
                          <ErrorMessage
                            component='span'
                            name='passwordConfirm'
                            className=''
                          />
                        </p>
                      </motion.div>
                    )}
                </div>

                <Link
                  to='/forgot-password'
                  className='forgotPasswordLink'
                >
                  Forgot Password
                </Link>

                <div className='signUpBar'>
                  <p className='signUpText'>Sign Up</p>
                  <button
                    className='signUpButton'
                    type='submit'
                    disabled={isSubmitting}
                  >
                    <ArrowRightIcon
                      fill='#ffffff'
                      width='34px'
                      height='34px'
                    />
                  </button>
                </div>
              </form>
            </AnimatePresence>

            {/* <OAuth /> */}

            <Link to='/sign-in' className='registerLink'>
              Sign In Instead
            </Link>
          </div>
        )}
      </Formik>
    </>
  );
};

export default SignUp;
