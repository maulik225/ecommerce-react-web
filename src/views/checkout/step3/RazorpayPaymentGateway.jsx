import React,{useEffect} from 'react';

const RazorpayPaymentGateway = ({ paymentMode, onRazorPayModeChange }) => {


    useEffect(() => {
        console.log('did mount called')
    }, [])



	return (
		<div className={`checkout-fieldset-collapse ${paymentMode === 'razorpay' ? 'is-selected-payment' : ''}`}>
			<div className="checkout-field margin-0">
				<div className="checkout-checkbox-field">
					<input
						checked={paymentMode === 'razorpay'}
						className=""
						id="payment-razorpay-checkbox"
						name="checkout_payment"
						onChange={onRazorPayModeChange}
						type="radio"
					/>
					<label
						className="d-flex w-100"
						htmlFor="payment-razorpay-checkbox"
					>
						<div className="d-flex-grow-1 margin-left-s">
							<h4 className="margin-0">RazorPay</h4>
							<span className="text-subtle d-block margin-top-s">
								Pay easily, fast and secure with RazorPay.
							</span>
						</div>  
						<div className="payment-img payment-img-visa" />
					</label>
				</div>
			</div>
		</div>
	);
};

export default RazorpayPaymentGateway;
