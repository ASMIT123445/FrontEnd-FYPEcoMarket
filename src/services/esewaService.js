import axiosInstance from './axiosInstance';

export const esewaService = {
  /**
   * Initiate eSewa payment
   * @param {Object} orderData - Order data including shipping address and phone
   * @returns {Promise} Payment initiation response
   */
  async initiatePayment(orderData) {
    try {
      const response = await axiosInstance.post('/orders/esewa/initiate/', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create Cash on Delivery order
   * @param {Object} orderData - Order data including shipping address and phone
   * @returns {Promise} Order creation response
   */
  async createCODOrder(orderData) {
    try {
      const response = await axiosInstance.post('/orders/cod/create/', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit eSewa payment form
   * @param {string} paymentUrl - eSewa payment URL
   * @param {Object} paymentData - Payment parameters
   */
  submitPaymentForm(paymentUrl, paymentData) {
    // Create a form dynamically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    // Add form fields
    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    // Append form to body and submit
    document.body.appendChild(form);
    form.submit();
  }
};
