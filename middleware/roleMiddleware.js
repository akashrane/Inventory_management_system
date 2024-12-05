// Middleware to verify roles
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Assuming `req.user` is populated by your JWT auth middleware
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: "Access denied: You do not have the required role" });
        }
        next();
    };
};

module.exports = verifyRole;
