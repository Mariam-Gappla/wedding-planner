const express = require('express');
const router = express.Router();
const Package = require('../models/package');

// Create a new package
router.post('/', async (req, res, next) => {
  try {
    const newPackage = await Package.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Package created successfully',
      data: newPackage,
    });
  } catch (err) {
    next(err);
  }
});

// Get all packages
router.get('/', async (req, res, next) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ status: 200, data: packages });
  } catch (err) {
    next(err);
  }
});

// Get a single package by ID
router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ status: 404, message: 'Package not found' });
    }
    res.status(200).json({ status: 200, data: pkg });
  } catch (err) {
    next(err);
  }
});

// Update a package by ID
router.put('/:id', async (req, res, next) => {
  try {
    const updatedPkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPkg) {
      return res.status(404).json({ status: 404, message: 'Package not found' });
    }
    res.status(200).json({ status: 200, message: 'Package updated', data: updatedPkg });
  } catch (err) {
    next(err);
  }
});

// Delete a package by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedPkg = await Package.findByIdAndDelete(req.params.id);
    if (!deletedPkg) {
      return res.status(404).json({ status: 404, message: 'Package not found' });
    }
    res.status(200).json({ status: 200, message: 'Package deleted', data: deletedPkg });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
