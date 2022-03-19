import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

const ForgotPassword = () => {
  const validate = Yup.object({
    email: Yup.string()
      .email('Email is Invalid')
      .required('Email is required'),
  });

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Forgot Password</p>
      </header>

      <main>
        <Formik
          initialValues={{
            email: '',
          }}
          validationSchema={validate}
          onSubmit={async (
            formData,
            { setSubmitting, resetForm }
          ) => {
            try {
              setSubmitting(true);
              const auth = getAuth();
              await sendPasswordResetEmail(auth, formData.email);
              toast.success('Email was sent');
            } catch (error) {
              toast.error('Could not send reset email');
            }

            setSubmitting(false);
            resetForm('');
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
            <form onSubmit={handleSubmit}>
              <div className='input-div'>
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Email'
                  className='emailInput'
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <p className='error-warning'>
                    <ErrorMessage
                      component='span'
                      name='email'
                    />
                  </p>
                )}
              </div>
              <Link className='forgotPasswordLink' to='/sign-in'>
                Sign In
              </Link>

              <div className='signInBar'>
                <div className='signInText'>Send Reset Link</div>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='signInButton'
                >
                  <ArrowRightIcon
                    fill='#ffffff'
                    width='34px'
                    height='34px'
                  />
                </button>
              </div>
            </form>
          )}
        </Formik>
      </main>
    </div>
  );
};

export default ForgotPassword;
