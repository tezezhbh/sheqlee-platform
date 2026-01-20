// controllers/handlerFactory.js
const AppError = require('../utilities/globalAppError');
const catchAsync = require('../utilities/catchAsync');

exports.toggleActive = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) return next(new AppError('Document not found', 404));

    doc.isActive = !doc.isActive;
    await doc.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: { active: doc.isActive },
    });
  });

exports.toggleStatus = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) return next(new AppError('Document not found', 404));

    // If the company is deleted, we don't just toggle it.
    // Usually, you want a separate 'Restore' action for that.
    if (doc.status === 'deleted') {
      return next(
        new AppError(
          'Deleted companies cannot be toggled. Use restore instead.',
          400
        )
      );
    }

    // Toggle logic: active <-> inactive
    doc.status = doc.status === 'active' ? 'inactive' : 'active';

    await doc.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: { status: doc.status },
    });
  });

exports.deactivate = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!doc) return next(new AppError('Document not found', 404));

    res.status(200).json({ status: 'success' });
  });

// controllers/handlerFactory.js

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

/* Then Next on the ROUTER 
// Users
router
  .route('/:id')
  .get(userController.getUser); // 👁

router.patch('/:id/toggle', toggleActive(User)); // 🟢🔴
router.patch('/:id/deactivate', deactivate(User));     // 🗑

// Companies
router.get('/:id', companyController.getCompany);
router.patch('/:id/toggle-active', toggleActive(Company));
router.patch('/:id/deactivate', deactivate(Company));
*/
