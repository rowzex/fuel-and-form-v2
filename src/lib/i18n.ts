import { getLocales } from 'expo-localization';

import { DEFAULT_HABITS, Habit } from './model';

export type Lang = 'en' | 'fr' | 'ar' | 'es';

export const LANGS: { code: Lang; name: string; hello: string }[] = [
  { code: 'en', name: 'English', hello: 'Welcome' },
  { code: 'fr', name: 'Français', hello: 'Bienvenue' },
  { code: 'ar', name: 'العربية', hello: 'مرحبا' },
  { code: 'es', name: 'Español', hello: 'Bienvenido' },
];

/** Language name used in the coach prompt, so Claude answers in the user's language. */
export const LANG_FOR_AI: Record<Lang, string> = { en: 'English', fr: 'French', ar: 'Arabic', es: 'Spanish' };

export function deviceLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode;
    return LANGS.some((l) => l.code === code) ? (code as Lang) : 'en';
  } catch {
    return 'en';
  }
}

const en = {
  'tab.today': 'Today', 'tab.log': 'Log food', 'tab.recipes': 'Recipes', 'tab.habits': 'Habits', 'tab.coach': 'Coach', 'tab.calendar': 'Calendar', 'tab.targets': 'Targets',
  'meal.Breakfast': 'Breakfast', 'meal.Lunch': 'Lunch', 'meal.Dinner': 'Dinner', 'meal.Snack': 'Snack',
  'day.today': 'Today', 'day.yesterday': 'Yesterday', 'day.prev': 'Previous day', 'day.next': 'Next day',
  'ring.left': 'kcal left', 'ring.over': 'kcal over',
  protein: 'Protein', carbs: 'Carbs', fat: 'Fat', kcal: 'kcal', min: 'min', done: 'Done', edit: 'Edit', delete: 'Delete', add: 'Add', save: 'Save',

  'today.goal': 'Goal', 'today.targetsLink': 'My targets & AI coach ›', 'today.fuel': 'Fuel', 'today.target': 'Target {n} kcal', 'today.eaten': 'eaten', 'today.burn': 'burn estimate', 'today.items': 'items',
  'today.water': 'Water', 'today.glasses': '{n} / {g} glasses', 'today.waterSet': 'Set water to {n} glasses', 'today.ideas': 'Ideas for you', 'today.allRecipes': 'All recipes ›',
  'today.meals': 'Meals', 'today.nothing': 'Nothing logged yet.', 'today.remove': 'Remove {name}',

  'log.title': 'Log food', 'log.search': 'Search foods: chicken, oats, banana…', 'log.noMatch': 'No match. Add it as a custom food below.', 'log.custom': 'Custom food',
  'log.customName': 'Name, e.g. Homemade lasagna', 'log.p': 'Protein g', 'log.c': 'Carbs g', 'log.f': 'Fat g', 'log.addTo': 'Add to {meal}', 'log.added': 'Added {name} to {meal}', 'log.addItem': 'Add {name}',

  'recipes.title': 'Recipes', 'recipes.left': '{n} kcal left today. "For you" puts the best fits first.', 'recipes.reached': 'You have reached your target today. Lighter options are first.',
  'recipes.forYou': 'For you', 'recipes.saved': 'Saved', 'recipes.highProtein': 'High protein', 'recipes.none': 'No saved recipes yet. Open any recipe, or one the coach suggests, and tap Save.',
  'recipes.fromCoach': 'FROM COACH', 'recipes.photoNote': 'Photos from TheMealDB, matched by dish type, so they show a similar dish rather than this exact recipe.',
  'recipe.perServing': 'per serving', 'recipe.ingredients': 'INGREDIENTS', 'recipe.steps': 'STEPS', 'recipe.logAs': 'Log it as', 'recipe.logTo': 'Log to {meal}', 'recipe.saved': 'Saved ✓',
  'recipe.logged': 'Logged {name} to {meal}', 'recipe.unsaved': 'Removed from saved', 'recipe.savedToast': 'Saved to Recipes', 'recipe.close': 'Close recipe', 'recipe.gProtein': '{n} g protein',

  'habits.title': 'Habits', 'habits.count': '{d} of {n} done', 'habits.empty': 'Add your first habit below.', 'habits.new': 'New habit, e.g. Stretch 10 min', 'habits.added': 'Habit added',
  'habits.streak': '{n}-day streak on "{name}"', 'habits.note': "Streaks count consecutive days. Today only counts once you tick it, and an unticked today doesn't break your streak until tomorrow.",
  'habit.h1': 'Drink 8 glasses of water', 'habit.h2': 'Hit protein target', 'habit.h3': 'Train or walk 30 min', 'habit.h4': 'Sleep before 23:30', 'habit.h5': 'No screens in bed',
  'habitNote.h1': 'Ticks itself when you log 8 glasses', 'habitNote.h2': 'Ticks itself from your food log',

  'coach.title': 'Coach', 'coach.newChat': 'New chat', 'coach.builtIn': 'Using built-in tips. ', 'coach.webBuiltIn': 'The web preview uses built-in tips. ', 'coach.addKey': 'Add your Claude API key ›',
  'coach.openPhone': 'Open the app on your phone for the AI coach.', 'coach.placeholder': 'Ask your coach anything…', 'coach.send': 'Send',
  'coach.hello': "Hi, I'm your coach. Ask me what to eat, how to hit your protein, or how to build a habit. When I suggest food, I'll give you the recipe with a photo, and you can log it in one tap.",
  'coach.p1': 'How am I doing today?', 'coach.p2': 'High-protein dinner idea', 'coach.p3': 'Quick healthy snack', 'coach.p4': 'Plan my meals for tomorrow', 'coach.p5': 'Which habit should I focus on?',
  'coach.savedNote': 'Chats are saved to the Calendar under the day you had them.',
  'err.auth': 'Your Claude API key was rejected. Check it in Targets → AI coach.', 'err.access': "Your API key doesn't have access to this model.", 'err.busy': 'The coach is busy right now. Try again in a minute.',
  'err.offline': "Can't reach the coach. Check your internet connection.", 'err.server': 'The coach had a problem. Try again.', 'err.refusal': "The coach can't help with that one. Try asking another way.",
  'err.incomplete': 'The coach sent an incomplete answer. Try again.', 'err.other': 'Something went wrong. Try again.',

  'cal.title': 'Calendar', 'cal.prevMonth': 'Previous month', 'cal.nextMonth': 'Next month', 'cal.tracked': 'Days tracked this month: {n}', 'cal.empty': 'Nothing was tracked on this day.',
  'cal.onTarget': 'On target', 'cal.under': 'Under', 'cal.over': 'Over', 'cal.chat': 'Coach chat', 'cal.habits': 'Habits done', 'cal.open': 'Open this day ›', 'cal.noChat': 'No coach chat on this day.',
  'cal.meals': 'Meals', 'cal.water': 'Water: {n} / {g} glasses', 'cal.legend': 'Dot colour: green on target, orange over, grey under.',

  'prof.title': 'My targets', 'prof.daily': 'Daily target', 'prof.formula': "Estimated with the Mifflin-St Jeor formula from the details below. It's a starting point, not medical advice.",
  'prof.about': 'About you', 'prof.female': 'Female', 'prof.male': 'Male', 'prof.age': 'Age', 'prof.height': 'Height cm', 'prof.weight': 'Weight kg', 'prof.activity': 'Activity', 'prof.goal': 'Goal',
  'prof.water': 'Water', 'prof.glassesDay': 'Glasses per day', 'prof.language': 'Language', 'prof.account': 'Account', 'prof.signOut': 'Sign out', 'prof.localNote': 'Your data is saved on this phone.',
  'prof.cloudNote': 'Your account is synced with the Fuel & Form server.',
  'act.1.2': 'Mostly sitting', 'act.1.375': 'Light, 1–3 workouts a week', 'act.1.55': 'Moderate, 3–5 a week', 'act.1.725': 'Hard, 6–7 a week',
  'goal.-500': 'Lose about 0.5 kg a week', 'goal.-250': 'Lose slowly', 'goal.0': 'Maintain', 'goal.250': 'Build muscle',
  'ai.title': 'AI coach', 'ai.phoneOnly': 'The AI coach works in the phone app. Open Fuel & Form in Expo Go to set it up.',
  'ai.on': 'Your coach uses Claude to answer with personal advice and new recipes. Your key is stored securely on this phone only.', 'ai.remove': 'Remove key', 'ai.removed': 'Key removed',
  'ai.off': 'Paste a Claude API key to turn on the AI coach. Create one at console.anthropic.com under API keys. Usage is billed to your Anthropic account, usually a fraction of a cent per question. The key stays on this phone.',
  'ai.turnOn': 'Turn on AI coach', 'ai.badKey': "That doesn't look like a Claude API key (it starts with sk-ant-)", 'ai.isOn': 'AI coach is on',

  'ob.chooseLang': 'Choose your language', 'ob.langSub': 'You can change it later in Targets.', 'ob.continue': 'Continue',
  'ob.email': 'Email', 
  'ob.back': '‹ Language',
  'ob.badEmail': 'Enter a valid email address.', 
  'ob.offline': "Can't reach the server. Check your internet connection.", 
  'ob.title': 'Sign in or create an account', 'ob.sub': "No password needed: we'll email you a 6-digit code.", 'ob.nameOptional': 'Your name (optional)', 'ob.sendCode': 'Send code',
  'ob.codeSent': 'We sent a 6-digit code to {email}. It can take a minute, and check your spam folder.', 'ob.code': '6-digit code', 'ob.verify': 'Continue', 'ob.resend': 'Send a new code', 'ob.changeEmail': 'Use another email',
  'ob.skip': 'Skip for now', 'ob.skipNote': 'Your data stays on this phone. You can create an account later in Targets.', 'ob.badCode': 'That code is wrong or has expired. Try again or send a new one.',
  'ob.tooMany': 'Too many tries. Wait a minute, then try again.', 'ob.sendFailed': "We couldn't send the code. Check the email address and try again.",
  'prof.guest': "You're using the app without an account. Create one to keep your data safe.", 'prof.createAccount': 'Create an account',
};

export type Key = keyof typeof en;
type Dict = Record<Key, string>;

const fr: Dict = {
  'tab.today': "Aujourd'hui", 'tab.log': 'Ajouter', 'tab.recipes': 'Recettes', 'tab.habits': 'Habitudes', 'tab.coach': 'Coach', 'tab.calendar': 'Calendrier', 'tab.targets': 'Objectifs',
  'meal.Breakfast': 'Petit-déjeuner', 'meal.Lunch': 'Déjeuner', 'meal.Dinner': 'Dîner', 'meal.Snack': 'Collation',
  'day.today': "Aujourd'hui", 'day.yesterday': 'Hier', 'day.prev': 'Jour précédent', 'day.next': 'Jour suivant',
  'ring.left': 'kcal restantes', 'ring.over': 'kcal en trop',
  protein: 'Protéines', carbs: 'Glucides', fat: 'Lipides', kcal: 'kcal', min: 'min', done: 'OK', edit: 'Modifier', delete: 'Supprimer', add: 'Ajouter', save: 'Enregistrer',

  'today.goal': 'Objectif', 'today.targetsLink': 'Mes objectifs et coach IA ›', 'today.fuel': 'Énergie', 'today.target': 'Objectif {n} kcal', 'today.eaten': 'mangées', 'today.burn': 'dépense estimée', 'today.items': 'aliments',
  'today.water': 'Eau', 'today.glasses': '{n} / {g} verres', 'today.waterSet': "Mettre l'eau à {n} verres", 'today.ideas': 'Idées pour vous', 'today.allRecipes': 'Toutes les recettes ›',
  'today.meals': 'Repas', 'today.nothing': 'Rien pour le moment.', 'today.remove': 'Retirer {name}',

  'log.title': 'Ajouter un aliment', 'log.search': 'Rechercher : poulet, avoine, banane…', 'log.noMatch': 'Aucun résultat. Ajoutez-le ci-dessous.', 'log.custom': 'Aliment personnalisé',
  'log.customName': 'Nom, ex. Lasagnes maison', 'log.p': 'Protéines g', 'log.c': 'Glucides g', 'log.f': 'Lipides g', 'log.addTo': 'Ajouter au {meal}', 'log.added': '{name} ajouté au {meal}', 'log.addItem': 'Ajouter {name}',

  'recipes.title': 'Recettes', 'recipes.left': "{n} kcal restantes aujourd'hui. « Pour vous » montre d'abord les meilleures options.", 'recipes.reached': "Objectif atteint aujourd'hui. Les options légères sont en premier.",
  'recipes.forYou': 'Pour vous', 'recipes.saved': 'Enregistrées', 'recipes.highProtein': 'Riche en protéines', 'recipes.none': 'Aucune recette enregistrée. Ouvrez une recette et touchez Enregistrer.',
  'recipes.fromCoach': 'DU COACH', 'recipes.photoNote': "Photos de TheMealDB, choisies par type de plat : elles montrent un plat proche, pas cette recette exacte.",
  'recipe.perServing': 'par portion', 'recipe.ingredients': 'INGRÉDIENTS', 'recipe.steps': 'ÉTAPES', 'recipe.logAs': 'Ajouter comme', 'recipe.logTo': 'Ajouter au {meal}', 'recipe.saved': 'Enregistrée ✓',
  'recipe.logged': '{name} ajouté au {meal}', 'recipe.unsaved': 'Retirée des recettes', 'recipe.savedToast': 'Enregistrée dans Recettes', 'recipe.close': 'Fermer la recette', 'recipe.gProtein': '{n} g de protéines',

  'habits.title': 'Habitudes', 'habits.count': '{d} sur {n} faites', 'habits.empty': 'Ajoutez votre première habitude ci-dessous.', 'habits.new': 'Nouvelle habitude, ex. Étirements 10 min', 'habits.added': 'Habitude ajoutée',
  'habits.streak': '{n} jours de suite pour « {name} »', 'habits.note': "Les séries comptent les jours consécutifs. Aujourd'hui ne compte qu'une fois coché, et ne casse pas la série avant demain.",
  'habit.h1': "Boire 8 verres d'eau", 'habit.h2': 'Atteindre mes protéines', 'habit.h3': "S'entraîner ou marcher 30 min", 'habit.h4': 'Dormir avant 23h30', 'habit.h5': "Pas d'écran au lit",
  'habitNote.h1': 'Se coche quand vous notez 8 verres', 'habitNote.h2': 'Se coche selon votre journal',

  'coach.title': 'Coach', 'coach.newChat': 'Nouvelle discussion', 'coach.builtIn': 'Conseils intégrés. ', 'coach.webBuiltIn': "L'aperçu web utilise les conseils intégrés. ", 'coach.addKey': 'Ajouter votre clé API Claude ›',
  'coach.openPhone': "Ouvrez l'app sur votre téléphone pour le coach IA.", 'coach.placeholder': 'Posez une question à votre coach…', 'coach.send': 'Envoyer',
  'coach.hello': "Bonjour, je suis votre coach. Demandez-moi quoi manger, comment atteindre vos protéines ou comment créer une habitude. Je vous donne les recettes avec photo, à ajouter en un geste.",
  'coach.p1': "Comment je m'en sors aujourd'hui ?", 'coach.p2': 'Idée de dîner riche en protéines', 'coach.p3': 'Collation saine et rapide', 'coach.p4': 'Planifie mes repas de demain', 'coach.p5': 'Sur quelle habitude me concentrer ?',
  'coach.savedNote': 'Les discussions sont enregistrées dans le Calendrier, au jour où elles ont eu lieu.',
  'err.auth': 'Votre clé API Claude a été refusée. Vérifiez-la dans Objectifs → Coach IA.', 'err.access': "Votre clé API n'a pas accès à ce modèle.", 'err.busy': 'Le coach est occupé. Réessayez dans une minute.',
  'err.offline': 'Impossible de joindre le coach. Vérifiez votre connexion.', 'err.server': 'Le coach a eu un problème. Réessayez.', 'err.refusal': 'Le coach ne peut pas répondre à cela. Reformulez la question.',
  'err.incomplete': 'Réponse incomplète. Réessayez.', 'err.other': "Une erreur s'est produite. Réessayez.",

  'cal.title': 'Calendrier', 'cal.prevMonth': 'Mois précédent', 'cal.nextMonth': 'Mois suivant', 'cal.tracked': 'Jours suivis ce mois-ci : {n}', 'cal.empty': "Rien n'a été noté ce jour-là.",
  'cal.onTarget': 'Objectif atteint', 'cal.under': 'En dessous', 'cal.over': 'Au-dessus', 'cal.chat': 'Discussion avec le coach', 'cal.habits': 'Habitudes faites', 'cal.open': 'Ouvrir ce jour ›', 'cal.noChat': 'Aucune discussion ce jour-là.',
  'cal.meals': 'Repas', 'cal.water': 'Eau : {n} / {g} verres', 'cal.legend': 'Point vert : objectif atteint, orange : au-dessus, gris : en dessous.',

  'prof.title': 'Mes objectifs', 'prof.daily': 'Objectif du jour', 'prof.formula': "Estimé avec la formule de Mifflin-St Jeor à partir des informations ci-dessous. C'est un point de départ, pas un avis médical.",
  'prof.about': 'Vous', 'prof.female': 'Femme', 'prof.male': 'Homme', 'prof.age': 'Âge', 'prof.height': 'Taille cm', 'prof.weight': 'Poids kg', 'prof.activity': 'Activité', 'prof.goal': 'Objectif',
  'prof.water': 'Eau', 'prof.glassesDay': 'Verres par jour', 'prof.language': 'Langue', 'prof.account': 'Compte', 'prof.signOut': 'Se déconnecter', 'prof.localNote': 'Vos données sont enregistrées sur ce téléphone.',
  'prof.cloudNote': 'Votre compte est synchronisé avec le serveur Fuel & Form.',
  'act.1.2': 'Plutôt assis', 'act.1.375': 'Léger, 1 à 3 séances par semaine', 'act.1.55': 'Modéré, 3 à 5 par semaine', 'act.1.725': 'Intense, 6 à 7 par semaine',
  'goal.-500': 'Perdre environ 0,5 kg par semaine', 'goal.-250': 'Perdre doucement', 'goal.0': 'Maintenir', 'goal.250': 'Prendre du muscle',
  'ai.title': 'Coach IA', 'ai.phoneOnly': "Le coach IA fonctionne dans l'app mobile. Ouvrez Fuel & Form dans Expo Go pour l'activer.",
  'ai.on': 'Votre coach utilise Claude pour des conseils personnalisés et de nouvelles recettes. Votre clé est stockée en sécurité sur ce téléphone.', 'ai.remove': 'Supprimer la clé', 'ai.removed': 'Clé supprimée',
  'ai.off': "Collez une clé API Claude pour activer le coach IA. Créez-en une sur console.anthropic.com, rubrique API keys. L'usage est facturé sur votre compte Anthropic, en général une fraction de centime par question. La clé reste sur ce téléphone.",
  'ai.turnOn': 'Activer le coach IA', 'ai.badKey': 'Ce n\'est pas une clé API Claude (elle commence par sk-ant-)', 'ai.isOn': 'Coach IA activé',

  'ob.chooseLang': 'Choisissez votre langue', 'ob.langSub': 'Vous pourrez la changer dans Objectifs.', 'ob.continue': 'Continuer',
  'ob.email': 'E-mail', 
  'ob.back': '‹ Langue',
  'ob.badEmail': 'Entrez une adresse e-mail valide.', 
  'ob.offline': 'Impossible de joindre le serveur. Vérifiez votre connexion.', 
  'ob.title': 'Connectez-vous ou créez un compte', 'ob.sub': 'Pas de mot de passe : nous vous envoyons un code à 6 chiffres par e-mail.', 'ob.nameOptional': 'Votre prénom (facultatif)', 'ob.sendCode': 'Envoyer le code',
  'ob.codeSent': "Code à 6 chiffres envoyé à {email}. Cela peut prendre une minute ; pensez à vérifier vos spams.", 'ob.code': 'Code à 6 chiffres', 'ob.verify': 'Continuer', 'ob.resend': 'Renvoyer un code', 'ob.changeEmail': 'Utiliser un autre e-mail',
  'ob.skip': 'Passer pour le moment', 'ob.skipNote': 'Vos données restent sur ce téléphone. Vous pourrez créer un compte plus tard dans Objectifs.', 'ob.badCode': 'Code incorrect ou expiré. Réessayez ou demandez-en un nouveau.',
  'ob.tooMany': "Trop d'essais. Attendez une minute puis réessayez.", 'ob.sendFailed': "Impossible d'envoyer le code. Vérifiez l'adresse e-mail et réessayez.",
  'prof.guest': 'Vous utilisez l\'app sans compte. Créez-en un pour garder vos données en sécurité.', 'prof.createAccount': 'Créer un compte',
};

const ar: Dict = {
  'tab.today': 'اليوم', 'tab.log': 'تسجيل', 'tab.recipes': 'وصفات', 'tab.habits': 'عادات', 'tab.coach': 'المدرب', 'tab.calendar': 'التقويم', 'tab.targets': 'الأهداف',
  'meal.Breakfast': 'الفطور', 'meal.Lunch': 'الغداء', 'meal.Dinner': 'العشاء', 'meal.Snack': 'وجبة خفيفة',
  'day.today': 'اليوم', 'day.yesterday': 'أمس', 'day.prev': 'اليوم السابق', 'day.next': 'اليوم التالي',
  'ring.left': 'سعرة متبقية', 'ring.over': 'سعرة زائدة',
  protein: 'بروتين', carbs: 'كربوهيدرات', fat: 'دهون', kcal: 'سعرة', min: 'د', done: 'تم', edit: 'تعديل', delete: 'حذف', add: 'إضافة', save: 'حفظ',

  'today.goal': 'الهدف', 'today.targetsLink': 'أهدافي والمدرب الذكي ›', 'today.fuel': 'الطاقة', 'today.target': 'الهدف {n} سعرة', 'today.eaten': 'مأكولة', 'today.burn': 'الحرق التقديري', 'today.items': 'أصناف',
  'today.water': 'الماء', 'today.glasses': '{n} / {g} أكواب', 'today.waterSet': 'اجعل الماء {n} أكواب', 'today.ideas': 'أفكار لك', 'today.allRecipes': 'كل الوصفات ›',
  'today.meals': 'الوجبات', 'today.nothing': 'لم يُسجَّل شيء بعد.', 'today.remove': 'إزالة {name}',

  'log.title': 'تسجيل الطعام', 'log.search': 'ابحث: دجاج، شوفان، موز…', 'log.noMatch': 'لا نتيجة. أضفه كطعام مخصص بالأسفل.', 'log.custom': 'طعام مخصص',
  'log.customName': 'الاسم، مثلا: لازانيا منزلية', 'log.p': 'بروتين غ', 'log.c': 'كربوهيدرات غ', 'log.f': 'دهون غ', 'log.addTo': 'أضف إلى {meal}', 'log.added': 'أضيف {name} إلى {meal}', 'log.addItem': 'أضف {name}',

  'recipes.title': 'وصفات', 'recipes.left': 'تبقى {n} سعرة اليوم. «لك» تعرض الأنسب أولا.', 'recipes.reached': 'بلغت هدفك اليوم. الخيارات الأخف أولا.',
  'recipes.forYou': 'لك', 'recipes.saved': 'المحفوظة', 'recipes.highProtein': 'غني بالبروتين', 'recipes.none': 'لا وصفات محفوظة بعد. افتح أي وصفة واضغط حفظ.',
  'recipes.fromCoach': 'من المدرب', 'recipes.photoNote': 'الصور من TheMealDB حسب نوع الطبق، فهي تُظهر طبقا مشابها وليس هذه الوصفة بالضبط.',
  'recipe.perServing': 'للحصة', 'recipe.ingredients': 'المكونات', 'recipe.steps': 'الخطوات', 'recipe.logAs': 'سجّلها كـ', 'recipe.logTo': 'سجّل في {meal}', 'recipe.saved': 'محفوظة ✓',
  'recipe.logged': 'سُجّل {name} في {meal}', 'recipe.unsaved': 'أزيلت من المحفوظات', 'recipe.savedToast': 'حُفظت في الوصفات', 'recipe.close': 'إغلاق الوصفة', 'recipe.gProtein': '{n} غ بروتين',

  'habits.title': 'العادات', 'habits.count': '{d} من {n} تمت', 'habits.empty': 'أضف أول عادة بالأسفل.', 'habits.new': 'عادة جديدة، مثلا: تمدد 10 دقائق', 'habits.added': 'أضيفت العادة',
  'habits.streak': '{n} أيام متتالية في «{name}»', 'habits.note': 'السلسلة تحسب الأيام المتتالية. اليوم يُحتسب عند تأشيره فقط، ولا ينقطع قبل الغد.',
  'habit.h1': 'اشرب 8 أكواب ماء', 'habit.h2': 'حقق هدف البروتين', 'habit.h3': 'تمرّن أو امشِ 30 دقيقة', 'habit.h4': 'نم قبل 23:30', 'habit.h5': 'لا شاشات في السرير',
  'habitNote.h1': 'تتأشر تلقائيا عند تسجيل 8 أكواب', 'habitNote.h2': 'تتأشر تلقائيا من سجل طعامك',

  'coach.title': 'المدرب', 'coach.newChat': 'محادثة جديدة', 'coach.builtIn': 'نصائح مدمجة. ', 'coach.webBuiltIn': 'نسخة الويب تستخدم نصائح مدمجة. ', 'coach.addKey': 'أضف مفتاح Claude API ›',
  'coach.openPhone': 'افتح التطبيق على هاتفك لاستخدام المدرب الذكي.', 'coach.placeholder': 'اسأل مدربك أي شيء…', 'coach.send': 'إرسال',
  'coach.hello': 'مرحبا، أنا مدربك. اسألني ماذا تأكل، كيف تصل لهدف البروتين، أو كيف تبني عادة. عندما أقترح طعاما سأعطيك الوصفة مع صورة، ويمكنك تسجيلها بلمسة.',
  'coach.p1': 'كيف حالي اليوم؟', 'coach.p2': 'فكرة عشاء غني بالبروتين', 'coach.p3': 'وجبة خفيفة صحية وسريعة', 'coach.p4': 'خطط وجباتي للغد', 'coach.p5': 'على أي عادة أركز؟',
  'coach.savedNote': 'تُحفظ المحادثات في التقويم تحت اليوم الذي جرت فيه.',
  'err.auth': 'رُفض مفتاح Claude API. تحقق منه في الأهداف ← المدرب الذكي.', 'err.access': 'مفتاحك لا يملك صلاحية هذا النموذج.', 'err.busy': 'المدرب مشغول الآن. حاول بعد دقيقة.',
  'err.offline': 'تعذر الوصول إلى المدرب. تحقق من اتصالك بالإنترنت.', 'err.server': 'حدثت مشكلة. حاول مرة أخرى.', 'err.refusal': 'لا يستطيع المدرب المساعدة في هذا. جرّب صياغة أخرى.',
  'err.incomplete': 'وصل رد غير مكتمل. حاول مرة أخرى.', 'err.other': 'حدث خطأ. حاول مرة أخرى.',

  'cal.title': 'التقويم', 'cal.prevMonth': 'الشهر السابق', 'cal.nextMonth': 'الشهر التالي', 'cal.tracked': 'أيام مسجلة هذا الشهر: {n}', 'cal.empty': 'لم يُسجَّل شيء في هذا اليوم.',
  'cal.onTarget': 'ضمن الهدف', 'cal.under': 'أقل', 'cal.over': 'أكثر', 'cal.chat': 'محادثة المدرب', 'cal.habits': 'العادات المنجزة', 'cal.open': 'افتح هذا اليوم ›', 'cal.noChat': 'لا محادثة في هذا اليوم.',
  'cal.meals': 'الوجبات', 'cal.water': 'الماء: {n} / {g} أكواب', 'cal.legend': 'النقطة: أخضر ضمن الهدف، برتقالي أكثر، رمادي أقل.',

  'prof.title': 'أهدافي', 'prof.daily': 'الهدف اليومي', 'prof.formula': 'محسوب بمعادلة Mifflin-St Jeor من بياناتك بالأسفل. هو نقطة بداية وليس نصيحة طبية.',
  'prof.about': 'عنك', 'prof.female': 'أنثى', 'prof.male': 'ذكر', 'prof.age': 'العمر', 'prof.height': 'الطول سم', 'prof.weight': 'الوزن كغ', 'prof.activity': 'النشاط', 'prof.goal': 'الهدف',
  'prof.water': 'الماء', 'prof.glassesDay': 'أكواب يوميا', 'prof.language': 'اللغة', 'prof.account': 'الحساب', 'prof.signOut': 'تسجيل الخروج', 'prof.localNote': 'بياناتك محفوظة على هذا الهاتف.',
  'prof.cloudNote': 'حسابك متزامن مع خادم Fuel & Form.',
  'act.1.2': 'جلوس معظم الوقت', 'act.1.375': 'خفيف، 1 إلى 3 تمارين أسبوعيا', 'act.1.55': 'متوسط، 3 إلى 5 أسبوعيا', 'act.1.725': 'شديد، 6 إلى 7 أسبوعيا',
  'goal.-500': 'خسارة حوالي 0.5 كغ أسبوعيا', 'goal.-250': 'خسارة ببطء', 'goal.0': 'الحفاظ على الوزن', 'goal.250': 'بناء العضلات',
  'ai.title': 'المدرب الذكي', 'ai.phoneOnly': 'المدرب الذكي يعمل في تطبيق الهاتف. افتح Fuel & Form في Expo Go لتفعيله.',
  'ai.on': 'مدربك يستخدم Claude لنصائح شخصية ووصفات جديدة. مفتاحك محفوظ بأمان على هذا الهاتف فقط.', 'ai.remove': 'حذف المفتاح', 'ai.removed': 'حُذف المفتاح',
  'ai.off': 'الصق مفتاح Claude API لتفعيل المدرب الذكي. أنشئ واحدا من console.anthropic.com في قسم API keys. يُحتسب الاستخدام على حسابك في Anthropic، عادة جزء من سنت لكل سؤال. يبقى المفتاح على هذا الهاتف.',
  'ai.turnOn': 'فعّل المدرب الذكي', 'ai.badKey': 'هذا لا يبدو مفتاح Claude API (يبدأ بـ sk-ant-)', 'ai.isOn': 'المدرب الذكي مفعّل',

  'ob.chooseLang': 'اختر لغتك', 'ob.langSub': 'يمكنك تغييرها لاحقا من الأهداف.', 'ob.continue': 'متابعة',
  'ob.email': 'البريد الإلكتروني', 
  'ob.back': '‹ اللغة',
  'ob.badEmail': 'أدخل بريدا إلكترونيا صحيحا.', 
  'ob.offline': 'تعذر الوصول إلى الخادم. تحقق من اتصالك.', 
  'ob.title': 'سجّل الدخول أو أنشئ حسابا', 'ob.sub': 'بدون كلمة مرور: سنرسل لك رمزا من 6 أرقام عبر البريد.', 'ob.nameOptional': 'اسمك (اختياري)', 'ob.sendCode': 'أرسل الرمز',
  'ob.codeSent': 'أرسلنا رمزا من 6 أرقام إلى {email}. قد يستغرق دقيقة، وتحقق من مجلد الرسائل غير المرغوب فيها.', 'ob.code': 'رمز من 6 أرقام', 'ob.verify': 'متابعة', 'ob.resend': 'أرسل رمزا جديدا', 'ob.changeEmail': 'استخدم بريدا آخر',
  'ob.skip': 'تخطَّ الآن', 'ob.skipNote': 'تبقى بياناتك على هذا الهاتف. يمكنك إنشاء حساب لاحقا من الأهداف.', 'ob.badCode': 'الرمز خاطئ أو منتهي الصلاحية. حاول مجددا أو اطلب رمزا جديدا.',
  'ob.tooMany': 'محاولات كثيرة. انتظر دقيقة ثم حاول مجددا.', 'ob.sendFailed': 'تعذر إرسال الرمز. تحقق من البريد وحاول مجددا.',
  'prof.guest': 'أنت تستخدم التطبيق بدون حساب. أنشئ حسابا للحفاظ على بياناتك.', 'prof.createAccount': 'إنشاء حساب',
};

const es: Dict = {
  'tab.today': 'Hoy', 'tab.log': 'Registrar', 'tab.recipes': 'Recetas', 'tab.habits': 'Hábitos', 'tab.coach': 'Coach', 'tab.calendar': 'Calendario', 'tab.targets': 'Objetivos',
  'meal.Breakfast': 'Desayuno', 'meal.Lunch': 'Almuerzo', 'meal.Dinner': 'Cena', 'meal.Snack': 'Merienda',
  'day.today': 'Hoy', 'day.yesterday': 'Ayer', 'day.prev': 'Día anterior', 'day.next': 'Día siguiente',
  'ring.left': 'kcal restantes', 'ring.over': 'kcal de más',
  protein: 'Proteína', carbs: 'Carbohidratos', fat: 'Grasa', kcal: 'kcal', min: 'min', done: 'Listo', edit: 'Editar', delete: 'Borrar', add: 'Añadir', save: 'Guardar',

  'today.goal': 'Objetivo', 'today.targetsLink': 'Mis objetivos y coach IA ›', 'today.fuel': 'Energía', 'today.target': 'Objetivo {n} kcal', 'today.eaten': 'consumidas', 'today.burn': 'gasto estimado', 'today.items': 'alimentos',
  'today.water': 'Agua', 'today.glasses': '{n} / {g} vasos', 'today.waterSet': 'Poner agua en {n} vasos', 'today.ideas': 'Ideas para ti', 'today.allRecipes': 'Todas las recetas ›',
  'today.meals': 'Comidas', 'today.nothing': 'Nada registrado aún.', 'today.remove': 'Quitar {name}',

  'log.title': 'Registrar comida', 'log.search': 'Buscar: pollo, avena, plátano…', 'log.noMatch': 'Sin resultados. Añádelo abajo como alimento propio.', 'log.custom': 'Alimento propio',
  'log.customName': 'Nombre, p. ej. Lasaña casera', 'log.p': 'Proteína g', 'log.c': 'Carbohidratos g', 'log.f': 'Grasa g', 'log.addTo': 'Añadir a {meal}', 'log.added': '{name} añadido a {meal}', 'log.addItem': 'Añadir {name}',

  'recipes.title': 'Recetas', 'recipes.left': 'Te quedan {n} kcal hoy. «Para ti» muestra primero lo que mejor encaja.', 'recipes.reached': 'Has alcanzado tu objetivo hoy. Primero las opciones ligeras.',
  'recipes.forYou': 'Para ti', 'recipes.saved': 'Guardadas', 'recipes.highProtein': 'Alta en proteína', 'recipes.none': 'Aún no hay recetas guardadas. Abre una y toca Guardar.',
  'recipes.fromCoach': 'DEL COACH', 'recipes.photoNote': 'Fotos de TheMealDB según el tipo de plato: muestran un plato parecido, no esta receta exacta.',
  'recipe.perServing': 'por ración', 'recipe.ingredients': 'INGREDIENTES', 'recipe.steps': 'PASOS', 'recipe.logAs': 'Registrar como', 'recipe.logTo': 'Registrar en {meal}', 'recipe.saved': 'Guardada ✓',
  'recipe.logged': '{name} registrado en {meal}', 'recipe.unsaved': 'Quitada de guardadas', 'recipe.savedToast': 'Guardada en Recetas', 'recipe.close': 'Cerrar receta', 'recipe.gProtein': '{n} g de proteína',

  'habits.title': 'Hábitos', 'habits.count': '{d} de {n} hechos', 'habits.empty': 'Añade tu primer hábito abajo.', 'habits.new': 'Nuevo hábito, p. ej. Estirar 10 min', 'habits.added': 'Hábito añadido',
  'habits.streak': '{n} días seguidos en «{name}»', 'habits.note': 'Las rachas cuentan días seguidos. Hoy solo cuenta al marcarlo, y no rompe la racha hasta mañana.',
  'habit.h1': 'Beber 8 vasos de agua', 'habit.h2': 'Llegar a la proteína', 'habit.h3': 'Entrenar o caminar 30 min', 'habit.h4': 'Dormir antes de las 23:30', 'habit.h5': 'Sin pantallas en la cama',
  'habitNote.h1': 'Se marca solo al registrar 8 vasos', 'habitNote.h2': 'Se marca solo según tu registro',

  'coach.title': 'Coach', 'coach.newChat': 'Nueva charla', 'coach.builtIn': 'Usando consejos integrados. ', 'coach.webBuiltIn': 'La vista web usa consejos integrados. ', 'coach.addKey': 'Añade tu clave API de Claude ›',
  'coach.openPhone': 'Abre la app en tu móvil para el coach IA.', 'coach.placeholder': 'Pregúntale lo que quieras a tu coach…', 'coach.send': 'Enviar',
  'coach.hello': 'Hola, soy tu coach. Pregúntame qué comer, cómo llegar a tu proteína o cómo crear un hábito. Cuando te sugiera comida, te daré la receta con foto para registrarla con un toque.',
  'coach.p1': '¿Cómo voy hoy?', 'coach.p2': 'Idea de cena alta en proteína', 'coach.p3': 'Merienda sana y rápida', 'coach.p4': 'Planifica mis comidas de mañana', 'coach.p5': '¿En qué hábito me centro?',
  'coach.savedNote': 'Las charlas se guardan en el Calendario, en el día en que las tuviste.',
  'err.auth': 'Tu clave API de Claude fue rechazada. Revísala en Objetivos → Coach IA.', 'err.access': 'Tu clave API no tiene acceso a este modelo.', 'err.busy': 'El coach está ocupado. Inténtalo en un minuto.',
  'err.offline': 'No se puede contactar al coach. Revisa tu conexión.', 'err.server': 'El coach tuvo un problema. Inténtalo de nuevo.', 'err.refusal': 'El coach no puede ayudar con eso. Prueba a preguntarlo de otra forma.',
  'err.incomplete': 'Respuesta incompleta. Inténtalo de nuevo.', 'err.other': 'Algo salió mal. Inténtalo de nuevo.',

  'cal.title': 'Calendario', 'cal.prevMonth': 'Mes anterior', 'cal.nextMonth': 'Mes siguiente', 'cal.tracked': 'Días registrados este mes: {n}', 'cal.empty': 'No se registró nada este día.',
  'cal.onTarget': 'En objetivo', 'cal.under': 'Por debajo', 'cal.over': 'Por encima', 'cal.chat': 'Charla con el coach', 'cal.habits': 'Hábitos hechos', 'cal.open': 'Abrir este día ›', 'cal.noChat': 'Sin charla este día.',
  'cal.meals': 'Comidas', 'cal.water': 'Agua: {n} / {g} vasos', 'cal.legend': 'Punto verde: en objetivo, naranja: por encima, gris: por debajo.',

  'prof.title': 'Mis objetivos', 'prof.daily': 'Objetivo diario', 'prof.formula': 'Estimado con la fórmula de Mifflin-St Jeor a partir de tus datos. Es un punto de partida, no un consejo médico.',
  'prof.about': 'Sobre ti', 'prof.female': 'Mujer', 'prof.male': 'Hombre', 'prof.age': 'Edad', 'prof.height': 'Altura cm', 'prof.weight': 'Peso kg', 'prof.activity': 'Actividad', 'prof.goal': 'Objetivo',
  'prof.water': 'Agua', 'prof.glassesDay': 'Vasos al día', 'prof.language': 'Idioma', 'prof.account': 'Cuenta', 'prof.signOut': 'Cerrar sesión', 'prof.localNote': 'Tus datos se guardan en este móvil.',
  'prof.cloudNote': 'Tu cuenta está sincronizada con el servidor de Fuel & Form.',
  'act.1.2': 'Casi siempre sentado', 'act.1.375': 'Ligera, 1 a 3 entrenos por semana', 'act.1.55': 'Moderada, 3 a 5 por semana', 'act.1.725': 'Intensa, 6 a 7 por semana',
  'goal.-500': 'Perder unos 0,5 kg por semana', 'goal.-250': 'Perder despacio', 'goal.0': 'Mantener', 'goal.250': 'Ganar músculo',
  'ai.title': 'Coach IA', 'ai.phoneOnly': 'El coach IA funciona en la app del móvil. Abre Fuel & Form en Expo Go para activarlo.',
  'ai.on': 'Tu coach usa Claude para darte consejos personales y recetas nuevas. Tu clave se guarda de forma segura solo en este móvil.', 'ai.remove': 'Quitar clave', 'ai.removed': 'Clave quitada',
  'ai.off': 'Pega una clave API de Claude para activar el coach IA. Créala en console.anthropic.com, en API keys. El uso se cobra en tu cuenta de Anthropic, normalmente una fracción de céntimo por pregunta. La clave se queda en este móvil.',
  'ai.turnOn': 'Activar coach IA', 'ai.badKey': 'Eso no parece una clave API de Claude (empieza por sk-ant-)', 'ai.isOn': 'Coach IA activado',

  'ob.chooseLang': 'Elige tu idioma', 'ob.langSub': 'Puedes cambiarlo luego en Objetivos.', 'ob.continue': 'Continuar',
  'ob.email': 'Correo electrónico', 
  'ob.back': '‹ Idioma',
  'ob.badEmail': 'Introduce un correo válido.', 
  'ob.offline': 'No se puede contactar al servidor. Revisa tu conexión.', 
  'ob.title': 'Inicia sesión o crea una cuenta', 'ob.sub': 'Sin contraseña: te enviamos un código de 6 dígitos por correo.', 'ob.nameOptional': 'Tu nombre (opcional)', 'ob.sendCode': 'Enviar código',
  'ob.codeSent': 'Enviamos un código de 6 dígitos a {email}. Puede tardar un minuto; revisa también el spam.', 'ob.code': 'Código de 6 dígitos', 'ob.verify': 'Continuar', 'ob.resend': 'Enviar otro código', 'ob.changeEmail': 'Usar otro correo',
  'ob.skip': 'Omitir por ahora', 'ob.skipNote': 'Tus datos se quedan en este móvil. Puedes crear una cuenta luego en Objetivos.', 'ob.badCode': 'El código es incorrecto o ha caducado. Inténtalo de nuevo o pide otro.',
  'ob.tooMany': 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.', 'ob.sendFailed': 'No pudimos enviar el código. Revisa el correo e inténtalo de nuevo.',
  'prof.guest': 'Usas la app sin cuenta. Crea una para guardar tus datos de forma segura.', 'prof.createAccount': 'Crear una cuenta',
};

const DICTS: Record<Lang, Dict> = { en, fr, ar, es };

export type T = (key: Key, vars?: Record<string, string | number>) => string;

export function translator(lang: Lang): T {
  const d = DICTS[lang] ?? en;
  return (key, vars) => {
    let s = d[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}

/** Locale tag for dates, e.g. weekday and month names. */
export const LOCALE: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', ar: 'ar-MA', es: 'es-ES' };

/** The starter habits show in the chosen language until the user renames them. */
export function habitText(h: Habit, tr: T): { name: string; note?: string } {
  const starter = DEFAULT_HABITS.find((d) => d.id === h.id && d.name === h.name);
  if (!starter) return { name: h.name, note: h.note };
  const id = h.id as 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  return { name: tr(`habit.${id}`), note: id === 'h1' || id === 'h2' ? tr(`habitNote.${id}`) : undefined };
}
