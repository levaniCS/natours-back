import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/signup',
      data,
    });

    if (res.data.status === 'success') {
      // redirect to home page
      showAlert('success', 'Sign Up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
