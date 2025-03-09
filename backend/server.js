const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const moment = require('moment-timezone');




const AuctionItem = require('./models/auctions');
const User = require('./models/users');
const Bidding = require('./models/biddings')


const {db} = require('./db/dbconnect');

const app = express();
//server is being configured to handle json
app.use(express.json());
//cors will help server to accept requests from multiple domains
app.use(cors());

const SECRET_KEY = 'my_super_secret_123!';

//

cron.schedule('* * * * * *', async () => {
  //console.log('Checking auction items...');


  const now = moment().toDate();

    // Parse and convert the date to the desired format
    const formattedDate = moment(now);
  // .tz('Asia/Kolkata')
  // .format('YYYY-MM-DDTHH:mm:ss.SSS');

  //console.log(formattedDate);

  try {
    const result = await AuctionItem.updateMany(
      { closingTime: { $lte: formattedDate }, isClosed: false },
      { $set: { isClosed: true } }
    );

    //console.log(result);

    if (result.modifiedCount > 0) {
      console.log(`Closed ${result.nModified} auction items.`);
    } else {
      //console.log('No auction items to close at this time.');
    }
  } catch (err) {
    console.error('Error updating auction items:', err);
  }
});


// Middleware to verify token
const authenticate = async(req, res, next) => {
  //console.log(req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try{
  const decodedToken = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decodedToken.userId); // Adjust the field name based on your token payload
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  }catch(error){
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error:"TokenExpiredError" ,message: 'JWT Expired! Relogin' });
    } else {
      console.log('Token verification failed:', error.message);
    }
  }
};


app.get('/validate-token', authenticate , (req,res)=>{

  let userRecord = {
    username:req.user.username,
    email:req.user.email
  }
  res.status(200).json(userRecord)
})
// Signup Route called when signup form is submitted on the frontend
app.post('/signup', async (req, res) => {
  try {
    const { username, email,  password , userType } = req.body;

    if (!(username && password && userType && password)) {
      return res.status(400).json({ message: 'All Input fields are required' });
    }



    //console.log(username+" "+password+" "+userType);

    const existingUser = await User.findOne({ username });
    if (existingUser) 
    {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email:email, password:hashedPassword , userType:userType});
    await newUser.save(); //a new user is being created in db

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Signin Route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(401).json({ message: 'Username and password required' });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ email });

    const user_type = (user.userType=="0")?0:1;

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a token for the user
    const token = jwt.sign({ userId: user._id, email }, SECRET_KEY, { expiresIn: '1h' }); // This token helps the user to remain signed in for 1 hour
    
    res.status(200).json({ message: 'Signin successful', token , user : user_type});
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Auction Item (Protected)
app.post('/auction', authenticate, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime , openingTime } = req.body;

    
    if (!(itemName && description && startingBid && closingTime && openingTime)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newItem = new AuctionItem({
      itemName,
      description,
      currentBid: startingBid,
      //highestBidder:'',
      closingTime,
      openingTime,
      sellerId:req.user._id
    });

    //console.log(req.user._id);

    await newItem.save();
    res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
    console.error('Auction Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
app.get('/auctions', async (req, res) => {
  try {
    const auctions = await AuctionItem.find();
    res.json(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/getAuctionsForSeller', authenticate , async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ sellerId : req.user._id});

    res.json(auctions);

   // console.log(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/getUsernameById', async(req,res)=>{

  try{

    const { userId } = req.body;

    const user = await User.findById(userId)

    res.status(200).json({username:user.username});

  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

})

app.get('/getauction/:id', authenticate , async (req, res) => {
  try {
    const {id} = req.params;

    const auction = await AuctionItem.findById(id);

    let bids = [],refinedBids=[];

    if(!auction){
      res.status(400).json({ message: 'Auction item not found'});
    }

    let RecordEditable  = false;

    if(auction.sellerId == req.user._id){
      RecordEditable = true;
       bids = await Bidding.find({ auctionId:id });

      
    }

    for(let p=0;p<bids.length;p++){
      let username_bidder = await User.findById(bids[p].userId);
      refinedBids.push({
        auctionId:bids[p].auctionId,
        bidAmount:bids[p].bidAmount,
        createdAt:bids[p].createdAt,
        successfullBid:bids[p].successfullBid,
        bidderUsername:username_bidder.username
      })
    }

    const sellerName = await User.findById(auction.sellerId);

    const auctiondata = {
      seller:sellerName.username,
      itemName:auction.itemName,
      description:auction.description,
      currentBid:auction.currentBid,
      bidders:auction.bidders,
      closingTime:auction.closingTime,
      openingTime:auction.openingTime,
      isClosed:auction.isClosed,
      editable:RecordEditable,
      bids:refinedBids

    }

    res.status(200).json(auctiondata);

  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//getting result for auction

app.get('/getauctionresult/:id', authenticate , async (req, res) => {
  try {
    const {id} = req.params;

    const auction = await AuctionItem.findById(id);

    const bids  = await Bidding.find({ auctionId : id });


    

    const highestBidderRecord = await User.findById(auction.highestBidderId);

    console.log(highestBidderRecord)
   

    if(!auction){
      res.status(400).json({ message: 'Auction item not found'});
    }

   
    

    const auctiondata = {
      auctionId : auction._id,
      itemName:auction.itemName,
      description:auction.description,
      currentBid:auction.currentBid,
      bidders:auction.bidders,
      closingTime:auction.closingTime,
      openingTime:auction.openingTime,
      isClosed:auction.isClosed,
      highestBidder:highestBidderRecord.username,
      bids:bids

    }

    res.status(200).json(auctiondata);

  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/getearnings', authenticate , async (req, res) => {
  try {
    const userId = req.user._id;

    const auction = await AuctionItem.find({ sellerId : userId , isClosed:true });

    if(!auction){
      res.status(400).json({ message: 'Auction item not found'});
    }

    let EarningRecords =  [],i;

  

    for(i=0;i<auction.length;i++){
      let tempEarningRecord = {
          itemName:auction[i].itemName,
          finalBid:auction[i].currentBid,
          closingTime:auction[i].closingTime,
          openingTime:auction[i].openingTime
      }
      EarningRecords.push(tempEarningRecord);
    }



    res.status(200).json(EarningRecords);

  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/getstats', authenticate , async (req, res) => {
  try {
    const userId = req.user._id;


    const auction = await AuctionItem.find({ sellerId : userId , isClosed:true });


    let BidsArray =  [],i;

    
    for(i=0;i<auction.length;i++)
    {
      const bids = await Bidding.find({ auctionId:auction[i]._id })

      BidsArray.push(bids);
    }

    let totalEarnings = 0;

    for(i=0;i<auction.length;i++){
      totalEarnings+=auction[i].currentBid;
    }


    if(!auction){
      res.status(400).json({ message: 'Auction item not found'});
    }

    let EarningStats = {
      bidsReceived : BidsArray.length,
      auctionedItems : auction.length,
      totalEarnings : totalEarnings
    }

    

    res.status(200).json(EarningStats);

  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// edit an auction
// Edit Auction Item (Protected)
app.put('/auction/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, description, currentBid, highestBidder, closingTime } = req.body;

    const auctionItem = await AuctionItem.findById(id);
    if (!auctionItem) return res.status(404).json({ message: 'Auction item not found' });

  
    auctionItem.itemName = itemName || auctionItem.itemName;
    auctionItem.description = description || auctionItem.description;
    auctionItem.currentBid = currentBid || auctionItem.currentBid;
    auctionItem.highestBidder = highestBidder || auctionItem.highestBidder;
    auctionItem.closingTime = closingTime || auctionItem.closingTime;

    await auctionItem.save();
    res.json({ message: 'Auction item updated', item: auctionItem });
  } catch (error) {
    console.error('Auction Edit Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single auction item by ID
app.get('/auctions/:id', async (req, res) => {
  try {
    const auctionItem = await AuctionItem.findById(req.params.id);
    if (!auctionItem) 
      return res.status(404).json({ message: 'Auction not found' });

    res.json(auctionItem);
  } catch (error) {
    console.error('Fetching Auction Item Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//get the data for user logged in 
app.get('/profile', authenticate , async(req,res)=>{
  try {

    const id  = req.user._id;

    const user = await User.findById(id);
    

    

    const userdata = {
      username : user.username,
      email : user.email,
      userType: user.userType
    };


    res.status(200).json({ data: userdata });

  } catch (error) {
    console.error('Profile fetch error : '+error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})


app.post('/updateprofile', authenticate, async (req, res) => {
  try {
    const id = req.user._id;
    const { username, email } = req.body;

    // Find the user by ID and update the profile information
    const user = await User.findByIdAndUpdate(id, { username, email }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUserData = {
      username: user.username,
      email: user.email,
      userType: user.userType
    };

    res.status(200).json({ data: updatedUserData });

  } catch (error) {
    console.error('Profile update error: ' + error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Bidding on an item (Protected)
app.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bid } = req.body;
    const item = await AuctionItem.findById(id);

    

    if (!item) return res.status(404).json({ message: 'Auction item not found' });
    if (item.isClosed) return res.status(400).json({ message: 'Auction is closed' });

    if (new Date() > new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.json({ message: 'Auction closed', winner: item.highestBidderId });
    }

    //console.log(`${bid} / ${item.currentBid}`);

    if (bid > item.currentBid) {
      item.currentBid = bid;
      item.highestBidderId = req.user._id;
      item.bidders.push(req.user._id);
      await item.save();
      res.json({ message: 'Bid successful', item });
    } else {
      res.status(400).json({ message: 'Bid too low' });
    }

    const bidRecord = {
      auctionId : item._id,
      userId : req.user._id,
      successfullBid : false,
      bidAmount:bid,
      createAt : Date.now().toString()
    }

    const newBidItem  = new Bidding(bidRecord);

    await newBidItem.save();

  } catch (error) {
    console.error('Bidding Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/getauctionbidded', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve unique auction IDs that the user has bidded on
    const distinctAuctionIds = await Bidding.distinct('auctionId', { userId: userId });

    

    // Get today's date and time
    const today = new Date();

    let auctionData = [];

    for (let i = 0; i < distinctAuctionIds.length; i++) {
      const tempAuctionData = await AuctionItem.findOne({
        _id: distinctAuctionIds[i],
        closingTime: { $gt: today }
      });

      //console.log(tempAuctionData);
      
      if (tempAuctionData) {
        auctionData.push(tempAuctionData);
      }
    }

    res.status(200).json(auctionData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/getBidsForUser', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const bids = await Bidding.find({userId:userId});


    let bidsData = [];
    let i =0;

    for(i=0;i<bids.length;i++){
    const auctionName = await AuctionItem.findById( bids[i].auctionId );

    
    bidsData.push({
      bidId: bids[i]._id,
      auctionName : auctionName.itemName,
      bidAmount : bids[i].bidAmount,
      createdAt : bids[i].createdAt,
      successfullBid : bids[i].successfullBid
    })

    }

    res.status(200).json(bidsData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



// Start the server
app.listen(5001, () => {
  console.log('Server is running on port 5001');
});