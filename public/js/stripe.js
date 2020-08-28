import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51HK4bGHMAKwzfOnyulIGVJT5fMEYgWN0gaL3beMHOxlNXLmSfaIk0KLcbXOQJMg32TlY6HzE3te4H3x4Tc3KB6pa00qu0X7QDn'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get Checkout session from API endpoint
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
