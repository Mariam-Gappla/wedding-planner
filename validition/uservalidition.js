const joi= require('joi');
const registerSchema=joi.object({
    username:joi.string().min(3).max(30).required().messages({
        'string.empty':"username required",
        "string.min":"username should be at least 3 characters and at most 30 characters",
        "string.max":"username should be at least 3 characters and at most 30 characters"
    }),
    email:joi.string().pattern(/^[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]{2,3}$/).required().messages({
        'string.empty':"email required",
        "string.pattern.base":"email should be in the format example@gamil.com",
        
    }),
    password:joi.string().min(3).max(9).pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,9}$/).required().messages({
         'string.empty':"password required",
        "string.pattern.base":"password should contain at least one number and one letter",
         "string.min":"username should be at least 3 characters and at most 6 characters",
        "string.max":"username should be at least 3 characters and at most 6 characters"
    }),
    role:joi.string().required().messages({
        'string.empty':"email required",
    })
});
const forgetPasswordSchema=joi.object({
    email:joi.string().pattern(/^[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]{2,3}$/).required().messages({
        'string.empty':"email required",
        "string.pattern.base":"email should be in the format example@gamil.com",
        
    }),
    password:joi.string().min(3).max(9).pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,9}$/).required().messages({
         'string.empty':"password required",
        "string.pattern.base":"password should contain at least one number and one letter",
         "string.min":"username should be at least 3 characters and at most 6 characters",
        "string.max":"username should be at least 3 characters and at most 6 characters"
    }),
})
module.exports={
registerSchema,
forgetPasswordSchema
}