const Joi = require("joi");

const createUserRelationSchema = Joi.object({
    hospitalId: Joi.string().trim().max(100).required(),
    seniorId: Joi.string().trim().max(100).required(),
    juniorId: Joi.string().trim().max(100).required(),
})

const validateUserRelationship = (req, res, next) => {
    const {error} = createUserRelationSchema.validate(req.body, {abortEarly: false});
    if (error) {
        return res.status(400).json({
            success: false,
            message: "validation failed",
            error: error.details.map((detail) => detail.message),
        })
    }
    next();
};

module.exports = {
    validateUserRelationship
}