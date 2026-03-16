"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, Utensils, Calendar, Calculator, ChevronRight, 
  Save, BookOpen, Target, Camera, ImagePlus, CheckCircle2, 
  History, ChevronLeft, Dumbbell, Ruler, Apple, Plus, PieChart, 
  Trash2, ChefHat, Search, X, CalendarDays, CalendarClock, Compass,
  Edit3, Timer
} from 'lucide-react';

export default function GirlfriendFitnessApp() {
  const [activeTab, setActiveTab] = useState('training'); 
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // --- STATE: NUTRITION & CALCULATOR ---
  const [age, setAge] = useState(34);
  const [weight, setWeight] = useState(49);
  const [height, setHeight] = useState(157);
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [calcResults, setCalcResults] = useState({
    calories: 1650, protein: 78, carbs: 213, fat: 54, bodyFat: null
  });

  // --- STATE: INGREDIENTS DATABASE ---
  const [ingredients, setIngredients] = useState([
    { id: 'i1', name: "Chicken Breast", category: "Proteins", baseQuantity: 100, unit: "g", protein: 31, carbs: 0, fat: 3.6, calories: 165 },
    { id: 'i2', name: "Whole Egg", category: "Proteins", baseQuantity: 1, unit: "Large", protein: 6, carbs: 0.6, fat: 5, calories: 72 },
    { id: 'i3', name: "Whey Protein", category: "Proteins", baseQuantity: 1, unit: "Scoop", protein: 25, carbs: 3, fat: 2, calories: 120 },
    { id: 'i4', name: "White Rice (Cooked)", category: "Carbs", baseQuantity: 100, unit: "g", protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
    { id: 'i5', name: "Kamote (Sweet Potato)", category: "Carbs", baseQuantity: 100, unit: "g", protein: 1.6, carbs: 20, fat: 0.1, calories: 86 },
    { id: 'i6', name: "Rolled Oats", category: "Carbs", baseQuantity: 50, unit: "g", protein: 6.5, carbs: 34, fat: 3.2, calories: 189 },
    { id: 'i7', name: "Peanut Butter", category: "Fats", baseQuantity: 1, unit: "Tbsp", protein: 4, carbs: 3, fat: 8, calories: 95 },
  ]);

  const [activeIngredientFilter, setActiveIngredientFilter] = useState('All');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: 'Proteins', baseQuantity: 100, unit: 'g', protein: '', carbs: '', fat: '' });
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  
  const ingredientCategories = ['All', 'Proteins', 'Carbs', 'Fats', 'Spices', 'Sauces'];
  const filteredIngredients = activeIngredientFilter === 'All' ? ingredients : ingredients.filter(i => i.category === activeIngredientFilter);

  const saveIngredient = () => {
    if (!newIngredient.name || newIngredient.protein === '' || newIngredient.carbs === '' || newIngredient.fat === '') {
      return showNotification("Please fill all ingredient fields.");
    }
    const p = parseFloat(newIngredient.protein);
    const c = parseFloat(newIngredient.carbs);
    const f = parseFloat(newIngredient.fat);
    const cals = Math.round((p * 4) + (c * 4) + (f * 9));
    
    const addedItem = {
      id: editingIngredientId || `i${Date.now()}`,
      name: newIngredient.name, category: newIngredient.category,
      baseQuantity: parseFloat(newIngredient.baseQuantity), unit: newIngredient.unit,
      protein: p, carbs: c, fat: f, calories: cals
    };

    if (editingIngredientId) {
      setIngredients(ingredients.map(i => i.id === editingIngredientId ? addedItem : i));
    } else {
      setIngredients([addedItem, ...ingredients]);
    }

    setNewIngredient({ name: '', category: 'Proteins', baseQuantity: 100, unit: 'g', protein: '', carbs: '', fat: '' });
    setShowAddIngredient(false);
    setEditingIngredientId(null);
    showNotification(`${addedItem.name} saved!`);
  };

  const editIngredient = (item) => {
    setNewIngredient({
      name: item.name, category: item.category,
      baseQuantity: item.baseQuantity, unit: item.unit,
      protein: item.protein, carbs: item.carbs, fat: item.fat
    });
    setEditingIngredientId(item.id);
    setShowAddIngredient(true);
  };

  const deleteIngredient = (id) => {
    setIngredients(ingredients.filter(i => i.id !== id));
    showNotification("Ingredient deleted.");
  };

  // --- STATE: RECIPES ---
  const [recipes, setRecipes] = useState([
    {
      id: 'r1', name: "Power Banana Shake", 
      baseQuantity: 1, unit: "Serving",
      calories: 310, protein: 29, carbs: 37, fat: 10,
      items: [{ name: "Whey Protein", qty: 1, unit: "Scoop", calories: 120, protein: 25, carbs: 3, fat: 2 }, { name: "Peanut Butter", qty: 1, unit: "Tbsp", calories: 95, protein: 4, carbs: 3, fat: 8 }]
    }
  ]);
  
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [draftRecipeName, setDraftRecipeName] = useState('');
  const [draftRecipeItems, setDraftRecipeItems] = useState([]);

  const addIngredientToRecipe = (ing, qty) => {
    if (!qty || qty <= 0) return;
    const ratio = qty / ing.baseQuantity;
    const newItem = {
      id: ing.id, name: ing.name, qty: parseFloat(qty), unit: ing.unit,
      calories: Math.round(ing.calories * ratio),
      protein: Math.round(ing.protein * ratio * 10)/10,
      carbs: Math.round(ing.carbs * ratio * 10)/10,
      fat: Math.round(ing.fat * ratio * 10)/10
    };
    setDraftRecipeItems([...draftRecipeItems, newItem]);
  };

  const recipeDraftTotals = draftRecipeItems.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories, protein: acc.protein + curr.protein, carbs: acc.carbs + curr.carbs, fat: acc.fat + curr.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const saveRecipe = () => {
    if (!draftRecipeName || draftRecipeItems.length === 0) return showNotification("Need a name and ingredients!");
    const newRecipe = {
      id: editingRecipeId || `r${Date.now()}`, name: draftRecipeName, baseQuantity: 1, unit: "Serving",
      calories: Math.round(recipeDraftTotals.calories), protein: Math.round(recipeDraftTotals.protein),
      carbs: Math.round(recipeDraftTotals.carbs), fat: Math.round(recipeDraftTotals.fat),
      items: draftRecipeItems
    };
    if (editingRecipeId) {
      setRecipes(recipes.map(r => r.id === editingRecipeId ? newRecipe : r));
    } else {
      setRecipes([newRecipe, ...recipes]);
    }
    setIsCreatingRecipe(false); setEditingRecipeId(null); setDraftRecipeName(''); setDraftRecipeItems([]);
    showNotification(`Recipe '${newRecipe.name}' saved!`);
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
    showNotification("Recipe deleted.");
  };

  const editRecipe = (recipe) => {
    setDraftRecipeName(recipe.name);
    setDraftRecipeItems(recipe.items);
    setEditingRecipeId(recipe.id);
    setIsCreatingRecipe(true);
  };

  // --- STATE: MEAL PLANNER (TEMPLATES) ---
  const [mealTemplates, setMealTemplates] = useState([
    {
      id: 't1', name: "Heavy Lifting Fuel", mealCount: 4,
      totalCalories: 1530, totalProtein: 102, totalCarbs: 185, totalFat: 42,
      meals: [
        { id: 'm1', name: 'Meal 1', items: [{ id: 'r1', name: 'Power Banana Shake', qty: 1, unit: 'Serving', calories: 310, protein: 29, carbs: 37, fat: 10 }] },
        { id: 'm2', name: 'Meal 2', items: [{ id: 'i1', name: 'Chicken Breast', qty: 150, unit: 'g', calories: 247, protein: 46, carbs: 0, fat: 5 }] },
        { id: 'm3', name: 'Meal 3', items: [{ id: 'i4', name: 'White Rice (Cooked)', qty: 150, unit: 'g', calories: 195, protein: 4, carbs: 42, fat: 0 }] },
        { id: 'm4', name: 'Meal 4', items: [{ id: 'i2', name: 'Whole Egg', qty: 2, unit: 'Large', calories: 144, protein: 12, carbs: 1, fat: 10 }] }
      ]
    }
  ]);

  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [draftTemplateName, setDraftTemplateName] = useState('');
  const [draftMealCount, setDraftMealCount] = useState(4);
  const [draftMeals, setDraftMeals] = useState([]);
  const [activeAddingMealId, setActiveAddingMealId] = useState(null);

  useEffect(() => {
    if (isCreatingTemplate && !editingTemplateId && draftMeals.length === 0) {
      setDraftMeals(Array.from({ length: draftMealCount }, (_, i) => ({ id: `dm${i+1}`, name: `Meal ${i+1}`, items: [] })));
    }
  }, [isCreatingTemplate, draftMealCount, editingTemplateId]);

  const handleMealCountChange = (num) => {
    setDraftMealCount(num);
    const newMeals = Array.from({ length: num }, (_, i) => draftMeals[i] || { id: `dm${i+1}`, name: `Meal ${i+1}`, items: [] });
    setDraftMeals(newMeals);
  };

  const addItemToDraftMeal = (item, qty, isRecipe) => {
    if (!qty || qty <= 0) return showNotification("Enter a valid quantity");
    const ratio = qty / item.baseQuantity;
    const addedItem = {
      id: item.id, name: item.name, qty: parseFloat(qty), unit: item.unit,
      calories: Math.round(item.calories * ratio), protein: Math.round(item.protein * ratio * 10)/10,
      carbs: Math.round(item.carbs * ratio * 10)/10, fat: Math.round(item.fat * ratio * 10)/10,
    };
    setDraftMeals(draftMeals.map(m => m.id === activeAddingMealId ? { ...m, items: [...m.items, addedItem] } : m));
    setActiveAddingMealId(null);
  };

  const removeDraftItem = (mealId, itemIndex) => {
    setDraftMeals(draftMeals.map(m => m.id === mealId ? { ...m, items: m.items.filter((_, idx) => idx !== itemIndex) } : m));
  };

  const templateTotals = draftMeals.reduce((acc, meal) => {
    meal.items.forEach(item => { acc.calories += item.calories; acc.protein += item.protein; acc.carbs += item.carbs; acc.fat += item.fat; });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const saveTemplate = () => {
    if (!draftTemplateName) return showNotification("Give your meal plan a name!");
    const newTemplate = {
      id: editingTemplateId || `t${Date.now()}`, name: draftTemplateName, mealCount: draftMealCount,
      totalCalories: Math.round(templateTotals.calories), totalProtein: Math.round(templateTotals.protein),
      totalCarbs: Math.round(templateTotals.carbs), totalFat: Math.round(templateTotals.fat), meals: draftMeals
    };
    
    if (editingTemplateId) {
      setMealTemplates(mealTemplates.map(t => t.id === editingTemplateId ? newTemplate : t));
    } else {
      setMealTemplates([...mealTemplates, newTemplate]);
    }
    setIsCreatingTemplate(false); setEditingTemplateId(null); setDraftTemplateName(''); setDraftMeals([]);
    showNotification(`Template '${newTemplate.name}' saved!`);
  };

  const editTemplate = (template) => {
    setDraftTemplateName(template.name); setDraftMealCount(template.mealCount);
    setDraftMeals(template.meals); setEditingTemplateId(template.id);
    setIsCreatingTemplate(true);
  };

  const deleteTemplate = (id) => {
    setMealTemplates(mealTemplates.filter(t => t.id !== id));
    const newAssigned = {...assignedPlans};
    Object.keys(newAssigned).forEach(k => { if(newAssigned[k] === id) newAssigned[k] = null; });
    setAssignedPlans(newAssigned);
    showNotification("Meal plan deleted.");
  };

  // --- STATE: MEAL ASSIGNER (SCHEDULE) ---
  const [assignedPlans, setAssignedPlans] = useState({
    Monday: 't1', Tuesday: null, Wednesday: 't1', Thursday: null, Friday: 't1', Saturday: null, Sunday: null
  });

  const assignPlanToDay = (day, templateId) => {
    setAssignedPlans({ ...assignedPlans, [day]: templateId }); showNotification(`Plan assigned to ${day}`);
  };
  const clearDayPlan = (day) => setAssignedPlans({ ...assignedPlans, [day]: null });
  const clearAllPlans = () => {
    setAssignedPlans({ Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null });
    showNotification("Schedule cleared.");
  };

  // --- STATE: DAILY EXTRAS (For Diet Tab) ---
  const [dailyExtras, setDailyExtras] = useState([]);
  const [activeExtraAdd, setActiveExtraAdd] = useState(false);

  // --- STATE: PROGRESS VIEW ---
  const [progressView, setProgressView] = useState('overview'); 
  const [mockWorkoutHistory, setMockWorkoutHistory] = useState([
    { 
      id: 1, date: "2024-10-24", day: "Monday", exercise: "Goblet Squats", 
      sets: [{ set: 1, weight: 15, reps: 12 }, { set: 2, weight: 15, reps: 10 }, { set: 3, weight: 15, reps: 9 }] 
    },
    { 
      id: 2, date: "2024-10-24", day: "Monday", exercise: "Dumbbell Rows", 
      sets: [{ set: 1, weight: 10, reps: 12 }, { set: 2, weight: 10, reps: 10 }, { set: 3, weight: 10, reps: 8 }] 
    },
    { 
      id: 3, date: "2024-10-17", day: "Monday", exercise: "Goblet Squats", 
      sets: [{ set: 1, weight: 12, reps: 15 }, { set: 2, weight: 12, reps: 12 }, { set: 3, weight: 12, reps: 10 }] 
    },
  ]);

  const [mockMeasurementHistory, setMockMeasurementHistory] = useState([
    { id: 1, date: "2024-10-24", weight: 49.5, waist: 26, hip: 35, arm: 10, hasPhoto: true }
  ]);

  const deleteWorkoutLog = (id) => {
    setMockWorkoutHistory(mockWorkoutHistory.filter(h => h.id !== id));
    showNotification("Workout log deleted.");
  };

  const deleteMeasurementLog = (id) => {
    setMockMeasurementHistory(mockMeasurementHistory.filter(h => h.id !== id));
    showNotification("Measurement entry deleted.");
  };

  // Group workout history by date
  const groupedHistory = mockWorkoutHistory.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = { day: log.day, exercises: [] };
    acc[log.date].exercises.push(log);
    return acc;
  }, {});

  // Measurements state
  const [trackWeight, setTrackWeight] = useState('');
  const [trackWaist, setTrackWaist] = useState('');
  const [trackHip, setTrackHip] = useState('');
  const [trackArm, setTrackArm] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const saveWeeklyProgress = async () => {
    if (!trackWeight) return showNotification("Please enter at least your weight!");
    showNotification("Progress saved successfully! (Includes photo & measurements)");
    setPhotoPreview(null); setPhotoFile(null); setTrackWeight(''); setTrackWaist(''); setTrackHip(''); setTrackArm('');
  };

  // --- STATE: TRAINING (7-Day Calendar & Sets) ---
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const actualToday = days[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(actualToday);

  // UPDATED: Added Sets and Rest Times to the routine
  const weeklyPlan = {
    Monday: { title: "Full-Body Gym", isRest: false, exercises: [
      { name: "Goblet Squats", sets: 3, rest: 90 },
      { name: "Dumbbell Rows", sets: 3, rest: 90 },
      { name: "Dumbbell Chest Press", sets: 3, rest: 90 },
      { name: "Planks (Seconds)", sets: 3, rest: 60 }
    ] },
    Tuesday: { title: "Short Island Run", isRest: false, exercises: [
      { name: "Run (Moderate Pace)", sets: 1, rest: 0 }
    ] },
    Wednesday: { title: "Lower-Body Gym", isRest: false, exercises: [
      { name: "Romanian Deadlifts", sets: 3, rest: 90 },
      { name: "Walking Lunges", sets: 3, rest: 90 },
      { name: "Glute Bridges", sets: 3, rest: 60 },
      { name: "Calf Raises", sets: 3, rest: 60 }
    ] },
    Thursday: { title: "Active Rest", isRest: true, exercises: [] },
    Friday: { title: "Upper-Body & Core", isRest: false, exercises: [
      { name: "Overhead Press", sets: 3, rest: 90 },
      { name: "Lat Pulldowns", sets: 3, rest: 90 },
      { name: "Bicep Curls", sets: 3, rest: 60 },
      { name: "Bicycle Crunches", sets: 3, rest: 60 }
    ] },
    Saturday: { title: "Long Run", isRest: false, exercises: [
      { name: "Run (Distance)", sets: 1, rest: 0 }
    ] },
    Sunday: { title: "Full Rest & Recovery", isRest: true, exercises: [] }
  };
  const selectedWorkout = weeklyPlan[selectedDay];

  // Active inputs for the training tab
  const [workoutInputs, setWorkoutInputs] = useState({});
  const handleWorkoutInput = (exerciseName, setIndex, field, value) => {
    const newInputs = { ...workoutInputs };
    if (!newInputs[exerciseName]) newInputs[exerciseName] = [];
    if (!newInputs[exerciseName][setIndex]) newInputs[exerciseName][setIndex] = { weight: '', reps: '' };
    newInputs[exerciseName][setIndex][field] = value;
    setWorkoutInputs(newInputs);
  };

  const saveWorkoutSession = () => {
    showNotification(`${selectedDay} session saved! Great job logging all sets.`);
    setWorkoutInputs({});
  };

  // --- AUTO-LOGGING MACROS (Today's Total) ---
  const todaysPlanId = assignedPlans[actualToday];
  const todaysPlan = mealTemplates.find(t => t.id === todaysPlanId);

  let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  if (todaysPlan) {
    consumed.calories += todaysPlan.totalCalories; consumed.protein += todaysPlan.totalProtein;
    consumed.carbs += todaysPlan.totalCarbs; consumed.fat += todaysPlan.totalFat;
  }
  dailyExtras.forEach(ext => {
    consumed.calories += ext.calories; consumed.protein += ext.protein; consumed.carbs += ext.carbs; consumed.fat += ext.fat;
  });

  const addExtraToToday = (item, qty) => {
    if (!qty || qty <= 0) return showNotification("Enter a valid quantity");
    const ratio = qty / item.baseQuantity;
    const addedItem = {
      logId: Date.now(), name: `${item.name} (${qty}${item.unit})`,
      calories: Math.round(item.calories * ratio), protein: Math.round(item.protein * ratio * 10)/10,
      carbs: Math.round(item.carbs * ratio * 10)/10, fat: Math.round(item.fat * ratio * 10)/10,
    };
    setDailyExtras([...dailyExtras, addedItem]);
    setActiveExtraAdd(false); showNotification("Added extra food to today's log.");
  };

  const calculateTargets = () => {
    let bmr = 0; let bodyFatPercentage = null; let calculationMethod = "";
    if (neck && waist && hip) {
      const heightInInches = height / 2.54;
      bodyFatPercentage = (163.205 * Math.log10(parseFloat(waist) + parseFloat(hip) - parseFloat(neck))) - (97.684 * Math.log10(heightInInches)) - 78.387;
      const lbm = weight * (1 - bodyFatPercentage / 100);
      bmr = 370 + (21.6 * lbm);
      calculationMethod = "Katch-McArdle";
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      calculationMethod = "Mifflin-St Jeor";
    }
    const tdee = bmr * 1.2; 
    const targetCalories = tdee + 250; 
    setCalcResults({
      method: calculationMethod, bodyFat: bodyFatPercentage ? bodyFatPercentage.toFixed(1) : null,
      tdee: Math.round(tdee), calories: Math.round(targetCalories), 
      protein: Math.round(weight * 1.6), fat: Math.round(weight * 1.1), 
      carbs: Math.round((targetCalories - (weight * 1.6 * 4) - (weight * 1.1 * 9)) / 4)
    });
  };

  // --- Dynamic Math for Learn Tab ---
  const mifflinBMR = Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  const harrisBMR = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  let katchBMRText = "Requires Body Fat % (Tape measures)";
  if (calcResults.bodyFat) {
    const lbm = weight * (1 - calcResults.bodyFat / 100);
    katchBMRText = Math.round(370 + (21.6 * lbm)) + " kcal";
  }

  // --- NAVIGATION ITEMS (UPDATED NAMES) ---
  const navItems = [
    { id: 'training', label: 'WORKOUTS', icon: Activity, color: 'text-cyan-400' },
    { id: 'planner', label: 'MEAL BUILDER', icon: CalendarDays, color: 'text-purple-400' },
    { id: 'assigner', label: 'SCHEDULE', icon: CalendarClock, color: 'text-blue-400' },
    { id: 'ingredients', label: 'FOODS', icon: Apple, color: 'text-orange-400' },
    { id: 'recipes', label: 'RECIPES', icon: ChefHat, color: 'text-yellow-400' },
    { id: 'nutrition', label: "TODAY'S LOG", icon: Utensils, color: 'text-rose-400' },
    { id: 'progress', label: 'HISTORY', icon: History, color: 'text-emerald-400' },
    { id: 'learn', label: 'LEARN', icon: BookOpen, color: 'text-indigo-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row selection:bg-rose-500 pb-24 md:pb-0 relative">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl z-[100] font-bold flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 size={20} /> {notification}
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-50 p-6 overflow-y-auto scrollbar-hide">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 mb-10 drop-shadow-lg">ISLAND GAINS</h1>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 font-bold ${
                  activeTab === item.id ? 'bg-slate-800 shadow-lg border border-slate-700 text-white' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                }`}>
                <Icon size={20} className={activeTab === item.id ? item.color : ''} /> {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        
        {/* ==================== THE GLOBAL COMPASS (Sticky Header) ==================== */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl hidden sm:block"><Compass className="text-indigo-400" size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Today is {actualToday}</p>
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <p className="text-xs sm:text-sm font-bold text-cyan-400 flex items-center gap-1"><Activity size={14}/> {weeklyPlan[actualToday].title}</p>
                <p className="text-xs sm:text-sm font-bold text-yellow-400 flex items-center gap-1"><Utensils size={14}/> {todaysPlan ? todaysPlan.name : 'No Meal Plan Assigned'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-5xl w-full mx-auto">

          {/* ==================== TAB 1: MEAL PLANNER (BLUEPRINTS) ==================== */}
          {activeTab === 'planner' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3"><CalendarDays className="text-purple-400" size={32} /> Meal Builder</h2>
                  <p className="text-slate-400 text-sm mt-1">Create your master blueprints. Assign them later.</p>
                </div>
              </div>

              {!isCreatingTemplate ? (
                <>
                  <button onClick={() => setIsCreatingTemplate(true)} className="w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-purple-400 text-purple-400 py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 transition-colors group">
                    <Plus size={32} className="group-hover:scale-110 transition-transform" /> Create Sample Meal Day
                  </button>

                  <div className="grid grid-cols-1 gap-4 mt-6">
                    {mealTemplates.map(template => (
                      <div key={template.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6 pb-4">
                          <h3 className="font-bold text-white text-xl mb-1">{template.name}</h3>
                          <p className="text-xs text-slate-400 mb-4">{template.mealCount} Meals Total</p>
                          <div className="flex gap-4 text-sm font-bold mb-4">
                            <div className="text-amber-400">{template.totalCalories} <span className="text-[10px] text-slate-500">KCAL</span></div>
                            <div className="text-rose-400">{template.totalProtein}g <span className="text-[10px] text-slate-500">PRO</span></div>
                            <div className="text-cyan-400">{template.totalCarbs}g <span className="text-[10px] text-slate-500">CARB</span></div>
                            <div className="text-yellow-400">{template.totalFat}g <span className="text-[10px] text-slate-500">FAT</span></div>
                          </div>
                          <div className="space-y-2">
                            {template.meals.map(meal => (
                              <div key={meal.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm">
                                <span className="font-bold text-slate-300">{meal.name}:</span> <span className="text-slate-500">{meal.items.map(i => `${i.qty}${i.unit} ${i.name}`).join(', ') || 'Empty'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 border-t border-slate-800 flex justify-end gap-3 mt-auto">
                          <button onClick={() => editTemplate(template)} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"><Edit3 size={14} /> Edit</button>
                          <button onClick={() => deleteTemplate(template.id)} className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-xs font-bold transition-colors"><Trash2 size={14} /> Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // TEMPLATE BUILDER
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl relative">
                  <button onClick={() => { setIsCreatingTemplate(false); setEditingTemplateId(null); setDraftTemplateName(''); setDraftMeals([]); }} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
                  <h3 className="text-xl font-bold text-white mb-6">{editingTemplateId ? 'Edit Template' : 'Template Builder'}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">TEMPLATE NAME</label>
                      <input type="text" placeholder="e.g. Cardio Day Meals" value={draftTemplateName} onChange={(e)=>setDraftTemplateName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">NUMBER OF MEALS</label>
                      <select value={draftMealCount} onChange={(e)=>handleMealCountChange(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-purple-500">
                        {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Meals</option>)}
                      </select>
                    </div>
                  </div>

                  {/* LIVE MATH BANNER */}
                  <div className="grid grid-cols-4 gap-2 text-center mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL KCAL</p><p className="text-xl font-black text-amber-400">{Math.round(templateTotals.calories)}</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL PRO</p><p className="text-xl font-black text-rose-400">{Math.round(templateTotals.protein)}g</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL CARB</p><p className="text-xl font-black text-cyan-400">{Math.round(templateTotals.carbs)}g</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL FAT</p><p className="text-xl font-black text-yellow-400">{Math.round(templateTotals.fat)}g</p></div>
                  </div>

                  {/* MEAL BUCKETS */}
                  <div className="space-y-4 mb-6">
                    {draftMeals.map((meal) => (
                      <div key={meal.id} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                        <div className="flex justify-between items-center mb-3">
                          <input type="text" value={meal.name} onChange={(e) => {
                            const newMeals = [...draftMeals];
                            newMeals.find(m => m.id === meal.id).name = e.target.value;
                            setDraftMeals(newMeals);
                          }} className="bg-transparent text-white font-bold focus:outline-none border-b border-dashed border-slate-600 focus:border-purple-400 px-1 w-full mr-4" />
                          <button onClick={() => setActiveAddingMealId(meal.id)} className="text-purple-400 hover:text-white text-xs font-bold flex items-center gap-1 bg-purple-500/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"><Plus size={14}/> Add Food</button>
                        </div>
                        
                        <div className="space-y-2">
                          {meal.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-sm">
                              <span className="font-bold text-slate-300">{item.qty}{item.unit} {item.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-500">{item.calories} kcal</span>
                                <button onClick={() => removeDraftItem(meal.id, idx)} className="text-slate-600 hover:text-red-400"><Trash2 size={16}/></button>
                              </div>
                            </div>
                          ))}
                          {meal.items.length === 0 && <p className="text-xs text-slate-500 italic">No food added yet.</p>}
                        </div>

                        {/* INLINE SEARCH/ADD UI */}
                        {activeAddingMealId === meal.id && (
                          <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-purple-500/50 animate-in fade-in zoom-in-95 duration-200 relative">
                            <button onClick={() => setActiveAddingMealId(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={16}/></button>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Select from Database</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                              {[...recipes, ...ingredients].map(ing => (
                                <div key={ing.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                      {ing.items ? <ChefHat size={12} className="text-yellow-400"/> : <Apple size={12} className="text-orange-400"/>} 
                                      {ing.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input type="number" placeholder={ing.baseQuantity} id={`qty-${meal.id}-${ing.id}`} className="w-14 bg-slate-800 text-white font-bold p-1.5 rounded-md text-center text-xs focus:outline-none focus:ring-1 ring-purple-500" />
                                    <span className="text-[10px] text-slate-400 w-8">{ing.unit}</span>
                                    <button onClick={() => {
                                      const val = document.getElementById(`qty-${meal.id}-${ing.id}`).value || ing.baseQuantity;
                                      addItemToDraftMeal(ing, val, !!ing.items);
                                    }} className="bg-purple-500 text-white p-1.5 rounded-md hover:bg-purple-600 transition-colors">
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={saveTemplate} className="w-full bg-purple-500 text-white py-4 rounded-full font-extrabold text-lg shadow-lg hover:bg-purple-600 transition-colors">SAVE MEAL PLAN</button>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 2: MEAL ASSIGNER (SCHEDULE) ==================== */}
          {activeTab === 'assigner' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3"><CalendarClock className="text-blue-400" size={32} /> Schedule</h2>
                  <p className="text-slate-400 text-sm mt-1">Assign your meal blueprints to match your workouts.</p>
                </div>
                <button onClick={clearAllPlans} className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-2 rounded-lg transition-colors">Reset All</button>
              </div>

              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-2xl space-y-3">
                {days.map(day => {
                  const currentAssignedId = assignedPlans[day];
                  const isToday = day === actualToday;
                  const workoutForDay = weeklyPlan[day];

                  return (
                    <div key={day} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-colors ${isToday ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-950 border-slate-800'}`}>
                      
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className={`w-12 text-center text-xs font-bold uppercase ${isToday ? 'text-white' : 'text-slate-500'}`}>{day.substring(0,3)}</div>
                        <div>
                           {/* SHOWS BOTH THE WORKOUT AND THE MEAL PLAN TOGETHER */}
                           <p className="text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1"><Activity size={12}/> {workoutForDay.title}</p>
                           {currentAssignedId ? (
                             <div className="text-blue-400 text-sm font-bold flex items-center gap-1">
                               <Utensils size={14}/> {mealTemplates.find(t => t.id === currentAssignedId)?.name || 'Deleted Plan'}
                             </div>
                           ) : (
                             <div className="text-slate-600 text-sm font-medium italic flex items-center gap-1"><Utensils size={14}/> No meals assigned</div>
                           )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select 
                          value={currentAssignedId || ''} 
                          onChange={(e) => assignPlanToDay(day, e.target.value)} 
                          className="flex-1 md:w-48 bg-slate-800 text-white text-sm font-bold p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 appearance-none"
                        >
                          <option value="" disabled>Select a meal plan...</option>
                          {mealTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        {currentAssignedId && (
                          <button onClick={() => clearDayPlan(day)} className="bg-slate-800 p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"><Trash2 size={18}/></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: DIET (THE AUTO-LOGGER) ==================== */}
          {activeTab === 'nutrition' && (
             <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3"><Utensils className="text-rose-400" size={32} /> Today's Log</h2>
                  <p className="text-slate-400 text-sm mt-1">Your daily plate. Plans auto-load automatically.</p>
                </div>
              </div>

              {calcResults && (
                <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                  {(() => {
                    const isOver = consumed.calories >= calcResults.calories;
                    const diff = Math.abs(calcResults.calories - consumed.calories);
                    const mainColor = isOver ? 'text-indigo-400' : 'text-amber-400';
                    const mainBg = isOver ? 'bg-indigo-500' : 'bg-amber-500';
                    const message = isOver 
                      ? `Goal Reached! +${diff} kcal buffer. Perfect for lean gains!` 
                      : `${diff} kcal remaining for today.`;

                    return (
                      <div className="mb-8">
                        <div className={`p-4 rounded-2xl mb-4 text-center font-bold text-sm ${isOver ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                          {isOver && <CheckCircle2 size={16} className="inline mr-2 text-indigo-400" />} {message}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
                            <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${mainBg}`} style={{ width: `${Math.min(100, (consumed.calories / calcResults.calories) * 100)}%` }}></div>
                            <p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL KCAL</p>
                            <p className={`text-2xl font-black ${mainColor}`}>{consumed.calories}</p>
                            <p className="text-[10px] text-slate-500 mt-1">Goal: {calcResults.calories}</p>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-500" style={{ width: `${Math.min(100, (consumed.protein / calcResults.protein) * 100)}%` }}></div>
                            <p className="text-[10px] text-slate-400 font-bold mb-1">PROTEIN</p>
                            <p className="text-2xl font-black text-rose-400">{Math.round(consumed.protein)}g</p>
                            <p className="text-[10px] text-slate-500 mt-1">Goal: {calcResults.protein}g</p>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-500" style={{ width: `${Math.min(100, (consumed.carbs / calcResults.carbs) * 100)}%` }}></div>
                            <p className="text-[10px] text-slate-400 font-bold mb-1">CARBS</p>
                            <p className="text-2xl font-black text-cyan-400">{Math.round(consumed.carbs)}g</p>
                            <p className="text-[10px] text-slate-500 mt-1">Goal: {calcResults.carbs}g</p>
                          </div>
                          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-500" style={{ width: `${Math.min(100, (consumed.fat / calcResults.fat) * 100)}%` }}></div>
                            <p className="text-[10px] text-slate-400 font-bold mb-1">FAT</p>
                            <p className="text-2xl font-black text-yellow-400">{Math.round(consumed.fat)}g</p>
                            <p className="text-[10px] text-slate-500 mt-1">Goal: {calcResults.fat}g</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                    <span>Scheduled Plan</span>
                    {todaysPlan && <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-[10px]">{todaysPlan.name}</span>}
                  </h3>
                  
                  {!todaysPlan ? (
                    <div className="text-center p-6 border-2 border-dashed border-slate-800 rounded-3xl mb-6">
                      <p className="text-slate-500 font-bold">No plan assigned for today.</p>
                      <button onClick={() => setActiveTab('assigner')} className="text-blue-400 text-xs font-bold mt-2 hover:underline">Go to Schedule</button>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8">
                      {todaysPlan.meals.map(meal => (
                        <div key={meal.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                          <h4 className="font-bold text-white mb-2">{meal.name}</h4>
                          {meal.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm mb-1 last:mb-0">
                              <span className="text-slate-300">{item.qty}{item.unit} {item.name}</span>
                              <span className="text-slate-500 text-xs font-bold">{item.calories} kcal</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Extra Additions</h3>
                      <button onClick={() => setActiveExtraAdd(!activeExtraAdd)} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <Plus size={14} /> Add Extra
                      </button>
                    </div>

                    {activeExtraAdd && (
                      <div className="mb-4 bg-slate-950 p-4 rounded-xl border border-emerald-500/50 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-xs font-bold text-slate-500 mb-3">Add outside of plan:</h4>
                        <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                          {[...recipes, ...ingredients].map(ing => (
                            <div key={ing.id} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                              <p className="text-sm font-bold text-white">{ing.name}</p>
                              <div className="flex items-center gap-2">
                                <input type="number" placeholder={ing.baseQuantity} id={`extra-${ing.id}`} className="w-14 bg-slate-800 text-white font-bold p-1 rounded-md text-center text-xs focus:outline-none" />
                                <span className="text-[10px] text-slate-400 w-8">{ing.unit}</span>
                                <button onClick={() => {
                                  const val = document.getElementById(`extra-${ing.id}`).value || ing.baseQuantity;
                                  addExtraToToday(ing, val);
                                }} className="bg-emerald-500 text-white p-1.5 rounded-md hover:bg-emerald-600 transition-colors"><Plus size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dailyExtras.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center p-4">You haven't deviated from the plan today. Great job!</p>
                    ) : (
                      <div className="space-y-2">
                        {dailyExtras.map(ext => (
                          <div key={ext.logId} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold text-white">{ext.name}</p>
                              <p className="text-[10px] text-amber-400 font-bold">+{ext.calories} kcal</p>
                            </div>
                            <button onClick={() => setDailyExtras(dailyExtras.filter(e => e.logId !== ext.logId))} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
             </div>
          )}

          {/* ==================== TAB 4: TRAINING (SETS & REPS OVERHAUL) ==================== */}
          {activeTab === 'training' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-6 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-3 min-w-max px-2">
                  {days.map((day) => {
                    const isToday = day === actualToday;
                    const isSelected = day === selectedDay;
                    return (
                      <button key={day} onClick={() => setSelectedDay(day)} className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${isSelected ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105' : isToday ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}>
                        <span className="text-[10px] font-bold uppercase mb-1">{day.substring(0, 3)}</span>
                        {isToday && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-cyan-500'}`}></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-cyan-400 font-bold text-sm uppercase mb-1 flex items-center gap-2"><Calendar size={16} /> {selectedDay}'s Workout</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">{selectedWorkout.title}</h2>
                  </div>
                </div>

                {selectedWorkout.exercises.length === 0 ? (
                  <div className="text-center p-10 bg-slate-800/50 rounded-3xl border border-slate-700/50 mt-4">
                    <p className="text-xl font-bold text-slate-300">Rest Day.</p>
                    <p className="text-sm text-slate-500 mt-2">Muscles grow outside the gym, not inside it.</p>
                  </div>
                ) : (
                  <div className="space-y-6 mt-6">
                    {selectedWorkout.exercises.map((exercise, idx) => (
                      <div key={idx} className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
                          <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                          {exercise.rest > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg">
                              <Timer size={14}/> Rest: {exercise.rest}s
                            </span>
                          )}
                        </div>
                        
                        {/* SETS RENDERER */}
                        <div className="space-y-3">
                          {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                            const currentVal = (workoutInputs[exercise.name] && workoutInputs[exercise.name][setIdx]) || {weight: '', reps: ''};
                            return (
                              <div key={setIdx} className="flex items-center justify-between gap-4">
                                <span className="text-sm font-bold text-slate-400 w-12">Set {setIdx + 1}</span>
                                <div className="flex gap-3 flex-1 justify-end">
                                  <div className="relative w-24 sm:w-32">
                                    <input type="number" placeholder="kg" value={currentVal.weight} onChange={(e) => handleWorkoutInput(exercise.name, setIdx, 'weight', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-black text-white text-center focus:outline-none focus:border-cyan-500 transition-colors" />
                                  </div>
                                  <div className="relative w-24 sm:w-32">
                                    <input type="number" placeholder="reps" value={currentVal.reps} onChange={(e) => handleWorkoutInput(exercise.name, setIdx, 'reps', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-black text-white text-center focus:outline-none focus:border-cyan-500 transition-colors" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button onClick={saveWorkoutSession} className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-full font-extrabold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20"><Save size={20} /> SAVE {selectedDay.toUpperCase()} SESSION</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: FOODS ==================== */}
          {activeTab === 'ingredients' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3"><Apple className="text-orange-400" size={32} /> Food Database</h2>
                  <p className="text-slate-400 text-sm mt-1">Raw ingredients and their base macros.</p>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {ingredientCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveIngredientFilter(cat)} className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${activeIngredientFilter === cat ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 p-1 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all">
                <button onClick={() => {
                  if (showAddIngredient) {
                    setShowAddIngredient(false);
                    setEditingIngredientId(null);
                    setNewIngredient({ name: '', category: 'Proteins', baseQuantity: 100, unit: 'g', protein: '', carbs: '', fat: '' });
                  } else {
                    setShowAddIngredient(true);
                  }
                }} className="w-full p-4 flex items-center justify-between text-orange-400 font-bold hover:bg-slate-800/50 transition-colors rounded-2xl">
                  <span className="flex items-center gap-2"><Plus size={20}/> {editingIngredientId ? 'Edit Ingredient' : 'Add Custom Ingredient'}</span>
                  <ChevronRight className={`transition-transform duration-300 ${showAddIngredient ? 'rotate-90' : ''}`} />
                </button>
                
                {showAddIngredient && (
                  <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">FOOD NAME</label>
                        <input type="text" value={newIngredient.name} onChange={(e)=>setNewIngredient({...newIngredient, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500" placeholder="e.g. Bangus" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">CATEGORY</label>
                        <select value={newIngredient.category} onChange={(e)=>setNewIngredient({...newIngredient, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500">
                          <option>Proteins</option><option>Carbs</option><option>Fats</option><option>Spices</option><option>Sauces</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">BASE QUANTITY</label>
                        <input type="number" value={newIngredient.baseQuantity} onChange={(e)=>setNewIngredient({...newIngredient, baseQuantity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500" placeholder="100" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">UNIT</label>
                        <input type="text" value={newIngredient.unit} onChange={(e)=>setNewIngredient({...newIngredient, unit: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500" placeholder="g, ml, cup, tbsp" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div><label className="text-[10px] font-bold text-rose-400 mb-1 block">PRO (g)</label><input type="number" value={newIngredient.protein} onChange={(e)=>setNewIngredient({...newIngredient, protein: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-center" /></div>
                      <div><label className="text-[10px] font-bold text-cyan-400 mb-1 block">CARBS (g)</label><input type="number" value={newIngredient.carbs} onChange={(e)=>setNewIngredient({...newIngredient, carbs: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-center" /></div>
                      <div><label className="text-[10px] font-bold text-yellow-400 mb-1 block">FAT (g)</label><input type="number" value={newIngredient.fat} onChange={(e)=>setNewIngredient({...newIngredient, fat: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 text-center" /></div>
                    </div>
                    <button onClick={saveIngredient} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-colors">{editingIngredientId ? 'UPDATE INGREDIENT' : 'SAVE INGREDIENT'}</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {filteredIngredients.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between group hover:border-orange-500/50 transition-colors relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white text-lg leading-tight">{item.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">Per {item.baseQuantity} {item.unit}</p>
                      </div>
                      <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editIngredient(item)} className="p-1.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"><Edit3 size={14}/></button>
                        <button onClick={() => deleteIngredient(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs font-bold mt-1">
                      <span className="text-amber-400">{item.calories} kcal</span>
                      <span className="text-rose-400">P: {item.protein}g</span>
                      <span className="text-cyan-400">C: {item.carbs}g</span>
                      <span className="text-yellow-400">F: {item.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 6: RECIPES ==================== */}
          {activeTab === 'recipes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3"><ChefHat className="text-yellow-400" size={32} /> My Recipes</h2>
                  <p className="text-slate-400 text-sm mt-1">Combine ingredients into custom meals.</p>
                </div>
              </div>
              
              {!isCreatingRecipe ? (
                <>
                  <button onClick={() => setIsCreatingRecipe(true)} className="w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-yellow-400 text-yellow-400 py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 transition-colors group">
                    <Plus size={32} className="group-hover:scale-110 transition-transform" /> Create New Recipe
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {recipes.map(recipe => (
                      <div key={recipe.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6 pb-4 relative">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><Utensils size={80} /></div>
                          <h3 className="font-bold text-white text-xl mb-1 relative z-10">{recipe.name}</h3>
                          <p className="text-xs text-slate-400 mb-4 relative z-10">{recipe.items.map(i => `${i.qty}${i.unit} ${i.name}`).join(', ')}</p>
                          
                          <div className="flex gap-4 text-sm font-bold relative z-10">
                            <div className="text-amber-400">{recipe.calories} <span className="text-[10px] text-slate-500">KCAL</span></div>
                            <div className="text-rose-400">{recipe.protein}g <span className="text-[10px] text-slate-500">PRO</span></div>
                            <div className="text-cyan-400">{recipe.carbs}g <span className="text-[10px] text-slate-500">CARB</span></div>
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 border-t border-slate-800 flex justify-end gap-3 mt-auto relative z-10">
                          <button onClick={() => editRecipe(recipe)} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"><Edit3 size={14} /> Edit</button>
                          <button onClick={() => deleteRecipe(recipe.id)} className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-xs font-bold transition-colors"><Trash2 size={14} /> Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl relative">
                  <button onClick={() => { setIsCreatingRecipe(false); setEditingRecipeId(null); setDraftRecipeName(''); setDraftRecipeItems([]); }} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
                  <h3 className="text-xl font-bold text-white mb-6">{editingRecipeId ? 'Edit Recipe' : 'Recipe Builder'}</h3>
                  
                  <input type="text" placeholder="Recipe Name (e.g. Morning Oats)" value={draftRecipeName} onChange={(e)=>setDraftRecipeName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xl font-bold text-white focus:outline-none focus:border-yellow-500 mb-6" />

                  {/* Live Totals */}
                  <div className="grid grid-cols-4 gap-2 text-center mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL KCAL</p><p className="text-xl font-black text-amber-400">{Math.round(recipeDraftTotals.calories)}</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL PRO</p><p className="text-xl font-black text-rose-400">{Math.round(recipeDraftTotals.protein)}g</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL CARB</p><p className="text-xl font-black text-cyan-400">{Math.round(recipeDraftTotals.carbs)}g</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold mb-1">TOTAL FAT</p><p className="text-xl font-black text-yellow-400">{Math.round(recipeDraftTotals.fat)}g</p></div>
                  </div>

                  {/* Added Ingredients List */}
                  {draftRecipeItems.length > 0 && (
                    <div className="mb-6 space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">Ingredients Added</h4>
                      {draftRecipeItems.map((d, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                          <span className="font-bold text-sm text-white">{d.qty}{d.unit} {d.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">{d.calories} kcal</span>
                            <button onClick={() => setDraftRecipeItems(draftRecipeItems.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search & Add Ingredients */}
                  <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Search size={14}/> Search Database</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                      {ingredients.map(ing => (
                        <div key={ing.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{ing.name}</p>
                            <p className="text-[10px] text-slate-500">Base: {ing.baseQuantity}{ing.unit} ({ing.calories} kcal)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" placeholder={ing.baseQuantity} id={`rec-qty-${ing.id}`} className="w-16 bg-slate-800 text-white font-bold p-2 rounded-lg text-center text-sm focus:outline-none focus:ring-1 ring-yellow-500" />
                            <span className="text-xs text-slate-400 w-8">{ing.unit}</span>
                            <button onClick={() => {
                              const val = document.getElementById(`rec-qty-${ing.id}`).value || ing.baseQuantity;
                              addIngredientToRecipe(ing, val);
                              document.getElementById(`rec-qty-${ing.id}`).value = '';
                            }} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:bg-yellow-500 hover:text-white transition-colors"><Plus size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={saveRecipe} className="w-full bg-yellow-500 text-slate-950 py-4 rounded-full font-extrabold text-lg shadow-lg hover:bg-yellow-400 transition-colors">SAVE RECIPE</button>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 7: HISTORY / PROGRESS ==================== */}
          {activeTab === 'progress' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {progressView === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => setProgressView('workouts')} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:bg-slate-800 transition-colors flex items-center justify-between group shadow-xl"><div className="flex items-center gap-4"><div className="bg-cyan-500/20 p-3 rounded-2xl"><Dumbbell className="text-cyan-400" size={24}/></div><div className="text-left"><h3 className="font-bold text-white text-lg">Workout Logs</h3><p className="text-sm text-slate-400">View past weights & reps</p></div></div><ChevronRight className="text-slate-600 group-hover:text-cyan-400 transition-colors" /></button>
                    <button onClick={() => setProgressView('metrics')} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:bg-slate-800 transition-colors flex items-center justify-between group shadow-xl"><div className="flex items-center gap-4"><div className="bg-emerald-500/20 p-3 rounded-2xl"><Ruler className="text-emerald-400" size={24}/></div><div className="text-left"><h3 className="font-bold text-white text-lg">Body Metrics</h3><p className="text-sm text-slate-400">View weight, measurements & photos</p></div></div><ChevronRight className="text-slate-600 group-hover:text-emerald-400 transition-colors" /></button>
                  </div>
                  <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl mt-6">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Target size={24} className="text-emerald-500"/> New Entry</h2>
                    <p className="text-xs text-slate-400 mb-6">Log your metrics. For a lean bulk, tracking hips and arms tells you if you are building muscle!</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 focus-within:border-emerald-500"><label className="block text-[10px] font-bold text-slate-500 text-center mb-1">WEIGHT (KG)</label><input type="number" value={trackWeight} onChange={(e)=>setTrackWeight(e.target.value)} className="w-full bg-transparent text-2xl font-black text-white text-center focus:outline-none" placeholder="0.0" /></div>
                      <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 focus-within:border-emerald-500"><label className="block text-[10px] font-bold text-slate-500 text-center mb-1">WAIST (INCHES)</label><input type="number" value={trackWaist} onChange={(e)=>setTrackWaist(e.target.value)} className="w-full bg-transparent text-2xl font-black text-white text-center focus:outline-none" placeholder="0" /></div>
                      <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 focus-within:border-emerald-500"><label className="block text-[10px] font-bold text-slate-500 text-center mb-1">HIPS / GLUTES (INCHES)</label><input type="number" value={trackHip} onChange={(e)=>setTrackHip(e.target.value)} className="w-full bg-transparent text-2xl font-black text-white text-center focus:outline-none" placeholder="0" /></div>
                      <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 focus-within:border-emerald-500"><label className="block text-[10px] font-bold text-slate-500 text-center mb-1">ARM / BICEP (INCHES)</label><input type="number" value={trackArm} onChange={(e)=>setTrackArm(e.target.value)} className="w-full bg-transparent text-2xl font-black text-white text-center focus:outline-none" placeholder="0" /></div>
                    </div>

                    <div className="mb-6 relative">
                      <input type="file" accept="image/*" id="photo-upload" className="hidden" onChange={handlePhotoSelect} />
                      {!photoPreview ? (
                        <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-950/30 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                          <Camera size={40} className="text-slate-500 group-hover:text-emerald-400 mb-2 transition-colors" />
                          <span className="text-sm font-bold text-slate-400">Tap to attach weekly progress photo</span>
                        </label>
                      ) : (
                        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 h-64 bg-slate-800">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-contain" />
                          <label htmlFor="photo-upload" className="absolute top-3 right-3 bg-slate-900/80 p-2 rounded-full cursor-pointer hover:bg-emerald-500 transition-colors"><ImagePlus size={20} className="text-white" /></label>
                        </div>
                      )}
                    </div>

                    <button onClick={saveWeeklyProgress} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-full font-extrabold text-lg shadow-lg hover:scale-[1.02] transition-all">SAVE ENTRY</button>
                  </div>
                </>
              )}
              {progressView === 'workouts' && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setProgressView('overview')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-bold text-sm"><ChevronLeft size={16} /> Back to Overview</button>
                  <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Dumbbell size={24} className="text-cyan-400"/> Workout Logs</h2>
                    
                    <div className="space-y-8">
                      {Object.entries(groupedHistory).map(([date, data]) => (
                        <div key={date} className="border-b border-slate-800 pb-8 last:border-0 last:pb-0">
                          <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                            <CalendarDays size={16} /> {date} ({data.day})
                          </h3>
                          <div className="space-y-3">
                            {data.exercises.map(log => (
                              <div key={log.id} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 relative group">
                                <button onClick={() => deleteWorkoutLog(log.id)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                <p className="text-white font-bold mb-3">{log.exercise}</p>
                                <div className="space-y-1">
                                  {log.sets.map((s, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-700/30 last:border-0 pb-1 last:pb-0">
                                      <span className="text-slate-400">Set {s.set}</span>
                                      <span className="font-bold text-white">{s.weight} kg <span className="text-slate-500 font-normal mx-1">x</span> {s.reps}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {progressView === 'metrics' && (
                 <div className="animate-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setProgressView('overview')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-bold text-sm"><ChevronLeft size={16} /> Back to Overview</button>
                  <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Ruler size={24} className="text-emerald-400"/> Body Metrics</h2>
                    <div className="space-y-4">
                      {mockMeasurementHistory.map((log) => (
                        <div key={log.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col gap-4 justify-between items-start relative group">
                          <button onClick={() => deleteMeasurementLog(log.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                          <p className="text-xs text-emerald-400 font-bold">{log.date}</p>
                          <div className="flex flex-wrap gap-4 md:gap-6 w-full">
                            <div><p className="text-[10px] text-slate-400 font-bold">WEIGHT</p><p className="text-xl font-black text-white">{log.weight} kg</p></div>
                            {log.waist && <div><p className="text-[10px] text-slate-400 font-bold">WAIST</p><p className="text-xl font-black text-white">{log.waist}"</p></div>}
                            {log.hip && <div><p className="text-[10px] text-slate-400 font-bold">HIPS</p><p className="text-xl font-black text-white">{log.hip}"</p></div>}
                            {log.arm && <div><p className="text-[10px] text-slate-400 font-bold">ARM</p><p className="text-xl font-black text-white">{log.arm}"</p></div>}
                          </div>
                          {log.hasPhoto && (
                            <button className="mt-2 bg-slate-900 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-2"><Camera size={14} /> View Photo</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 8: LEARN (MASTERCLASS) ==================== */}
          {activeTab === 'learn' && (
             <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2rem] border border-indigo-500/30 shadow-2xl text-center">
                  <BookOpen size={48} className="text-indigo-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-white mb-2">The Masterclass</h2>
                  <p className="text-indigo-200">Understand the 'why' behind your program to build lifelong habits.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* CHAPTER 1 */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-3">1. The Metabolism Engine</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p><strong className="text-white">BMR (Basal Metabolic Rate):</strong> Imagine your body is a parked car with the engine running. BMR is the fuel burned just keeping the engine on—your heart beating, lungs breathing, and brain working.</p>
                    <p><strong className="text-white">TEF (Thermic Effect of Food):</strong> You actually burn calories digesting food! Protein requires the most energy to digest (up to 30% of its calories are burned during digestion).</p>
                    <p><strong className="text-white">Activity Multiplier:</strong> If you take that parked car for a drive, you burn more gas. We multiply your BMR by a factor (e.g., 1.2 for sedentary + light gym) to account for daily movement.</p>
                    <p><strong className="text-white">TDEE (Total Daily Energy Expenditure):</strong> BMR + TEF + Activity. This is the total number of calories you burn in 24 hours.</p>
                  </div>
                 </div>

                 {/* CHAPTER 2 */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-xl font-bold text-rose-400 mb-4 border-b border-slate-800 pb-3">2. The Scientific Formulas</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p>Calculators use formulas to guess your BMR. Here are the big three, dynamically calculated for you right now (Weight: {weight}kg, Height: {height}cm, Age: {age}):</p>
                    <ul className="space-y-3 mt-2">
                      <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <strong className="text-rose-400">Mifflin-St Jeor: {mifflinBMR} kcal</strong><br/>
                        <span className="text-xs text-slate-500">The modern gold standard. Used by default in this app.</span>
                      </li>
                      <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <strong className="text-amber-400">Harris-Benedict: {harrisBMR} kcal</strong><br/>
                        <span className="text-xs text-slate-500">The older 1919 formula, slightly overestimates BMR.</span>
                      </li>
                      <li className="bg-slate-950 p-3 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500">
                        <strong className="text-emerald-400">Katch-McArdle: {katchBMRText}</strong><br/>
                        <span className="text-xs text-slate-500">The most accurate for athletes. It subtracts fat to find your <strong>Lean Body Mass (LBM)</strong>, because muscle burns way more calories than fat!</span>
                      </li>
                    </ul>
                  </div>
                 </div>

                 {/* CHAPTER 3 */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-xl font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-3">3. Progressive Overload</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p><strong className="text-white">When to move the weights up?</strong> Use the "2-for-2" scientific rule.</p>
                    <p>If your goal is 10 reps, and you can successfully perform <strong>12 reps on your last set, for two consecutive workouts in a row</strong>, your muscle has fully adapted. It is time to move the weight up by the smallest increment possible (e.g., 1 to 2.5 kg).</p>
                    <p>If the last set is incredibly hard and your reps drop (e.g., you hit 10, then 9, then 7), do not move the weight up yet. Your body is still being sufficiently challenged by the current weight!</p>
                  </div>
                 </div>

                 {/* CHAPTER 4 */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-800 pb-3">4. Rest Periods & Sets</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p><strong className="text-white">Why rest 90-120 seconds?</strong> Muscle growth (hypertrophy) requires ATP (cellular energy). It takes about 90 seconds for your body to naturally replenish ATP. If you rest only 30 seconds, you are doing cardio, not building muscle.</p>
                    <p><strong className="text-white">Straight Sets vs. Advanced Sets:</strong> We are using "Straight Sets" (doing a set, resting, doing another). Advanced variations like <em>Supersets</em> (doing two exercises back-to-back with no rest) or <em>Drop Sets</em> (lowering weight rapidly to failure) are great for saving time, but straight sets are clinically proven to be the absolute best way to build a foundation of lean mass safely.</p>
                  </div>
                 </div>

                 {/* CHAPTER 5: WEEKLY VOLUME (NEW) */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-xl font-bold text-orange-400 mb-4 border-b border-slate-800 pb-3">5. Weekly Training Volume</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p><strong className="text-white">How many sets per week?</strong> Sports science generally recommends <strong>10 to 20 sets per muscle group per week</strong> for maximum hypertrophy. However, context matters!</p>
                    <p><strong className="text-white">The Sweet Spot:</strong> If you are new to lifting or focusing on a lean bulk, jumping straight to 20 sets is "junk volume." It causes excessive inflammation, forcing your body to spend all its surplus calories repairing damage instead of building new muscle. That's why this program starts you in the highly effective <strong>6 to 10 sets per week</strong> range.</p>
                    <p><strong className="text-white">When to increase volume:</strong> As you become an advanced lifter, 6-10 sets might no longer trigger growth. When your strength plateaus for several weeks, you can gradually push closer to that 10-20 set range by adding a 4th set to your exercises or adding a new isolation movement!</p>
                  </div>
                 </div>

                 {/* CHAPTER 6 (Renumbered) */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-slate-800 pb-3">6. Muscle Fibers & Genetics</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p>Why are some people naturally great marathon runners, while others are incredibly strong powerlifters? It comes down to genetics and muscle fibers.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <strong className="text-red-400 block mb-1">Type 1 (Slow-Twitch)</strong>
                        These fibers use oxygen efficiently for continuous, extended muscle contractions. Think of a marathon runner. They are very hard to fatigue, but they do not produce much power, and they do not grow very large.
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <strong className="text-blue-400 block mb-1">Type 2 (Fast-Twitch)</strong>
                        These fibers fire quickly and generate explosive force. Think of a sprinter or bodybuilder. They fatigue very quickly, but they are the fibers most responsible for <strong>visible muscle growth</strong> (hypertrophy).
                      </div>
                    </div>
                    <p className="mt-2">Lifting weights in the 8-12 rep range targets those Type 2 Fast-Twitch fibers, forcing them to adapt and grow larger to handle the heavy load next time!</p>
                  </div>
                 </div>

                 {/* CHAPTER 7 (Renumbered) */}
                 <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl md:col-span-2">
                  <h3 className="text-xl font-bold text-amber-400 mb-4 border-b border-slate-800 pb-3">7. The Science of the "Lean Bulk"</h3>
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p>To gain weight, you must consume more calories than your TDEE. This is a <strong>Caloric Surplus</strong>. If you eat a massive 1,000-calorie surplus (a "dirty bulk"), your body will build muscle, but it will store the remaining 700 calories as pure body fat.</p>
                    <p>Instead, we use a <strong>Lean Bulk (+250 kcal)</strong>. This tiny surplus provides exactly enough energy to fuel muscle synthesis without spilling over into excess fat storage.</p>
                    <p><strong className="text-white">When to change your calories:</strong> Weigh yourself weekly. The goal is to gain about 0.5kg to 1kg per month. If your weight stalls and stays exactly the same for two full weeks, congratulations—your metabolism has adapted! Your body is burning more calories because it has more muscle. At this point, simply add <strong>+100 to +150 calories</strong> to your daily target (usually in the form of extra carbs like an extra cup of rice) to keep growing.</p>
                  </div>
                 </div>

               </div>
             </div>
          )}

        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50 p-3 pb-safe flex overflow-x-auto scrollbar-hide z-50">
        <div className="flex w-full justify-between min-w-max px-2 gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 min-w-[3rem] ${activeTab === item.id ? `${item.color} scale-110 -translate-y-1` : 'text-slate-500 hover:text-slate-400'}`}>
                <Icon size={20} />
                <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}