const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.status)) {
        return res.status(403).json({ message: "Forbidden: You do not have permission" });
    }
    next();
}

export default checkRole;