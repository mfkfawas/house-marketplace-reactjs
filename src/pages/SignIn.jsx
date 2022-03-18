import { useState } from 'react';
import { Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);

  const validate = Yup.object({
    email: Yup.string()
      .email('Email is Invalid')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be atleast 6 characters.')
      .required('Password is required.'),
  });

  // const navigate = useNavigate();

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={validate}
        onSubmit={(data, { setSubmitting, resetForm }) => {
          setSubmitting(true);

          setSubmitting(false);

          resetForm();
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
                    type={showPassword ? 'text' : 'password'}
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
                    name='showPassword'
                    onClick={() =>
                      setShowPassword(!showPassword)
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

                <Link
                  to='/forgot-password'
                  className='forgotPasswordLink'
                >
                  Forgot Password
                </Link>

                <div className='signInBar'>
                  <p className='signInText'>Sign In</p>
                  <button
                    className='signInButton'
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

            <Link to='/sign-up' className='registerLink'>
              Sign Up Instead
            </Link>
          </div>
        )}
      </Formik>
    </>
  );
};

export default SignIn;
