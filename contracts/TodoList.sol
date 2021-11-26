// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TodoList {
    uint256 public taskCount = 0;

    struct Todo {
        string title;
        bool completed;
        bool deleted;
    }

    Todo[] internal _todoList;

    struct Task {
        uint256 id;
        string title;
        bool completed;
    }

    event TaskCreated(uint256 id, string content, bool completed);
    event TaskTitleUpdated(uint256 id, string content, bool completed);
    event TaskCompletedToggled(uint256 id, string content, bool completed);

    mapping(uint256 => Task) public tasks;

    modifier onlyValidTaskId(uint256 taskId) {
        require(taskCount >= taskId, "the id was out of bounds");
        require(tasks[taskId].id != 0, "the task does not exist");
        _;
    }

    // @deprecated
    modifier validIndex(uint256 _index) {
        require(_todoList.length > _index, "invalid index was given");
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

    // @deprecated
    function createItem(string memory _title) public {
        _todoList.push(Todo(_title, false, false));
    }

    // @deprecated
    // For pagenation on the frontend
    function getItemCount() public view returns (uint256) {
        return _todoList.length;
    }

    // @deprecated
    function getItem(uint256 _index)
        public
        view
        validIndex(_index)
        returns (
            uint256,
            string memory,
            bool,
            bool
        )
    {
        string memory title = _todoList[_index].title;
        return (_index, title, _todoList[_index].completed, _todoList[_index].deleted);
    }

    // logical deletion for a Todo item.
    function removeItem(uint256 _index) public validIndex(_index) {
        delete _todoList[_index];
        _todoList[_index].deleted = true;
        // @todo add event
    }
}
