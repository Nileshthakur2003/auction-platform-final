import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import moment from 'moment-timezone';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';

const PostAuction = () => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // FIX: Properly initialize useNavigate
  const navigate = useNavigate();

  const auctionSchema = z
    .object({
      itemName: z.string().trim().min(3, 'Title must be at least 3 characters'),
      description: z.string().trim().min(10, 'Description must be at least 10 characters'),
      startingBid: z.number().positive('Starting bid must be a positive number'),
      openingTime: z.string().nonempty('Start date and time is required'),
      closingTime: z.string().nonempty('End date and time is required'),
    })
    .refine((data) => new Date(data.closingTime) > new Date(data.openingTime), {
      message: 'End date and time must be after the start date and time',
      path: ['closingTime'],
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newItem = {
      itemName,
      description,
      startingBid: parseFloat(startingBid),
      openingTime: moment.tz(openingTime, 'Asia/Kolkata').toDate().toISOString(),
      closingTime: moment.tz(closingTime, 'Asia/Kolkata').toDate().toISOString(),
    };

    const validationResult = auctionSchema.safeParse(newItem);
    if (!validationResult.success) {
      const formErrors = validationResult.error.formErrors.fieldErrors;
      setErrors(formErrors);
      toast.error('Please resolve the form validation errors');
      return;
    }

    setSubmitting(true);
    try {
      const response = await ApiConnector.post('/auction', newItem);
      if (response.status === 201) {
        toast.success('Auction posted successfully!');
        setItemName('');
        setDescription('');
        setStartingBid('');
        setOpeningTime('');
        setClosingTime('');
        setErrors({});
        navigate('/seller/current-auctions');
      }
    } catch (error) {
      console.error('Error posting auction:', error);
      const msg = error.response?.data?.message || 'Failed to create auction. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <SellerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="mx-auto" style={{ maxWidth: '750px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-dark mb-1">Post New Auction</h2>
                <p className="text-muted mb-0">Fill in the details below to list a new item</p>
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/seller')}
              >
                &larr; Back to Dashboard
              </button>
            </div>

            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">Auction Title</label>
                  <input
                    type="text"
                    className={`form-control ${errors.itemName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Vintage 1970s Chronograph Watch"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                  {errors.itemName && <div className="invalid-feedback">{errors.itemName}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">Starting Bid ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className={`form-control ${errors.startingBid ? 'is-invalid' : ''}`}
                    placeholder="e.g. 150.00"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    required
                  />
                  {errors.startingBid && <div className="invalid-feedback">{errors.startingBid}</div>}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${errors.openingTime ? 'is-invalid' : ''}`}
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      required
                    />
                    {errors.openingTime && (
                      <div className="invalid-feedback">{errors.openingTime}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${errors.closingTime ? 'is-invalid' : ''}`}
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      required
                    />
                    {errors.closingTime && (
                      <div className="invalid-feedback">{errors.closingTime}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">Item Description</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    rows="4"
                    placeholder="Provide details about condition, authenticity, shipping, and history..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 fw-semibold fs-5 shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Creating Auction...
                    </span>
                  ) : (
                    'Publish Auction Listing'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAuction;
