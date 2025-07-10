//  import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Elementos del DOM
    const tasksList = document.getElementById('tasks-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskBtn = document.getElementById('add-task');
    const logoutBtn = document.getElementById('logout-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';

    // Cargar tareas
    const loadTasks = async () => {
        let query = supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (currentFilter === 'pending') {
            query = query.eq('is_complete', false);
        } else if (currentFilter === 'completed') {
            query = query.eq('is_complete', true);
        }

        const { data: tasks, error } = await query;

        if (error) {
            console.error('Error cargando tareas:', error);
            return;
        }

        renderTasks(tasks);
    };

    // Renderizar tareas
    const renderTasks = (tasks) => {
        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks">No hay tareas para mostrar.</p>';
            return;
        }

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.is_complete ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <input type="checkbox" ${task.is_complete ? 'checked' : ''}>
                <span class="task-text">${task.task}</span>
                <button class="delete-btn">🗑️</button>
            `;

            // Marcar como completada/incompleta
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async () => {
                await updateTaskStatus(task.id, checkbox.checked);
            });

            // Eliminar tarea
            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await deleteTask(task.id);
            });

            tasksList.appendChild(taskItem);
        });
    };

    // Agregar nueva tarea
    addTaskBtn.addEventListener('click', async () => {
        const taskText = newTaskInput.value.trim();
        if (!taskText) return;

        const { error } = await supabase
            .from('todos')
            .insert([{
                user_id: user.id,
                task: taskText,
                is_complete: false
            }]);

        if (error) {
            console.error('Error agregando tarea:', error);
        } else {
            newTaskInput.value = '';
            loadTasks();
        }
    });

    // También permitir agregar con Enter
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    // Actualizar estado de tarea
    const updateTaskStatus = async (taskId, isComplete) => {
        const { error } = await supabase
            .from('todos')
            .update({ is_complete: isComplete })
            .eq('id', taskId);

        if (error) {
            console.error('Error actualizando tarea:', error);
        } else {
            loadTasks();
        }
    };

    // Eliminar tarea
    const deleteTask = async (taskId) => {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error eliminando tarea:', error);
        } else {
            loadTasks();
        }
    };

    // Filtrar tareas
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            loadTasks();
        });
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error cerrando sesión:', error);
        } else {
            window.location.href = 'auth.html';
        }
    });

    // Escuchar cambios en tiempo real
    supabase
        .channel('todos_changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'todos',
            filter: `user_id=eq.${user.id}`
        }, () => {
            loadTasks();
        })
        .subscribe();

    // Keep-Alive
async function keepAlive() {
  try {
    // Opción 1: Consulta simple a nuestra tabla todos
    const { data, error } = await supabase
      .from('todos')
      .select('id')
      .limit(1);
    
    // Opción 2: Alternativa con fetch directo a la API REST
    if (error) {
      await fetch(`${supabaseUrl}/rest/v1/todos?select=id&limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
    }
    
    console.log('Keep-alive ejecutado:', new Date().toLocaleString());
  } catch (err) {
    console.error('Error en keep-alive:', err);
  }
}

// Ejecutar al cargar la aplicación
keepAlive();

// Programar ejecución periódica (cada 5 días)
const keepAliveInterval = setInterval(keepAlive, 5 * 24 * 60 * 60 * 1000);

// Opcional: Detener el intervalo cuando no se necesite
// clearInterval(keepAliveInterval);

    // Cargar tareas iniciales
    loadTasks();
});
