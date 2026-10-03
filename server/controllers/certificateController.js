const Certificate = require('../models/Certificate');

const getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id }).sort({ issueDate: -1 });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
};

const addCertificate = async (req, res, next) => {
  try {
    const { name, organization, course, issueDate, credentialId, credentialUrl } = req.body;
    if (!name || !organization || !issueDate) {
      return res.status(400).json({ message: 'Name, organization and issue date are required' });
    }
    const certificate = await Certificate.create({
      userId: req.user._id, name, organization, course, issueDate, credentialId, credentialUrl
    });
    res.status(201).json({ certificate });
  } catch (err) {
    next(err);
  }
};

const updateCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ certificate });
  } catch (err) {
    next(err);
  }
};

const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ message: 'Certificate deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCertificates, addCertificate, updateCertificate, deleteCertificate };
