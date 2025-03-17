const Subscribers =  require("../models/subscribers");

exports.createSubscriber = async (req, res) => {
    try {
        const { email } = req.body;
        const isExistEmail = await Subscribers.findOne({email});

        if(isExistEmail){
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const subscribers = new Subscribers({ email });
        await subscribers.save();

        res.status(201).json({ success: true, message: "Subscribed successfully", subscribers });
    } catch (err) {
        console.log("Error is ", err);
        res.status(500).json({ success: false, message: "Error creating category", error: err?.message });
    }
}

exports.getSubscribers = async (req, res) => {
    try {
        const subscriber = await Subscribers.find();
        res.status(201).json({ success: true, message: "fetched successfully", subscriber });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching subscribers", error: err?.message });
    }
}