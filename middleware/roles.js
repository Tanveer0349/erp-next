export function authorize(allowedRoles) {
  return (handler) => async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    // allowedRoles can be array of roles or a function that checks department
    if (typeof allowedRoles === 'function') {
      const ok = await allowedRoles(user, req);
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
      return handler(req, res);
    }
    if (!allowedRoles.includes(user.role) && !allowedRoles.includes(user.department)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return handler(req, res);
  };
}