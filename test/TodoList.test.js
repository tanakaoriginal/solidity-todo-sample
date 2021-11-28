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
      expect(await todoList.dataCount()).to.equal(0);
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

      it('create multiple tasks', async function () {
        await todoList.createTask('test title 1');
        expect(await todoList.taskCount()).to.equal(1);
        const task1 = await todoList.tasks(1);
        expect(task1.id).to.equal(1);
        expect(task1.title).to.equal('test title 1');
        expect(task1.completed).to.false;

        await todoList.createTask('test title 2');
        expect(await todoList.taskCount()).to.equal(2);
        const task2 = await todoList.tasks(2);
        expect(task2.id).to.equal(2);
        expect(task2.title).to.equal('test title 2');
        expect(task2.completed).to.false;
      });
    });

    describe('Read Task', async function () {
      it('get invalid id error for task id = 1 on empty list', async function () {
        try {
          await todoList.getTask(1);
        } catch (err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the id was out of bounds/.test(err.message)).to.be.true;
        }
      });

      it("get no existence error for task id = 0 on empty list", async function () {
        try {
          await todoList.getTask(0);
        } catch (err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/the task does not exist/.test(err.message)).to.be.true;
        }
      });

      it('get no existence error for task id = 0 on present list', async function () {
        try {
          await todoList.createTask('test title 1');
          await todoList.getTask(0);
        } catch (err) {
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

      it('delete first task', async function () {
        await todoList.createTask('test title 1');
        expect(await todoList.taskCount()).to.equal(1);
        expect(await todoList.dataCount()).to.equal(1);
        await todoList.deleteTask(1);
        expect(await todoList.taskCount()).to.equal(0);
        expect(await todoList.dataCount()).to.equal(1);

        const deletedTask = await todoList.tasks(1);
        expect(deletedTask.id.eq(0)).to.true;
        expect(deletedTask.title).to.equal('');
        expect(deletedTask.completed).to.false;
      });

      it('delete 2nd task', async function () {
        await todoList.createTask('test title 1');
        await todoList.createTask('test title 2');
        await todoList.createTask('test title 3');
        expect(await todoList.taskCount()).to.equal(3);
        expect(await todoList.dataCount()).to.equal(3);

        await todoList.deleteTask(2);
        expect(await todoList.taskCount()).to.equal(2);
        expect(await todoList.dataCount()).to.equal(3);

        const deletedTask1 = await todoList.tasks(1);
        expect(deletedTask1.id.eq(1)).to.true;
        expect(deletedTask1.title).to.equal('test title 1');
        expect(deletedTask1.completed).to.false;

        const deletedTask2 = await todoList.tasks(2);
        expect(deletedTask2.id.eq(0)).to.true;
        expect(deletedTask2.title).to.equal('');
        expect(deletedTask2.completed).to.false;

        const deletedTask3 = await todoList.tasks(3);
        expect(deletedTask3.id.eq(3)).to.true;
        expect(deletedTask3.title).to.equal('test title 3');
        expect(deletedTask3.completed).to.false;
      });

      it('delete tasks from fist to last', async function () {
        await todoList.createTask('test title 1');
        await todoList.createTask('test title 2');
        await todoList.createTask('test title 3');
        expect(await todoList.taskCount()).to.equal(3);
        expect(await todoList.dataCount()).to.equal(3);

        await todoList.deleteTask(1);
        expect(await todoList.taskCount()).to.equal(2);
        expect(await todoList.dataCount()).to.equal(3);

        const deletedTask1 = await todoList.tasks(1);
        expect(deletedTask1.id.eq(0)).to.true;
        expect(deletedTask1.title).to.equal('');
        expect(deletedTask1.completed).to.false;

        const deletedTask2 = await todoList.tasks(2);
        expect(deletedTask2.id.eq(2)).to.true;
        expect(deletedTask2.title).to.equal('test title 2');
        expect(deletedTask2.completed).to.false;

        const deletedTask3 = await todoList.tasks(3);
        expect(deletedTask3.id.eq(3)).to.true;
        expect(deletedTask3.title).to.equal('test title 3');
        expect(deletedTask3.completed).to.false;
      });

      it('delete tasks from last to first', async function () {
        await todoList.createTask('test title 1');
        await todoList.createTask('test title 2');
        await todoList.createTask('test title 3');
        expect(await todoList.taskCount()).to.equal(3);
        expect(await todoList.dataCount()).to.equal(3);

        await todoList.deleteTask(3);
        expect(await todoList.taskCount()).to.equal(2);
        expect(await todoList.dataCount()).to.equal(3);

        const deletedTask1 = await todoList.tasks(1);
        expect(deletedTask1.id.eq(1)).to.true;
        expect(deletedTask1.title).to.equal('test title 1');
        expect(deletedTask1.completed).to.false;

        const deletedTask2 = await todoList.tasks(2);
        expect(deletedTask2.id.eq(2)).to.true;
        expect(deletedTask2.title).to.equal('test title 2');
        expect(deletedTask2.completed).to.false;

        const deletedTask3 = await todoList.tasks(3);
        expect(deletedTask3.id.eq(0)).to.true;
        expect(deletedTask3.title).to.equal('');
        expect(deletedTask3.completed).to.false;
      });

      it('get id not available error for task id = 0 on empty list', async function () {
        try {
          await todoList.deleteTask(0);
        } catch (err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/The id is not available/.test(err.message)).to.be.true;
        }
      });

      it('get no task data found error for task id = 1 on empty list', async function () {
        try {
          await todoList.deleteTask(1);
        } catch (err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/No task data found/.test(err.message)).to.be.true;
        }
      });

      it('get no existence error for task id = 0 on present list', async function () {
        try {
          await todoList.createTask('test title 1');
          await todoList.deleteTask(0);
        } catch (err) {
          expect(/revert/.test(err.message)).to.be.true;
          expect(/The id is not available/.test(err.message)).to.be.true;
        }
      });
    });
  });
});