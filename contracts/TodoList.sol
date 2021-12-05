// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TodoList {

    // For counting length of tasks mapping (including deleted tasks).
    uint256 public dataCount = 0;
    // For counting length of active tasks.
    uint256 public taskCount = 0;

    // Task data strucutre
    // When a task was deleted, id is set to 0.
    struct Task {
        uint256 id;
        string title;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;

    event TaskCreated(address indexed _from, uint256 id, string content, bool completed);
    event TaskTitleUpdated(address indexed _from, uint256 id, string content, bool completed);
    event TaskCompletedToggled(address indexed _from, uint256 id, string content, bool completed);
    event TaskDeleted(address indexed _from, uint256 id);

    modifier onlyPresentTasks(uint256 _taskId) {
        /// No data exists for the ID to read out.
        require(_taskId > 0, "The id is not available");
        /// No data found due to the database was empty.
        require(dataCount > 0, "No task data found");
        /// No tasks except deleted were found.
        require(taskCount > 0, "No task found");
        /// The ID was out of bounds for the data.
        require(taskCount >= _taskId, "The id was out of bounds");
        _;
    }

    function createTask(string memory _title) public {
        dataCount++;
        tasks[dataCount] = Task(dataCount, _title, false);
        taskCount++;
        emit TaskCreated(msg.sender, dataCount, _title, false);
    }

    function getTask(uint256 _taskId)
        public
        view
        returns (Task memory task)
    {
        return tasks[_taskId];
    }

    function updateTaskTitle(uint256 _taskId, string memory _title)
        public
        onlyPresentTasks(_taskId)
    {
        Task storage task = tasks[_taskId];
        task.title = _title;
        emit TaskTitleUpdated(msg.sender, task.id, task.title, task.completed);
    }

    function toggleTaskCompleted(uint256 _taskId)
        public
        onlyPresentTasks(_taskId)
    {
        Task storage task = tasks[_taskId];
        task.completed = !task.completed;
        emit TaskCompletedToggled(msg.sender, task.id, task.title, task.completed);
    }

    function deleteTask(uint256 _taskId)
        public
        onlyPresentTasks(_taskId)
    {
        delete tasks[_taskId];
        taskCount--;
        emit TaskDeleted(msg.sender, _taskId);
    }
}
