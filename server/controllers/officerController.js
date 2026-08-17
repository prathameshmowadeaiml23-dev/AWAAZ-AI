const getOfficers = (req, res) => res.json({ success: true, data: [{ id: 'OFF-01', name: 'Er. Rajesh Sharma', department: 'DEPT_ROAD' }] });
const getContractors = (req, res) => res.json({ success: true, data: require('../../data/contractors.json') });
module.exports = { getOfficers, getContractors };
