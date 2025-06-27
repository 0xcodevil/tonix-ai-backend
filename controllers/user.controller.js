const me = async (req, res) => {
  const user = req.user;
  res.json(user);
}

module.exports = {
  me,
}