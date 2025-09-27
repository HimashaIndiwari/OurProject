import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId, isLoggedIn } from '../utils/getCurrentUser';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, totalData, address, enrollment, program, amount, type, cartToken } = location.state || { 
    cart: [], 
    totalData: { subtotal: 0, deliveryFee: 450, total: 0 }, 
    address: '',
    enrollment: null,
    program: null,
    amount: 0,
    type: 'order',
    cartToken: localStorage.getItem('cartToken') || ''
  };
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
    country: 'India',
    email: ''
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartOrder, setCartOrder] = useState(null);
  const [products, setProducts] = useState([]);

  // Get current logged-in user ID
  const userId = getCurrentUserId();

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Check if user is logged in
      if (!isLoggedIn() || !userId) {
        console.log('User not logged in or no user ID:', { isLoggedIn: isLoggedIn(), userId });
        setError('Please log in to continue with payment.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user details for userId:', userId);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };
        const response = await axios.get(`http://localhost:5000/api/users/profile`, config);
        setUser(response.data);
        setPaymentInfo(prev => ({ ...prev, email: response.data.email || '' }));
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCartOrder = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };
        const response = await axios.get(`http://localhost:5000/api/orders/cart/${userId}`, config);
        setCartOrder(response.data);
      } catch (err) {
        console.error('Error fetching cart order:', err);
        // If no cart order exists, we'll create one during payment
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/');
        setProducts(res.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchUserDetails();
    fetchCartOrder();
    fetchProducts();
    console.log('Received state in Payment:', location.state);
    if (!location.state) {
      console.warn('No state passed to Payment page.');
    }
  }, [location.state, userId]);

  const getProductDetails = (productId) => {
    return products.find(product => product._id === productId) || {};
  };

  const handleChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validatePaymentInfo = () => {
    const cardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length !== 16 || isNaN(cardNumber)) {
      setError('Please enter a valid 16-digit card number.');
      return false;
    }
    if (!paymentInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      setError('Please enter a valid expiry date (MM/YY).');
      return false;
    }
    if (!paymentInfo.cvc || paymentInfo.cvc.length !== 3 || isNaN(paymentInfo.cvc)) {
      setError('Please enter a valid 3-digit CVC.');
      return false;
    }
    if (!paymentInfo.cardholderName.trim()) {
      setError('Please enter the cardholder name.');
      return false;
    }
    setError(null);
    return true;
  };

  const handlePay = async () => {
    if (!validatePaymentInfo()) return;

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      if (type === 'enrollment') {
        // Handle enrollment payment
        console.log('Processing enrollment payment:', { 
          userId, 
          enrollmentId: enrollment._id, 
          paymentType: 'enrollment_payment', 
          amount: amount, 
          status: 'success', 
          paymentDate: new Date() 
        });
        
        // Process enrollment payment using the new endpoint
        const paymentRes = await axios.post(`http://localhost:5000/api/enrollments/${enrollment._id}/payment`, {
          userId,
          enrollmentId: enrollment._id,
          amount: amount,
          status: 'success',
          paymentDate: new Date()
        }, config);
        console.log('Enrollment payment processed:', paymentRes.data);

        // Store enrollment data in localStorage for Profile page to pick up
        const paymentEnrollmentData = {
          enrollment: paymentRes.data.data,
          program: program
        };
        localStorage.setItem('paymentEnrollmentData', JSON.stringify(paymentEnrollmentData));
        
        // Store notification message for successful enrollment
        const enrollmentNotificationMessage = "Thank you! Your enrollment payment has been processed successfully. You can manage your program from your profile page.";
        localStorage.setItem('latestNotification', JSON.stringify({
          message: enrollmentNotificationMessage,
          timestamp: new Date().toISOString(),
          type: 'enrollment_success'
        }));
        
        // Show success notification and redirect to profile
        alert('Payment successful! You have been enrolled in the program.');
        // Use window.location.href for reliable navigation to customer profile
        window.location.href = '/customer/profile';
      } else {
        // Handle order payment for selected items from Cart_Pending
        // Determine productIds being purchased (cart array contains only items being paid for on this flow)
        const productIds = cart.map(i => i.productId);
        const deliveryAddress = address || user?.address || 'No address provided';

        const payRes = await axios.post('http://localhost:5000/api/payment/pay-selected', {
          cartToken,
          productIds,
          customerId: userId,
          address: deliveryAddress,
          paymentMethod: 'card'
        }, config);

        // Update local storage cart to remove purchased items only
        const currentLocal = JSON.parse(localStorage.getItem('cricketCart') || '[]');
        const purchasedSet = new Set(productIds.map(String));
        const remainingLocal = currentLocal.filter(line => !purchasedSet.has(String(line.productId)));
        localStorage.setItem('cricketCart', JSON.stringify(remainingLocal));

        // Store notification message for successful order
        const notificationMessage = "Thank you! Your order has been placed successfully. You can track your order in the 'My Orders' section.";
        localStorage.setItem('latestNotification', JSON.stringify({
          message: notificationMessage,
          timestamp: new Date().toISOString(),
          type: 'order_success'
        }));

        // If we came from selecting subset, Payment received only selected items in cart state.
        // After success, return to cart to reflect remaining items, or go to orders page.
        navigate('/orders', { state: { order: payRes.data.order, payment: payRes.data.payment } });
      }
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError(`Error processing payment: ${err.response?.data?.message || err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return (
    <div className="text-center p-8">
      <div className="text-red-500 mb-4">{error}</div>
      {error.includes('log in') && (
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#42ADF5] text-white px-6 py-2 rounded-lg hover:bg-[#2C8ED1] transition-colors"
        >
          Go to Login
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#F1F2F7] min-h-screen text-[#36516C]">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Order/Enrollment Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {type === 'enrollment' ? (
            <>
              <div className="text-2xl font-bold mb-4">Program Enrollment Payment</div>
              <div className="text-3xl font-bold text-green-600 mb-6">LKR {amount}.00</div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Program: {program?.title}</span>
                  <span>LKR {program?.fee}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{program?.duration} weeks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Coach</span>
                  <span>{program?.coach?.userId?.firstName} {program?.coach?.userId?.lastName}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Total</span>
                  <span className="font-bold">LKR {amount}.00</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold mb-4">Pay Order</div>
              <div className="text-3xl font-bold text-green-600 mb-6">LKR {totalData.total}.00</div>
              
              <div className="space-y-3">
                {cart.map((item) => {
                  const product = getProductDetails(item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{product.name || item.productId} (Qty {item.quantity})</span>
                      <span>LKR {((product.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Delivery Charge</span>
                  <span>LKR {totalData.deliveryFee}.00</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Pay with Card</h3>
          
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email"
              value={paymentInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="1234 1234 1234 1234"
                value={paymentInfo.cardNumber}
                onChange={(e) => handleChange('cardNumber', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-20"
              />
              <div className="absolute right-3 top-2 flex space-x-1">
                <div className="w-6 h-4 bg-red-500 rounded"></div>
                <div className="w-6 h-4 bg-blue-500 rounded"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="MM/YY"
                value={paymentInfo.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <input 
                type="text" 
                placeholder="CVC"
                value={paymentInfo.cvc}
                onChange={(e) => handleChange('cvc', e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            
            <input 
              type="text" 
              placeholder="Cardholder name"
              value={paymentInfo.cardholderName}
              onChange={(e) => handleChange('cardholderName', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            
          
             
            
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              onClick={handlePay}
              className="w-full bg-[#42ADF5] text-white py-3 rounded-lg hover:bg-[#2C8ED1] transition-colors"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;