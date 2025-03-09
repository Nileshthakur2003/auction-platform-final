import React, { useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';
import moment from 'moment-timezone';

const NewAuction = () => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [errors, setErrors] = useState({});

  const auctionSchema = z.object({
    itemName: z.string().nonempty("Title is required"),
    description: z.string().nonempty("Description is required"),
    startingBid: z.number().positive("Starting bid must be a positive number"),
    openingTime: z.string().nonempty("Start date and time is required"),
    closingTime: z.string().nonempty("End date and time is required").refine(value => new Date(value) > new Date(), "End date must be in the future")
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newItem = {
      itemName: itemName,
      description: description,
      startingBid: parseFloat(startingBid),
      openingTime: moment.tz(openingTime, 'Asia/Kolkata').toString(),
      closingTime: moment.tz(closingTime,'Asia/Kolkata').toString()
    };

    const validationResult = auctionSchema.safeParse(newItem);
    if (!validationResult.success) {
      const formErrors = validationResult.error.formErrors.fieldErrors;
      setErrors(formErrors);
      return;
    }

    try {
      const response = await ApiConnector.post('/auction', newItem);
      if (response.status === 201) {
        alert('Auction Posted Successfully!');
        setItemName('');
        setDescription('');
        setStartingBid('');
        setOpeningTime('');
        setClosingTime('');
        setErrors({});
      } else {
        alert('Failed to post auction. Please try again.');
      }
    } catch (error) {
      if(error.response.data.error == "TokenExpiredError"){
        navigate('/signin');
      }
      console.error('Error posting auction:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <SellerSidebar />
        <div className="col-md-10 offset-md-2" style={{ padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className='mt-5'>New Auction</h2>
          <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '800px' }}>
            <div className="form-row mb-3">
              <div className="form-group col-md-6">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
                {errors.itemName && <small className="text-danger">{errors.itemName}</small>}
              </div>
              <div className="form-group col-md-6">
                <label>Starting Bid</label>
                <input
                  type="number"
                  className="form-control"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  required
                />
                {errors.startingBid && <small className="text-danger">{errors.startingBid}</small>}
              </div>
            </div>
            <div className="form-row mb-3">
              <div className="form-group col-md-6">
                <label>Start Date/Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  required
                />
                {errors.openingTime && <small className="text-danger">{errors.openingTime}</small>}
              </div>
              <div className="form-group col-md-6">
                <label>End Date/Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  required
                />
                {errors.closingTime && <small className="text-danger">{errors.closingTime}</small>}
              </div>
            </div>
            <div className="form-group mb-3">
              <label>Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="5"
              ></textarea>
              {errors.description && <small className="text-danger">{errors.description}</small>}
            </div>
            <button type="submit" className="btn btn-primary mt-3">Post Auction</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAuction;
