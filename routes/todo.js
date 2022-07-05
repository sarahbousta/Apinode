const express = require('express');
const todoController = require('../controllers/TodoController');

const router = express.Router();

router.get('/', todoController.todo_list);
router.get('/:id', todoController.todo_get);
router.post('/', todoController.todo_create);
router.put('/:id', todoController.todo_update);
router.delete('/:id', todoController.todo_delete);

module.exports = router;
