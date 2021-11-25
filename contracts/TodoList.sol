// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TodoList {
    struct Todo {
        string title;
        bool completed;
        bool deleted;
    }

    Todo[] internal _todoList;

    modifier validIndex(uint256 _index) {
        require(_todoList.length > _index, "invalid index was given");
        _;
    }

    // @todo add event
    function createItem(string memory _title) public {
        _todoList.push(Todo(_title, false, false));
    }

    // For pagenation on the frontend
    function getItemCount() public view returns (uint256) {
        return _todoList.length;
    }

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

    function updateTitle(uint256 _index, string memory _title)
        public
        validIndex(_index)
    {
        Todo storage todo = _todoList[_index];
        todo.title = _title;
    }

    function toggleCompleted(uint256 _index) public {
        require(_todoList.length > _index, "invalid index was given");
        Todo storage todo = _todoList[_index];
        todo.completed = !todo.completed;
    }

    // logical deletion for a Todo item.
    function removeItem(uint256 _index) public validIndex(_index) {
        delete _todoList[_index];
        _todoList[_index].deleted = true;
        // @todo add event
    }
}
