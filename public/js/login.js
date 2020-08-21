import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:8000/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      // redirect to home page
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: 'http://localhost:8000/api/v1/users/logout',
    });

    if (res.data.status === 'success') location.assign('/login');
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
