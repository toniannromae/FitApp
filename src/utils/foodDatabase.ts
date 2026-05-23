export interface FoodProfile {
  names: string[]; // primary name first, then aliases for matching
  glycemicIndex: number; // 0 = no carbs/negligible
  antiInflammatoryScore: number; // -3 to +3
  carbsPer100g: number;
  category: string;
  diabetesFriendly: boolean;
  uctdFriendly: boolean;
  isOmega3Source: boolean;
  isLeafyGreen: boolean;
  alternatives: { name: string; reason: string }[];
  warningForDiabetes?: string;
  warningForUCTD?: string;
}

export const FOOD_DATABASE: FoodProfile[] = [
  // ── FISH & SEAFOOD ─────────────────────────────────────
  {
    names: ['salmon', 'grilled salmon', 'baked salmon', 'smoked salmon', 'atlantic salmon'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['sardines', 'canned sardines', 'sardine'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['mackerel', 'canned mackerel'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['tuna', 'canned tuna', 'albacore tuna', 'ahi tuna'],
    glycemicIndex: 0, antiInflammatoryScore: 2, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['tilapia', 'cod', 'halibut', 'white fish'],
    glycemicIndex: 0, antiInflammatoryScore: 1, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Salmon', reason: 'Much higher omega-3 content, stronger anti-inflammatory' }],
  },
  {
    names: ['shrimp', 'prawns'],
    glycemicIndex: 0, antiInflammatoryScore: 1, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },

  // ── POULTRY ────────────────────────────────────────────
  {
    names: ['chicken breast', 'chicken', 'grilled chicken', 'rotisserie chicken'],
    glycemicIndex: 0, antiInflammatoryScore: 1, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['turkey', 'ground turkey', 'turkey breast'],
    glycemicIndex: 0, antiInflammatoryScore: 1, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['chicken thighs', 'chicken wings', 'fried chicken'],
    glycemicIndex: 0, antiInflammatoryScore: -1, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Chicken breast', reason: 'Lower saturated fat, less inflammatory' }],
    warningForUCTD: 'Higher saturated fat content can promote inflammation',
  },

  // ── RED MEAT ───────────────────────────────────────────
  {
    names: ['beef', 'ground beef', 'steak', 'burger', 'hamburger', 'red meat'],
    glycemicIndex: 0, antiInflammatoryScore: -2, carbsPer100g: 0,
    category: 'protein', diabetesFriendly: true, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Salmon', reason: 'Anti-inflammatory omega-3s vs pro-inflammatory saturated fat' },
      { name: 'Ground turkey', reason: 'Leaner protein with less inflammatory impact' },
      { name: 'Lentils', reason: 'Plant-based protein with anti-inflammatory fiber' },
    ],
    warningForUCTD: 'Red meat is high in arachidonic acid, which promotes inflammation — limit to 1–2x/week',
  },
  {
    names: ['bacon', 'sausage', 'hot dog', 'deli meat', 'pepperoni', 'salami', 'processed meat'],
    glycemicIndex: 0, antiInflammatoryScore: -3, carbsPer100g: 3,
    category: 'protein', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Turkey slices (unprocessed)', reason: 'Lean protein without nitrates or excess sodium' },
      { name: 'Salmon', reason: 'Anti-inflammatory and heart-healthy' },
      { name: 'Hard-boiled eggs', reason: 'Whole-food protein, no preservatives' },
    ],
    warningForDiabetes: 'High sodium raises blood pressure, which worsens diabetes complications',
    warningForUCTD: 'Nitrates and preservatives in processed meat are strongly pro-inflammatory',
  },

  // ── EGGS & DAIRY ───────────────────────────────────────
  {
    names: ['eggs', 'egg', 'hard-boiled eggs', 'scrambled eggs'],
    glycemicIndex: 0, antiInflammatoryScore: 1, carbsPer100g: 1,
    category: 'dairy-eggs', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['greek yogurt', 'plain greek yogurt', 'low-fat greek yogurt'],
    glycemicIndex: 11, antiInflammatoryScore: 1, carbsPer100g: 9,
    category: 'dairy-eggs', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['yogurt', 'flavored yogurt', 'sweetened yogurt', 'fruit yogurt'],
    glycemicIndex: 36, antiInflammatoryScore: -1, carbsPer100g: 20,
    category: 'dairy-eggs', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Plain Greek yogurt', reason: 'Much lower sugar, higher protein, lower GI' }],
    warningForDiabetes: 'Flavored yogurts often contain 20–30g added sugar per serving',
  },
  {
    names: ['milk', 'whole milk', '2% milk'],
    glycemicIndex: 31, antiInflammatoryScore: 0, carbsPer100g: 12,
    category: 'dairy-eggs', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta'],
    glycemicIndex: 0, antiInflammatoryScore: -1, carbsPer100g: 1,
    category: 'dairy-eggs', diabetesFriendly: true, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Nutritional yeast', reason: 'Cheesy flavor with B-vitamins, no saturated fat' }],
    warningForUCTD: 'High saturated fat dairy may trigger inflammation in some autoimmune conditions — use in moderation',
  },
  {
    names: ['cottage cheese', 'low-fat cottage cheese'],
    glycemicIndex: 10, antiInflammatoryScore: 0, carbsPer100g: 4,
    category: 'dairy-eggs', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },

  // ── LEAFY GREENS & VEGETABLES ──────────────────────────
  {
    names: ['spinach', 'baby spinach', 'spinach leaves'],
    glycemicIndex: 15, antiInflammatoryScore: 3, carbsPer100g: 3,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: true,
    alternatives: [],
  },
  {
    names: ['kale', 'kale chips', 'lacinato kale', 'curly kale'],
    glycemicIndex: 10, antiInflammatoryScore: 3, carbsPer100g: 9,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: true,
    alternatives: [],
  },
  {
    names: ['broccoli', 'broccolini', 'broccoli florets'],
    glycemicIndex: 10, antiInflammatoryScore: 3, carbsPer100g: 7,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['cauliflower', 'cauliflower rice', 'cauliflower florets'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 5,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['arugula', 'rocket', 'mixed greens', 'salad greens', 'mesclun'],
    glycemicIndex: 15, antiInflammatoryScore: 3, carbsPer100g: 4,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: true,
    alternatives: [],
  },
  {
    names: ['swiss chard', 'chard', 'beet greens', 'collard greens', 'bok choy'],
    glycemicIndex: 15, antiInflammatoryScore: 3, carbsPer100g: 4,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: true,
    alternatives: [],
  },
  {
    names: ['brussels sprouts', 'brussels'],
    glycemicIndex: 15, antiInflammatoryScore: 3, carbsPer100g: 9,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['asparagus'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 4,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['zucchini', 'courgette', 'summer squash'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 3,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['bell pepper', 'red pepper', 'green pepper', 'yellow pepper', 'bell peppers'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 6,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['cucumber', 'cucumbers'],
    glycemicIndex: 15, antiInflammatoryScore: 1, carbsPer100g: 4,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['tomato', 'tomatoes', 'cherry tomatoes', 'roma tomatoes'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 4,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['onion', 'red onion', 'yellow onion', 'onions', 'shallots'],
    glycemicIndex: 10, antiInflammatoryScore: 2, carbsPer100g: 9,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['garlic', 'garlic cloves', 'minced garlic'],
    glycemicIndex: 10, antiInflammatoryScore: 3, carbsPer100g: 33,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['mushrooms', 'cremini mushrooms', 'portobello mushrooms', 'shiitake'],
    glycemicIndex: 10, antiInflammatoryScore: 2, carbsPer100g: 3,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },

  // ── STARCHY VEGETABLES & ROOTS ─────────────────────────
  {
    names: ['sweet potato', 'sweet potatoes', 'yam', 'yams'],
    glycemicIndex: 63, antiInflammatoryScore: 2, carbsPer100g: 20,
    category: 'produce', diabetesFriendly: false, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Cauliflower', reason: 'Much lower carbs and GI, still anti-inflammatory' }],
    warningForDiabetes: 'Medium-high GI — keep portions small (½ cup) and pair with protein/fat to blunt glucose spike',
  },
  {
    names: ['white potato', 'potato', 'russet potato', 'mashed potato', 'baked potato', 'french fries', 'fries'],
    glycemicIndex: 85, antiInflammatoryScore: -1, carbsPer100g: 17,
    category: 'produce', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Sweet potato', reason: 'Lower GI and anti-inflammatory vitamins' },
      { name: 'Cauliflower', reason: 'Very low carb alternative for mashing or roasting' },
    ],
    warningForDiabetes: 'Very high GI — causes rapid blood glucose spikes',
    warningForUCTD: 'Nightshade vegetable; some people with autoimmune conditions report worsened symptoms',
  },
  {
    names: ['carrots', 'carrot', 'baby carrots'],
    glycemicIndex: 39, antiInflammatoryScore: 2, carbsPer100g: 10,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['beets', 'beet', 'beetroot'],
    glycemicIndex: 64, antiInflammatoryScore: 2, carbsPer100g: 10,
    category: 'produce', diabetesFriendly: false, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
    warningForDiabetes: 'Medium-high GI — eat in small amounts, prefer raw over cooked',
  },

  // ── FRUITS ─────────────────────────────────────────────
  {
    names: ['blueberries', 'blueberry', 'frozen blueberries'],
    glycemicIndex: 53, antiInflammatoryScore: 3, carbsPer100g: 14,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['strawberries', 'strawberry', 'frozen strawberries'],
    glycemicIndex: 40, antiInflammatoryScore: 3, carbsPer100g: 8,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['raspberries', 'raspberry', 'blackberries', 'blackberry'],
    glycemicIndex: 32, antiInflammatoryScore: 3, carbsPer100g: 12,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['cherries', 'cherry', 'tart cherries'],
    glycemicIndex: 22, antiInflammatoryScore: 3, carbsPer100g: 12,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['avocado', 'avocados', 'guacamole'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 9,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['apple', 'apples', 'green apple'],
    glycemicIndex: 36, antiInflammatoryScore: 1, carbsPer100g: 14,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['banana', 'bananas', 'ripe banana'],
    glycemicIndex: 52, antiInflammatoryScore: 0, carbsPer100g: 23,
    category: 'produce', diabetesFriendly: false, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Blueberries', reason: 'Lower GI with stronger antioxidant/anti-inflammatory benefits' },
      { name: 'Strawberries', reason: 'Lower carb, lower GI, rich in vitamin C' },
    ],
    warningForDiabetes: 'Ripe bananas have significant sugar content — choose greener (less ripe) bananas if eating',
  },
  {
    names: ['grapes', 'grape', 'raisins'],
    glycemicIndex: 59, antiInflammatoryScore: 1, carbsPer100g: 18,
    category: 'produce', diabetesFriendly: false, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Cherries or raspberries', reason: 'Lower GI with better anti-inflammatory profiles' }],
    warningForDiabetes: 'High sugar concentration; raisins in particular are very high GI',
  },
  {
    names: ['orange', 'oranges', 'clementine', 'mandarin', 'grapefruit'],
    glycemicIndex: 42, antiInflammatoryScore: 2, carbsPer100g: 12,
    category: 'produce', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['mango', 'mangoes', 'pineapple', 'papaya', 'watermelon'],
    glycemicIndex: 72, antiInflammatoryScore: 1, carbsPer100g: 15,
    category: 'produce', diabetesFriendly: false, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Berries', reason: 'Much lower GI and higher antioxidant content' }],
    warningForDiabetes: 'Tropical fruits are high in natural sugars with elevated GI — limit portion sizes',
  },

  // ── GRAINS ─────────────────────────────────────────────
  {
    names: ['white rice', 'rice', 'instant rice', 'jasmine rice'],
    glycemicIndex: 73, antiInflammatoryScore: -1, carbsPer100g: 28,
    category: 'grains', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Brown rice', reason: 'Lower GI (55), more fiber slows glucose absorption' },
      { name: 'Cauliflower rice', reason: 'Virtually no carbs, anti-inflammatory' },
      { name: 'Quinoa', reason: 'Complete protein, GI 53, more nutrients' },
    ],
    warningForDiabetes: 'High GI — causes rapid blood glucose spikes',
    warningForUCTD: 'Refined grain with minimal nutritional value; promotes inflammation',
  },
  {
    names: ['brown rice', 'long grain brown rice'],
    glycemicIndex: 55, antiInflammatoryScore: 0, carbsPer100g: 23,
    category: 'grains', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Quinoa', reason: 'Similar GI but complete protein and higher fiber' }],
  },
  {
    names: ['quinoa'],
    glycemicIndex: 53, antiInflammatoryScore: 1, carbsPer100g: 22,
    category: 'grains', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['oatmeal', 'oats', 'rolled oats', 'steel-cut oats', 'overnight oats'],
    glycemicIndex: 55, antiInflammatoryScore: 1, carbsPer100g: 27,
    category: 'grains', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['white bread', 'bread', 'sandwich bread', 'baguette', 'white flour tortilla'],
    glycemicIndex: 75, antiInflammatoryScore: -2, carbsPer100g: 49,
    category: 'grains', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Whole grain bread (100%)', reason: 'More fiber, lower GI (~51), less inflammatory' },
      { name: 'Lettuce wraps', reason: 'Zero carbs, anti-inflammatory, crisp texture' },
      { name: 'Ezekiel bread', reason: 'Sprouted grain, lowest GI option (~36)' },
    ],
    warningForDiabetes: 'Very high GI — one slice can significantly raise blood glucose',
    warningForUCTD: 'Refined flour promotes systemic inflammation',
  },
  {
    names: ['whole wheat bread', 'whole grain bread', 'whole wheat tortilla', 'ezekiel bread'],
    glycemicIndex: 51, antiInflammatoryScore: -1, carbsPer100g: 41,
    category: 'grains', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['pasta', 'white pasta', 'spaghetti', 'penne', 'fettuccine', 'noodles'],
    glycemicIndex: 65, antiInflammatoryScore: -1, carbsPer100g: 25,
    category: 'grains', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Chickpea pasta', reason: 'Higher protein and fiber, much lower GI (~35)' },
      { name: 'Zucchini noodles (zoodles)', reason: 'Essentially zero carbs, anti-inflammatory' },
      { name: 'Lentil pasta', reason: 'Lower GI, protein-rich, anti-inflammatory' },
    ],
    warningForDiabetes: 'Medium-high GI, especially when overcooked',
    warningForUCTD: 'Refined carb — keep portions modest',
  },
  {
    names: ['crackers', 'saltines', 'graham crackers', 'rice cakes'],
    glycemicIndex: 74, antiInflammatoryScore: -2, carbsPer100g: 72,
    category: 'grains', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Almond flour crackers', reason: 'Low carb, healthy fats, much lower GI' },
      { name: 'Vegetable slices with hummus', reason: 'Anti-inflammatory, fiber-rich, low GI' },
    ],
    warningForDiabetes: 'High GI processed snack',
  },

  // ── LEGUMES ────────────────────────────────────────────
  {
    names: ['lentils', 'red lentils', 'green lentils', 'brown lentils', 'black lentils'],
    glycemicIndex: 29, antiInflammatoryScore: 2, carbsPer100g: 20,
    category: 'legumes', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['chickpeas', 'garbanzo beans', 'hummus'],
    glycemicIndex: 28, antiInflammatoryScore: 2, carbsPer100g: 18,
    category: 'legumes', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['black beans', 'kidney beans', 'pinto beans', 'cannellini beans', 'navy beans', 'mixed beans'],
    glycemicIndex: 30, antiInflammatoryScore: 2, carbsPer100g: 22,
    category: 'legumes', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['edamame', 'soybeans'],
    glycemicIndex: 18, antiInflammatoryScore: 1, carbsPer100g: 10,
    category: 'legumes', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['tofu', 'firm tofu', 'silken tofu'],
    glycemicIndex: 15, antiInflammatoryScore: 1, carbsPer100g: 2,
    category: 'protein', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },

  // ── NUTS & SEEDS ───────────────────────────────────────
  {
    names: ['walnuts', 'walnut'],
    glycemicIndex: 15, antiInflammatoryScore: 3, carbsPer100g: 14,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['almonds', 'almond', 'almond butter', 'almond flour'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 22,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['chia seeds', 'chia'],
    glycemicIndex: 1, antiInflammatoryScore: 3, carbsPer100g: 42,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['flaxseed', 'ground flaxseed', 'flax seeds', 'flax meal'],
    glycemicIndex: 35, antiInflammatoryScore: 3, carbsPer100g: 29,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['pumpkin seeds', 'pepitas', 'sunflower seeds'],
    glycemicIndex: 25, antiInflammatoryScore: 2, carbsPer100g: 18,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['peanuts', 'peanut butter', 'natural peanut butter'],
    glycemicIndex: 14, antiInflammatoryScore: 1, carbsPer100g: 16,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['mixed nuts', 'cashews', 'pistachios', 'pecans', 'macadamia nuts', 'brazil nuts', 'hazelnuts'],
    glycemicIndex: 15, antiInflammatoryScore: 2, carbsPer100g: 20,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Walnuts', reason: 'Highest omega-3 among nuts, best for inflammation' }],
  },

  // ── OILS & FATS ────────────────────────────────────────
  {
    names: ['olive oil', 'extra virgin olive oil', 'evoo'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 0,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['coconut oil'],
    glycemicIndex: 0, antiInflammatoryScore: -1, carbsPer100g: 0,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Extra virgin olive oil', reason: 'Proven anti-inflammatory with polyphenols; coconut oil is very high in saturated fat' }],
    warningForUCTD: 'Very high saturated fat content may increase inflammation despite marketing claims',
  },
  {
    names: ['butter', 'margarine', 'vegetable oil', 'canola oil', 'corn oil', 'soybean oil'],
    glycemicIndex: 0, antiInflammatoryScore: -2, carbsPer100g: 0,
    category: 'fats-oils', diabetesFriendly: true, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Extra virgin olive oil', reason: 'Anti-inflammatory oleocanthal; proven to reduce CRP levels' },
      { name: 'Avocado oil', reason: 'High smoke point, healthy monounsaturated fats' },
    ],
    warningForUCTD: 'Omega-6 heavy vegetable oils promote inflammation; butter raises LDL',
  },

  // ── CONDIMENTS & SPICES ────────────────────────────────
  {
    names: ['turmeric', 'turmeric powder', 'ground turmeric'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 65,
    category: 'condiments', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['ginger', 'fresh ginger', 'ground ginger', 'ginger root'],
    glycemicIndex: 10, antiInflammatoryScore: 3, carbsPer100g: 18,
    category: 'condiments', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['cinnamon', 'cinnamon powder'],
    glycemicIndex: 0, antiInflammatoryScore: 2, carbsPer100g: 81,
    category: 'condiments', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['ketchup', 'BBQ sauce', 'barbecue sauce', 'sweet chili sauce', 'teriyaki sauce'],
    glycemicIndex: 55, antiInflammatoryScore: -2, carbsPer100g: 25,
    category: 'condiments', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Fresh salsa', reason: 'Low sugar, anti-inflammatory tomato and peppers' },
      { name: 'Mustard', reason: 'Essentially zero sugar, anti-inflammatory spices' },
    ],
    warningForDiabetes: 'High added sugar content raises glucose',
    warningForUCTD: 'High fructose corn syrup is strongly pro-inflammatory',
  },
  {
    names: ['soy sauce', 'regular soy sauce'],
    glycemicIndex: 10, antiInflammatoryScore: -1, carbsPer100g: 8,
    category: 'condiments', diabetesFriendly: true, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [{ name: 'Coconut aminos', reason: 'Lower sodium, gluten-free, less inflammatory' }],
    warningForUCTD: 'Very high sodium; excess sodium can worsen autoimmune inflammation',
  },

  // ── BEVERAGES ──────────────────────────────────────────
  {
    names: ['green tea', 'matcha', 'matcha tea'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 0,
    category: 'beverages', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['soda', 'cola', 'diet soda', 'soft drink', 'energy drink', 'sports drink', 'lemonade'],
    glycemicIndex: 63, antiInflammatoryScore: -3, carbsPer100g: 11,
    category: 'beverages', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Sparkling water with lemon', reason: 'Satisfies fizz craving with zero sugar/calories' },
      { name: 'Green tea (unsweetened)', reason: 'Anti-inflammatory antioxidants, no sugar' },
    ],
    warningForDiabetes: 'Even diet soda may worsen insulin resistance via gut microbiome disruption',
    warningForUCTD: 'Phosphoric acid and sugar promote systemic inflammation',
  },
  {
    names: ['orange juice', 'apple juice', 'fruit juice', 'grape juice'],
    glycemicIndex: 57, antiInflammatoryScore: -1, carbsPer100g: 11,
    category: 'beverages', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Whole fruit (orange, apple)', reason: 'Fiber slows sugar absorption; GI much lower' },
      { name: 'Infused water', reason: 'Hydrating with no sugar impact' },
    ],
    warningForDiabetes: 'Juice removes fiber, leaving concentrated sugar that hits the bloodstream rapidly',
  },
  {
    names: ['coffee', 'black coffee', 'espresso'],
    glycemicIndex: 0, antiInflammatoryScore: 1, carbsPer100g: 0,
    category: 'beverages', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },

  // ── SNACKS & SWEETS ────────────────────────────────────
  {
    names: ['dark chocolate', '70% dark chocolate', 'dark cocoa'],
    glycemicIndex: 23, antiInflammatoryScore: 2, carbsPer100g: 46,
    category: 'snacks', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [],
  },
  {
    names: ['milk chocolate', 'chocolate bar', 'candy', 'chocolate chip cookies', 'chocolate cake'],
    glycemicIndex: 45, antiInflammatoryScore: -2, carbsPer100g: 60,
    category: 'snacks', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Dark chocolate (≥70%)', reason: 'Antioxidants and much less sugar; GI ~23' },
      { name: 'Berries with coconut cream', reason: 'Naturally sweet, anti-inflammatory' },
    ],
    warningForDiabetes: 'High sugar content causes rapid glucose spikes',
    warningForUCTD: 'High sugar is strongly pro-inflammatory',
  },
  {
    names: ['chips', 'potato chips', 'tortilla chips', 'corn chips', 'crisps'],
    glycemicIndex: 72, antiInflammatoryScore: -3, carbsPer100g: 53,
    category: 'snacks', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Veggie sticks with hummus', reason: 'Anti-inflammatory, fiber-rich, low GI' },
      { name: 'Walnuts or almonds', reason: 'Satisfying crunch with anti-inflammatory healthy fats' },
      { name: 'Kale chips (homemade)', reason: 'Very low GI, strongly anti-inflammatory' },
    ],
    warningForDiabetes: 'Very high GI and calorie-dense',
    warningForUCTD: 'Omega-6 vegetable oils used in frying are strongly pro-inflammatory',
  },
  {
    names: ['ice cream', 'frozen yogurt', 'gelato', 'sorbet'],
    glycemicIndex: 61, antiInflammatoryScore: -2, carbsPer100g: 24,
    category: 'snacks', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Frozen blended banana (1 ingredient)', reason: 'Natural sweetness, potassium, lower GI' },
      { name: 'Greek yogurt with berries', reason: 'Protein-rich, probiotic, anti-inflammatory' },
    ],
    warningForDiabetes: 'High sugar content and rapid glucose spike',
  },
  {
    names: ['protein bar', 'granola bar', 'energy bar', 'clif bar', 'larabar'],
    glycemicIndex: 60, antiInflammatoryScore: -1, carbsPer100g: 50,
    category: 'snacks', diabetesFriendly: false, uctdFriendly: false,
    isOmega3Source: false, isLeafyGreen: false,
    alternatives: [
      { name: 'Hard-boiled eggs + almonds', reason: 'Real whole-food protein with healthy fats, no added sugar' },
      { name: 'Greek yogurt', reason: 'High protein, lower GI, probiotic benefits' },
    ],
    warningForDiabetes: 'Many bars contain 20–30g sugar despite "healthy" labeling — always check',
  },

  // ── FISH OIL / SUPPLEMENTS (grocery-relevant) ──────────
  {
    names: ['fish oil', 'omega-3 supplement', 'omega 3'],
    glycemicIndex: 0, antiInflammatoryScore: 3, carbsPer100g: 0,
    category: 'other', diabetesFriendly: true, uctdFriendly: true,
    isOmega3Source: true, isLeafyGreen: false,
    alternatives: [],
  },
];

export function findFoodProfile(name: string): FoodProfile | null {
  const normalized = name.toLowerCase().trim();
  for (const profile of FOOD_DATABASE) {
    for (const alias of profile.names) {
      if (
        alias === normalized ||
        normalized.includes(alias) ||
        alias.includes(normalized)
      ) {
        return profile;
      }
    }
  }
  return null;
}
