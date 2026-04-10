const router = require('express').Router();
const c = require('../controllers/meetingController');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', c.create);
router.delete('/:id', c.remove);
router.post('/:id/draw-member', c.drawMember);

module.exports = router;
