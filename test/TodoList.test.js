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

    describe('Create Todo', async function () {
      it('create a Todo item', async function () {
        await todoList.createItem('test title 1');
        expect(await todoList.getItemCount()).to.equal(1);
        const item = await todoList.getItem(0);
        expect(item[0]).to.equal(0);
        expect(item[1]).to.equal('test title 1');
        expect(item[2]).to.equal(false);
        expect(item[3]).to.equal(false);
      });
    });

    describe('Read Todo', async function () {
      it('get fist Todo item', async function () {
        await todoList.createItem('test title 1');
        expect(await todoList.getItemCount()).to.equal(1);
        const item = await todoList.getItem(0);
        expect(item[0]).to.equal(0);
        expect(item[1]).to.equal('test title 1');
        expect(item[2]).to.equal(false);
        expect(item[3]).to.equal(false);
      });

      it("get a Todo item by index", async function () {
        await todoList.createItem('test title 1');
        await todoList.createItem('test title 2');
        await todoList.createItem('test title 3');
        expect(await todoList.getItemCount()).to.equal(3);

        item = await todoList.getItem(1);
        expect(item[0]).to.equal(1);
        expect(item[1]).to.equal('test title 2');
        expect(item[2]).to.equal(false);
        expect(item[3]).to.equal(false);
      });

      it("get an error by invalid index", async function () {
        await todoList.createItem('test title 1');
        await todoList.createItem('test title 2');
        await todoList.createItem('test title 3');
        expect(await todoList.getItemCount()).to.equal(3);

        const invalidIndex = 3;
        try {
          item = await todoList.getItem(invalidIndex);
        } catch (e) {
          expect(/revert/.test(e.message)).to.be.true;
          expect(/invalid index was given/.test(e.message)).to.be.true;
        }
      });
    });

    describe('Delete Todo', async function () {
      it('delete fist Todo item', async function () {
        await todoList.createItem('test title 1');
        await todoList.removeItem(0);

        const item = await todoList.getItem(0);
        expect(item[0]).to.equal(0);
        expect(item[1]).to.equal('');
        expect(item[2]).to.equal(false);
        expect(item[3]).to.equal(true);
      });
    });
  });
});