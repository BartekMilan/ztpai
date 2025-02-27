const Task = require('../models/Task');

// Pobieranie wszystkich zadań użytkownika
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Błąd pobierania zadań:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};

// Pobieranie zadań z filtrowaniem
exports.getFilteredTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const filter = { userId: req.userId };

    // Dodawanie filtrów jeśli istnieją
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Błąd filtrowania zadań:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};

// Pobieranie jednego zadania
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Zadanie nie znalezione' });
    }
    res.json({ success: true, task });
  } catch (error) {
    console.error('Błąd pobierania zadania:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};

// Tworzenie nowego zadania
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.userId
    });

    await task.save();
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Błąd tworzenia zadania:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};

// Aktualizacja zadania
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, status, priority, dueDate, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Zadanie nie znalezione' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Błąd aktualizacji zadania:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};

// Usuwanie zadania
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Zadanie nie znalezione' });
    }

    res.json({ success: true, message: 'Zadanie usunięte' });
  } catch (error) {
    console.error('Błąd usuwania zadania:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};