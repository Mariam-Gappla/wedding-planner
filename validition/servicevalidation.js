const Joi = require('joi');

const serviceSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.base': "title must be a string",
    'string.empty': "title is required",
    'any.required': "title is required",
  }),

  category: Joi.string().required().messages({
    'string.base': "category must be a string",
    'string.empty': "category is required",
    'any.required': "category is required",
  }),

  exprience: Joi.string().required().messages({
    'string.base': "exprience must be a string",
    'string.empty': "exprience is required",
    'any.required': "exprience is required",
  }),

  address: Joi.string().allow('', null).optional().messages({
    'string.base': "address must be a string",
  }),

  profileImage: Joi.string().required().messages({
    'string.base': "profileImage must be a string",
    'string.empty': "profileImage is required",
    'any.required': "profileImage is required",
  }),

  serviceImage: Joi.array()
    .items(
      Joi.string().messages({
        'string.base': 'Each item in serviceImage must be a string',
        'string.empty': "serviceImage cannot contain empty strings",
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'serviceImage must be an array',
      'array.min': 'At least one serviceImage is required',
      'any.required': 'serviceImage is required'
    }),

  serviceDetails: Joi.string().required().messages({
    'string.base': "serviceDetails must be a string",
    'string.empty': "serviceDetails is required",
    'any.required': "serviceDetails is required",
  }),

  phone: Joi.string().required().messages({
    'string.base': "phone must be a string",
    'string.empty': "phone is required",
    'any.required': "phone is required",
  }),

  facebookLink: Joi.string().allow('', null).optional().messages({
    'string.base': "facebookLink must be a string",
  }),

  instgrameLink: Joi.string().allow('', null).optional().messages({
    'string.base': "instgrameLink must be a string",
  }),

  likes: Joi.array()
    .items(
      Joi.string().messages({
        'string.base': 'Each like must be a string (user ID)',
      })
    )
    .messages({
      'array.base': 'likes must be an array of strings (user IDs)',
    }),

  status: Joi.string().messages({
    'string.base': "status must be a string",
  })
});

module.exports = {
  serviceSchema
};
