"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, Utensils, Calendar, Calculator, ChevronRight, 
  Save, BookOpen, Target, Camera, ImagePlus, CheckCircle2, 
  History, ChevronLeft, Dumbbell, Ruler, Apple, Plus, PieChart, 
  Trash2, ChefHat, Search, X, CalendarDays, CalendarClock, Compass,
  Edit3, Timer, Lock, User, Eye, EyeOff, ClipboardList
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// Safely initialize Firebase so it compiles correctly in all environments
const safeEnv = typeof process !== 'undefined' ? process.env : {};

const firebaseConfig = {
  apiKey: safeEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-key",
  authDomain: safeEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain",
  projectId: safeEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: safeEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: safeEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: safeEnv.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const isMock = firebaseConfig.apiKey === "mock-key"; 

// ============================================================================
// --- DEFAULT SEED DATA (Nutrition & Fitness) ---
// ============================================================================
const DEFAULT_INGREDIENTS = [
  { id: 'i1', name: "Chicken Breast", category: "Proteins", baseQuantity: 100, unit: "g", protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  { id: 'i2', name: "Whole Egg", category: "Proteins", baseQuantity: 1, unit: "Large", protein: 6, carbs: 0.6, fat: 5, calories: 72 },
  { id: 'i3', name: "Whey Protein", category: "Proteins", baseQuantity: 1, unit: "Scoop", protein: 25, carbs: 3, fat: 2, calories: 120 },
  { id: 'i4', name: "White Rice (Cooked)", category: "Carbs", baseQuantity: 100, unit: "g", protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  { id: 'i5', name: "Kamote (Sweet Potato)", category: "Carbs", baseQuantity: 100, unit: "g", protein: 1.6, carbs: 20, fat: 0.1, calories: 86 },
  { id: 'i6', name: "Rolled Oats", category: "Carbs", baseQuantity: 50, unit: "g", protein: 6.5, carbs: 34, fat: 3.2, calories: 189 },
  { id: 'i7', name: "Peanut Butter", category: "Fats", baseQuantity: 1, unit: "Tbsp", protein: 4, carbs: 3, fat: 8, calories: 95 },
];

const DEFAULT_RECIPES = [
  {
    id: 'r1', name: "Power Banana Shake", baseQuantity: 1, unit: "Serving",
    calories: 310, protein: 29, carbs: 37, fat: 10,
    items: [{ name: "Whey Protein", qty: 1, unit: "Scoop", calories: 120, protein: 25, carbs: 3, fat: 2 }, { name: "Peanut Butter", qty: 1, unit: "Tbsp", calories: 95, protein: 4, carbs: 3, fat: 8 }]
  }
];

const DEFAULT_TEMPLATES = [
  {
    id: 't1', name: "Heavy Lifting Fuel", mealCount: 4, totalCalories: 1530, totalProtein: 102, totalCarbs: 185, totalFat: 42,
    meals: [
      { id: 'm1', name: 'Meal 1', items: [{ id: 'r1', name: 'Power Banana Shake', qty: 1, unit: 'Serving', calories: 310, protein: 29, carbs: 37, fat: 10 }] },
      { id: 'm2', name: 'Meal 2', items: [{ id: 'i1', name: 'Chicken Breast', qty: 150, unit: 'g', calories: 247, protein: 46, carbs: 0, fat: 5 }] },
      { id: 'm3', name: 'Meal 3', items: [{ id: 'i4', name: 'White Rice (Cooked)', qty: 150, unit: 'g', calories: 195, protein: 4, carbs: 42, fat: 0 }] },
      { id: 'm4', name: 'Meal 4', items: [{ id: 'i2', name: 'Whole Egg', qty: 2, unit: 'Large', calories: 144, protein: 12, carbs: 1, fat: 10 }] }
    ]
  }
];

const DEFAULT_EXERCISES = [
  { id: 'e1', name: "Goblet Squats", target: "Legs & Glutes", equipment: "Dumbbell" },
  { id: 'e2', name: "Dumbbell Rows", target: "Back", equipment: "Dumbbell" },
  { id: 'e3', name: "Dumbbell Chest Press", target: "Chest", equipment: "Dumbbell" },
  { id: 'e4', name: "Planks", target: "Core", equipment: "Bodyweight" },
  { id: 'e5', name: "Run (Moderate Pace)", target: "Cardio", equipment: "None" },
  { id: 'e6', name: "Romanian Deadlifts", target: "Legs & Glutes", equipment: "Dumbbell" },
  { id: 'e7', name: "Walking Lunges", target: "Legs & Glutes", equipment: "Dumbbell" },
  { id: 'e8', name: "Glute Bridges", target: "Legs & Glutes", equipment: "Bodyweight" },
  { id: 'e9', name: "Calf Raises", target: "Legs", equipment: "Bodyweight/Dumbbell" },
  { id: 'e10', name: "Overhead Press", target: "Shoulders", equipment: "Dumbbell" },
  { id: 'e11', name: "Lat Pulldowns", target: "Back", equipment: "Machine/Band" },
  { id: 'e12', name: "Bicep Curls", target: "Arms", equipment: "Dumbbell" },
  { id: 'e13', name: "Bicycle Crunches", target: "Core", equipment: "Bodyweight" },
  { id: 'e14', name: "Run (Distance)", target: "Cardio", equipment: "None" }
];

const DEFAULT_WORKOUT_TEMPLATES = [
  { id: 'wt1', title: "Full-Body Gym", isRest: false, exercises: [
    { id: 'e1', name: "Goblet Squats", sets: 3, rest: 90 }, { id: 'e2', name: "Dumbbell Rows", sets: 3, rest: 90 }, { id: 'e3', name: "Dumbbell Chest Press", sets: 3, rest: 90 }, { id: 'e4', name: "Planks", sets: 3, rest: 60 }
  ]},
  { id: 'wt2', title: "Short Island Run", isRest: false, exercises: [{ id: 'e5', name: "Run (Moderate Pace)", sets: 1, rest: 0 }] },
  { id: 'wt3', title: "Lower-Body Gym", isRest: false, exercises: [
    { id: 'e6', name: "Romanian Deadlifts", sets: 3, rest: 90 }, { id: 'e7', name: "Walking Lunges", sets: 3, rest: 90 }, { id: 'e8', name: "Glute Bridges", sets: 3, rest: 60 }, { id: 'e9', name: "Calf Raises", sets: 3, rest: 60 }
  ]},
  { id: 'wt4', title: "Active Rest", isRest: true, exercises: [] },
  { id: 'wt5', title: "Upper-Body & Core", isRest: false, exercises: [
    { id: 'e10', name: "Overhead Press", sets: 3, rest: 90 }, { id: 'e11', name: "Lat Pulldowns", sets: 3, rest: 90 }, { id: 'e12', name: "Bicep Curls", sets: 3, rest: 60 }, { id: 'e13', name: "Bicycle Crunches", sets: 3, rest: 60 }
  ]},
  { id: 'wt6', title: "Long Run", isRest: false, exercises: [{ id: 'e14', name: "Run (Distance)", sets: 1, rest: 0 }] },
  { id: 'wt7', title: "Full Rest & Recovery", isRest: true, exercises: [] }
];

const DEFAULT_SCHEDULE = {
  meals: { Monday: 't1', Tuesday: null, Wednesday: 't1', Thursday: null, Friday: 't1', Saturday: null, Sunday: null },
  workouts: { Monday: 'wt1', Tuesday: 'wt2', Wednesday: 'wt3', Thursday: 'wt4', Friday: 'wt5', Saturday: 'wt6', Sunday: 'wt7' }
};

// ============================================================================
// --- NAVIGATION ARCHITECTURE (MD3 EXPRESSIVE) ---
// ============================================================================
const MAIN_TABS = [
  { id: 'schedule', label: 'Schedule', icon: CalendarClock, color: 'text-blue-400', bgHover: 'hover:bg-blue-500/10', activeBg: 'bg-blue-500/20' },
  { id: 'workout', label: 'Workout', icon: Activity, color: 'text-cyan-400', bgHover: 'hover:bg-cyan-500/10', activeBg: 'bg-cyan-500/20' },
  { id: 'diet', label: 'Diet', icon: Utensils, color: 'text-rose-400', bgHover: 'hover:bg-rose-500/10', activeBg: 'bg-rose-500/20' },
  { id: 'progress', label: 'History', icon: History, color: 'text-emerald-400', bgHover: 'hover:bg-emerald-500/10', activeBg: 'bg-emerald-500/20' },
  { id: 'learn', label: 'Learn', icon: BookOpen, color: 'text-indigo-400', bgHover: 'hover:bg-indigo-500/10', activeBg: 'bg-indigo-500/20' },
];

const SUB_TABS = {
  workout: [
    { id: 'session', label: "Today's Session", icon: Dumbbell },
    { id: 'routines', label: "My Routines", icon: ClipboardList },
    { id: 'library', label: "Exercise Library", icon: Search },
  ],
  diet: [
    { id: 'log', label: "Today's Log", icon: PieChart },
    { id: 'targets', label: "Macro Goals", icon: Target },
    { id: 'plans', label: "Meal Plans", icon: CalendarDays },
    { id: 'recipes', label: "Recipes", icon: ChefHat },
    { id: 'foods', label: "Food Database", icon: Apple },
  ]
};

export default function GirlfriendFitnessApp() {
  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- NAVIGATION STATE ---
  const [mainTab, setMainTab] = useState('schedule');
  const [subTabs, setSubTabs] = useState({ workout: 'session', diet: 'log' });
  const [notification, setNotification] = useState('');
  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

  // --- STATE: PROFILE & MACRO CALCULATOR ---
  const [age, setAge] = useState(34);
  const [weight, setWeight] = useState(49);
  const [height, setHeight] = useState(157);
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  
  // Tunable Goals
  const [activityLevel, setActivityLevel] = useState(1.2);
  const [proteinPerKg, setProteinPerKg] = useState(1.6);
  const [fatPerKg, setFatPerKg] = useState(1.1);
  const [caloricSurplus, setCaloricSurplus] = useState(250);

  const [calcResults, setCalcResults] = useState({
    method: "Mifflin-St Jeor", tdee: 1400, calories: 1650, protein: 78, carbs: 213, fat: 54, bodyFat: null
  });

  // Calculate live preview whenever inputs change
  useEffect(() => {
    let bmr = 0; let bf = null; let method = "";
    const w = parseFloat(weight) || 49;
    const h = parseFloat(height) || 157;
    const a = parseFloat(age) || 34;
    
    if (neck && waist && hip) {
       const hInches = h / 2.54;
       // Female Navy Body Fat Formula (requires inches)
       bf = (163.205 * Math.log10(parseFloat(waist) + parseFloat(hip) - parseFloat(neck))) - (97.684 * Math.log10(hInches)) - 78.387;
       const lbm = w * (1 - bf / 100);
       bmr = 370 + (21.6 * lbm);
       method = "Katch-McArdle";
    } else {
       bmr = (10 * w) + (6.25 * h) - (5 * a) - 161; 
       method = "Mifflin-St Jeor";
    }
    
    const tdee = bmr * parseFloat(activityLevel);
    const targetCals = tdee + parseFloat(caloricSurplus);
    const pro = w * parseFloat(proteinPerKg);
    const f = w * parseFloat(fatPerKg);
    const carb = (targetCals - (pro * 4) - (f * 9)) / 4;

    setCalcResults({
      method, bodyFat: bf ? bf.toFixed(1) : null,
      tdee: Math.round(tdee), calories: Math.round(targetCals),
      protein: Math.round(pro), fat: Math.round(f), carbs: Math.round(carb)
    });
  }, [age, weight, height, neck, waist, hip, activityLevel, proteinPerKg, fatPerKg, caloricSurplus]);

  const saveProfile = async () => {
    const profileData = {
      age, weight, height, neck, waist, hip,
      activityLevel, proteinPerKg, fatPerKg, caloricSurplus,
      calcResults
    };
    if (!isMock) await setDoc(getDocRef('settings', 'profile'), profileData);
    showNotification("Profile & Macro Goals Saved!");
  };

  // --- FIREBASE AUTH LOGIC ---
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthChecking(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase not fully configured yet.", err);
      setAuthChecking(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) return setLoginError("Please enter email and password.");
    try {
      if (isMock) { setUser({ email, uid: 'mock-user-123' }); return; }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoginError("Incorrect email or password.");
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) {}
    setUser(null);
    localStorage.removeItem('islandGainsMainTab');
  };

  // UI STATE RETENTION
  useEffect(() => {
    if (user) {
      const savedMain = localStorage.getItem('islandGainsMainTab');
      if (savedMain) setMainTab(savedMain);
      
      const savedWorkoutSub = localStorage.getItem('islandGainsWorkoutSub');
      const savedDietSub = localStorage.getItem('islandGainsDietSub');
      setSubTabs(prev => ({
        workout: savedWorkoutSub || prev.workout,
        diet: savedDietSub || prev.diet
      }));
    }
  }, [user]);

  const switchMainTab = (tabId) => {
    setMainTab(tabId);
    localStorage.setItem('islandGainsMainTab', tabId);
    if (setProgressView) setProgressView('overview'); 
  };

  const switchSubTab = (parent, tabId) => {
    setSubTabs(prev => ({ ...prev, [parent]: tabId }));
    localStorage.setItem(`islandGains${parent.charAt(0).toUpperCase() + parent.slice(1)}Sub`, tabId);
  };

  // --- FIREBASE DATABASE PATH HELPERS ---
  const getDocRef = (colName, docId) => {
    const uid = user?.uid || 'guest';
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'island-gains';
    return doc(db, `artifacts/${appId}/users/${uid}/${colName}`, docId.toString());
  };

  // --- REAL-TIME DATABASE STATE ---
  const [ingredients, setIngredients] = useState(DEFAULT_INGREDIENTS);
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [mealTemplates, setMealTemplates] = useState(DEFAULT_TEMPLATES);
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [workoutTemplates, setWorkoutTemplates] = useState(DEFAULT_WORKOUT_TEMPLATES);
  const [assignedMeals, setAssignedMeals] = useState(DEFAULT_SCHEDULE.meals);
  const [assignedWorkouts, setAssignedWorkouts] = useState(DEFAULT_SCHEDULE.workouts);
  const [dailyExtras, setDailyExtras] = useState([]);
  const [mockWorkoutHistory, setMockWorkoutHistory] = useState([]);
  const [mockMeasurementHistory, setMockMeasurementHistory] = useState([]);

  // --- REAL-TIME CLOUD SYNC LOGIC ---
  useEffect(() => {
    if (!user || isMock) return;

    const uid = user.uid;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'island-gains';
    const basePath = `artifacts/${appId}/users/${uid}`;
    const unsubs = [];

    const syncCol = (colName, setter, seedData = null) => {
      let isFirstLoad = true;
      const unsubscribe = onSnapshot(collection(db, `${basePath}/${colName}`), (snap) => {
        if (snap.empty && isFirstLoad && seedData) {
          seedData.forEach(item => setDoc(doc(db, `${basePath}/${colName}`, item.id.toString()), item));
        } else {
          setter(snap.docs.map(d => d.data()));
        }
        isFirstLoad = false;
      }, (err) => console.error(`Error syncing ${colName}:`, err));
      unsubs.push(unsubscribe);
    };

    syncCol('ingredients', setIngredients, DEFAULT_INGREDIENTS);
    syncCol('recipes', setRecipes, DEFAULT_RECIPES);
    syncCol('mealTemplates', setMealTemplates, DEFAULT_TEMPLATES);
    syncCol('exercises', setExercises, DEFAULT_EXERCISES);
    syncCol('workoutTemplates', setWorkoutTemplates, DEFAULT_WORKOUT_TEMPLATES);
    syncCol('dailyExtras', setDailyExtras);
    syncCol('workoutHistory', setMockWorkoutHistory);
    syncCol('measurementHistory', setMockMeasurementHistory);

    const unsubSchedule = onSnapshot(doc(db, `${basePath}/settings`, 'schedule'), (docSnap) => {
      if (docSnap.exists()) { 
        const data = docSnap.data();
        if (data.meals) {
          setAssignedMeals(data.meals);
          setAssignedWorkouts(data.workouts || DEFAULT_SCHEDULE.workouts);
        } else {
          setAssignedMeals(data);
          setAssignedWorkouts(DEFAULT_SCHEDULE.workouts);
        }
      } else {
        setDoc(doc(db, `${basePath}/settings`, 'schedule'), DEFAULT_SCHEDULE);
      }
    });
    unsubs.push(unsubSchedule);

    const unsubProfile = onSnapshot(doc(db, `${basePath}/settings`, 'profile'), (docSnap) => {
      if (docSnap.exists()) {
        const p = docSnap.data();
        if (p.age) setAge(p.age);
        if (p.weight) setWeight(p.weight);
        if (p.height) setHeight(p.height);
        if (p.neck) setNeck(p.neck);
        if (p.waist) setWaist(p.waist);
        if (p.hip) setHip(p.hip);
        if (p.activityLevel) setActivityLevel(p.activityLevel);
        if (p.proteinPerKg) setProteinPerKg(p.proteinPerKg);
        if (p.fatPerKg) setFatPerKg(p.fatPerKg);
        if (p.caloricSurplus) setCaloricSurplus(p.caloricSurplus);
      }
    });
    unsubs.push(unsubProfile);

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  // ============================================================================
  // --- CLOUD CRUD: NUTRITION (Ingredients, Recipes, Meal Templates) ---
  // ============================================================================

  const [activeIngredientFilter, setActiveIngredientFilter] = useState('All');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: 'Proteins', baseQuantity: 100, unit: 'g', protein: '', carbs: '', fat: '' });
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  const ingredientCategories = ['All', 'Proteins', 'Carbs', 'Fats', 'Spices', 'Sauces'];
  const filteredIngredients = activeIngredientFilter === 'All' ? ingredients : ingredients.filter(i => i.category === activeIngredientFilter);

  const saveIngredient = async () => {
    if (!newIngredient.name || newIngredient.protein === '' || newIngredient.carbs === '' || newIngredient.fat === '') return showNotification("Fill all fields.");
    const addedItem = {
      id: editingIngredientId || `i${Date.now()}`, name: newIngredient.name, category: newIngredient.category,
      baseQuantity: parseFloat(newIngredient.baseQuantity), unit: newIngredient.unit,
      protein: parseFloat(newIngredient.protein), carbs: parseFloat(newIngredient.carbs), fat: parseFloat(newIngredient.fat), 
      calories: Math.round((parseFloat(newIngredient.protein) * 4) + (parseFloat(newIngredient.carbs) * 4) + (parseFloat(newIngredient.fat) * 9))
    };
    if (!isMock) await setDoc(getDocRef('ingredients', addedItem.id), addedItem);
    else editingIngredientId ? setIngredients(ingredients.map(i => i.id === editingIngredientId ? addedItem : i)) : setIngredients([addedItem, ...ingredients]);
    
    setNewIngredient({ name: '', category: 'Proteins', baseQuantity: 100, unit: 'g', protein: '', carbs: '', fat: '' });
    setShowAddIngredient(false); setEditingIngredientId(null); showNotification(`${addedItem.name} saved!`);
  };

  const editIngredient = (item) => {
    setNewIngredient({ name: item.name, category: item.category, baseQuantity: item.baseQuantity, unit: item.unit, protein: item.protein, carbs: item.carbs, fat: item.fat });
    setEditingIngredientId(item.id); setShowAddIngredient(true);
  };

  const deleteIngredient = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('ingredients', id));
    else setIngredients(ingredients.filter(i => i.id !== id));
    showNotification("Ingredient deleted.");
  };

  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [draftRecipeName, setDraftRecipeName] = useState('');
  const [draftRecipeItems, setDraftRecipeItems] = useState([]);

  const addIngredientToRecipe = (ing, qty) => {
    if (!qty || qty <= 0) return;
    const ratio = qty / ing.baseQuantity;
    const newItem = {
      id: ing.id, name: ing.name, qty: parseFloat(qty), unit: ing.unit, calories: Math.round(ing.calories * ratio),
      protein: Math.round(ing.protein * ratio * 10)/10, carbs: Math.round(ing.carbs * ratio * 10)/10, fat: Math.round(ing.fat * ratio * 10)/10
    };
    setDraftRecipeItems([...draftRecipeItems, newItem]);
  };

  const recipeDraftTotals = draftRecipeItems.reduce((acc, curr) => ({ calories: acc.calories + curr.calories, protein: acc.protein + curr.protein, carbs: acc.carbs + curr.carbs, fat: acc.fat + curr.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const saveRecipe = async () => {
    if (!draftRecipeName || draftRecipeItems.length === 0) return showNotification("Need a name and ingredients!");
    const newRecipe = {
      id: editingRecipeId || `r${Date.now()}`, name: draftRecipeName, baseQuantity: 1, unit: "Serving",
      calories: Math.round(recipeDraftTotals.calories), protein: Math.round(recipeDraftTotals.protein),
      carbs: Math.round(recipeDraftTotals.carbs), fat: Math.round(recipeDraftTotals.fat), items: draftRecipeItems
    };
    if (!isMock) await setDoc(getDocRef('recipes', newRecipe.id), newRecipe);
    else editingRecipeId ? setRecipes(recipes.map(r => r.id === editingRecipeId ? newRecipe : r)) : setRecipes([newRecipe, ...recipes]);
    
    setIsCreatingRecipe(false); setEditingRecipeId(null); setDraftRecipeName(''); setDraftRecipeItems([]); showNotification(`Recipe saved!`);
  };

  const deleteRecipe = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('recipes', id));
    else setRecipes(recipes.filter(r => r.id !== id));
    showNotification("Recipe deleted.");
  };

  const editRecipe = (recipe) => {
    setDraftRecipeName(recipe.name); setDraftRecipeItems(recipe.items); setEditingRecipeId(recipe.id); setIsCreatingRecipe(true);
  };

  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [draftTemplateName, setDraftTemplateName] = useState('');
  const [draftMealCount, setDraftMealCount] = useState(4);
  const [draftMeals, setDraftMeals] = useState([]);
  const [activeAddingMealId, setActiveAddingMealId] = useState(null);

  useEffect(() => {
    if (isCreatingTemplate && !editingTemplateId && draftMeals.length === 0) setDraftMeals(Array.from({ length: draftMealCount }, (_, i) => ({ id: `dm${i+1}`, name: `Meal ${i+1}`, items: [] })));
  }, [isCreatingTemplate, draftMealCount, editingTemplateId]);

  const handleMealCountChange = (num) => {
    setDraftMealCount(num); setDraftMeals(Array.from({ length: num }, (_, i) => draftMeals[i] || { id: `dm${i+1}`, name: `Meal ${i+1}`, items: [] }));
  };

  const addItemToDraftMeal = (item, qty) => {
    if (!qty || qty <= 0) return showNotification("Enter a valid quantity");
    const ratio = qty / item.baseQuantity;
    const addedItem = {
      id: item.id, name: item.name, qty: parseFloat(qty), unit: item.unit, calories: Math.round(item.calories * ratio), 
      protein: Math.round(item.protein * ratio * 10)/10, carbs: Math.round(item.carbs * ratio * 10)/10, fat: Math.round(item.fat * ratio * 10)/10,
    };
    setDraftMeals(draftMeals.map(m => m.id === activeAddingMealId ? { ...m, items: [...m.items, addedItem] } : m)); setActiveAddingMealId(null);
  };

  const removeDraftItem = (mealId, itemIndex) => {
    setDraftMeals(draftMeals.map(m => m.id === mealId ? { ...m, items: m.items.filter((_, idx) => idx !== itemIndex) } : m));
  };

  const templateTotals = draftMeals.reduce((acc, meal) => {
    meal.items.forEach(item => { acc.calories += item.calories; acc.protein += item.protein; acc.carbs += item.carbs; acc.fat += item.fat; });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const saveTemplate = async () => {
    if (!draftTemplateName) return showNotification("Give your meal plan a name!");
    const newTemplate = {
      id: editingTemplateId || `t${Date.now()}`, name: draftTemplateName, mealCount: draftMealCount,
      totalCalories: Math.round(templateTotals.calories), totalProtein: Math.round(templateTotals.protein),
      totalCarbs: Math.round(templateTotals.carbs), totalFat: Math.round(templateTotals.fat), meals: draftMeals
    };
    if (!isMock) await setDoc(getDocRef('mealTemplates', newTemplate.id), newTemplate);
    else editingTemplateId ? setMealTemplates(mealTemplates.map(t => t.id === editingTemplateId ? newTemplate : t)) : setMealTemplates([...mealTemplates, newTemplate]);
    
    setIsCreatingTemplate(false); setEditingTemplateId(null); setDraftTemplateName(''); setDraftMeals([]); showNotification(`Template saved!`);
  };

  const editTemplate = (template) => {
    setDraftTemplateName(template.name); setDraftMealCount(template.mealCount); setDraftMeals(template.meals); setEditingTemplateId(template.id); setIsCreatingTemplate(true);
  };

  const deleteTemplate = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('mealTemplates', id));
    else setMealTemplates(mealTemplates.filter(t => t.id !== id));
    
    const newAssigned = {...assignedMeals};
    Object.keys(newAssigned).forEach(k => { if(newAssigned[k] === id) newAssigned[k] = null; });
    if (!isMock) await setDoc(getDocRef('settings', 'schedule'), { meals: newAssigned, workouts: assignedWorkouts });
    else setAssignedMeals(newAssigned);
    showNotification("Meal plan deleted.");
  };

  // ============================================================================
  // --- CLOUD CRUD: FITNESS (Exercises & Workout Templates) ---
  // ============================================================================
  
  const [activeExerciseFilter, setActiveExerciseFilter] = useState('All');
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [newExercise, setNewExercise] = useState({ name: '', target: 'Legs & Glutes', equipment: 'Dumbbell' });
  const exerciseTargets = ['All', 'Legs & Glutes', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Cardio'];
  const filteredExercises = activeExerciseFilter === 'All' ? exercises : exercises.filter(e => e.target === activeExerciseFilter);

  const saveExercise = async () => {
    if (!newExercise.name) return showNotification("Please enter an exercise name.");
    const addedItem = { id: editingExerciseId || `e${Date.now()}`, ...newExercise };
    
    if (!isMock) await setDoc(getDocRef('exercises', addedItem.id), addedItem);
    else editingExerciseId ? setExercises(exercises.map(e => e.id === editingExerciseId ? addedItem : e)) : setExercises([...exercises, addedItem]);

    setNewExercise({ name: '', target: 'Legs & Glutes', equipment: 'Dumbbell' });
    setShowAddExercise(false); setEditingExerciseId(null); showNotification(`${addedItem.name} saved!`);
  };

  const editExercise = (item) => {
    setNewExercise({ name: item.name, target: item.target, equipment: item.equipment });
    setEditingExerciseId(item.id); setShowAddExercise(true);
  };

  const deleteExercise = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('exercises', id));
    else setExercises(exercises.filter(e => e.id !== id));
    showNotification("Exercise deleted.");
  };

  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [draftRoutineName, setDraftRoutineName] = useState('');
  const [draftRoutineIsRest, setDraftRoutineIsRest] = useState(false);
  const [draftRoutineExercises, setDraftRoutineExercises] = useState([]);
  const [addingRoutineExercise, setAddingRoutineExercise] = useState(false);

  const addExerciseToRoutine = (exercise) => {
    setDraftRoutineExercises([...draftRoutineExercises, { id: exercise.id, name: exercise.name, sets: 3, rest: 90 }]);
    setAddingRoutineExercise(false);
  };

  const updateRoutineExercise = (index, field, value) => {
    const updated = [...draftRoutineExercises];
    updated[index][field] = Number(value);
    setDraftRoutineExercises(updated);
  };

  const saveRoutine = async () => {
    if (!draftRoutineName) return showNotification("Give your routine a name!");
    const newRoutine = {
      id: editingRoutineId || `wt${Date.now()}`, title: draftRoutineName, isRest: draftRoutineIsRest, exercises: draftRoutineIsRest ? [] : draftRoutineExercises
    };
    
    if (!isMock) await setDoc(getDocRef('workoutTemplates', newRoutine.id), newRoutine);
    else editingRoutineId ? setWorkoutTemplates(workoutTemplates.map(t => t.id === editingRoutineId ? newRoutine : t)) : setWorkoutTemplates([...workoutTemplates, newRoutine]);
    
    setIsCreatingRoutine(false); setEditingRoutineId(null); setDraftRoutineName(''); setDraftRoutineExercises([]); setDraftRoutineIsRest(false);
    showNotification(`Routine saved!`);
  };

  const editRoutine = (routine) => {
    setDraftRoutineName(routine.title); setDraftRoutineIsRest(routine.isRest); setDraftRoutineExercises(routine.exercises);
    setEditingRoutineId(routine.id); setIsCreatingRoutine(true);
  };

  const deleteRoutine = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('workoutTemplates', id));
    else setWorkoutTemplates(workoutTemplates.filter(t => t.id !== id));
    
    const newAssigned = {...assignedWorkouts};
    Object.keys(newAssigned).forEach(k => { if(newAssigned[k] === id) newAssigned[k] = null; });
    if (!isMock) await setDoc(getDocRef('settings', 'schedule'), { meals: assignedMeals, workouts: newAssigned });
    else setAssignedWorkouts(newAssigned);
    showNotification("Routine deleted.");
  };

  // ============================================================================
  // --- CLOUD CRUD: UNIFIED SCHEDULE ASSIGNER ---
  // ============================================================================
  const assignMealToDay = async (day, templateId) => {
    const newMeals = { ...assignedMeals, [day]: templateId };
    if (!isMock) await setDoc(getDocRef('settings', 'schedule'), { meals: newMeals, workouts: assignedWorkouts });
    else setAssignedMeals(newMeals);
    showNotification(`Meal plan assigned to ${day}`);
  };

  const assignWorkoutToDay = async (day, templateId) => {
    const newWorkouts = { ...assignedWorkouts, [day]: templateId };
    if (!isMock) await setDoc(getDocRef('settings', 'schedule'), { meals: assignedMeals, workouts: newWorkouts });
    else setAssignedWorkouts(newWorkouts);
    showNotification(`Workout assigned to ${day}`);
  };

  const clearAllSchedule = async () => {
    const emptyObj = { Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null };
    if (!isMock) await setDoc(getDocRef('settings', 'schedule'), { meals: emptyObj, workouts: emptyObj });
    else { setAssignedMeals(emptyObj); setAssignedWorkouts(emptyObj); }
    showNotification("Complete schedule cleared.");
  };

  // ============================================================================
  // --- CLOUD CRUD: DAILY DIET LOG (Extras) ---
  // ============================================================================
  const [activeExtraAdd, setActiveExtraAdd] = useState(false);
  const addExtraToToday = async (item, qty) => {
    if (!qty || qty <= 0) return showNotification("Enter a valid quantity");
    const ratio = qty / item.baseQuantity;
    const addedItem = {
      id: `ext${Date.now()}`, name: `${item.name} (${qty}${item.unit})`,
      calories: Math.round(item.calories * ratio), protein: Math.round(item.protein * ratio * 10)/10,
      carbs: Math.round(item.carbs * ratio * 10)/10, fat: Math.round(item.fat * ratio * 10)/10,
    };
    if (!isMock) await setDoc(getDocRef('dailyExtras', addedItem.id), addedItem);
    else setDailyExtras([...dailyExtras, addedItem]);
    setActiveExtraAdd(false); showNotification("Added extra food to today's log.");
  };

  const removeExtra = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('dailyExtras', id));
    else setDailyExtras(dailyExtras.filter(e => e.id !== id));
  };

  // ============================================================================
  // --- CLOUD CRUD: PROGRESS & HISTORY ---
  // ============================================================================
  const [progressView, setProgressView] = useState('overview'); 

  const deleteWorkoutLog = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('workoutHistory', id));
    else setMockWorkoutHistory(mockWorkoutHistory.filter(h => h.id !== id));
    showNotification("Workout log deleted.");
  };

  const deleteMeasurementLog = async (id) => {
    if (!isMock) await deleteDoc(getDocRef('measurementHistory', id));
    else setMockMeasurementHistory(mockMeasurementHistory.filter(h => h.id !== id));
    showNotification("Measurement entry deleted.");
  };

  const groupedHistory = mockWorkoutHistory.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = { day: log.day, exercises: [] };
    acc[log.date].exercises.push(log);
    return acc;
  }, {});

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
    const logId = Date.now().toString();
    const dateStr = new Date().toISOString().split('T')[0];
    const newLog = {
      id: logId, date: dateStr, weight: parseFloat(trackWeight), hasPhoto: !!photoFile,
      waist: trackWaist ? parseFloat(trackWaist) : null, hip: trackHip ? parseFloat(trackHip) : null, arm: trackArm ? parseFloat(trackArm) : null,
    };
    
    if (!isMock) await setDoc(getDocRef('measurementHistory', logId), newLog);
    else setMockMeasurementHistory([newLog, ...mockMeasurementHistory]);
    
    showNotification("Progress saved to cloud successfully!");
    setPhotoPreview(null); setPhotoFile(null); setTrackWeight(''); setTrackWaist(''); setTrackHip(''); setTrackArm('');
  };

  // ============================================================================
  // --- DAILY EXECUTION LOGIC (Workouts & Nutrition) ---
  // ============================================================================
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const actualToday = days[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(actualToday);

  // Dynamic Workout Selection
  const activeRoutineId = assignedWorkouts[selectedDay];
  const selectedWorkout = workoutTemplates.find(t => t.id === activeRoutineId) || { title: "No Routine Assigned", isRest: true, exercises: [] };

  const [workoutInputs, setWorkoutInputs] = useState({});
  const handleWorkoutInput = (exerciseName, setIndex, field, value) => {
    const newInputs = { ...workoutInputs };
    if (!newInputs[exerciseName]) newInputs[exerciseName] = [];
    if (!newInputs[exerciseName][setIndex]) newInputs[exerciseName][setIndex] = { weight: '', reps: '' };
    newInputs[exerciseName][setIndex][field] = value;
    setWorkoutInputs(newInputs);
  };

  const saveWorkoutSession = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    let loggedSomething = false;
    
    for (const exercise of selectedWorkout.exercises) {
      const sets = workoutInputs[exercise.name];
      if (sets && sets.length > 0) {
        const validSets = sets.filter(s => s && (s.weight || s.reps));
        if (validSets.length > 0) {
           const logItem = {
             id: `${dateStr}-${exercise.name.replace(/\s+/g, '')}`,
             date: dateStr, day: selectedDay, exercise: exercise.name,
             sets: validSets.map((s, i) => ({ set: i+1, weight: s.weight||0, reps: s.reps||0 }))
           };
           if (!isMock) await setDoc(getDocRef('workoutHistory', logItem.id), logItem);
           else setMockWorkoutHistory(prev => [...prev.filter(p => p.id !== logItem.id), logItem]);
           loggedSomething = true;
        }
      }
    }
    if (loggedSomething) {
        showNotification(`${selectedDay} cloud session saved!`);
        setWorkoutInputs({});
    } else showNotification("Please enter some weights/reps first.");
  };

  // Dynamic Diet Selection
  const todaysPlanId = assignedMeals[actualToday];
  const todaysPlan = mealTemplates.find(t => t.id === todaysPlanId);

  let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  if (todaysPlan) {
    consumed.calories += todaysPlan.totalCalories; consumed.protein += todaysPlan.totalProtein;
    consumed.carbs += todaysPlan.totalCarbs; consumed.fat += todaysPlan.totalFat;
  }
  dailyExtras.forEach(ext => {
    consumed.calories += ext.calories; consumed.protein += ext.protein; consumed.carbs += ext.carbs; consumed.fat += ext.fat;
  });

  // --- Dynamic Math for Learn Tab ---
  const mifflinBMR = Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  const harrisBMR = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  let katchBMRText = "Requires Body Fat % (Tape measures)";
  if (calcResults && calcResults.bodyFat) {
    const lbm = weight * (1 - calcResults.bodyFat / 100);
    katchBMRText = Math.round(370 + (21.6 * lbm)) + " kcal";
  }

  // =========================================================================
  // LOGIN SCREEN RENDER
  // =========================================================================
  if (authChecking) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Activity className="animate-spin text-rose-500" size={48} /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Lock size={120} /></div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 mb-2 relative z-10 text-center drop-shadow-lg">ISLAND GAINS</h1>
          <p className="text-slate-400 text-center mb-8 relative z-10 text-sm">Please log in to access your dashboard.</p>
          {loginError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm font-bold text-center relative z-10">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-2">Email Address</label>
              <div className="relative"><User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors" placeholder="marie@islandgains.com" /></div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-2">Password</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-rose-500 transition-colors" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </div>
            <button type="submit" className="w-full mt-4 bg-gradient-to-r from-rose-600 to-orange-500 text-white py-4 rounded-2xl font-extrabold text-lg shadow-lg hover:scale-[1.02] transition-transform">ACCESS ACCOUNT</button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN APP RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row selection:bg-rose-500 overflow-x-hidden relative">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl z-[100] font-bold flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 size={20} /> {notification}
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-50 p-6 overflow-y-auto scrollbar-hide">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 mb-10 drop-shadow-lg">ISLAND GAINS</h1>
        <nav className="flex flex-col gap-2 flex-1">
          {MAIN_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = mainTab === item.id;
            return (
              <div key={item.id} className="flex flex-col">
                <button onClick={() => switchMainTab(item.id)} className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 font-bold text-sm ${isActive ? `bg-slate-800 shadow-lg border border-slate-700 text-white` : `text-slate-500 ${item.bgHover} hover:text-slate-300`}`}>
                  <Icon size={18} className={isActive ? item.color : ''} /> {item.label}
                </button>
                {isActive && SUB_TABS[item.id] && (
                  <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-slate-800 pl-3">
                     {SUB_TABS[item.id].map(sub => {
                       const isSubActive = subTabs[item.id] === sub.id;
                       return (
                         <button key={sub.id} onClick={() => switchSubTab(item.id, sub.id)} className={`text-left text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${isSubActive ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{sub.label}</button>
                       )
                     })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="mt-auto text-slate-500 hover:text-red-400 text-sm font-bold flex items-center gap-2 pt-4 border-t border-slate-800">Sign Out</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative pb-28 md:pb-0 w-full max-w-[100vw]">
        
        {/* HEADER */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-indigo-500/20 p-2 rounded-xl hidden sm:block shrink-0"><Compass className="text-indigo-400" size={24}/></div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Today is {actualToday}</p>
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-cyan-400 flex items-center gap-1 truncate"><Activity size={14} className="shrink-0"/> <span className="truncate">{assignedWorkouts[actualToday] ? workoutTemplates.find(t=>t.id===assignedWorkouts[actualToday])?.title : 'No Workout'}</span></p>
                <p className="text-xs sm:text-sm font-bold text-rose-400 flex items-center gap-1 truncate"><Utensils size={14} className="shrink-0"/> <span className="truncate">{todaysPlan ? todaysPlan.name : 'No Meal Plan'}</span></p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="md:hidden shrink-0 text-slate-500 hover:text-red-400 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg ml-2">Logout</button>
        </div>

        {/* SUB-TABS NAV */}
        {SUB_TABS[mainTab] && (
           <div className="px-4 py-3 border-b border-slate-800/50 flex gap-2 overflow-x-auto scrollbar-hide bg-slate-950/50">
              {SUB_TABS[mainTab].map(tab => {
                const isActive = subTabs[mainTab] === tab.id;
                const activeColor = mainTab === 'workout' ? 'bg-cyan-500 text-slate-950' : 'bg-rose-500 text-slate-950';
                const TabIcon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => switchSubTab(mainTab, tab.id)} className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all flex items-center gap-2 ${isActive ? activeColor : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                    <TabIcon size={14} /> {tab.label}
                  </button>
                )
              })}
           </div>
        )}

        <div className="p-4 md:p-8 max-w-5xl w-full mx-auto overflow-x-hidden">

          {/* === WORKOUT HUB (Session) === */}
          {mainTab === 'workout' && subTabs.workout === 'session' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-6 overflow-x-auto pb-4 scrollbar-hide w-full">
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
              <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-cyan-400 font-bold text-sm uppercase mb-1 flex items-center gap-2"><Calendar size={16} /> {selectedDay}'s Workout</p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{selectedWorkout.title}</h2>
                  </div>
                </div>
                {selectedWorkout.isRest || selectedWorkout.exercises.length === 0 ? (
                  <div className="text-center p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 mt-4"><p className="text-lg sm:text-xl font-bold text-slate-300">Rest Day.</p></div>
                ) : (
                  <div className="space-y-6 mt-6">
                    {selectedWorkout.exercises.map((ex, idx) => (
                      <div key={idx} className="bg-slate-800/40 p-4 sm:p-5 rounded-3xl border border-slate-700/50">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-slate-700/50 pb-3 gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-white">{ex.name}</h3>
                          {ex.rest > 0 && <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg w-max"><Timer size={14}/> Rest: {ex.rest}s</span>}
                        </div>
                        <div className="space-y-3">
                          {Array.from({ length: ex.sets }).map((_, setIdx) => {
                            const cVal = (workoutInputs[ex.name] && workoutInputs[ex.name][setIdx]) || {weight: '', reps: ''};
                            return (
                              <div key={setIdx} className="flex items-center justify-between gap-2 sm:gap-4">
                                <span className="text-xs sm:text-sm font-bold text-slate-400 w-10 sm:w-12">Set {setIdx + 1}</span>
                                <div className="flex gap-2 sm:gap-3 flex-1 justify-end">
                                  <div className="relative w-20 sm:w-32"><input type="number" placeholder="kg" value={cVal.weight} onChange={(e) => handleWorkoutInput(ex.name, setIdx, 'weight', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-2.5 font-black text-white text-center focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base" /></div>
                                  <div className="relative w-20 sm:w-32"><input type="number" placeholder="reps" value={cVal.reps} onChange={(e) => handleWorkoutInput(ex.name, setIdx, 'reps', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-2.5 font-black text-white text-center focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base" /></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button onClick={saveWorkoutSession} className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-full font-extrabold text-sm sm:text-lg flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg"><Save size={20} /> SAVE SESSION</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === WORKOUT HUB (Routines) === */}
          {mainTab === 'workout' && subTabs.workout === 'routines' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {!isCreatingRoutine ? (
                <>
                  <button onClick={() => setIsCreatingRoutine(true)} className="w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-cyan-400 text-cyan-400 py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 group"><Plus size={32} className="group-hover:scale-110 transition-transform" /> Create New Routine</button>
                  <div className="grid grid-cols-1 gap-4 mt-6">
                    {workoutTemplates.map(routine => (
                      <div key={routine.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                        <div className="p-5 sm:p-6 pb-4 relative">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><Dumbbell size={80} /></div>
                          <h3 className="font-bold text-white text-xl mb-1 relative z-10">{routine.title}</h3>
                          <p className="text-xs text-slate-400 mb-4 relative z-10">{routine.isRest ? "Rest Day" : `${routine.exercises.length} Exercises`}</p>
                          {!routine.isRest && (
                            <div className="space-y-2 relative z-10">
                              {routine.exercises.map((ex, idx) => (
                                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm flex justify-between items-center"><span className="font-bold text-slate-300 truncate pr-2">{ex.name}</span><span className="text-slate-500 text-[10px] sm:text-xs font-bold shrink-0">{ex.sets} Sets • {ex.rest}s</span></div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="bg-slate-800/50 p-3 border-t border-slate-800 flex justify-end gap-3 mt-auto relative z-10"><button onClick={() => editRoutine(routine)} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"><Edit3 size={14} /> Edit</button><button onClick={() => deleteRoutine(routine.id)} className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-xs font-bold transition-colors"><Trash2 size={14} /> Delete</button></div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[2rem] shadow-2xl relative">
                  <button onClick={() => { setIsCreatingRoutine(false); setEditingRoutineId(null); setDraftRoutineName(''); setDraftRoutineExercises([]); setDraftRoutineIsRest(false); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white"><X size={24}/></button>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-6 pr-8">{editingRoutineId ? 'Edit Routine' : 'Routine Builder'}</h3>
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1"><label className="text-xs font-bold text-slate-500 mb-1 block">ROUTINE NAME</label><input type="text" value={draftRoutineName} onChange={(e)=>setDraftRoutineName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-white font-bold focus:outline-none focus:border-cyan-500 text-sm sm:text-base" /></div>
                    <div className="flex items-center gap-3 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 h-full"><input type="checkbox" id="isRestCheck" checked={draftRoutineIsRest} onChange={(e) => setDraftRoutineIsRest(e.target.checked)} className="w-5 h-5 accent-cyan-500" /><label htmlFor="isRestCheck" className="text-sm font-bold text-slate-300">Mark as Rest Day</label></div>
                  </div>
                  {!draftRoutineIsRest && (
                    <>
                      {draftRoutineExercises.length > 0 && (
                        <div className="mb-6 space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase">Exercises in Routine</h4>
                          {draftRoutineExercises.map((ex, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 gap-4">
                              <span className="font-bold text-sm text-white flex-1">{ex.name}</span>
                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <div className="relative"><label className="absolute -top-2 left-2 bg-slate-800 px-1 text-[8px] font-bold text-slate-400 rounded">SETS</label><input type="number" value={ex.sets} onChange={(e)=>updateRoutineExercise(idx, 'sets', e.target.value)} className="w-14 sm:w-16 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-center focus:outline-none focus:border-cyan-500 text-sm" /></div>
                                <div className="relative"><label className="absolute -top-2 left-2 bg-slate-800 px-1 text-[8px] font-bold text-slate-400 rounded">REST (s)</label><input type="number" value={ex.rest} onChange={(e)=>updateRoutineExercise(idx, 'rest', e.target.value)} className="w-14 sm:w-16 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-center focus:outline-none focus:border-cyan-500 text-sm" /></div>
                                <button onClick={() => setDraftRoutineExercises(draftRoutineExercises.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 mb-6 relative">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase flex items-center gap-1 sm:gap-2"><Search size={14}/> Add from Library</h4>
                          <button onClick={() => setAddingRoutineExercise(!addingRoutineExercise)} className="text-cyan-400 hover:text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-lg"><Plus size={14}/> Browse</button>
                        </div>
                        {addingRoutineExercise && (
                          <div className="mt-4 max-h-48 overflow-y-auto space-y-2 scrollbar-hide border-t border-slate-700/50 pt-4 animate-in fade-in zoom-in-95 duration-200">
                            {exercises.map(ex => (
                              <div key={ex.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <div className="min-w-0 pr-2"><p className="text-xs sm:text-sm font-bold text-white truncate">{ex.name}</p><p className="text-[9px] sm:text-[10px] text-cyan-400 truncate">{ex.target}</p></div>
                                <button onClick={() => addExerciseToRoutine(ex)} className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-md hover:bg-cyan-500 hover:text-white transition-colors shrink-0"><Plus size={16} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <button onClick={saveRoutine} className="w-full bg-cyan-500 text-slate-950 py-3 sm:py-4 rounded-full font-extrabold text-sm sm:text-lg shadow-lg hover:bg-cyan-400">SAVE ROUTINE</button>
                </div>
              )}
            </div>
          )}

          {/* === WORKOUT HUB (Library) === */}
          {mainTab === 'workout' && subTabs.workout === 'library' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
                {exerciseTargets.map(cat => (
                  <button key={cat} onClick={() => setActiveExerciseFilter(cat)} className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${activeExerciseFilter === cat ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>{cat}</button>
                ))}
              </div>
              <div className="bg-slate-900 p-1 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all">
                <button onClick={() => { if (showAddExercise) { setShowAddExercise(false); setEditingExerciseId(null); setNewExercise({ name: '', target: 'Legs & Glutes', equipment: 'Dumbbell' }); } else { setShowAddExercise(true); } }} className="w-full p-4 flex items-center justify-between text-cyan-400 font-bold hover:bg-slate-800/50 transition-colors rounded-2xl text-sm sm:text-base">
                  <span className="flex items-center gap-2"><Plus size={20}/> {editingExerciseId ? 'Edit Exercise' : 'Add Custom Exercise'}</span><ChevronRight className={`transition-transform duration-300 ${showAddExercise ? 'rotate-90' : ''}`} />
                </button>
                {showAddExercise && (
                  <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">EXERCISE NAME</label><input type="text" value={newExercise.name} onChange={(e)=>setNewExercise({...newExercise, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-sm" placeholder="e.g. Hip Thrusts" /></div>
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">TARGET MUSCLE</label><select value={newExercise.target} onChange={(e)=>setNewExercise({...newExercise, target: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-sm">{exerciseTargets.filter(t=>t!=='All').map(t => <option key={t}>{t}</option>)}</select></div>
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">EQUIPMENT</label><input type="text" value={newExercise.equipment} onChange={(e)=>setNewExercise({...newExercise, equipment: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-sm" placeholder="e.g. Barbell" /></div>
                    </div>
                    <button onClick={saveExercise} className="w-full bg-cyan-500 text-slate-950 py-3 rounded-xl font-bold shadow-lg hover:bg-cyan-400 transition-colors text-sm sm:text-base">{editingExerciseId ? 'UPDATE EXERCISE' : 'SAVE EXERCISE'}</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                {filteredExercises.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between group hover:border-cyan-500/50 transition-colors relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 pr-2"><h4 className="font-bold text-white text-base sm:text-lg leading-tight truncate">{item.name}</h4><p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Equipment: {item.equipment}</p></div>
                      <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><button onClick={() => editExercise(item)} className="p-1.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"><Edit3 size={14}/></button><button onClick={() => deleteExercise(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14}/></button></div>
                    </div>
                    <div><span className="text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">{item.target}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === DIET HUB (Targets) === */}
          {mainTab === 'diet' && subTabs.diet === 'targets' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div><h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-3"><Target className="text-rose-400" size={28} /> Macro Goals</h2><p className="text-slate-400 text-xs sm:text-sm mt-1">Tune your engine and adjust your fuel.</p></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-5 sm:p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-2"><Ruler size={18} className="text-rose-400"/> 1. Body Metrics</h3>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">AGE</label><input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-center font-bold focus:outline-none focus:border-rose-500" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">WEIGHT (KG)</label><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-center font-bold focus:outline-none focus:border-rose-500" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">HEIGHT (CM)</label><input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-center font-bold focus:outline-none focus:border-rose-500" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">NECK (IN)</label><input type="number" value={neck} onChange={e=>setNeck(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-center font-bold focus:outline-none focus:border-rose-500" placeholder="Optional" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">WAIST (IN)</label><input type="number" value={waist} onChange={e=>setWaist(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-center font-bold focus:outline-none focus:border-rose-500" placeholder="Optional" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">HIPS (IN)</label><input type="number" value={hip} onChange={e=>setHip(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-center font-bold focus:outline-none focus:border-rose-500" placeholder="Optional" /></div>
                  </div>
                </div>
                <div className="bg-slate-900 p-5 sm:p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-2"><Activity size={18} className="text-orange-400"/> 2. Lifestyle & Goals</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">ACTIVITY</label><select value={activityLevel} onChange={e=>setActivityLevel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold focus:outline-none focus:border-orange-500 appearance-none"><option value={1.2}>Sedentary (1.2)</option><option value={1.375}>Lightly Active (1.375)</option><option value={1.55}>Moderate (1.55)</option></select></div>
                    <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">GOAL</label><select value={caloricSurplus} onChange={e=>setCaloricSurplus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold focus:outline-none focus:border-orange-500 appearance-none"><option value={0}>Maintenance (+0)</option><option value={250}>Lean Bulk (+250)</option><option value={500}>Bulk (+500)</option><option value={-250}>Cut (-250)</option></select></div>
                  </div>
                  <div className="space-y-5">
                    <div><div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-rose-400">PROTEIN</label><span className="text-xs font-bold text-white">{proteinPerKg}g / kg</span></div><input type="range" min="1.6" max="2.2" step="0.1" value={proteinPerKg} onChange={e=>setProteinPerKg(e.target.value)} className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" /></div>
                    <div><div className="flex justify-between items-center mb-1"><label className="text-[10px] font-bold text-yellow-400">FAT</label><span className="text-xs font-bold text-white">{fatPerKg}g / kg</span></div><input type="range" min="0.8" max="1.2" step="0.1" value={fatPerKg} onChange={e=>setFatPerKg(e.target.value)} className="w-full accent-yellow-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" /></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-1 rounded-[2rem] shadow-2xl mt-6">
                <div className="bg-slate-950 p-5 sm:p-8 rounded-[calc(2rem-4px)] flex flex-col items-center">
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 w-full">
                    <div className="text-center"><p className="text-[10px] text-slate-500 font-bold mb-1">TDEE</p><p className="text-2xl sm:text-3xl font-black text-slate-300">{calcResults.tdee}</p></div>
                    <div className="text-center"><p className="text-[10px] text-slate-500 font-bold mb-1">TARGET CALORIES</p><p className="text-3xl sm:text-4xl font-black text-amber-400">{calcResults.calories}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg mb-8">
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center"><p className="text-[10px] text-slate-500 font-bold mb-1">PROTEIN</p><p className="text-xl sm:text-2xl font-black text-rose-400">{calcResults.protein}g</p></div>
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center"><p className="text-[10px] text-slate-500 font-bold mb-1">CARBS</p><p className="text-xl sm:text-2xl font-black text-cyan-400">{calcResults.carbs}g</p></div>
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center"><p className="text-[10px] text-slate-500 font-bold mb-1">FAT</p><p className="text-xl sm:text-2xl font-black text-yellow-400">{calcResults.fat}g</p></div>
                  </div>
                  <button onClick={saveProfile} className="w-full max-w-md bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-full font-extrabold text-sm sm:text-lg shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"><Save size={20} /> SAVE PROFILE & MACROS</button>
                </div>
              </div>
            </div>
          )}

          {/* === DIET HUB (Log) === */}
          {mainTab === 'diet' && subTabs.diet === 'log' && (
             <div className="space-y-6 animate-in fade-in duration-500">
              {calcResults && (
                <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                  {(() => {
                    const isOver = consumed.calories >= calcResults.calories;
                    const diff = Math.abs(calcResults.calories - consumed.calories);
                    const mainColor = isOver ? 'text-indigo-400' : 'text-amber-400';
                    const mainBg = isOver ? 'bg-indigo-500' : 'bg-amber-500';
                    return (
                      <div className="mb-8">
                        <div className={`p-3 sm:p-4 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm ${isOver ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                          {isOver ? `Goal Reached! +${diff} kcal buffer.` : `${diff} kcal remaining for today.`}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-center">
                          <div className="bg-slate-800/50 rounded-2xl p-3 sm:p-4 border border-slate-700 relative overflow-hidden"><div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${mainBg}`} style={{ width: `${Math.min(100, (consumed.calories / calcResults.calories) * 100)}%` }}></div><p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mb-1">KCAL</p><p className={`text-xl sm:text-2xl font-black ${mainColor}`}>{consumed.calories}</p></div>
                          <div className="bg-slate-800/50 rounded-2xl p-3 sm:p-4 border border-slate-700 relative overflow-hidden"><div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-500" style={{ width: `${Math.min(100, (consumed.protein / calcResults.protein) * 100)}%` }}></div><p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mb-1">PRO</p><p className="text-xl sm:text-2xl font-black text-rose-400">{Math.round(consumed.protein)}g</p></div>
                          <div className="bg-slate-800/50 rounded-2xl p-3 sm:p-4 border border-slate-700 relative overflow-hidden"><div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-500" style={{ width: `${Math.min(100, (consumed.carbs / calcResults.carbs) * 100)}%` }}></div><p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mb-1">CARB</p><p className="text-xl sm:text-2xl font-black text-cyan-400">{Math.round(consumed.carbs)}g</p></div>
                          <div className="bg-slate-800/50 rounded-2xl p-3 sm:p-4 border border-slate-700 relative overflow-hidden"><div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-500" style={{ width: `${Math.min(100, (consumed.fat / calcResults.fat) * 100)}%` }}></div><p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mb-1">FAT</p><p className="text-xl sm:text-2xl font-black text-yellow-400">{Math.round(consumed.fat)}g</p></div>
                        </div>
                      </div>
                    );
                  })()}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-between"><span>Scheduled Plan</span>{todaysPlan && <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-[10px] truncate max-w-[120px] sm:max-w-none">{todaysPlan.name}</span>}</h3>
                  {!todaysPlan ? (
                    <div className="text-center p-6 border-2 border-dashed border-slate-800 rounded-3xl mb-6"><p className="text-sm text-slate-500 font-bold">No meal plan assigned for today.</p></div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4 mb-8">
                      {todaysPlan.meals.map(meal => (
                        <div key={meal.id} className="bg-slate-950 border border-slate-800 p-3 sm:p-4 rounded-2xl">
                          <h4 className="font-bold text-white text-sm sm:text-base mb-2">{meal.name}</h4>
                          {meal.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs sm:text-sm mb-1 last:mb-0 gap-2"><span className="text-slate-300 truncate">{item.qty}{item.unit} {item.name}</span><span className="text-slate-500 text-[10px] sm:text-xs font-bold shrink-0">{item.calories} kcal</span></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Extra Additions</h3><button onClick={() => setActiveExtraAdd(!activeExtraAdd)} className="text-emerald-400 hover:text-emerald-300 text-[10px] sm:text-xs font-bold bg-emerald-500/10 px-2 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"><Plus size={14} /> Add Extra</button></div>
                    {activeExtraAdd && (
                      <div className="mb-4 bg-slate-950 p-3 sm:p-4 rounded-xl border border-emerald-500/50 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 mb-3">Add outside of plan:</h4>
                        <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                          {[...recipes, ...ingredients].map(ing => (
                            <div key={ing.id} className="flex justify-between items-center bg-slate-900 p-2 sm:p-2.5 rounded-lg border border-slate-800 gap-2">
                              <p className="text-xs sm:text-sm font-bold text-white truncate">{ing.name}</p>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <input type="number" placeholder={ing.baseQuantity} id={`extra-${ing.id}`} className="w-12 sm:w-14 bg-slate-800 text-white font-bold p-1 rounded-md text-center text-[10px] sm:text-xs focus:outline-none" />
                                <span className="text-[8px] sm:text-[10px] text-slate-400 w-6 sm:w-8">{ing.unit}</span>
                                <button onClick={() => { const val = document.getElementById(`extra-${ing.id}`).value || ing.baseQuantity; addExtraToToday(ing, val); }} className="bg-emerald-500 text-white p-1 sm:p-1.5 rounded-md hover:bg-emerald-600 transition-colors"><Plus size={12} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {dailyExtras.length === 0 ? (
                      <p className="text-[10px] sm:text-xs text-slate-500 italic text-center p-4">You haven't deviated from the plan today.</p>
                    ) : (
                      <div className="space-y-2">
                        {dailyExtras.map(ext => (
                          <div key={ext.id} className="bg-slate-800/50 p-2 sm:p-3 rounded-xl border border-slate-700/50 flex justify-between items-center gap-2">
                            <div className="min-w-0"><p className="text-xs sm:text-sm font-bold text-white truncate">{ext.name}</p><p className="text-[8px] sm:text-[10px] text-amber-400 font-bold">+{ext.calories} kcal</p></div>
                            <button onClick={() => removeExtra(ext.id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0"><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
             </div>
          )}

          {/* === DIET HUB (Plans) === */}
          {mainTab === 'diet' && subTabs.diet === 'plans' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {!isCreatingTemplate ? (
                <>
                  <button onClick={() => setIsCreatingTemplate(true)} className="w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-purple-400 text-purple-400 py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 transition-colors group"><Plus size={32} className="group-hover:scale-110 transition-transform" /> Create Sample Meal Day</button>
                  <div className="grid grid-cols-1 gap-4 mt-6">
                    {mealTemplates.map(template => (
                      <div key={template.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                        <div className="p-5 sm:p-6 pb-4">
                          <h3 className="font-bold text-white text-lg sm:text-xl mb-1">{template.name}</h3>
                          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-bold mb-4 flex-wrap"><div className="text-amber-400">{template.totalCalories} <span className="text-[8px] sm:text-[10px] text-slate-500">KCAL</span></div><div className="text-rose-400">{template.totalProtein}g <span className="text-[8px] sm:text-[10px] text-slate-500">PRO</span></div><div className="text-cyan-400">{template.totalCarbs}g <span className="text-[8px] sm:text-[10px] text-slate-500">CARB</span></div></div>
                          <div className="space-y-2">
                            {template.meals.map(meal => (
                              <div key={meal.id} className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800 text-xs sm:text-sm flex gap-2"><span className="font-bold text-slate-300 shrink-0">{meal.name}:</span><span className="text-slate-500 truncate">{meal.items.map(i => `${i.qty}${i.unit} ${i.name}`).join(', ') || 'Empty'}</span></div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 border-t border-slate-800 flex justify-end gap-3 mt-auto"><button onClick={() => editTemplate(template)} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"><Edit3 size={14} /> Edit</button><button onClick={() => deleteTemplate(template.id)} className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-xs font-bold transition-colors"><Trash2 size={14} /> Delete</button></div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[2rem] shadow-2xl relative">
                  <button onClick={() => { setIsCreatingTemplate(false); setEditingTemplateId(null); setDraftTemplateName(''); setDraftMeals([]); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white"><X size={24}/></button>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-6 pr-8">{editingTemplateId ? 'Edit Template' : 'Template Builder'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">TEMPLATE NAME</label><input type="text" placeholder="e.g. Cardio Day Meals" value={draftTemplateName} onChange={(e)=>setDraftTemplateName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-white font-bold focus:outline-none focus:border-purple-500 text-sm sm:text-base" /></div>
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">NUMBER OF MEALS</label><select value={draftMealCount} onChange={(e)=>handleMealCountChange(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-white font-bold focus:outline-none focus:border-purple-500 text-sm sm:text-base">{[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Meals</option>)}</select></div>
                  </div>
                  <div className="space-y-4 mb-6">
                    {draftMeals.map((meal) => (
                      <div key={meal.id} className="bg-slate-800/30 p-3 sm:p-4 rounded-2xl border border-slate-700/50">
                        <div className="flex justify-between items-center mb-3 gap-2"><input type="text" value={meal.name} onChange={(e) => { const newMeals = [...draftMeals]; newMeals.find(m => m.id === meal.id).name = e.target.value; setDraftMeals(newMeals); }} className="bg-transparent text-white font-bold focus:outline-none border-b border-dashed border-slate-600 focus:border-purple-400 px-1 w-full min-w-0 text-sm sm:text-base" /><button onClick={() => setActiveAddingMealId(meal.id)} className="text-purple-400 hover:text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 bg-purple-500/10 px-2 sm:px-3 py-1.5 rounded-lg transition-colors shrink-0"><Plus size={14}/> Add Food</button></div>
                        <div className="space-y-2">
                          {meal.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm gap-2"><span className="font-bold text-slate-300 truncate">{item.qty}{item.unit} {item.name}</span><div className="flex items-center gap-2 sm:gap-3 shrink-0"><span className="text-[8px] sm:text-[10px] text-slate-500">{item.calories} kcal</span><button onClick={() => removeDraftItem(meal.id, idx)} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button></div></div>
                          ))}
                          {meal.items.length === 0 && <p className="text-[10px] sm:text-xs text-slate-500 italic">No food added yet.</p>}
                        </div>
                        {activeAddingMealId === meal.id && (
                          <div className="mt-4 bg-slate-950 p-3 sm:p-4 rounded-xl border border-purple-500/50 animate-in fade-in zoom-in-95 duration-200 relative">
                            <button onClick={() => setActiveAddingMealId(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={16}/></button>
                            <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Search size={14}/> Search Database</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                              {[...recipes, ...ingredients].map(ing => (
                                <div key={ing.id} className="flex justify-between items-center bg-slate-900 p-2 sm:p-2.5 rounded-lg border border-slate-800 gap-2"><div className="min-w-0 flex-1"><p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 sm:gap-2 truncate">{ing.items ? <ChefHat size={10} className="text-yellow-400 shrink-0"/> : <Apple size={10} className="text-orange-400 shrink-0"/>} <span className="truncate">{ing.name}</span></p></div><div className="flex items-center gap-1 sm:gap-2 shrink-0"><input type="number" placeholder={ing.baseQuantity} id={`qty-${meal.id}-${ing.id}`} className="w-10 sm:w-14 bg-slate-800 text-white font-bold p-1 sm:p-1.5 rounded-md text-center text-[10px] sm:text-xs focus:outline-none focus:ring-1 ring-purple-500" /><span className="text-[8px] sm:text-[10px] text-slate-400 w-6 sm:w-8">{ing.unit}</span><button onClick={() => { const val = document.getElementById(`qty-${meal.id}-${ing.id}`).value || ing.baseQuantity; addItemToDraftMeal(ing, val); document.getElementById(`qty-${meal.id}-${ing.id}`).value = ''; }} className="bg-purple-500 text-white p-1 sm:p-1.5 rounded-md hover:bg-purple-600 transition-colors"><Plus size={12} /></button></div></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={saveTemplate} className="w-full bg-purple-500 text-white py-3 sm:py-4 rounded-full font-extrabold text-sm sm:text-lg shadow-lg hover:bg-purple-600 transition-colors">SAVE MEAL PLAN</button>
                </div>
              )}
            </div>
          )}

          {/* === DIET HUB (Recipes) === */}
          {mainTab === 'diet' && subTabs.diet === 'recipes' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {!isCreatingRecipe ? (
                <>
                  <button onClick={() => setIsCreatingRecipe(true)} className="w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-yellow-400 text-yellow-400 py-6 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 transition-colors group"><Plus size={32} className="group-hover:scale-110 transition-transform" /> Create New Recipe</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {recipes.map(recipe => (
                      <div key={recipe.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                        <div className="p-5 sm:p-6 pb-4 relative"><div className="absolute top-0 right-0 p-4 opacity-5"><Utensils size={80} /></div><h3 className="font-bold text-white text-lg sm:text-xl mb-1 relative z-10">{recipe.name}</h3><p className="text-[10px] sm:text-xs text-slate-400 mb-4 relative z-10 truncate">{recipe.items.map(i => `${i.qty}${i.unit} ${i.name}`).join(', ')}</p><div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-bold relative z-10 flex-wrap"><div className="text-amber-400">{recipe.calories} <span className="text-[8px] sm:text-[10px] text-slate-500">KCAL</span></div></div></div>
                        <div className="bg-slate-800/50 p-3 border-t border-slate-800 flex justify-end gap-3 mt-auto relative z-10"><button onClick={() => editRecipe(recipe)} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"><Edit3 size={14} /> Edit</button><button onClick={() => deleteRecipe(recipe.id)} className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-xs font-bold transition-colors"><Trash2 size={14} /> Delete</button></div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[2rem] shadow-2xl relative">
                  <button onClick={() => { setIsCreatingRecipe(false); setEditingRecipeId(null); setDraftRecipeName(''); setDraftRecipeItems([]); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white"><X size={24}/></button>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-6 pr-8">{editingRecipeId ? 'Edit Recipe' : 'Recipe Builder'}</h3>
                  <input type="text" placeholder="Recipe Name" value={draftRecipeName} onChange={(e)=>setDraftRecipeName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-yellow-500 mb-6" />
                  {draftRecipeItems.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {draftRecipeItems.map((d, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 sm:p-3 rounded-xl border border-slate-700/50 gap-2"><span className="font-bold text-xs sm:text-sm text-white truncate">{d.qty}{d.unit} {d.name}</span><div className="flex items-center gap-2 sm:gap-3 shrink-0"><span className="text-[8px] sm:text-[10px] text-slate-500">{d.calories} kcal</span><button onClick={() => setDraftRecipeItems(draftRecipeItems.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button></div></div>
                      ))}
                    </div>
                  )}
                  <div className="bg-slate-800/30 p-3 sm:p-4 rounded-2xl border border-slate-700/50 mb-6">
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Search size={14}/> Search Database</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                      {ingredients.map(ing => (
                        <div key={ing.id} className="flex justify-between items-center bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800 gap-2"><div className="min-w-0 flex-1"><p className="text-xs sm:text-sm font-bold text-white truncate">{ing.name}</p></div><div className="flex items-center gap-1 sm:gap-2 shrink-0"><input type="number" placeholder={ing.baseQuantity} id={`rec-qty-${ing.id}`} className="w-10 sm:w-16 bg-slate-800 text-white font-bold p-1 sm:p-2 rounded-lg text-center text-[10px] sm:text-sm focus:outline-none focus:ring-1 ring-yellow-500" /><button onClick={() => { const val = document.getElementById(`rec-qty-${ing.id}`).value || ing.baseQuantity; addIngredientToRecipe(ing, val); document.getElementById(`rec-qty-${ing.id}`).value = ''; }} className="bg-slate-800 p-1 sm:p-2 rounded-lg text-slate-400 hover:bg-yellow-500 hover:text-white transition-colors"><Plus size={14} /></button></div></div>
                      ))}
                    </div>
                  </div>
                  <button onClick={saveRecipe} className="w-full bg-yellow-500 text-slate-950 py-3 sm:py-4 rounded-full font-extrabold text-sm sm:text-lg shadow-lg hover:bg-yellow-400 transition-colors">SAVE RECIPE</button>
                </div>
              )}
            </div>
          )}

          {/* === DIET HUB (Foods) === */}
          {mainTab === 'diet' && subTabs.diet === 'foods' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4"><div><h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-3"><Apple className="text-orange-400" size={28} /> Database</h2></div></div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
                {ingredientCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveIngredientFilter(cat)} className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${activeIngredientFilter === cat ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>{cat}</button>
                ))}
              </div>
              <div className="bg-slate-900 p-1 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all">
                <button onClick={() => { if (showAddIngredient) { setShowAddIngredient(false); setEditingIngredientId(null); setNewIngredient({ name: '', category: 'Proteins', baseQuantity: 100, unit: 'g', protein: '', carbs: '', fat: '' }); } else { setShowAddIngredient(true); } }} className="w-full p-3 sm:p-4 flex items-center justify-between text-orange-400 font-bold hover:bg-slate-800/50 transition-colors rounded-2xl text-xs sm:text-base">
                  <span className="flex items-center gap-2"><Plus size={18}/> {editingIngredientId ? 'Edit Ingredient' : 'Add Custom Ingredient'}</span><ChevronRight className={`transition-transform duration-300 ${showAddIngredient ? 'rotate-90' : ''}`} size={18} />
                </button>
                {showAddIngredient && (
                  <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div><label className="text-[10px] sm:text-xs font-bold text-slate-500 mb-1 block">FOOD NAME</label><input type="text" value={newIngredient.name} onChange={(e)=>setNewIngredient({...newIngredient, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-orange-500 text-xs sm:text-sm" placeholder="e.g. Bangus" /></div>
                      <div><label className="text-[10px] sm:text-xs font-bold text-slate-500 mb-1 block">CATEGORY</label><select value={newIngredient.category} onChange={(e)=>setNewIngredient({...newIngredient, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-orange-500 text-xs sm:text-sm"><option>Proteins</option><option>Carbs</option><option>Fats</option><option>Spices</option><option>Sauces</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div><label className="text-[10px] sm:text-xs font-bold text-slate-500 mb-1 block">BASE QUANTITY</label><input type="number" value={newIngredient.baseQuantity} onChange={(e)=>setNewIngredient({...newIngredient, baseQuantity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-orange-500 text-xs sm:text-sm" placeholder="100" /></div>
                      <div><label className="text-[10px] sm:text-xs font-bold text-slate-500 mb-1 block">UNIT</label><input type="text" value={newIngredient.unit} onChange={(e)=>setNewIngredient({...newIngredient, unit: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-orange-500 text-xs sm:text-sm" placeholder="g, ml, cup" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                      <div><label className="text-[9px] sm:text-[10px] font-bold text-rose-400 mb-1 block">PRO (g)</label><input type="number" value={newIngredient.protein} onChange={(e)=>setNewIngredient({...newIngredient, protein: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-rose-500 text-center text-xs sm:text-sm" /></div>
                      <div><label className="text-[9px] sm:text-[10px] font-bold text-cyan-400 mb-1 block">CARBS (g)</label><input type="number" value={newIngredient.carbs} onChange={(e)=>setNewIngredient({...newIngredient, carbs: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-cyan-500 text-center text-xs sm:text-sm" /></div>
                      <div><label className="text-[9px] sm:text-[10px] font-bold text-yellow-400 mb-1 block">FAT (g)</label><input type="number" value={newIngredient.fat} onChange={(e)=>setNewIngredient({...newIngredient, fat: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3 text-white focus:outline-none focus:border-yellow-500 text-center text-xs sm:text-sm" /></div>
                    </div>
                    <button onClick={saveIngredient} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm">{editingIngredientId ? 'UPDATE INGREDIENT' : 'SAVE INGREDIENT'}</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-4">
                {filteredIngredients.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col justify-between group hover:border-orange-500/50 transition-colors relative">
                    <div className="flex justify-between items-start mb-2 gap-2"><div className="min-w-0"><h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate">{item.name}</h4><p className="text-[10px] sm:text-xs text-slate-400 font-medium">Per {item.baseQuantity} {item.unit}</p></div><div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><button onClick={() => editIngredient(item)} className="p-1 sm:p-1.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"><Edit3 size={14}/></button><button onClick={() => deleteIngredient(item.id)} className="p-1 sm:p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14}/></button></div></div>
                    <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold mt-1 flex-wrap">
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

          {/* ==================== SCHEDULE HUB (Assigner) ==================== */}
          {mainTab === 'schedule' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex justify-between items-end mb-4">
                <div><h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-3"><CalendarClock className="text-blue-400" size={28} /> Schedule</h2><p className="text-slate-400 text-xs sm:text-sm mt-1">Assign meals and workouts to days.</p></div>
                <button onClick={clearAllSchedule} className="text-[10px] sm:text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors">Reset All</button>
              </div>
              <div className="bg-slate-900 p-4 sm:p-6 rounded-[2rem] border border-slate-800 shadow-2xl space-y-3 sm:space-y-4">
                {days.map(day => {
                  const mealId = assignedMeals[day];
                  const workoutId = assignedWorkouts[day];
                  const isToday = day === actualToday;
                  return (
                    <div key={day} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-colors gap-3 sm:gap-4 ${isToday ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-950 border-slate-800'}`}>
                      <div className="flex items-center gap-3 sm:gap-4"><div className={`w-10 sm:w-14 text-center text-xs sm:text-sm font-bold uppercase ${isToday ? 'text-white' : 'text-slate-500'}`}>{day.substring(0,3)}</div></div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto flex-1 lg:justify-end">
                        <div className="flex-1 max-w-none sm:max-w-xs lg:max-w-[240px]">
                          <label className="text-[8px] sm:text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block ml-1"><Activity size={10} className="inline mr-1"/>Workout</label>
                          <div className="flex gap-2">
                            <select value={workoutId || ''} onChange={(e) => assignWorkoutToDay(day, e.target.value)} className="w-full bg-slate-800 text-white text-xs sm:text-sm font-bold p-2.5 sm:p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 appearance-none truncate">
                              <option value="" disabled>Select workout...</option>
                              {workoutTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                            {workoutId && <button onClick={() => assignWorkoutToDay(day, null)} className="bg-slate-800 p-2.5 sm:p-3 rounded-xl text-slate-500 hover:text-red-400 transition-colors shrink-0"><Trash2 size={16}/></button>}
                          </div>
                        </div>
                        <div className="flex-1 max-w-none sm:max-w-xs lg:max-w-[240px]">
                          <label className="text-[8px] sm:text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-1 block ml-1"><Utensils size={10} className="inline mr-1"/>Meal Plan</label>
                          <div className="flex gap-2">
                            <select value={mealId || ''} onChange={(e) => assignMealToDay(day, e.target.value)} className="w-full bg-slate-800 text-white text-xs sm:text-sm font-bold p-2.5 sm:p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500 appearance-none truncate">
                              <option value="" disabled>Select meal plan...</option>
                              {mealTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {mealId && <button onClick={() => assignMealToDay(day, null)} className="bg-slate-800 p-2.5 sm:p-3 rounded-xl text-slate-500 hover:text-red-400 transition-colors shrink-0"><Trash2 size={16}/></button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== HISTORY HUB ==================== */}
          {mainTab === 'progress' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {progressView === 'overview' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setProgressView('workouts')} className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[2rem] hover:bg-slate-800 transition-colors flex items-center justify-between group shadow-xl"><div className="flex items-center gap-3 sm:gap-4"><div className="bg-cyan-500/20 p-2.5 sm:p-3 rounded-2xl shrink-0"><Dumbbell size={24} className="text-cyan-400" /></div><div className="text-left min-w-0"><h3 className="font-bold text-white text-base sm:text-lg truncate">Workout Logs</h3><p className="text-xs sm:text-sm text-slate-400 truncate">Past weights & reps</p></div></div><ChevronRight className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" /></button>
                    <button onClick={() => setProgressView('metrics')} className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[2rem] hover:bg-slate-800 transition-colors flex items-center justify-between group shadow-xl"><div className="flex items-center gap-3 sm:gap-4"><div className="bg-emerald-500/20 p-2.5 sm:p-3 rounded-2xl shrink-0"><Ruler size={24} className="text-emerald-400" /></div><div className="text-left min-w-0"><h3 className="font-bold text-white text-base sm:text-lg truncate">Body Metrics</h3><p className="text-xs sm:text-sm text-slate-400 truncate">Weight & measurements</p></div></div><ChevronRight className="text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" /></button>
                  </div>
                  <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl mt-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 sm:gap-3"><Target size={24} className="text-emerald-500"/> New Entry</h2>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                      <div className="bg-slate-800/50 p-2 sm:p-3 rounded-2xl border border-slate-700/50"><label className="block text-[8px] sm:text-[10px] font-bold text-slate-500 text-center mb-1">WEIGHT (KG)</label><input type="number" value={trackWeight} onChange={(e)=>setTrackWeight(e.target.value)} className="w-full bg-transparent text-xl sm:text-2xl font-black text-white text-center focus:outline-none" placeholder="0.0" /></div>
                      <div className="bg-slate-800/50 p-2 sm:p-3 rounded-2xl border border-slate-700/50"><label className="block text-[8px] sm:text-[10px] font-bold text-slate-500 text-center mb-1">WAIST (IN)</label><input type="number" value={trackWaist} onChange={(e)=>setTrackWaist(e.target.value)} className="w-full bg-transparent text-xl sm:text-2xl font-black text-white text-center focus:outline-none" placeholder="0" /></div>
                      <div className="bg-slate-800/50 p-2 sm:p-3 rounded-2xl border border-slate-700/50"><label className="block text-[8px] sm:text-[10px] font-bold text-slate-500 text-center mb-1">HIPS (IN)</label><input type="number" value={trackHip} onChange={(e)=>setTrackHip(e.target.value)} className="w-full bg-transparent text-xl sm:text-2xl font-black text-white text-center focus:outline-none" placeholder="0" /></div>
                      <div className="bg-slate-800/50 p-2 sm:p-3 rounded-2xl border border-slate-700/50"><label className="block text-[8px] sm:text-[10px] font-bold text-slate-500 text-center mb-1">ARM (IN)</label><input type="number" value={trackArm} onChange={(e)=>setTrackArm(e.target.value)} className="w-full bg-transparent text-xl sm:text-2xl font-black text-white text-center focus:outline-none" placeholder="0" /></div>
                    </div>
                    <button onClick={saveWeeklyProgress} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 sm:py-4 rounded-full font-extrabold text-sm sm:text-lg shadow-lg hover:scale-[1.02] transition-all">SAVE ENTRY</button>
                  </div>
                </>
              )}
              {progressView === 'workouts' && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setProgressView('overview')} className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-white mb-4 sm:mb-6 font-bold text-xs sm:text-sm"><ChevronLeft size={16} /> Back to Overview</button>
                  <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"><Dumbbell size={24} className="text-cyan-400"/> Workout Logs</h2>
                    <div className="space-y-6 sm:space-y-8">
                      {Object.keys(groupedHistory).length === 0 ? <p className="text-slate-500 italic text-center p-6 text-sm">No workouts logged yet.</p> : (
                        Object.entries(groupedHistory).map(([date, data]) => (
                          <div key={date} className="border-b border-slate-800 pb-6 sm:pb-8 last:border-0 last:pb-0">
                            <h3 className="text-cyan-400 font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base"><CalendarDays size={16} /> {date} ({data.day})</h3>
                            <div className="space-y-3">
                              {data.exercises.map(log => (
                                <div key={log.id} className="bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-slate-700/50 relative group">
                                  <button onClick={() => deleteWorkoutLog(log.id)} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-slate-500 hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 size={16} /></button>
                                  <p className="text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base pr-6">{log.exercise}</p>
                                  <div className="space-y-1">
                                    {log.sets.map((s, i) => (
                                      <div key={i} className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-700/30 last:border-0 pb-1 last:pb-0"><span className="text-slate-400">Set {s.set}</span><span className="font-bold text-white">{s.weight} kg <span className="text-slate-500 font-normal mx-0.5 sm:mx-1">x</span> {s.reps}</span></div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              {progressView === 'metrics' && (
                 <div className="animate-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setProgressView('overview')} className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-white mb-4 sm:mb-6 font-bold text-xs sm:text-sm"><ChevronLeft size={16} /> Back to Overview</button>
                  <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"><Ruler size={24} className="text-emerald-400"/> Body Metrics</h2>
                    <div className="space-y-4">
                      {mockMeasurementHistory.length === 0 ? <p className="text-slate-500 italic text-center p-6 text-sm">No metrics logged yet.</p> : (
                        mockMeasurementHistory.map((log) => (
                          <div key={log.id} className="bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-700 flex flex-col gap-3 sm:gap-4 justify-between items-start relative group">
                            <button onClick={() => deleteMeasurementLog(log.id)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 size={16} /></button>
                            <p className="text-[10px] sm:text-xs text-emerald-400 font-bold">{log.date}</p>
                            <div className="flex flex-wrap gap-3 sm:gap-6 w-full">
                              <div><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">WEIGHT</p><p className="text-lg sm:text-xl font-black text-white">{log.weight} kg</p></div>
                              {log.waist && <div><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">WAIST</p><p className="text-lg sm:text-xl font-black text-white">{log.waist}"</p></div>}
                              {log.hip && <div><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">HIPS</p><p className="text-lg sm:text-xl font-black text-white">{log.hip}"</p></div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== LEARN HUB ==================== */}
          {mainTab === 'learn' && (
             <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 sm:p-8 rounded-[2rem] border border-indigo-500/30 shadow-2xl text-center">
                  <BookOpen size={48} className="text-indigo-400 mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">The Masterclass</h2>
                  <p className="text-indigo-200 text-xs sm:text-sm">Understand the 'why' behind your program.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-indigo-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">1. The Metabolism Engine</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p><strong className="text-white">BMR (Basal Metabolic Rate):</strong> Imagine your body is a parked car with the engine running. BMR is the fuel burned just keeping the engine on.</p>
                    <p><strong className="text-white">TEF (Thermic Effect of Food):</strong> You actually burn calories digesting food! Protein requires the most energy to digest.</p>
                    <p><strong className="text-white">Activity Multiplier:</strong> We multiply your BMR by a factor to account for daily movement.</p>
                    <p><strong className="text-white">TDEE:</strong> BMR + TEF + Activity. The total calories you burn in 24 hours.</p>
                  </div>
                 </div>

                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-rose-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">2. Scientific Formulas</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p>Your calculated Basal Metabolic Rates (Weight: {weight}kg):</p>
                    <ul className="space-y-2 mt-2">
                      <li className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800"><strong className="text-rose-400">Mifflin-St Jeor: {mifflinBMR} kcal</strong></li>
                      <li className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800"><strong className="text-amber-400">Harris-Benedict: {harrisBMR} kcal</strong></li>
                      <li className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500"><strong className="text-emerald-400">Katch-McArdle: {katchBMRText}</strong><br/><span className="text-[10px] text-slate-500">Most accurate for athletes (requires Body Fat %).</span></li>
                    </ul>
                  </div>
                 </div>

                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">3. Progressive Overload</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p><strong className="text-white">When to move the weights up?</strong> Use the "2-for-2" rule.</p>
                    <p>If your goal is 10 reps, and you can successfully perform <strong>12 reps on your last set, for two consecutive workouts in a row</strong>, your muscle has adapted. Move the weight up.</p>
                  </div>
                 </div>

                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-cyan-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">4. Rest Periods & Sets</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p><strong className="text-white">Why rest 90-120 seconds?</strong> It takes about 90 seconds for your body to naturally replenish ATP (cellular energy). Short rests equal cardio, not muscle growth.</p>
                    <p><strong className="text-white">Straight Sets:</strong> Doing a set, resting, doing another. This is clinically proven to be the best way to build a foundation safely compared to advanced sets.</p>
                  </div>
                 </div>
                 
                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">5. Weekly Training Volume</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p><strong className="text-white">How many sets per week?</strong> Sports science generally recommends <strong>10 to 20 sets per muscle group per week</strong> for maximum hypertrophy.</p>
                    <p><strong className="text-white">The Sweet Spot:</strong> If you are new to lifting or focusing on a lean bulk, jumping straight to 20 sets is "junk volume." It causes excessive inflammation. That's why this program starts you in the highly effective <strong>6 to 10 sets per week</strong> range.</p>
                  </div>
                 </div>

                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">6. Muscle Fibers & Genetics</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p>Why are some people naturally great marathon runners, while others are incredibly strong powerlifters? It comes down to genetics and muscle fibers.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><strong className="text-red-400 block mb-1">Type 1 (Slow-Twitch)</strong>Use oxygen efficiently for continuous muscle contractions. Think of a marathon runner.</div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><strong className="text-blue-400 block mb-1">Type 2 (Fast-Twitch)</strong>Fire quickly and generate explosive force. The fibers most responsible for <strong>visible muscle growth</strong> (hypertrophy).</div>
                    </div>
                  </div>
                 </div>

                 <div className="bg-slate-900 p-5 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl md:col-span-2">
                  <h3 className="text-lg sm:text-xl font-bold text-amber-400 mb-3 sm:mb-4 border-b border-slate-800 pb-2 sm:pb-3">7. The Science of the "Lean Bulk"</h3>
                  <div className="space-y-3 sm:space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p>To gain weight, you must consume more calories than your TDEE. This is a <strong>Caloric Surplus</strong>. If you eat a massive 1,000-calorie surplus (a "dirty bulk"), your body will store the excess as pure body fat.</p>
                    <p>Instead, we use a <strong>Lean Bulk (+250 kcal)</strong>. This tiny surplus provides exactly enough energy to fuel muscle synthesis without spilling over into excess fat storage.</p>
                    <p><strong className="text-white">When to change your calories:</strong> Weigh yourself weekly. The goal is to gain about 0.5kg to 1kg per month. If your weight stalls and stays exactly the same for two full weeks, congratulations—your metabolism has adapted! At this point, simply add <strong>+100 to +150 calories</strong> to your daily target to keep growing.</p>
                  </div>
                 </div>
               </div>
             </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MD3 BOTTOM NAVIGATION BAR (Mobile Only) */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 z-50 pt-2 pb-[env(safe-area-inset-bottom,16px)] px-1">
        <div className="flex w-full justify-around items-center h-16">
          {MAIN_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = mainTab === item.id;
            return (
              <button key={item.id} onClick={() => switchMainTab(item.id)} className="flex flex-col items-center justify-center w-16 gap-1 group">
                <div className={`px-4 py-1 rounded-full transition-all duration-300 ${isActive ? item.activeBg : 'bg-transparent group-hover:bg-slate-800/50'}`}>
                  <Icon size={22} className={isActive ? item.color : 'text-slate-400 group-hover:text-slate-300'} />
                </div>
                <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-bold text-slate-100' : 'font-medium text-slate-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}