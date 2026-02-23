import React,{ useState, useContext } from 'react'
import './booking.css'
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from 'reactstrap'

import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { BASE_URL } from '../../utils/config'
import axios from 'axios'

const Booking = ({ tour, avgRating }) => {

    const { price, reviews, title } = tour;
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);

    const [ booking, setBooking ] = useState({
        userId: user && user._id,
        userEmail: user && user.email,
        tourName: title,
        fullName: '',
        phone: '',
        room: 1,
        adult: 1,
        child: 0,
        bookAt: '',
        totalAmount: 0,
    })

    const handleChange = (e) => {
        setBooking(prev => ({ ...prev, [e.target.id]:e.target.value }))
    };

    const serviceFee = 100;
    const roomCharge  = 50;

    // send data to the server
    const handleClick = async (e) =>{
        e.preventDefault();

        if (!user) {
            return alert('Please Sign In');
        }

        const totalAmount = (Number(price) * Number(booking.adult)) +
                            (Number(roomCharge) * Number(booking.room)) +
                            (Number(serviceFee) * Number(booking.adult));
        
        const bookingWithTotal = {
            ...booking,
            totalAmount: totalAmount,
        };

        try {

            const res = await axios.post(`${BASE_URL}/Booking/Add`, bookingWithTotal, {
                withCredentials: true,
            });
            
            if (res.status === 201) {
                navigate("/thank-you");
            } else {
                alert(res.data.message || 'Booking failed. Please try again.');
            }
            
        } catch (error) {
            alert(error.response?.data?.message || error.message);;
        }

    }

  return (
    <div className="booking">
        <div className="booking__top d-flex align-items-center justify-content-between">
            <h3>${price} 
                <span>/per person</span>
            </h3>
            <span className="tour__rating d-flex align-items-center">
                <i className="ri-star-fill"></i> 
                {avgRating === 0 ? null : avgRating} ({reviews?.length})
            </span>
        </div>

        {/* -----------------  booking form start  ---------------------- */}
        <div className="booking__form">
            <h5>Information</h5>
            <Form className="booking__info-form" onSubmit={handleClick}>
                <FormGroup>
                    <input type="text" placeholder="Full Name" id="fullName" required onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <input type="number" placeholder="Phone" id="phone" required onChange={handleChange} />
                </FormGroup>
                <FormGroup className="d-flex align-items-center gap-3">
                    <input type="date" id="bookAt" required onChange={handleChange} />
                    <input type="number" placeholder="Room" id="room" min="1" required onChange={handleChange} />
                </FormGroup>
                <FormGroup className="d-flex align-items-center gap-3">
                    <input type="number" placeholder="Adults" id="adult" min="1" required onChange={handleChange} />
                    <input type="number" placeholder="Child (age < 10y)" id="child" min="0" max="5" onChange={handleChange} />
                </FormGroup>
            </Form>
        </div>
        {/* -----------------  booking form end  ---------------------- */}

        {/* ---------------  booking bottom start ------------------ */}
        <div className="booking__bottom">
            <ListGroup>
                <ListGroupItem className="border-0 px-0">
                    <h5 className='d-flex align-items-center gap-1'>
                        ${price} <i className="ri-close-line"></i> {booking.adult} person(s)
                    </h5>
                    <span> ${price * booking.adult}</span>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0">
                    <h5 className="d-flex align-items-center gap-1">
                        ${roomCharge} <i className="ri-close-line"></i>{' '}
                        {booking.room} room(s)
                    </h5>
                    <span>${roomCharge * booking.room}</span>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0">
                    <h5>Service Charge for Adults</h5>
                    <span>${serviceFee * booking.adult}</span>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0">
                    <h5>Service Charge for Childs</h5>
                    <span>$0</span>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 total">
                    <h5>Total</h5>
                    <span>${(Number(price) * Number(booking.adult)) +
                                 (Number(roomCharge) * Number(booking.room)) +
                                 (Number(serviceFee) * Number(booking.adult))}</span>
                </ListGroupItem>
            </ListGroup>

            <Button className="btn primary__btn w-100 mt-4" onClick={handleClick}>
                Book Now
            </Button>
        </div>
        {/* ---------------  booking bottom end ------------------ */}
    </div>
  )
}

export default Booking