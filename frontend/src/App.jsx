import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TodoItem from './components/TodoItem';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';

import { ListGroup, Container, Row, Col, ButtonGroup } from 'react-bootstrap';

import TodoList from './artifacts/TodoList.json';
import ContractAddress from './artifacts/contract-address.json';

const contractAddress = ContractAddress.TodoList;

// it holds whole task data for tasks state when changing task view mode (all, active, completed)
let taskViewData = [];

let active = false;
let completed = false;
let taskCount = 0;

const refreshPage = () => {
  window.location.reload();
};

function App(props) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function connect() {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, TodoList.abi, provider);
        try {
          const dataCountBN = await contract.dataCount();
          const dataCountInt = parseInt(dataCountBN.toString());
          console.log('dataCountInt', dataCountInt);

          const activeTaskCountBN = await contract.taskCount();
          const activeTaskCountInt = parseInt(activeTaskCountBN.toString());
          console.log('activeTaskCountInt', activeTaskCountInt);
          taskCount = activeTaskCountInt;

          if (dataCountInt > 0 && activeTaskCountInt > 0) {
            let list = [];
            for (let i = 1; i <= dataCountInt; i++) {
              console.log('i', i);
              let taskId = i;
              console.log('taskId', taskId);
              let task = await contract.getTask(taskId);
              console.log('task', task);
              console.log('task.id.toString()', task.id.toString());
              const taskIdInt = parseInt(task.id.toString());
              if (taskIdInt > 0 && task.title !== '') {
                list.push({ id: task.id, title: task.title, completed: task.completed });
              }
            }
            taskViewData = list;
            setTasks(list);
          }
        } catch (error) {
          console.error(error);
          alert('Failed to start app');
        }
      }
    }

    connect();
  }, []);

  function txPreProc() {
    setIsLoading(true);
  }

  function txPostProc() {
    setIsLoading(false);
    if (active) {
      filterActive();
    }
    if (completed) {
      filterCompleted();
    }
  }

  function txErrorHandler(error) {
    if (typeof error === 'object' && error.hasOwnProperty('code')) {
      // Metamask error
      if (error.code === 4001) {
        alert('Transaction was canceled by user');
      } else if (error.code === -32603) {
        const errorData = error.data;
        if (typeof errorData === 'object') {
          alert(errorData.message);
        } else if (typeof errorData === 'undefined') {
          //
          // Handling the error like below
          // `RPC Error: [ethjs-query] while formatting outputs from RPC`
          //
          // Extract error stack from string
          const stackStr = ('{' + error.message.split("'{")[1]).replace(
            "}'",
            '}'
          )
          const errorStack = JSON.parse(stackStr);
          console.error('errorStack.value', errorStack.value);
          let errorMessage = ''
          if (errorStack.value.data.code === -32000) {
            errorMessage =
              'Nonce Error: ' + errorStack.value.data.code + '\nDetail\n'
          }
          alert(errorMessage + errorStack.value.data.message);
        } else {
          console.log('error', error);
          alert('Unknown Metamask RPC error');
        }
      } else {
        console.log('error', error);
        alert('Unknown Metamask error');
      }
    } else {
      console.log('error', error);
      alert('Unknown error');
    }
  }

  async function addTask(title) {
    console.warn('addTask');
    console.log('title', title);

    if (title === '') {
      alert('Please input task');
      return;
    }

    txPreProc();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, TodoList.abi, signer);

    // Transaction event handler
    // Update tasks state by adding a new task after the transaction completed.
    // The listener will be called multiple times for a transaction in sometimes.
    const myAddress = await signer.getAddress();
    const filter = contract.filters.TaskCreated(myAddress);
    contract.on(filter, async function (sender, id, title, completed) {
      console.warn('on TaskCreated');
      console.log('sender', sender);
      console.log('id', id);
      console.log('title', title);
      console.log('completed', completed);

      const found = tasks.filter((item) => id.eq(item.id));
      console.log('found', found);
      if (found.length === 0) {
        // Checking data count on the network chain
        const activeTaskCount = await contract.taskCount();
        const activeTaskCountInt = parseInt(activeTaskCount.toString());
        console.log('activeTaskCountInt', activeTaskCountInt);
        console.log('taskCount', taskCount);
        if (activeTaskCountInt === taskCount + 1) {
          /*
          // Sometimes list item assignment is unstable when tasks are created continuously.
          taskCount = activeTaskCountInt;
          const newTask = { id: id, title: title, completed: false };
          console.log('newTask', newTask);
          setTasks([...tasks, newTask]);
          console.log('tasks', tasks);
          taskViewData = tasks;
          console.log('taskViewData', taskViewData)
          setIsLoading(false);
          */

          // Workaround for the unstability on updating tasks state
          refreshPage();
        }
      }
    });

    /*
    // This is another way to handle the transaction event
    contract.on('TaskCreated', function(sender, id, title, completed) {
      console.warn('on TaskCreated');
      console.log('sender', sender);
      console.log('id', id);
      console.log('title', title);
      console.log('completed', completed);

      if(sender !== myAddress) {
        return;
      }
      const found = tasks.filter(item => id.eq(item.id));
      console.log('found', found);
      if(found.length === 0) {
        const itemCount = await contract.taskCount();
        const itemCountInt = parseInt(itemCount.toString());
        if (itemCountInt === taskCount + 1) {
          // ...snip...
        }
      }
    });
    */

    try {
      const transaction = await contract.createTask(title);
      await transaction.wait().then((result) => {
        console.log('createTask tx finished result', result);
      });
    } catch (err) {
      txErrorHandler(err);
    }

    txPostProc();
  }

  async function deleteTask(taskId) {
    console.warn('deleteTask');
    if (isLoading) {
      return;
    }

    txPreProc();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, TodoList.abi, signer);

    // Transaction event handler
    // Update tasks state by deleting a task after the transaction completed.
    // The listener will be called multiple times for a transaction in sometimes.
    const myAddress = await signer.getAddress();
    const filter = contract.filters.TaskDeleted(myAddress);
    contract.on(filter, async function (sender, id) {
      console.warn('on TaskDeleted');
      console.log('sender', sender);
      console.log('id', id);

      const found = tasks.filter((item) => id.eq(item.id));
      console.log('found', found);
      if (found.length === 1) {
        // checking data count on the network chain
        const itemCount = await contract.taskCount();
        const itemCountInt = parseInt(itemCount.toString());
        if (itemCountInt === taskCount - 1) {
          /*
          const updatedTasks = tasks.filter((item) => id.eq(item.id) === false);
          setTasks(updatedTasks);
          taskViewData = tasks;
          setIsLoading(false);
          */

          // workaround for unstability on updating state
          refreshPage();
        }
      }
    });

    try {
      console.log('taskId', taskId);
      const tx = await contract.deleteTask(taskId);
      await tx.wait().then((result) => {
        console.log('deleteTask tx finished result', result);
      });
    } catch (err) {
      txErrorHandler(err);
    }

    txPostProc();
  }

  async function toggleTask(taskId) {
    console.info('toggleTask');
    if (isLoading) {
      return;
    }

    txPreProc();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, TodoList.abi, signer);

    // Transaction event handler
    // Update tasks state by replacing pre-processed view data after the transaction completed.
    // The listener will be called multiple times for a transaction in sometimes.
    const myAddress = await signer.getAddress();
    const filter = contract.filters.TaskCompletedToggled(myAddress);
    contract.on(filter, async function (sender, id, title, completed) {
      console.warn('on TaskCompletedToggled');
      console.log('sender', sender);
      console.log('id', id);
      console.log('title', title);
      console.log('completed', completed);

      const found = tasks.filter((item) => id.eq(item.id) && completed === !item.completed);
      console.log('found', found);
      if (found.length === 1) {
        taskViewData = tasks.map((task) => {
          if (task.id.eq(taskId)) {
            return { ...task, completed: completed };
          } else {
            return task;
          }
        });
        setTasks(taskViewData);
      }
    });

    try {
      const transaction = await contract.toggleTaskCompleted(taskId);
      await transaction.wait();
    } catch (err) {
      txErrorHandler(err);
      // for reseting the view
      refreshPage();
    }

    txPostProc();
  }

  function filterAll() {
    console.log('filterAll');
    active = false;
    completed = false;
    const allTasks = taskViewData.filter((task) => task.completed === false);
    setTasks(allTasks);
  }

  function filterActive() {
    console.log('filterActive');
    completed = false;
    active = true;
    const activeTasks = taskViewData.filter((task) => task.completed === false);
    setTasks(activeTasks);
  }

  function filterCompleted() {
    console.log('filterCompleted');
    active = false;
    completed = true;
    const completedTasks = taskViewData.filter((task) => task.completed === true);
    setTasks(completedTasks);
  }

  const taskList = tasks.map((task) => (
    <TodoItem
      key={task.id}
      id={task.id}
      title={task.title}
      completed={task.completed}
      deleteTask={deleteTask}
      toggleTask={toggleTask}
      isLoading={isLoading}
    />
  ));
  const taskNumText = tasks.length > 1 ? 'tasks are' : 'task is';
  let action = '';
  if (active === false && completed === false) {
    action = 'registered';
  } else if (active === true && completed === false) {
    action = 'active';
  } else if (active === false && completed === true) {
    action = 'completed';
  } else {
    action = 'registered';
  }
  const headingText = `${tasks.length} ${taskNumText} ${action}`;

  return (
    <Container className="my-2">
      <Row>
        <Col>
          <h1 className="fs-1">TodoList</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <TaskForm addTask={addTask} isLoading={isLoading} />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col align="center">
          {taskViewData.length !== 0 ? <h2 className="fs-6">{headingText}</h2> : null}
        </Col>
      </Row>
      <Row>
        <Col align="center">
          <ButtonGroup size="" className="mb-2">
            <TaskFilter name="All" filter={filterAll} />
            <TaskFilter name="Active" filter={filterActive} />
            <TaskFilter name="Completed" filter={filterCompleted} />
          </ButtonGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <ListGroup>{taskList}</ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
