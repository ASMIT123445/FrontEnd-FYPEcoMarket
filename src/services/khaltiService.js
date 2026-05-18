import axiosInstance from './axiosInstance';

export const khaltiService = {
  /**
   * Initiate Khalti payment — calls Django which calls Khalti API.
   * Returns { payment_url, pidx, order_id }
   */
  async initiatePayment(orderData) {
    try {
      const response = await axiosInstance.post('/orders/khalti/initiate/', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Redirect the browser to Khalti's hosted payment page.
   * Khalti will redirect back to our return_url after payment.
   */
  redirectToPayment(paymentUrl) {
    window.location.href = paymentUrl;
  },
};
