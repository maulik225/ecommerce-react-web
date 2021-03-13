import React, { useState, useRef } from 'react';
import { Redirect } from 'react-router-dom';

import { CHECKOUT_STEP_2 } from 'constants/routes';
import useDocumentTitle from 'hooks/useDocumentTitle';
import useScrollTop from 'hooks/useScrollTop';
import { setPaymentDetails } from 'redux/actions/checkoutActions';
import { displayMoney, displayActionMessage } from 'helpers/utils';
import StepTracker from '../components/StepTracker';
import Pagination from '../components/Pagination';
import CreditPayment from './CreditPayment';
import PayPalPayment from './PayPalPayment';
import RazorpayPaymentGateway from './RazorpayPaymentGateway';
import withAuth from '../hoc/withAuth';
import Axios from 'axios';
// import Razorpay from 'razorpay'
const Razorpay = window.Razorpay

const Payment = ({
	shipping,
	payment,
	subtotal,
	dispatch,
	history
}) => {
	useDocumentTitle('Check Out Final Step | Melzo');
	useScrollTop();

	const [paymentMode, setPaymentMode] = useState(payment.type || 'paypal');
	const collapseCreditHeight = useRef(null);
	const cardInputRef = useRef(null);
	const [field, setField] = useState({
		name: { value: payment.data.name ? payment.data.name : '' },
		cardnumber: { value: payment.data.cardnumber ? payment.data.cardnumber : '' },
		expiry: { value: payment.data.expiry ? payment.data.expiry : '' },
		ccv: { value: payment.data.ccv ? payment.data.ccv : '' }
	});

	const onCreditModeChange = (e) => {
		setPaymentMode('credit');
		const parent = e.target.closest('.checkout-fieldset-collapse');
		const checkBoxContainer = e.target.closest('.checkout-checkbox-field');

		cardInputRef.current.focus();
		parent.style.height = `${checkBoxContainer.offsetHeight + collapseCreditHeight.current.offsetHeight}px`;
	};

	const onPayPalModeChange = () => {
		setPaymentMode('paypal');
		collapseCreditHeight.current.parentElement.style.height = '97px';
	};


	const onRazorPayModeChange = () => {
		setPaymentMode('razorpay');
		// collapseCreditHeight.current.parentElement.style.height = '97px';
	};

	const savePaymentDetails = () => {
		const isChanged = Object.keys(field).some(key => field[key].value !== payment.data[key]) || paymentMode !== payment.type;

		if (isChanged) {
			dispatch(setPaymentDetails({
				type: paymentMode,
				data: {
					type: paymentMode,
					name: field.name.value,
					cardnumber: field.cardnumber.value,
					expiry: field.expiry.value,
					ccv: field.ccv.value
				}
			}));
		}
	};

	const onConfirm = (e) => {
		e.preventDefault();
		// eslint-disable-next-line no-extra-boolean-cast
		const noError = Object.keys(field).every(key => !!field[key].value && !!!field[key].error);

		// if (!paymentMode) return;
		// if (paymentMode === 'credit') {
		// 	if (noError) {
		// 		displayActionMessage('Feature not ready yet :)', 'info');
		// 		// TODO: fire only if changed
		// 		savePaymentDetails();
		// 		// Do some action here. :)
		// 	} else {
		// 		displayActionMessage('All credentials for credit payment required!', 'error');
		// 	}
		// } else {
		// 	displayActionMessage('RazorPay not ready yet :)', 'info');
		// }

		if(paymentMode === "razorpay"){
			displayActionMessage('RazorPay working on this feature :)', 'info');
			paymentHandler(subtotal)
		}
	};


  const paymentHandler = async (totalBill) => {

    console.log('total bill inside payment handler')
    const API_URL = `https://nbt-server.ap-south-1.elasticbeanstalk.com/pay/`
    // const API_URL = `${config.serverUrl}pay/`
    const orderUrl = `${API_URL}order`;
    const response = await Axios.post(orderUrl,{
	  totalBill:totalBill,
	  key_id:"rzp_live_ZEgFnIDdWBw4sx",
	  key_secret:"pWuAcQZb5yc380mZffAB6eNo",
    });
    const { data } = response;
    const options = {
      "amount": parseInt(totalBill)*100,
      key: 'rzp_live_ZEgFnIDdWBw4sx',
      name: "Melzo Jewel",
      callback_url:'',
      description: "Exclusive gems, Exclusive you",
      order_id: data.id,
      handler: async (response) => {
        try {
         const paymentId = response.razorpay_payment_id;
         alert('Your Order Has Been Successfully Placed! Note This Payment Id For Future Reference '+paymentId);
         const url = `${API_URL}createorder/`;
         const captureResponse = await Axios.post(url,{
			totalBill:totalBill,
			key_id:"rzp_live_ZEgFnIDdWBw4sx",
			key_secret:"pWuAcQZb5yc380mZffAB6eNo",
			paymentId:paymentId
        }).then(res=>{
			console.log('most awaited res',res)
		})
		
        } catch (err) {
          console.log(err);
        }
      },
      theme: {
        color: "#686CFD",
      },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
	};
	

	const onClickBack = () => {
		savePaymentDetails();
		history.push(CHECKOUT_STEP_2);
	};

	return !shipping.isDone ? <Redirect to="/checkout/step1" />
		: (
			<div className="checkout">
				<StepTracker current={3} />
				<div className="checkout-step-3">
					{/* <CreditPayment
						field={field}
						onCreditModeChange={onCreditModeChange}
						paymentMode={paymentMode}
						ref={{
							cardInputRef,
							collapseCreditHeight
						}}
						setField={setField}
					/> */}
					{/* <PayPalPayment
						onPayPalModeChange={onPayPalModeChange}
						paymentMode={paymentMode}
					/> */}

					<RazorpayPaymentGateway onRazorPayModeChange={onRazorPayModeChange}
						paymentMode={paymentMode} />
					<br />
					<div className="basket-total text-right">
						<p className="basket-total-title">Total:</p>
						<h2 className="basket-total-amount">{displayMoney(subtotal + (shipping.isInternational ? 50 : 0))}</h2>
					</div>
					<br />
					<Pagination
						// eslint-disable-next-line no-extra-boolean-cast
						disabledNext={!!!paymentMode}
						history={history}
						nextStepLabel="Confirm"
						onClickNext={onConfirm}
						onClickPrevious={onClickBack}

					/>
				</div>
			</div>
		);
};

export default withAuth(Payment);
