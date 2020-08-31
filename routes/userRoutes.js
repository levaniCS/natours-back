const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/signup',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  authController.signup
);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// 👇 all middlewares after this one, will be PROTECTED (Needs Authentication)
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

// protect middleware creates user object (req.user)
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateme',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteme', userController.deleteMe);

// Only admin can [...CRUD] user data
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
