// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TodoList {
    uint256 public taskCount = 0;

    struct Task {
        uint256 id;
        string title;
        bool completed;
    }

    event TaskCreated(uint256 id, string content, bool completed);
    event TaskTitleUpdated(uint256 id, string content, bool completed);
    event TaskCompletedToggled(uint256 id, string content, bool completed);
    event TaskDeleted(uint256 id, string content, bool completed);

    mapping(uint256 => Task) public tasks;

    modifier onlyValidTaskId(uint256 taskId) {
        require(taskCount >= taskId, "the id was out of bounds");
        require(tasks[taskId].id != 0, "the task does not exist");
        _;
    }

    modifier onlyPresentTasks() {
        require(taskCount > 0, "No tasks found");
        _;
    }

    function createTask(string memory _title) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _title, false);
        emit TaskCreated(taskCount, _title, false);
    }

    function getTask(uint256 taskId)
        public
        view
        onlyValidTaskId(taskId)
        returns (Task memory task)
    {
        return tasks[taskId];
    }

    function updateTaskTitle(uint256 taskId, string memory title)
        public
        onlyValidTaskId(taskId)
    {
        Task storage task = tasks[taskId];
        task.title = title;
        emit TaskTitleUpdated(task.id, task.title, task.completed);
    }

    function toggleTaskCompleted(uint256 taskId)
        public
        onlyValidTaskId(taskId)
    {
        Task storage task = tasks[taskId];
        task.completed = !task.completed;
        emit TaskCompletedToggled(task.id, task.title, task.completed);
    }

    function deleteTask(uint256 taskId)
        public
        onlyValidTaskId(taskId)
        onlyPresentTasks
    {
        taskCount--;
        delete tasks[taskId];
        emit TaskDeleted(taskId, tasks[taskId].title, tasks[taskId].completed);
    }
}
