'use client'

import axios from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';

export default function Home() {
  /** 任務名稱 */
  const [todoTitle, setTodoTitle] = useState<string>('');  // 儲存輸入值
  /** 任務描述 */
  const [todoDescription, setTodoDescription] = useState<string>('');
  /** 待辦事項 */
  const [todoArray, setTodoArray] = useState<todoArrayObj[]>([]);  // 儲存所有待辦事項
  /** 【隱藏/顯示】task完成狀態 */
  const [btnShowHideStatus, setBtnShowHideStatus] = useState<boolean>(false)

  /** 待辦interface */
  class todoArrayObj {
    id!: number;
    /** 任務名稱 */
    name: string = '';
    /** 前次任務名稱 */
    preName: string = '';

    /** 任務描述 */
    description: string = '';
    /** 前次任務描述 */
    preDescription: string = '';

    /** 任務名稱、描述【顯示/編輯】狀態 */
    showEditStatus: boolean = false;
    
    is_completed: boolean = false;
    created_at?: string
    updated_at?: string

    constructor(obj: getTodoAPI){
      this.id = obj.id || 0
      this.name = obj.name || ''
      this.preName = obj.name || ''

      this.description = obj.description || ''
      this.preDescription = obj.description || ''

      this.showEditStatus = false

      this.is_completed = obj.is_completed || false
      this.created_at = obj.created_at || new Date().toISOString()
      this.updated_at = obj.updated_at || ''
    }
  }

  interface getTodoAPI {
    /** id */
    id: number
    /** 任務名稱 */
    name: string
    /** 任務描述 */
    description: string
    /** 完成狀態 */
    is_completed: boolean
    /** 創建時間 */
    created_at: string
    /** 更新時間 */
    updated_at: string
  }



  // 初始階段發送 GET 請求以獲取任務清單
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('https://wayi.league-funny.com/api/task', {
          params: { page: 1, type: 'all' }, // 這裡你可以調整查詢參數
        });

        console.error('測試API初始化: ', response)

        if(response.data.status !== 'success'){
          return
        }        

        const formattedTasks = response.data.data.map((item: getTodoAPI) => new todoArrayObj(item))

        console.error('整理完資料: ', formattedTasks)
        
        setTodoArray(formattedTasks);
      } catch (error) {
        console.error('查詢任務清單失敗:', error);
      }
    };

    fetchTasks();
  }, []);

  // 【隱藏/顯示】task完成狀態
  const handleTaskStatus = (value: string) => {
    if(todoArray.length === 0){
      return
    }

    switch(value){
      case 'hide': {
        setBtnShowHideStatus(true)
        break
      }
      case 'show': {
        setBtnShowHideStatus(false)
        break
      }
    }
  }

  // keyDown AddTodo Enter
  const enterTodo = async(event: React.KeyboardEvent<HTMLInputElement>) => {
    try {
      if(event.key === 'Enter'){
        await addTodo()
      }
    } catch (error) {
      console.error('Error: ', error)
    }
    
  }

  // 添加待辦項目
  const addTodo = async() => {
    if (!todoTitle.trim()) {
      return
    }

    try {
      const response = await axios.post('https://wayi.league-funny.com/api/task', {
        name: todoTitle,
        description: todoDescription,
      });

      console.error('測試新增API: ', response)

      if(response.data.status !== 'success'){
        return
      }

      const addTodoItem = response.data.data

      const inputObj = new todoArrayObj(
        {
          /** id */
          id: addTodoItem.id,
          /** 任務名稱 */
          name: addTodoItem.name,
          /** 任務描述 */
          description: addTodoItem.description,
          /** 完成狀態 */
          is_completed: addTodoItem.is_completed,
          /** 創建時間 */
          created_at: addTodoItem.created_at,
          /** 更新時間 */
          updated_at: addTodoItem.updated_at
        }
      )
      
      console.error('測試輸入： ', inputObj)
      setTodoArray([...todoArray, inputObj])
      setTodoTitle('');  // 清空輸入欄
      setTodoDescription('')
    } catch (error) {
      console.error('新增任務失敗:', error);
    }

    
  };

  // 刪除待辦項目
  const removeTodo = async(item: todoArrayObj) => {
    try {
      const response = await axios.delete(`https://wayi.league-funny.com/api/task/${item.id}`);

      console.error('刪除輸出： ', response)

      if(response.status !== 204) {
        console.error('刪除失敗')
        return
      }

      const newTodos = todoArray.filter((todoItem: todoArrayObj) => todoItem.id !== item.id);  // 過濾出被刪除的項目
      setTodoArray(newTodos);
    } catch (error) {
      console.error('刪除任務失敗:', error);
    }
  };

  // 切換【完成/未完成】狀態的處理函式
  const handleCheckboxChange = async(item: todoArrayObj) => {
    try {
      const response = await axios.patch(`https://wayi.league-funny.com/api/task/${item.id}`, {
        is_completed: !item.is_completed
      });

      console.error('切換【完成/未完成】狀態: ', response)

      if(response.data.status !== 'success'){
        console.error('切換【完成/未完成】狀態式敗')
        return
      }

      const statusArray = todoArray.map((todoItem: todoArrayObj) => {
        if(todoItem.id === item.id){
          return {
            ...todoItem,
            is_completed: !item.is_completed
          } 
        }

        return todoItem
      })

      console.error('更新狀態： ', statusArray)

      setTodoArray(statusArray)
      
    } catch (error) {
      console.error('更新任務完成狀態失敗:', error);
    }

    
  };

  // 切換task【顯示/編輯】狀態
  const handleShowEditStatus = (item: todoArrayObj) => {
    const statusArray = todoArray.map((todoItem: todoArrayObj) => {
      if(todoItem.id === item.id){
        return {
          ...todoItem,
          showEditStatus: !item.showEditStatus
        } 
      }

      return todoItem
    })

    console.error('task【顯示/編輯】狀態： ', statusArray)

    setTodoArray(statusArray)
  };

  // 改變任務名稱輸入值
  const onChangeName = (event: ChangeEvent<HTMLInputElement>, item: todoArrayObj) => {
    const statusArray = todoArray.map((todoItem: todoArrayObj) => {
      if(todoItem.id === item.id){
        return {
          ...todoItem,
          name: event.target.value
        } 
      }

      return todoItem
    })

    console.error('改變任務名稱輸入值： ', statusArray)

    setTodoArray(statusArray)
  };

  // 改變任務描述輸入值
  const onChangeDescription = (event: ChangeEvent<HTMLInputElement>, item: todoArrayObj) => {
    const statusArray = todoArray.map((todoItem: todoArrayObj) => {
      if(todoItem.id === item.id){
        return {
          ...todoItem,
          description: event.target.value
        } 
      }

      return todoItem
    })

    console.error('改變任務描述輸入值： ', statusArray)

    setTodoArray(statusArray)
  };

  // 點擊【確認修改 - 任務名稱/任務描述】按鈕
  const handleConfirmBtn = async(item: todoArrayObj) => {
    try {
      const putAPItodoItem = todoArray.find((findItem: todoArrayObj) => findItem.id === item.id)

      const response = await axios.put(`https://wayi.league-funny.com/api/task/${item.id}`, {
        name: putAPItodoItem?.name,
        description: putAPItodoItem?.description,
        updated_at: new Date().toISOString()
      });
      
      console.error('測試修改內容: ', response)

      if(response.data.status !== 'success'){
        console.error('點擊【確認修改】失敗')
        return
      }

      const putTodoItem = response.data.data

      const statusArray = todoArray.map((todoItem: todoArrayObj) => {
        if(todoItem.id === item.id){
          return {
            ...todoItem,
            name: putTodoItem.name,
            preName: putTodoItem.name,
            description: putTodoItem.description,
            preDescription: putTodoItem.description,
            updated_at: putTodoItem.update_at,
            showEditStatus: !todoItem.showEditStatus
          } 
        }
  
        return todoItem
      })
  
      console.error('覆蓋前次輸入值： ', statusArray)
  
      setTodoArray(statusArray)
    } catch (error) {
      console.error('修改失敗Error: ', error)
    }
  }

  // 點擊【取消 - 任務名稱/任務描述】按鈕
  const handleCancelBtn = async(item: todoArrayObj) => {
    const statusArray = todoArray.map((todoItem: todoArrayObj) => {
      if(todoItem.id === item.id){
        return {
          ...todoItem,
          name: todoItem.preName,
          description: todoItem.preDescription,
          showEditStatus: !todoItem.showEditStatus
        } 
      }

      return todoItem
    })

    console.error('取消輸入： ', statusArray)

    setTodoArray(statusArray)
  }

  return (
    <div
      className='flex flex-col items-center'
    >
      <h1>Todo List</h1>

      {/* 輸入表單 */}
      <div
        className='mt-3'
      >
        
        <input
          type="text"
          className='border-b-2'
          value={todoTitle}
          maxLength={10}
          onChange={(e) => setTodoTitle(e.target.value)}
          onKeyDown={(event) => enterTodo(event)}
          placeholder="輸入任務名稱"
        />
        <input
          type="text"
          className='border-b-2 ml-3'
          value={todoDescription}
          maxLength={30}
          onChange={(e) => setTodoDescription(e.target.value)}
          onKeyDown={(event) => enterTodo(event)}
          placeholder="輸入任務描述"
        ></input>
        <button 
          className='rounded bg-blue-300 p-1 ml-3'
          onClick={() => addTodo()}
        >
          新增
        </button>
      </div>
      
      {/* 【顯示/隱藏】按鈕 */}
      <div
        className='mt-3'
      >
        <button 
          className={`rounded bg-blue-300 p-2 ${btnShowHideStatus ? 'hidden' : ''}`}
          onClick={() => handleTaskStatus('hide')}
        >
          【隱藏】完成task
        </button>
        <button 
          className={`rounded bg-blue-300 p-2 ${btnShowHideStatus ? '' : 'hidden'}`}
          onClick={() => handleTaskStatus('show')}
        >
          【顯示】完成task
        </button>
      </div>

      {/* 表單顯示區域 */}
      <div
        className='w-full p-4 mt-3'
      >
        <table
          className='w-full'
        >
          <thead>
            <tr>
              <th className='text-left w-[17%]'>狀態</th>
              <th className='text-left w-[33%]'>任務名稱</th>
              <th className='text-left w-[33%]'>任務描述</th>
              <th className='text-left w-[17%]'>刪除</th>
            </tr>
          </thead>
          <tbody>
          {todoArray.map((item, index) => (
            <tr 
              className={`border-b border-lime-700 ${(item.is_completed === true) && (btnShowHideStatus === true) ? 'hidden' : ''}`}
              key={index}
            >
              <td>
                <input 
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => handleCheckboxChange(item)}
                />
              </td>
              {/* 任務名稱 */}
              <td>
                <span 
                  className={item.showEditStatus ? 'hidden' : ''}
                  onDoubleClick={() => handleShowEditStatus(item)}
                >
                  {item.name}
                </span>
                <div
                  className={item.showEditStatus ? '' : 'hidden'}
                >
                  <input 
                    type="text"
                    className='border-b-2'
                    maxLength={10}
                    value={item.name}
                    onChange={(event) => onChangeName(event, item)}
                  />
                </div>
              </td>
              {/* 任務描述 */}
              <td>
              <span 
                  className={item.showEditStatus ? 'hidden' : ''}
                  onDoubleClick={() => handleShowEditStatus(item)}
                >
                  {item.description}
                </span>
                <div
                  className={item.showEditStatus ? '' : 'hidden'}
                >
                  <input 
                    type="text"
                    className='border-b-2'
                    maxLength={30}
                    value={item.description}
                    onChange={(event) => onChangeDescription(event, item)}
                  />
                  <button 
                    className='ml-3 border border-red-600'
                    onClick={() => handleConfirmBtn(item)}
                  >
                    確認
                  </button>
                  <button 
                    className='ml-3 border border-lime-500'
                    onClick={() => handleCancelBtn(item)}
                  >
                    取消
                  </button>
                </div>
              </td>
              <td>
              <button
                className='rounded bg-red-600 p-2' 
                onClick={() => removeTodo(item)}
              >
                刪除
              </button>
              </td>  
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
