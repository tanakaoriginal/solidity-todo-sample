const {
  expect
} = require('chai');
const {
  ethers
} = require('hardhat');

let TodoList, todoList;

beforeEach(async function () {
  TodoList = await ethers.getContractFactory('TodoList');
  todoList = await TodoList.deploy();
});

describe('TodoList contract', function () {

  describe('Deployment', async function () {
    it('assign empty Todo list', async function () {
      expect(await todoList.taskCount()).to.equal(0);
    });
  });

  describe('Transactions', async function () {

    describe('Create Task', async function () {
      it('create a task', async function () {
        await todoList.createTask('test title 1');
        expect(await todoList.taskCount()).to.equal(1);
        const task = await todoList.tasks(1);
        expect(task.id).to.equal(1);
        expect(task.title).to.equal('test title 1');
        expect(task.completed).to.false;
      });
    });

    describe('Read Task', async function () {
      it('get invalid id error for task id = 1 on empty list', async function () {
        try {
          await todoList.getTask(1);
        } catch(err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the id was out of bounds/.test(err.message)).to.be.true;
        }
      });

      it('get no existence error for task id = 0 on empty list', async function () {
        try {
          await todoList.getTask(0);
        } catch(err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the task does not exist/.test(err.message)).to.be.true;
        }
      });

      it('get no existence error for task id = 0 on present list', async function () {
        try {
          await todoList.createTask('test title 1');
          await todoList.getTask(0);
        } catch(err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the task does not exist/.test(err.message)).to.be.true;
        }
      });

      it('get fist task item', async function () {
        await todoList.createTask('test title 1');
        const task = await todoList.getTask(1);
        expect(task.id).to.equal(1);
        expect(task.title).to.equal('test title 1');
        expect(task.completed).to.false;
      });
    });

    describe('Update Task', async function () {
      it('update title', async function () {
        await todoList.createTask('test title 1');
        expect(await todoList.taskCount()).to.equal(1);
        const task = await todoList.tasks(1);
        expect(task.title).to.equal('test title 1');

        await todoList.updateTaskTitle(1, 'test title 1 - updated');
        const taskUpdated = await todoList.tasks(1);
        expect(taskUpdated.title).to.equal('test title 1 - updated');
        expect(taskUpdated.completed).to.equal(false);
      });

      it('toggle completed', async function () {
        await todoList.createTask('test title 1');
        const task = await todoList.tasks(1);
        expect(task.title).to.equal('test title 1');
        expect(task.completed).to.equal(false);

        await todoList.toggleTaskCompleted(1);
        const taskCompleted = await todoList.tasks(1);
        expect(taskCompleted.completed).to.equal(true);

        await todoList.toggleTaskCompleted(1);
        const taskCompleteToggled = await todoList.tasks(1);
        expect(taskCompleteToggled.completed).to.equal(false);
      });
    });

    describe('Delete Task', async function () {
      it('delete task item', async function () {
        await todoList.createTask('test title 1');
        expect(await todoList.taskCount()).to.equal(1);
        await todoList.deleteTask(1);
        expect(await todoList.taskCount()).to.equal(0);
      });

      it('get error  task item', async function () {
        await todoList.createTask('test title 1');
        expect(await todoList.taskCount()).to.equal(1);
        await todoList.deleteTask(1);
        expect(await todoList.taskCount()).to.equal(0);
      });

      it('get no existence error for task id = 0 on empty list', async function () {
        try {
          await todoList.deleteTask(0);
        } catch(err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the task does not exist/.test(err.message)).to.be.true;
        }
      });

      it('get no existence error for task id = 1 on empty list', async function () {
        try {
          await todoList.deleteTask(1);
        } catch(err) {
          console.log(err)
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the id was out of bounds/.test(err.message)).to.be.true;
        }
      });

      it('get no existence error for task id = 0 on present list', async function () {
        try {
          await todoList.createTask('test title 1');
          await todoList.deleteTask(0);
        } catch(err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the task does not exist/.test(err.message)).to.be.true;
        }
      });
    });
  });
});
