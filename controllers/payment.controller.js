const Payment = require("../models/payments");
const Joi = require("joi");

const schema = Joi.object({
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  amount: Joi.number().required(),
  paymentMethod: Joi.string().valid("fawry", "vodafone").required(),
});

exports.createPayment = async (req, res) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { fullName, phoneNumber, amount, paymentMethod } = req.body;

    const newPayment = new Payment({
      fullName,
      phoneNumber,
      amount,
      paymentMethod,
      userId: req.user?._id,
      screenshot: req.file?.filename, 
    });

    await newPayment.save();
    res
      .status(201)
      .json({ message: "Payment created successfully", newPayment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
